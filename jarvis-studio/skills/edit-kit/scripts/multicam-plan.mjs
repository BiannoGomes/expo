#!/usr/bin/env node
// multicam-plan: "one take, every angle" with REAL PIXELS ONLY. Plans virtual camera framings as crops of
// the real take (wide / medium / offset / close), hard cuts placed inside the breaths between phrases
// (never mid-word), a gentle push-in inside each shot, and optional supers cut from the spoken words.
// Nothing is generated: no AI re-render, no synthetic angle, no altered face or eye line. That keeps it
// within the Becoming Project's "No AI Bianno" rule. Zero dependencies (Node 18+); ffprobe for the source size.
//
// usage: node multicam-plan.mjs take.cut.mp4 take.cut.words.json --face 0.5,0.38
//          [--key "could become"] [--supers "THE MAN,PROUD TO MEET"] [--min-shot 1.2] [--max-shot 4]
//          [--push 1.04] [--transition cut|whip] [--canvas 1080x1920]
//   --face  normalised centre of the face in the SOURCE frame (read it off the review-frames sheets)
//   --key   the key line: its shot is the close-up and gets the longest hold
//   --supers words to lift into on-screen supers, each matched to where it is spoken
// writes: take.cut.camera.json + take.cut.camera.js (window.CAMERA = …, read by the talking-reel template)

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (n, d = null) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const pos = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
const [video, wordsPath] = pos;
if (!video || !wordsPath) { console.error('usage: node multicam-plan.mjs take.cut.mp4 take.cut.words.json --face 0.5,0.38 [--key "phrase"] [--supers "A,B"]'); process.exit(2); }
const [FX, FY] = (flag('--face', '0.5,0.38')).split(',').map(Number);
const [CW, CH] = (flag('--canvas', '1080x1920')).split('x').map(Number);
const MIN_SHOT = +flag('--min-shot', 1.2), MAX_SHOT = +flag('--max-shot', 4), PUSH = +flag('--push', 1.04);
const TRANSITION = flag('--transition', 'cut');
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}' ]/gu, '').trim();

const pr = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', video], { encoding: 'utf8' }));
const vs = pr.streams.find((s) => s.codec_type === 'video');
const rot = Math.abs(+(vs.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? vs.tags?.rotate ?? 0)) % 180 === 90;
const W = rot ? vs.height : vs.width, H = rot ? vs.width : vs.height;
const DUR = +pr.format.duration;
const [fn, fd] = (vs.avg_frame_rate !== '0/0' ? vs.avg_frame_rate : vs.r_frame_rate).split('/').map(Number); const FPS = fn / (fd || 1);
const snap = (t) => Math.round(t * FPS) / FPS;
const words = JSON.parse(readFileSync(wordsPath, 'utf8')).words.sort((a, b) => a.s - b.s);

// ---- framings (real crops) --------------------------------------------------------------------------
// The video element is sized to "cover" the canvas (base scale S0). A framing = zoom z plus where the face
// should land on the canvas. The crop is clamped so no frame ever shows an empty edge.
const S0 = Math.max(CW / W, CH / H);
const FRAMINGS = {
  wide:   { z: 1.0,  at: [0.5, 0.40] },
  medium: { z: 1.3,  at: [0.5, 0.40] },
  offset: { z: 1.25, at: [0.62, 0.40] },  // subject on the right third: open space on the left for a super
  close:  { z: 1.75, at: [0.5, 0.36] },
};
function state(name, zMul = 1) {
  const f = FRAMINGS[name]; const z = f.z * zMul; const S = S0 * z;
  let x = f.at[0] * CW - FX * W * S, y = f.at[1] * CH - FY * H * S;
  x = Math.min(0, Math.max(CW - W * S, x)); y = Math.min(0, Math.max(CH - H * S, y));
  return { scale: +z.toFixed(4), x: +x.toFixed(1), y: +y.toFixed(1), upscale: +S.toFixed(3) };
}

// ---- cut points: inside breaths or on phrase starts, never inside a word --------------------------------
const cands = [];
for (let k = 1; k < words.length; k++) {
  const p = words[k - 1], w = words[k]; const gap = w.s - p.e;
  if (gap >= 0.12) cands.push({ t: snap(p.e + gap / 2), k, strength: gap + (/[.!?]$/.test(p.w) ? 1 : /[,;:]$/.test(p.w) ? 0.4 : 0) });
  else if (/[.!?,;:]$/.test(p.w)) cands.push({ t: snap(w.s - 0.02), k, strength: 0.3 });
}
// Key line: where it starts and ends in the words.
let key = null;
if (flag('--key')) {
  const kw = norm(flag('--key')).split(/\s+/);
  for (let k = 0; k + kw.length <= words.length; k++) if (kw.every((x, j) => norm(words[k + j].w) === x)) { key = { k0: k, k1: k + kw.length - 1, s: words[k].s, e: words[k + kw.length - 1].e }; break; }
  if (!key) console.warn(`⚠ key line "${flag('--key')}" not found in the transcript`);
}

// Walk forward: the key line always gets its own cut; otherwise take the strongest breath between
// MIN_SHOT and MAX_SHOT after the last cut (earliest wins ties). Nothing ever cuts inside the key line.
const inKey = (t) => key && t > key.s - 0.05 && t < key.e + 0.25;
const keyCut = key ? (cands.filter((c) => c.t <= key.s + 0.01 && c.t >= key.s - 0.6).at(-1)?.t ?? snap(Math.max(0, key.s - 0.03))) : null;
const cuts = []; let last = 0; let keyDone = keyCut === null || keyCut < MIN_SHOT * 0.8;
for (;;) {
  if (!keyDone && keyCut - last <= MAX_SHOT && keyCut - last >= MIN_SHOT * 0.8) { cuts.push(keyCut); last = keyCut; keyDone = true; continue; }
  const ok = (c) => c.t >= last + MIN_SHOT && DUR - c.t >= MIN_SHOT && !inKey(c.t) && (keyDone || c.t <= keyCut - MIN_SHOT);
  const inWindow = cands.filter((c) => ok(c) && c.t <= last + MAX_SHOT);
  const pick = inWindow.sort((x, y) => y.strength - x.strength || x.t - y.t)[0] ?? cands.find(ok);
  if (!pick) { if (!keyDone && keyCut > last) { cuts.push(keyCut); last = keyCut; keyDone = true; continue; } break; }
  cuts.push(pick.t); last = pick.t;
}
// Return to the original framing for the outro when there's room (like a director sitting on the wide).
const bounds = [0, ...cuts, snap(DUR)];

// ---- assign framings ------------------------------------------------------------------------------------
const cycle = ['offset', 'medium', 'close'];
const shots = []; let ci = 0;
for (let i = 0; i < bounds.length - 1; i++) {
  const s = bounds[i], e = bounds[i + 1];
  let f;
  if (i === 0) f = 'wide';
  else if (key && s <= key.s + 0.01 && e >= key.s) f = 'close';
  else if (i === bounds.length - 2 && bounds.length > 3) f = 'wide';
  else { f = cycle[ci % cycle.length]; ci++; if (f === 'close' && key) { f = cycle[ci % cycle.length]; ci++; } }
  if (shots.length && shots.at(-1).frame === f) f = f === 'wide' ? 'medium' : 'wide';
  shots.push({ s: +s.toFixed(3), e: +e.toFixed(3), frame: f, from: state(f), to: state(f, PUSH) });
}

// ---- supers: lifted from the spoken words, placed away from the face -------------------------------------
const supers = [];
for (const raw of (flag('--supers', '') || '').split(',').map((s) => s.trim()).filter(Boolean)) {
  const sw = norm(raw).split(/\s+/);
  let hit = null;
  for (let k = 0; k + sw.length <= words.length; k++) if (sw.every((x, j) => norm(words[k + j].w) === x)) { hit = k; break; }
  if (hit === null) { console.warn(`⚠ super "${raw}" isn't spoken in the take: supers must be the speaker's own words`); continue; }
  const s = words[hit].s, e = Math.max(words[hit + sw.length - 1].e + 0.8, s + 1.2);
  const shot = shots.find((sh) => s >= sh.s && s < sh.e);
  // Face sits at ~36–40% height in every framing, so supers go in the lower band (safe zone y ≤ 1500),
  // or top-left when the framing leaves the left third open.
  supers.push({ text: raw, s: +s.toFixed(3), e: +Math.min(e, DUR).toFixed(3), place: shot?.frame === 'offset' ? 'left' : 'low' });
}

const warnings = [];
const maxUp = Math.max(...shots.map((s) => s.to.upscale));
if (maxUp > 1.15) warnings.push(`the tightest framing upscales the source ${maxUp.toFixed(2)}× (${W}×${H}): it will look soft. Film vertical 4K (2160×3840) for clean close-ups, or pass a smaller close-up zoom`);
if (FX === 0.5 && FY === 0.38 && !args.includes('--face')) warnings.push('no --face given: assumed centre, 38% height. Read the real face position off the review-frames sheets');
if (shots.length < 3) warnings.push('fewer than 3 shots: the take may be too short or have no clean breaths to cut on');

const plan = { source: video, sourceSize: [W, H], canvas: [CW, CH], face: [FX, FY], fps: FPS, duration: +DUR.toFixed(3), transition: TRANSITION,
  realPixelsOnly: true, key, shots, supers, warnings };
const base = video.replace(/\.mp4$/i, '');
writeFileSync(`${base}.camera.json`, JSON.stringify(plan, null, 1));
writeFileSync(`${base}.camera.js`, `// generated by edit-kit/multicam-plan.mjs · real pixels only. Regenerate, don't hand-edit.\nwindow.CAMERA = ${JSON.stringify(plan)};\n`);
console.log(`multicam-plan · ${W}×${H} → ${CW}×${CH} · ${shots.length} shots · ${supers.length} supers · transition: ${TRANSITION}`);
for (const s of shots) console.log(`  ${s.s.toFixed(2).padStart(6)}–${s.e.toFixed(2).padEnd(6)} ${s.frame.padEnd(7)} zoom ${s.from.scale}→${s.to.scale}`);
for (const s of supers) console.log(`  super "${s.text}" ${s.s}–${s.e}s (${s.place})`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
console.log(`  → ${base}.camera.json · .camera.js`);
