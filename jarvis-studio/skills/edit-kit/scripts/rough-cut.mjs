#!/usr/bin/env node
// rough-cut: the Creator Stack "cut the dead air" step, done deterministically from word timings.
// Removes pauses longer than --max-gap (and optionally fillers), never cuts inside a word, keeps a
// beat before chosen punchlines, snaps every cut to a frame boundary, fades 12 ms at each join so
// the audio doesn't click, and REMAPS every word's time to the new timeline so captions stay in sync.
// Zero npm dependencies (Node 18+); needs ffmpeg + ffprobe.
//
// usage: node rough-cut.mjs take.mp4 take.words.json [--max-gap 0.3] [--pad-in 0.08] [--pad-out 0.12]
//          [--drop-fillers] [--drop 7.5-8.9,20.1-24] [--beat 15,31] [--beat-len 0.45] [--min-cut 0.2] [--dry-run]
// writes: take.cut.mp4 · take.cut.wav (voice only, PCM: every browser can read it, for HyperFrames <audio>) · take.cut.words.json · take.cut.edl.json

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const flag = (n, d = null) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const pos = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--') || ['--dry-run', '--drop-fillers'].includes(args[i - 1]));
const [video, wordsPath] = pos;
if (!video || !wordsPath) { console.error('usage: node rough-cut.mjs take.mp4 take.words.json [--max-gap 0.3] [--drop-fillers] [--beat 15] [--dry-run]'); process.exit(2); }
const MAX_GAP = +flag('--max-gap', 0.3), PAD_IN = +flag('--pad-in', 0.08), PAD_OUT = +flag('--pad-out', 0.12);
const BEAT_LEN = +flag('--beat-len', 0.45), MIN_CUT = +flag('--min-cut', 0.2), FADE = 0.012, EPS = 0.02;
const beats = new Set((flag('--beat', '') || '').split(',').filter(Boolean).map(Number));
const drops = (flag('--drop', '') || '').split(',').filter(Boolean).map((r) => r.split('-').map(Number));
const dropFillers = args.includes('--drop-fillers');
const base = video.replace(/\.[^.]+$/, '');

const doc = JSON.parse(readFileSync(wordsPath, 'utf8'));
const all = [...doc.words].sort((a, b) => a.s - b.s);
const pr = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', video], { encoding: 'utf8' }));
const vs = pr.streams.find((s) => s.codec_type === 'video');
const hasAudio = pr.streams.some((s) => s.codec_type === 'audio');
const [fn, fd] = (vs.avg_frame_rate !== '0/0' ? vs.avg_frame_rate : vs.r_frame_rate).split('/').map(Number);
const FPS = fn / (fd || 1), DUR = +pr.format.duration;

// ---- decide what stays ------------------------------------------------------------------------------
const isDropped = (w) => (dropFillers && w.filler) || drops.some(([a, b]) => w.s >= a - EPS && w.e <= b + EPS);
const segs = []; let cur = null;
for (let k = 0; k < all.length; k++) {
  const w = all[k];
  if (isDropped(w)) { if (cur) { segs.push(cur); cur = null; } continue; }
  const prev = all[k - 1];
  const gap = prev ? w.s - prev.e : Infinity;
  if (!cur || gap > MAX_GAP || (prev && isDropped(prev))) { if (cur) segs.push(cur); cur = { words: [w], k0: k, k1: k }; }
  else { cur.words.push(w); cur.k1 = k; }
}
if (cur) segs.push(cur);

// Pads, clamped so a pad never reaches into a neighbouring word (kept or dropped) or another segment.
for (const sg of segs) {
  const first = sg.words[0], last = sg.words.at(-1);
  const before = all[sg.k0 - 1], after = all[sg.k1 + 1];
  const padIn = beats.has(first.i) ? Math.max(PAD_IN, BEAT_LEN) : PAD_IN;
  let a = first.s - padIn, b = last.e + PAD_OUT;
  // The previous segment keeps at most PAD_OUT (or half the gap) after its last word; this segment may
  // start no earlier than that. A beat word simply asks for a longer pad-in into the same pause.
  if (before) a = Math.max(a, isDropped(before) ? before.e + EPS : before.e + Math.min(PAD_OUT, (first.s - before.e) / 2));
  if (after) b = Math.min(b, isDropped(after) ? after.s - EPS : last.e + Math.min(PAD_OUT, (after.s - last.e) / 2));
  a = Math.max(0, Math.min(a, first.s)); b = Math.min(DUR, Math.max(b, last.e));
  // Snap outward to frame boundaries: a cut may land in silence, never inside a word.
  sg.a = Math.floor(a * FPS + 1e-6) / FPS; sg.b = Math.min(DUR, Math.ceil(b * FPS - 1e-6) / FPS);
}
// Merge segments that touch after snapping, or whose gap is too small to be worth a jump cut
// (unless a dropped word sits in that gap: then the cut must happen however small it is).
const edl = [];
for (const sg of segs) {
  const p = edl.at(-1);
  const droppedBetween = p && all.some((w) => isDropped(w) && w.s >= p.b - EPS && w.e <= sg.a + EPS);
  if (p && (sg.a <= p.b + 1 / FPS / 2 || (sg.a - p.b < MIN_CUT && !droppedBetween))) { p.b = Math.max(p.b, sg.b); p.words.push(...sg.words); }
  else edl.push({ a: sg.a, b: sg.b, words: [...sg.words] });
}
let t = 0; for (const sg of edl) { sg.dst = t; t += sg.b - sg.a; }
const newDur = t;

// ---- remap words to the new timeline -----------------------------------------------------------------
const kept = [];
for (const sg of edl) for (const w of sg.words) kept.push({ ...w, i: kept.length, src_i: w.i, s: +(sg.dst + w.s - sg.a).toFixed(3), e: +(sg.dst + w.e - sg.a).toFixed(3) });
const droppedWords = all.filter(isDropped);
const cuts = edl.slice(1).map((sg, k) => ({ at: +sg.dst.toFixed(3), removed: +(sg.a - edl[k].b).toFixed(3), src: [+edl[k].b.toFixed(3), +sg.a.toFixed(3)] }));

writeFileSync(`${base}.cut.edl.json`, JSON.stringify({ source: video, fps: FPS, maxGap: MAX_GAP, padIn: PAD_IN, padOut: PAD_OUT, beats: [...beats],
  segments: edl.map((s) => ({ src: [+s.a.toFixed(3), +s.b.toFixed(3)], dst: +s.dst.toFixed(3), words: s.words.length })), cuts,
  dropped: droppedWords.map((w) => ({ i: w.i, w: w.w, s: w.s })) }, null, 1));
writeFileSync(`${base}.cut.words.json`, JSON.stringify({ ...doc, source: `${base}.cut.mp4`, cutFrom: video, duration: +newDur.toFixed(3),
  words: kept, segments: [] }, null, 1));

console.log(`rough-cut · ${video}\n  ${DUR.toFixed(2)} s → ${newDur.toFixed(2)} s (−${(DUR - newDur).toFixed(2)} s) · ${edl.length} segments · ${cuts.length} cuts · ${droppedWords.length} words dropped${droppedWords.length ? ` (${droppedWords.map((w) => w.w).join(' ')})` : ''}`);
const long = cuts.filter((c) => c.removed >= 1);
if (long.length) console.log(`  check: ${long.length} cut(s) of 1 s or more (a restart or bad take?): ${long.map((c) => `src ${c.src[0]}–${c.src[1]}s`).join(', ')}`);
if (args.includes('--dry-run')) { console.log('  dry run: EDL + remapped words written, no render'); process.exit(0); }

// ---- render --------------------------------------------------------------------------------------------
const parts = []; const ins = [];
edl.forEach((s, k) => {
  const d = (s.b - s.a).toFixed(6);
  parts.push(`[0:v]trim=start=${s.a.toFixed(6)}:end=${s.b.toFixed(6)},setpts=PTS-STARTPTS[v${k}]`);
  if (hasAudio) parts.push(`[0:a]atrim=start=${s.a.toFixed(6)}:end=${s.b.toFixed(6)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${FADE},afade=t=out:st=${Math.max(0, d - FADE).toFixed(6)}:d=${FADE}[a${k}]`);
  ins.push(hasAudio ? `[v${k}][a${k}]` : `[v${k}]`);
});
parts.push(`${ins.join('')}concat=n=${edl.length}:v=1:a=${hasAudio ? 1 : 0}[v]${hasAudio ? '[a]' : ''}`);
const tmp = mkdtempSync(join(tmpdir(), 'rough-cut-')); const script = join(tmp, 'graph.txt');
writeFileSync(script, parts.join(';\n'));
// Long takes make long graphs: pass them as a file (Windows caps command lines at ~32k chars).
const major = +(execFileSync('ffmpeg', ['-version'], { encoding: 'utf8' }).match(/ffmpeg version n?(\d+)/)?.[1] ?? 6);
const graphArg = major >= 7 ? ['-/filter_complex', script] : ['-filter_complex_script', script];
const out = ['-hide_banner', '-loglevel', 'error', '-y', '-i', video, ...graphArg, '-map', '[v]', ...(hasAudio ? ['-map', '[a]'] : []),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  ...(hasAudio ? ['-c:a', 'aac', '-ar', '48000', '-b:a', '192k'] : []), '-movflags', '+faststart', `${base}.cut.mp4`];
const r = spawnSync('ffmpeg', out, { encoding: 'utf8' });
rmSync(tmp, { recursive: true, force: true });
if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
if (hasAudio) spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', `${base}.cut.mp4`, '-map', '0:a', '-c:a', 'pcm_s16le', '-ar', '48000', `${base}.cut.wav`]);
console.log(`  → ${base}.cut.mp4${hasAudio ? ` · ${base}.cut.wav` : ''} · .cut.words.json · .cut.edl.json`);
