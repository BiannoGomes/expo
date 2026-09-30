#!/usr/bin/env node
// spec-check: technical QA of a finished render against a platform preset. Checks the container,
// codec, pixel format, colour tags, size, fps, duration, audio, faststart, loudness and true peak,
// plus motion health: frozen holds, a flat/empty opening frame, and flash risk (a WCAG 2.3.1 heuristic).
// Needs ffmpeg + ffprobe on PATH. Zero npm dependencies (Node 18+).
//
// usage: node spec-check.mjs <video.mp4> [--platform reels|tiktok|shorts|feed45|youtube|linkedin|x] [--max-hold 1.5] [--json]
// exit:  0 = pass (warnings allowed) · 1 = at least one FAIL · 2 = usage error

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, openSync, readSync, closeSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = (n, d = null) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const video = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
if (!video || !existsSync(video)) { console.error('usage: node spec-check.mjs <video.mp4> [--platform reels] [--max-hold 1.5] [--json]'); process.exit(2); }
const here = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(here, '..', 'references', 'platforms.json'), 'utf8'));
const pName = flag('--platform', 'universal');
const P = { ...cfg.presets?.default, ...cfg.presets?.[pName] };
if (!cfg.presets?.[pName]) console.warn(`⚠ unknown preset "${pName}", using defaults (have: ${Object.keys(cfg.presets ?? {}).join(', ')})`);
const maxHold = +flag('--max-hold', P.maxHoldSeconds ?? 1.5);

const results = [];
const check = (level, name, ok, detail) => results.push({ status: ok ? 'PASS' : level, name, detail });
const info = (name, detail) => results.push({ status: 'INFO', name, detail });

const pr = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', video], { encoding: 'utf8' }));
const v = pr.streams.find((s) => s.codec_type === 'video');
const a = pr.streams.filter((s) => s.codec_type === 'audio');
const dur = +pr.format.duration;
const [fn, fd] = (v.avg_frame_rate !== '0/0' ? v.avg_frame_rate : v.r_frame_rate).split('/').map(Number);
const fps = fn / (fd || 1);
const sizeMB = statSync(video).size / 1e6;

// ---- container / stream ---------------------------------------------------------------------------
check('FAIL', 'container', /mp4|mov/.test(pr.format.format_name), pr.format.format_name);
if (P.mp4Only) check('FAIL', 'mp4 (not mov)', /\.mp4$/i.test(video) && !/qt/.test(pr.format.tags?.major_brand ?? ''), `${video.split('.').pop()} · brand ${pr.format.tags?.major_brand ?? '?'} (LinkedIn no longer accepts MOV)`);
check('FAIL', 'video codec', v.codec_name === (P.videoCodec ?? 'h264'), `${v.codec_name} ${v.profile ?? ''}`.trim());
check('FAIL', 'pixel format', v.pix_fmt === 'yuv420p', v.pix_fmt);
if (P.width && P.height) check('FAIL', 'resolution', v.width === P.width && v.height === P.height, `${v.width}×${v.height} (want ${P.width}×${P.height})`);
else info('resolution', `${v.width}×${v.height}`);
if (P.aspect) { const [aw, ah] = P.aspect.split(':').map(Number); check('FAIL', 'aspect', Math.abs(v.width / v.height - aw / ah) < 0.01, `${(v.width / v.height).toFixed(4)} vs ${P.aspect}`); }
check('FAIL', 'frame rate', fps >= (P.fpsMin ?? 23.976) - 0.01 && fps <= (P.fpsMax ?? 60) + 0.01, `${fps.toFixed(3)} fps (allowed ${P.fpsMin ?? 23.976}–${P.fpsMax ?? 60})`);
check('WARN', 'constant frame rate', v.avg_frame_rate === v.r_frame_rate, `avg ${v.avg_frame_rate} vs r ${v.r_frame_rate}`);
if (P.maxSeconds) check('FAIL', 'duration max', dur <= P.maxSeconds, `${dur.toFixed(2)} s (max ${P.maxSeconds})`);
if (P.minSeconds) check('FAIL', 'duration min', dur >= P.minSeconds, `${dur.toFixed(2)} s (min ${P.minSeconds})`);
if (P.idealMaxSeconds) check('WARN', 'duration ideal', dur <= P.idealMaxSeconds, `${dur.toFixed(2)} s (platform recommends ≤ ${P.idealMaxSeconds})`);
if (P.maxWidth || P.maxHeight) check('WARN', 'max dimensions', v.width <= (P.maxWidth ?? Infinity) && v.height <= (P.maxHeight ?? Infinity), `${v.width}×${v.height} (platform max ${P.maxWidth}×${P.maxHeight}; it will downscale)`);
if (P.maxFileMB) check('FAIL', 'file size', sizeMB <= P.maxFileMB, `${sizeMB.toFixed(1)} MB (max ${P.maxFileMB})`);
else info('file size', `${sizeMB.toFixed(1)} MB`);
check('WARN', 'colour range', (v.color_range ?? 'tv') === 'tv', v.color_range ?? 'unset (treated as tv)');
check('WARN', 'colour primaries bt709', !v.color_primaries || v.color_primaries === 'bt709', v.color_primaries ?? 'unset');
check('WARN', 'audio track present', a.length === 1, `${a.length} audio stream(s) (some platforms reject or mis-handle silent/no-audio uploads)`);
if (a[0]) {
  check('WARN', 'audio codec aac', a[0].codec_name === 'aac', a[0].codec_name);
  check('WARN', 'audio sample rate', [44100, 48000].includes(+a[0].sample_rate), `${a[0].sample_rate} Hz`);
}

// faststart: top-level 'moov' atom must come before 'mdat' so playback starts before full download.
function atomOrder(path) {
  const fd = openSync(path, 'r'); const size = statSync(path).size; const buf = Buffer.alloc(16); const order = [];
  let pos = 0;
  while (pos < size && order.length < 50) {
    readSync(fd, buf, 0, 16, pos);
    let len = buf.readUInt32BE(0); const type = buf.toString('latin1', 4, 8);
    if (len === 1) len = Number(buf.readBigUInt64BE(8)); else if (len === 0) len = size - pos;
    order.push(type); if (len < 8) break; pos += len;
  }
  closeSync(fd); return order;
}
const atoms = atomOrder(video);
check('WARN', 'faststart (moov before mdat)', atoms.indexOf('moov') > -1 && atoms.indexOf('moov') < atoms.indexOf('mdat'), atoms.join(' → '));

// ---- loudness -------------------------------------------------------------------------------------
if (a[0]) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', video, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
  const I = +(r.stderr.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop()?.match(/-?[\d.]+/)?.[0] ?? NaN);
  const TP = +(r.stderr.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/g)?.pop()?.match(/-?[\d.]+|-inf/)?.[0] ?? NaN);
  if (Number.isFinite(I) && I <= -60) info('integrated loudness', `${I.toFixed(1)} LUFS: a silent track (fine for a muted-first piece; add music or VO and re-check)`);
  else if (Number.isFinite(I)) {
    const [lo, hi] = P.lufsRange ?? [-16, -12];
    check('WARN', 'integrated loudness', I >= lo && I <= hi, `${I.toFixed(1)} LUFS (target ${lo} to ${hi}; ${P.lufsNote ?? ''})`.trim());
  } else info('integrated loudness', 'silent or unmeasurable');
  if (Number.isFinite(TP)) check('WARN', 'true peak', TP <= (P.truePeakMax ?? -1), `${TP.toFixed(1)} dBTP (max ${P.truePeakMax ?? -1})`);
}

// ---- motion health --------------------------------------------------------------------------------
const fz = spawnSync('ffmpeg', ['-hide_banner', '-i', video, '-vf', `freezedetect=n=0.001:d=${maxHold}`, '-map', '0:v:0', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const starts = [...fz.matchAll(/freeze_start: ([\d.]+)/g)].map((m) => +m[1]);
const durs = [...fz.matchAll(/freeze_duration: ([\d.]+)/g)].map((m) => +m[1]);
const holds = starts.map((s, i) => `${s.toFixed(2)}s for ${(durs[i] ?? dur - s).toFixed(2)}s`);
check('WARN', `holds over ${maxHold}s`, holds.length === 0, holds.length ? holds.join(', ') + '. Intentional? A CTA end-hold is fine, and it should be in the storyboard' : 'none');

// One pass over luma stats: the first frame's range (empty opening?) plus per-frame average (flash risk).
const st = spawnSync('ffmpeg', ['-hide_banner', '-i', video, '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG:key=lavfi.signalstats.YMIN:key=lavfi.signalstats.YMAX', '-map', '0:v:0', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
const yavg = [...st.matchAll(/YAVG=([\d.]+)/g)].map((m) => +m[1]);
const ymin0 = +(st.match(/YMIN=([\d.]+)/)?.[1] ?? 0); const ymax0 = +(st.match(/YMAX=([\d.]+)/)?.[1] ?? 0);
check('WARN', 'opening frame not empty', ymax0 - ymin0 > 24, `frame 0 luma range ${ymin0}–${ymax0}${ymax0 - ymin0 <= 24 ? ': looks flat/empty (house rule: no empty opening frame)' : ''}`);
// Flash heuristic: count luma swings of more than 20% of full range; flag if more than 3 opposing swings in any 1 s window.
const swings = [];
for (let i = 1; i < yavg.length; i++) { const d = yavg[i] - yavg[i - 1]; if (Math.abs(d) > 0.2 * 255) swings.push({ t: i / fps, s: Math.sign(d) }); }
let worst = 0;
for (let i = 0; i < swings.length; i++) { const win = swings.filter((x) => x.t >= swings[i].t && x.t < swings[i].t + 1); let pairs = 0; for (let j = 1; j < win.length; j++) if (win[j].s !== win[j - 1].s) pairs++; worst = Math.max(worst, Math.ceil(pairs / 2)); }
check('FAIL', 'flash risk (WCAG 2.3.1 heuristic)', worst <= 3, `${worst} flash pair(s) in the worst 1 s window (limit 3). Heuristic on average luma only: confirm by eye`);

// ---- report ---------------------------------------------------------------------------------------
if (args.includes('--json')) console.log(JSON.stringify({ video, preset: pName, results }, null, 2));
else {
  console.log(`spec-check · ${video} · preset "${pName}"${P.source ? ` · spec source: ${P.source}` : ''}`);
  for (const r of results) console.log(`${{ PASS: '✔', WARN: '⚠', FAIL: '✖', INFO: 'ℹ' }[r.status]} ${r.name.padEnd(30)} ${r.detail}`);
}
process.exit(results.some((r) => r.status === 'FAIL') ? 1 : 0);
