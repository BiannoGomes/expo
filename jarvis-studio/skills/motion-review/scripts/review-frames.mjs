#!/usr/bin/env node
// review-frames: turn a render into what Claude can actually "watch": timestamp-labelled contact
// sheets of the hook and every cut, one full-res frame per scene, first/last frames, and an
// index.md that maps every image back to time. Optional safe-zone overlays per platform.
// Needs ffmpeg + ffprobe on PATH. Zero npm dependencies (Node 18+).
//
// usage: node review-frames.mjs <video.mp4> [--out review/] [--cuts 2.6,6.8] [--hook 3] [--fps 15]
//                                [--platform reels|tiktok|shorts|universal] [--scene-threshold 0.3]
// If --cuts is omitted, cuts are detected with ffmpeg's scene filter.

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = (n, d = null) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const video = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
if (!video || !existsSync(video)) { console.error('usage: node review-frames.mjs <video.mp4> [--out review/] [--cuts t1,t2] [--platform reels]'); process.exit(2); }
const out = resolve(flag('--out', join(dirname(video), 'review')));
const hookSecs = +flag('--hook', 3);
const fps = +flag('--fps', 15);
const platform = flag('--platform');
const here = dirname(fileURLToPath(import.meta.url));

const ff = (a, opts = {}) => spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { encoding: 'utf8', ...opts });
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', video], { encoding: 'utf8' }));
const vs = probe.streams.find((s) => s.codec_type === 'video');
const W = vs.width, H = vs.height;
const duration = +probe.format.duration;
const [fn, fd] = vs.r_frame_rate.split('/').map(Number); const srcFps = fn / (fd || 1);
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });

// Timestamp label: try drawtext (needs a font via fontconfig); fall back silently to unlabelled tiles.
// Input seeking resets pts to 0, so the label adds the sheet's start offset to show film time.
const LABEL = (offset) => `drawtext=text='%{pts\\:hms\\:${offset.toFixed(3)}}':x=8:y=8:fontsize=h/18:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=6`;
const labelOk = ff(['-f', 'lavfi', '-i', 'color=c=black:s=64x64:d=0.1', '-vf', LABEL(0), '-frames:v', '1', '-f', 'null', '-']).status === 0;
const lab = (vf, offset) => (labelOk ? `${vf},${LABEL(offset)}` : vf);

function sheet(name, start, len, sampleFps, cols, tileW) {
  const frames = Math.max(1, Math.round(len * sampleFps));
  const rows = Math.ceil(frames / cols);
  // select (not fps): keeps each sampled frame's true timestamp, so labels never drift by half an interval.
  const pick = `select='isnan(prev_selected_t)+gte(t-prev_selected_t\\,${(1 / sampleFps - 0.0005).toFixed(4)})'`;
  const vf = `${lab(`${pick},scale=${tileW}:-2`, Math.max(0, start))},tile=${cols}x${rows}:margin=6:padding=4:color=white`;
  const r = ff(['-ss', String(Math.max(0, start)), '-t', String(len), '-i', video, '-vf', vf, '-frames:v', '1', '-an', join(out, name)]);
  if (r.status !== 0) throw new Error(`ffmpeg failed on ${name}: ${r.stderr}`);
  return { name, start: +Math.max(0, start).toFixed(3), len, fps: sampleFps, cols, frames };
}
function still(name, t, vfExtra = '') {
  const vf = vfExtra ? vfExtra : 'null';
  const r = ff(['-ss', String(Math.max(0, t)), '-i', video, '-frames:v', '1', '-vf', vf, join(out, name)]);
  if (r.status !== 0) throw new Error(`ffmpeg failed on ${name}: ${r.stderr}`);
  return { name, t: +t.toFixed(3) };
}

// ---- cuts ----------------------------------------------------------------------------------------
let cuts;
if (flag('--cuts')) cuts = flag('--cuts').split(',').map(Number).filter((n) => n > 0 && n < duration);
else {
  const thr = flag('--scene-threshold', '0.3');
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', video, '-vf', `select='gt(scene,${thr})',showinfo`, '-an', '-f', 'null', '-'], { encoding: 'utf8' });
  cuts = [...r.stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => +m[1]).filter((t, i, a) => i === 0 || t - a[i - 1] > 0.25);
}
const bounds = [0, ...cuts, duration];
const scenes = bounds.slice(0, -1).map((s, i) => ({ n: i + 1, start: s, end: bounds[i + 1] }));

// ---- outputs -------------------------------------------------------------------------------------
const tileW = Math.round(Math.min(W, 1080) / 5);
const made = { hook: sheet('01-hook.jpg', 0, Math.min(hookSecs, duration), fps, 5, tileW) };
made.film = sheet('02-film-1fps.jpg', 0, duration, 1, 6, Math.round(Math.min(W, 1080) / 6));
made.cuts = cuts.map((t, i) => sheet(`03-cut-${String(i + 1).padStart(2, '0')}-at-${t.toFixed(2)}s.jpg`, t - 0.5, 1, fps, 5, tileW));
made.first = still('04-first-frame.png', 0);
made.last = still('04-last-frame.png', Math.max(0, duration - 1 / srcFps));
made.scenes = scenes.map((s) => ({ ...s, ...still(`05-scene-${String(s.n).padStart(2, '0')}-mid.png`, (s.start + s.end) / 2) }));

// Safe-zone overlays on each scene's mid frame: red = platform UI covers this area.
if (platform) {
  const zones = JSON.parse(readFileSync(join(here, '..', 'references', 'platforms.json'), 'utf8'));
  const z = zones.safeZones?.[platform];
  if (!z) console.warn(`⚠ no safe zone "${platform}" in platforms.json (have: ${Object.keys(zones.safeZones ?? {}).join(', ')})`);
  else {
    const sx = W / z.canvas[0], sy = H / z.canvas[1];
    const boxes = [
      z.top && `drawbox=x=0:y=0:w=iw:h=${Math.round(z.top * sy)}:color=red@0.35:t=fill`,
      z.bottom && `drawbox=x=0:y=ih-${Math.round(z.bottom * sy)}:w=iw:h=${Math.round(z.bottom * sy)}:color=red@0.35:t=fill`,
      z.left && `drawbox=x=0:y=0:w=${Math.round(z.left * sx)}:h=ih:color=red@0.35:t=fill`,
      z.right && `drawbox=x=iw-${Math.round(z.right * sx)}:y=0:w=${Math.round(z.right * sx)}:h=ih:color=red@0.35:t=fill`,
    ].filter(Boolean).join(',');
    made.safe = scenes.map((s) => still(`06-safe-${platform}-scene-${String(s.n).padStart(2, '0')}.png`, (s.start + s.end) / 2, boxes));
  }
}

// ---- index.md ------------------------------------------------------------------------------------
const L = [];
L.push(`# Review frames · ${basename(video)}`, '');
L.push(`${W}×${H} · ${srcFps.toFixed(2)} fps · ${duration.toFixed(2)} s · ${scenes.length} scene(s) · cuts at ${cuts.map((c) => c.toFixed(2) + 's').join(', ') || 'none detected'}`, '');
L.push('Read in this order. Timestamps are burned into each tile' + (labelOk ? '.' : ' (drawtext unavailable: use the maths below).'), '');
L.push(`1. **01-hook.jpg**: the first ${made.hook.len}s at ${fps} fps, 5 per row. Tile *i* (from 0) = ${'`'}i / ${fps}${'`'} s. Is frame 0 already doing something? Is the hook legible by 1.5 s?`);
L.push(`2. **02-film-1fps.jpg**: one frame per second, 6 per row. The whole arc at a glance. Does anything hold too long?`);
made.cuts.forEach((c, i) => L.push(`${3 + i}. **${c.name}**: ${c.start}s → ${(c.start + c.len).toFixed(2)}s at ${fps} fps. Does the transition read as one intentional move?`));
L.push(`- **04-first-frame.png / 04-last-frame.png**: the thumbnail frame, and the loop seam if it loops.`);
made.scenes.forEach((s) => L.push(`- **${s.name}**: scene ${s.n} (${s.start.toFixed(2)}–${s.end.toFixed(2)}s), full resolution. Check clipping, spelling, alignment and hierarchy.`));
if (made.safe) L.push(`- **06-safe-${platform}-*.png**: red = covered by ${platform} UI. No text, face or logo may sit in red.`);
writeFileSync(join(out, 'index.md'), L.join('\n') + '\n');
console.log(`review-frames → ${out}\n${L.slice(2, 3).join('')}\n${(made.cuts.length + made.scenes.length + 4 + (made.safe?.length ?? 0))} images · open index.md`);
