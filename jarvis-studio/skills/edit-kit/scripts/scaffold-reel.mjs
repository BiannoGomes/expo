#!/usr/bin/env node
// scaffold-reel: turn a rough cut + captions into a HyperFrames project that lints, checks and renders.
// Copies the verified talking-reel starter, the cut video, the voice track and captions.js into <out-dir>,
// and fills in the duration. Brand styling is the next step (see the template's header comment).
// Zero dependencies (Node 18+).
//
// usage: node scaffold-reel.mjs take.cut.mp4 <out-dir>
//   expects next to the video: take.cut.wav (from rough-cut) and take.cut.captions.js (from captions)

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [video, outArg] = process.argv.slice(2);
if (!video || !outArg) { console.error('usage: node scaffold-reel.mjs take.cut.mp4 <out-dir>'); process.exit(2); }
const base = video.replace(/\.mp4$/i, '');
const voice = `${base}.wav`, caps = `${base}.captions.js`;
for (const f of [video, voice, caps]) if (!existsSync(f)) { console.error(`missing ${f}: run rough-cut and captions first`); process.exit(2); }
const tpl = join(dirname(fileURLToPath(import.meta.url)), '..', 'templates', 'talking-reel');
const out = resolve(outArg);
if (existsSync(join(out, 'index.html'))) { console.error(`${out}/index.html exists: not overwriting. Pick a new folder (v2, v3…).`); process.exit(1); }

const dur = (+execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], { encoding: 'utf8' })).toFixed(3);
for (const d of ['assets', 'vendor', 'fonts']) mkdirSync(join(out, d), { recursive: true });
for (const d of ['vendor', 'fonts']) for (const f of readdirSync(join(tpl, d))) copyFileSync(join(tpl, d, f), join(out, d, f));
copyFileSync(video, join(out, 'assets', 'take.mp4'));
copyFileSync(voice, join(out, 'assets', 'voice.wav'));
copyFileSync(caps, join(out, 'assets', 'captions.js'));
const cam = `${base}.camera.js`; // optional real-pixel multicam plan from multicam-plan.mjs
if (existsSync(cam)) copyFileSync(cam, join(out, 'assets', 'camera.js'));
else writeFileSync(join(out, 'assets', 'camera.js'), '// no multicam plan: a single real framing (object-fit: cover)\nwindow.CAMERA = null;\n');
writeFileSync(join(out, 'index.html'), readFileSync(join(tpl, 'index.html'), 'utf8').replaceAll('{{DURATION}}', dur));
console.log(`scaffold-reel → ${out}\n  ${dur} s · assets/take.mp4 · assets/voice.wav · assets/captions.js · assets/camera.js${existsSync(cam) ? ' (multicam plan)' : ' (single framing)'}\n  next: brand it (tokens + --cap-* variables), then hyperframes lint → check → preview → render`);
