#!/usr/bin/env node
// 05 · THE HUMAN SIGNAL · envelope maker. The waveform on screen is driven by the score's own sound, so it is measured
// from Night Watch renders, not drawn by hand.
//
//   node envelope.mjs --work <dir>      render the isolated layers of every variant's cue into <dir> (outside the repo),
//                                       measure one loudness value per frame, write envelope.js beside this file and
//                                       write cue.json from the default variant
//   node envelope.mjs --check           exit 1 unless cue.json equals the default variant's cue in data.js and
//                                       envelope.js was made from the cues data.js holds now
//
// Layers (each a full Night Watch render of the variant's cue with the other layers switched off; turning a layer off
// never changes another layer's texture, see lib/night-watch.js):
//   bells   stingAt + land only (heartbeat, pad, sea, ticks, hits off)
//   heart   the heartbeat only (stingAt and land null). Without land the heartbeat doesn't fade after the landing;
//           the bids that carry `heart` end before the land time in every variant, so the window used is identical.
// Measure: RMS over a 1/30 s window centred on each frame -> dB relative to the layer's own peak -> mapped from
// -42..0 dB to 0..1 -> a peak hold with a 0.18 s exponential release (so a 70 ms thump stays visible for a few frames).
// Needs: the env of tools/night-watch-render.mjs (PLAYWRIGHT_MODULE, CHROMIUM_PATH), Node 22.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const RENDER = resolve(HERE, "../../tools/night-watch-render.mjs");
const FPS = 30, FLOOR_DB = -42, RELEASE = 0.18;

function loadData(variant) {
  const ctx = { window: { SIGNAL_VARIANT: variant } };
  ctx.globalThis = ctx;
  vm.runInNewContext(readFileSync(resolve(HERE, "data.js"), "utf8"), ctx);
  return ctx.window;
}
const stable = o => JSON.stringify(o, Object.keys(o).sort());
const cueHash = cues => createHash("sha256").update(JSON.stringify(cues)).digest("hex").slice(0, 16);

function readWav(p) {
  const b = readFileSync(p);
  let o = 12, fmt = null, data = null;
  while (o + 8 <= b.length) {
    const id = b.toString("ascii", o, o + 4), n = b.readUInt32LE(o + 4);
    if (id === "fmt ") fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) };
    if (id === "data") data = b.subarray(o + 8, o + 8 + n);
    o += 8 + n + (n & 1);
  }
  if (!fmt || !data || fmt.bits !== 16) throw new Error("envelope: expected a 16-bit WAV: " + p);
  const frames = data.length / (2 * fmt.ch), mono = new Float32Array(frames);
  for (let i = 0; i < frames; i++) { let s = 0; for (let c = 0; c < fmt.ch; c++) s += data.readInt16LE((i * fmt.ch + c) * 2); mono[i] = s / fmt.ch / 32768; }
  return { sr: fmt.sr, x: mono };
}

function envelope(wav, duration) {
  const n = Math.round(duration * FPS) + 1, half = Math.round(wav.sr / FPS / 2), db = [];
  for (let k = 0; k < n; k++) {
    const c = Math.round((k / FPS) * wav.sr); let acc = 0, m = 0;
    for (let i = Math.max(0, c - half); i < Math.min(wav.x.length, c + half); i++) { acc += wav.x[i] * wav.x[i]; m++; }
    db.push(10 * Math.log10(acc / Math.max(1, m) + 1e-12));
  }
  const peak = Math.max(...db), out = []; let prev = 0;
  const rel = Math.exp(-1 / FPS / RELEASE);
  for (let k = 0; k < n; k++) {
    let v = Math.min(1, Math.max(0, (db[k] - peak - FLOOR_DB) / -FLOOR_DB));
    v = Math.max(v, prev * rel); prev = v;
    out.push(+v.toFixed(3));
  }
  return out;
}

const args = process.argv.slice(2);
const def = loadData(undefined), variants = Object.keys(def.SIGNAL_VARIANTS);
const cues = {}; for (const v of variants) cues[v] = loadData(v).DATA.cue;

if (args[0] === "--check") {
  let ok = true;
  const cue = JSON.parse(readFileSync(resolve(HERE, "cue.json"), "utf8"));
  if (stable(cue) !== stable(def.DATA.cue)) { console.error("check: cue.json != data.js cue for variant " + def.DATA.variant); ok = false; }
  const ctx = { window: {} }; ctx.globalThis = ctx;
  vm.runInNewContext(readFileSync(resolve(HERE, "envelope.js"), "utf8"), ctx);
  if (!ctx.window.SIGNAL_ENV || ctx.window.SIGNAL_ENV.cueHash !== cueHash(cues)) { console.error("check: envelope.js is stale (run node envelope.mjs --work <dir>)"); ok = false; }
  console.log(ok ? "check: OK (cue.json = data.js cue, envelope.js current)" : "check: FAILED");
  process.exit(ok ? 0 : 1);
}
if (args[0] !== "--work" || !args[1]) { console.error("usage: node envelope.mjs --work <dir> | --check"); process.exit(2); }
const WORK = resolve(args[1]); mkdirSync(WORK, { recursive: true });

const ENV = { fps: FPS, floorDb: FLOOR_DB, release: RELEASE, cueHash: cueHash(cues), variants: {} };
for (const v of variants) {
  const cue = cues[v], layers = {
    bells: { ...cue, heartbeat: false, pad: false, sea: false, ticks: false, hits: false },
    heart: { ...cue, pad: false, sea: false, ticks: false, hits: false, stingAt: null, land: null }
  };
  ENV.variants[v] = {};
  for (const [name, c] of Object.entries(layers)) {
    const cp = resolve(WORK, `${v}-${name}.cue.json`), wp = resolve(WORK, `${v}-${name}.wav`);
    writeFileSync(cp, JSON.stringify(c));
    execFileSync(process.execPath, [RENDER, cp, wp], { stdio: ["ignore", "ignore", "inherit"] });
    ENV.variants[v][name] = envelope(readWav(wp), cue.duration);
    const e = ENV.variants[v][name], top = e.map((x, k) => [x, k]).filter(([x]) => x > 0.9).slice(0, 4).map(([, k]) => (k / FPS).toFixed(2));
    console.log(`envelope: ${v}/${name}: ${e.length} frames; first frames above .9 at ${top.join(", ")} s`);
  }
}
writeFileSync(resolve(HERE, "envelope.js"),
  "// 05 · THE HUMAN SIGNAL · measured loudness envelopes, one value per frame (30 fps), written by `node envelope.mjs`.\n" +
  "// Data, not copy. Do not edit by hand: change the cue in data.js and run the script again.\n" +
  "(function (w) { w.SIGNAL_ENV = " + JSON.stringify(ENV) + "; })(typeof window !== \"undefined\" ? window : globalThis);\n");
writeFileSync(resolve(HERE, "cue.json"), JSON.stringify(def.DATA.cue) + "\n");
console.log("envelope: wrote envelope.js and cue.json (variant " + def.DATA.variant + ")");
