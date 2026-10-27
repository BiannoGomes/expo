#!/usr/bin/env node
// Night Watch renderer: cue.json -> score.wav (48 kHz stereo), using lib/night-watch.js in headless Chromium.
//
//   node tools/night-watch-render.mjs <cue.json> <out.wav> [--sr 48000] [--bits 16|32] [--json]
//
// The cue format and its optional fields are documented at the top of lib/night-watch.js.
// The page is a data: URL with the module injected, so no server is needed; OfflineAudioContext renders the score.
//
// Environment (documented defaults):
//   PLAYWRIGHT_MODULE  path to the playwright package     (default /opt/node22/lib/node_modules/playwright)
//   CHROMIUM_PATH      Chromium executable                 (default /opt/pw-browsers/chromium-1194/chrome-linux/chrome)
// Exit code: 0 on success, 1 on any error (bad cue, page error, empty render).
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = resolve(HERE, "../lib/night-watch.js");
const PLAYWRIGHT_MODULE = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright";
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function usage(msg) {
  if (msg) console.error("night-watch-render: " + msg);
  console.error("usage: node tools/night-watch-render.mjs <cue.json> <out.wav> [--sr 48000] [--bits 16|32] [--json]");
  process.exit(1);
}

const args = process.argv.slice(2), pos = [];
let sr = 48000, bits = 16, asJson = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--sr") sr = Number(args[++i]);
  else if (a === "--bits") bits = Number(args[++i]);
  else if (a === "--json") asJson = true;
  else if (a === "-h" || a === "--help") usage();
  else if (a.startsWith("--")) usage("unknown option " + a);
  else pos.push(a);
}
if (pos.length !== 2) usage("need <cue.json> and <out.wav>");
if (!(sr >= 8000 && sr <= 192000)) usage("--sr must be 8000..192000");
if (bits !== 16 && bits !== 32) usage("--bits must be 16 or 32");
const [cuePath, outPath] = pos.map(p => resolve(p));

let cue;
try { cue = JSON.parse(readFileSync(cuePath, "utf8")); } catch (e) { usage(`can't read cue ${cuePath}: ${e.message}`); }

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require(PLAYWRIGHT_MODULE)); } catch (e) { usage(`can't load Playwright from ${PLAYWRIGHT_MODULE} (set PLAYWRIGHT_MODULE): ${e.message}`); }

const t0 = Date.now();
const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
let code = 0;
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("console error: " + m.text()); });
  await page.goto("data:text/html;charset=utf-8," + encodeURIComponent("<!doctype html><meta charset=utf-8><title>Night Watch</title>"));
  await page.addScriptTag({ content: readFileSync(LIB, "utf8") + "\n//# sourceURL=night-watch.js" });
  const res = await page.evaluate(async ({ cue, sr, bits }) => {
    const buf = await window.NightWatch.render(cue, sr);
    let peak = 0;
    for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; } }
    const bytes = new Uint8Array(window.NightWatch.toWav(buf, { bits }));
    let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { b64: btoa(s), seconds: buf.length / buf.sampleRate, frames: buf.length, sampleRate: buf.sampleRate, channels: buf.numberOfChannels, samplePeak: peak, cue: window.NightWatch.normCue(cue) };
  }, { cue, sr, bits });
  if (errors.length) throw new Error(errors.join("\n"));
  if (!res.frames || !(res.samplePeak > 0)) throw new Error("render came back empty");
  mkdirSync(dirname(outPath), { recursive: true });
  const wav = Buffer.from(res.b64, "base64");
  writeFileSync(outPath, wav);
  const info = { out: outPath, seconds: res.seconds, frames: res.frames, sampleRate: res.sampleRate, channels: res.channels, bits, bytes: wav.length,
    samplePeakDbfs: +(20 * Math.log10(res.samplePeak)).toFixed(2), renderMs: Date.now() - t0, cue: res.cue };
  if (asJson) console.log(JSON.stringify(info));
  else console.log(`night-watch-render: ${outPath} · ${res.seconds.toFixed(3)} s · ${res.sampleRate} Hz · ${res.channels} ch · ${bits}-bit · sample peak ${info.samplePeakDbfs} dBFS · ${info.renderMs} ms`);
} catch (e) {
  console.error("night-watch-render: FAILED: " + (e && e.message ? e.message : e));
  code = 1;
} finally {
  await browser.close();
}
process.exit(code);
