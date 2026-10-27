#!/usr/bin/env node
// Audio QA for Becoming pieces (foundation spec decision 11). Measures, prints a table and one JSON line, exits 1 on failure.
//
//   node tools/audio-qa.mjs <final.wav|.mp4|.m4a> [options]
//
// Gates (always):
//   integrated loudness   ebur128, target -14 LUFS +/- 0.5      (--lufs N, --lufs-tol N)
//   true peak             ebur128 peak=true, <= -1.0 dBTP        (--tp N)
//   sub-60 Hz gap         RMS of 150 Hz-4 kHz minus RMS below 60 Hz, >= 18 dB   (--gap N)
//                         same filters as audit/evidence/score-band-probe.txt: below 60 Hz = three cascaded 2-pole
//                         low-passes; a band = two cascaded 2-pole filters per edge (ffmpeg highpass/lowpass + astats)
// Gates when a voice is in the mix (pass the stems mix.sh writes with --voice):
//   score duck            median drop of the score under speech, 12-15 dB  (--duck MIN:MAX)
//                         = level of score-post vs score-pre in 50 ms windows inside speech, from the voice stem
//   voice stem loudness   -16 LUFS +/- 1                                     (--voice-lufs N, --voice-tol N)
//   Stems: --stems DIR (reads DIR/voice.wav, DIR/score-pre.wav, DIR/score-post.wav)
//          or --voice V.wav --score-pre PRE.wav --score-post POST.wav
// Other options: --json FILE (also write the JSON there), --quiet (JSON line only)
//
// Environment: FFMPEG (default "ffmpeg"). Exit codes: 0 all PASS, 1 any FAIL or measurement error, 2 usage error.
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

const FFMPEG = process.env.FFMPEG || "ffmpeg";

function usage(msg) {
  if (msg) console.error("audio-qa: " + msg);
  console.error("usage: node tools/audio-qa.mjs <final.wav|mp4> [--stems DIR | --voice V --score-pre PRE --score-post POST] [--lufs -14] [--lufs-tol 0.5] [--tp -1] [--gap 18] [--duck 12:15] [--voice-lufs -16] [--voice-tol 1] [--json FILE] [--quiet]");
  process.exit(2);
}

// ---------- args ----------
const a = process.argv.slice(2), pos = [];
const opt = { lufs: -14, lufsTol: 0.5, tp: -1.0, gap: 18, duckMin: 12, duckMax: 15, voiceLufs: -16, voiceTol: 1, json: null, quiet: false, stems: null, voice: null, pre: null, post: null };
const num = (v, k) => { const n = Number(v); if (!isFinite(n)) usage(`${k} needs a number`); return n; };
for (let i = 0; i < a.length; i++) {
  const k = a[i], v = () => { if (i + 1 >= a.length) usage(`${k} needs a value`); return a[++i]; };
  switch (k) {
    case "--lufs": opt.lufs = num(v(), k); break;
    case "--lufs-tol": opt.lufsTol = num(v(), k); break;
    case "--tp": opt.tp = num(v(), k); break;
    case "--gap": opt.gap = num(v(), k); break;
    case "--duck": { const [x, y] = v().split(":").map(Number); if (!isFinite(x) || !isFinite(y) || x > y) usage("--duck needs MIN:MAX"); opt.duckMin = x; opt.duckMax = y; break; }
    case "--voice-lufs": opt.voiceLufs = num(v(), k); break;
    case "--voice-tol": opt.voiceTol = num(v(), k); break;
    case "--stems": opt.stems = resolve(v()); break;
    case "--voice": opt.voice = resolve(v()); break;
    case "--score-pre": opt.pre = resolve(v()); break;
    case "--score-post": opt.post = resolve(v()); break;
    case "--json": opt.json = resolve(v()); break;
    case "--quiet": opt.quiet = true; break;
    case "-h": case "--help": usage();
    default: if (k.startsWith("--")) usage("unknown option " + k); pos.push(k);
  }
}
if (pos.length !== 1) usage("need exactly one input file");
const input = resolve(pos[0]);
if (!existsSync(input)) usage("no such file " + input);
if (opt.stems) { opt.voice = opt.voice || join(opt.stems, "voice.wav"); opt.pre = opt.pre || join(opt.stems, "score-pre.wav"); opt.post = opt.post || join(opt.stems, "score-post.wav"); }
for (const k of ["voice", "pre", "post"]) if (opt[k] && !existsSync(opt[k])) usage(`no such file ${opt[k]} (${k})`);

// ---------- ffmpeg helpers ----------
function ff(args, { binary = false } = {}) {
  const r = spawnSync(FFMPEG, ["-hide_banner", "-nostats", ...args], { maxBuffer: 1 << 30, encoding: binary ? "buffer" : "utf8" });
  if (r.error) throw new Error(`can't run ${FFMPEG}: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`ffmpeg failed (${args.join(" ")}):\n${String(r.stderr).slice(-1500)}`);
  return r;
}
// ebur128 frame metadata: integrated loudness to 3 decimals (last lavfi.r128.I) and true peak = max of lavfi.r128.true_peaks_chN
function loudness(file) {
  const dir = mkdtempSync(join(tmpdir(), "audio-qa-")), m = join(dir, "r128.txt");
  try {
    ff(["-loglevel", "error", "-i", file, "-vn", "-map", "0:a:0", "-af", `ebur128=peak=true:metadata=1:framelog=verbose,ametadata=mode=print:file=${m.replace(/([\\:'])/g, "\\$1")}`, "-f", "null", "-"]);
    let I = NaN, LRA = NaN, tp = 0;
    for (const line of readFileSync(m, "utf8").split("\n")) {
      const [k, v] = line.split("=");
      if (k === "lavfi.r128.I") I = Number(v); else if (k === "lavfi.r128.LRA") LRA = Number(v); else if (/^lavfi\.r128\.true_peaks_ch\d+$/.test(k)) tp = Math.max(tp, Number(v));
    }
    if (!isFinite(I)) throw new Error(`no loudness reading for ${file}`);
    return { I: Math.round(I * 100) / 100, LRA: Math.round(LRA * 10) / 10, TP: tp > 0 ? Math.round(2000 * Math.log10(tp)) / 100 : -144 };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
function rmsDb(file, chain) {
  const err = ff(["-i", file, "-vn", "-map", "0:a:0", "-af", `${chain ? chain + "," : ""}astats=measure_perchannel=none:measure_overall=RMS_level`, "-f", "null", "-"]).stderr;
  const m = /Overall[\s\S]*?RMS level dB:\s*(-?[\d.]+|-inf)/.exec(err);
  if (!m) throw new Error(`no astats RMS for ${file}`);
  return m[1] === "-inf" ? -Infinity : Number(m[1]);
}
const fx = (type, f, k) => Array(k).fill(`${type}=f=${f}`).join(",");
const band = (lo, hi) => `${fx("highpass", lo, 2)},${fx("lowpass", hi, 2)}`;
function info(file) {
  const err = spawnSync(FFMPEG, ["-hide_banner", "-i", file], { encoding: "utf8" }).stderr || "";
  const d = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(err), au = /Audio:\s*([^,\n]+),\s*(\d+) Hz,\s*([^,\n]+)/.exec(err);
  return { duration: d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : NaN, codec: au ? au[1].trim() : "?", sampleRate: au ? +au[2] : NaN, layout: au ? au[3].trim() : "?" };
}
function pcm(file, chain) { // interleaved stereo float32 at 48 kHz, optionally through an ffmpeg filter chain
  const b = ff(["-v", "error", "-i", file, "-vn", "-map", "0:a:0", ...(chain ? ["-af", chain] : []), "-ac", "2", "-ar", "48000", "-f", "f32le", "-"], { binary: true }).stdout;
  return new Float32Array(b.buffer, b.byteOffset, Math.floor(b.length / 4));
}

// ---------- duck measurement ----------
function duck(voiceF, preF, postF, chain) {
  const SR = 48000, W = Math.round(0.05 * SR), v = pcm(voiceF), p = pcm(preF, chain), q = pcm(postF, chain);
  const n = Math.floor(Math.min(v.length, p.length, q.length) / 2), nw = Math.floor(n / W);
  const pow = (x, w) => { let s = 0; for (let i = w * W * 2, e = (w + 1) * W * 2; i < e; i++) s += x[i] * x[i]; return s / (W * 2); };
  const dB = z => 10 * Math.log10(z + 1e-20);
  const vd = new Float64Array(nw), pd = new Float64Array(nw), qd = new Float64Array(nw);
  for (let w = 0; w < nw; w++) { vd[w] = dB(pow(v, w)); pd[w] = dB(pow(p, w)); qd[w] = dB(pow(q, w)); }
  const audible = [...vd].filter(x => x > -90).sort((x, y) => x - y);
  if (!audible.length) return { error: "voice stem is silent" };
  const ref = audible[Math.floor(0.95 * (audible.length - 1))], thr = Math.max(ref - 30, -55);
  // speech regions: active windows, with gaps shorter than 0.35 s closed (syllables and short pauses stay inside one region)
  const act = [...vd].map(x => x > thr), gapMax = Math.round(0.35 / 0.05);
  const regions = []; let s = -1, last = -1e9;
  for (let w = 0; w < nw; w++) if (act[w]) { if (s < 0) s = w; else if (w - last > gapMax + 1) { regions.push([s, last]); s = w; } last = w; }
  if (s >= 0) regions.push([s, last]);
  const edge = Math.round(0.25 / 0.05), clear = Math.round(1.0 / 0.05);
  const under = [], open = [];
  const near = w => regions.some(([a0, a1]) => w >= a0 - clear && w <= a1 + clear);
  for (const [a0, a1] of regions) for (let w = a0 + edge; w <= a1 - edge; w++) if (pd[w] > -70) under.push(pd[w] - qd[w]);
  for (let w = 0; w < nw; w++) if (!near(w) && pd[w] > -70) open.push(qd[w] - pd[w]);
  const pct = (arr, k) => { const b = [...arr].sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(k * (b.length - 1)))] : NaN; };
  const speechS = regions.reduce((acc, [a0, a1]) => acc + (a1 - a0 + 1) * 0.05, 0);
  if (!under.length) return { error: "no speech long enough to measure (need regions > 0.5 s with score under them)", regions: regions.length };
  return { depth: pct(under, 0.5), p10: pct(under, 0.1), p90: pct(under, 0.9), windows: under.length, regions: regions.length, speechSeconds: +speechS.toFixed(2),
    recoveryGain: open.length ? pct(open, 0.5) : null, recoveryWindows: open.length, voiceThresholdDb: +thr.toFixed(1) };
}

// ---------- run ----------
const checks = [], extra = {};
const add = (id, label, value, unit, target, pass, note) => checks.push({ id, label, value, unit, target, pass, ...(note ? { note } : {}) });
const r1 = x => (isFinite(x) ? Math.round(x * 10) / 10 : x);
let fatal = null;
try {
  const meta = info(input);
  Object.assign(extra, { duration: meta.duration, codec: meta.codec, sampleRate: meta.sampleRate, layout: meta.layout });
  const L = loudness(input);
  extra.LRA = L.LRA;
  add("lufs", "integrated loudness", L.I, "LUFS", `${opt.lufs} ±${opt.lufsTol}`, Math.abs(L.I - opt.lufs) <= opt.lufsTol + 1e-9);
  add("true_peak", "true peak", L.TP, "dBTP", `≤ ${opt.tp}`, L.TP <= opt.tp + 1e-9);
  const sub = rmsDb(input, fx("lowpass", 60, 3)), ident = rmsDb(input, band(150, 4000));
  Object.assign(extra, { rmsFullDb: r1(rmsDb(input, "")), rmsSub60Db: r1(sub), rms60to150Db: r1(rmsDb(input, band(60, 150))), rms150to4kDb: r1(ident) });
  add("sub60_gap", "sub-60 Hz under 150 Hz–4 kHz", r1(ident - sub), "dB", `≥ ${opt.gap}`, ident - sub >= opt.gap);
  if (opt.voice || opt.pre || opt.post) {
    if (!(opt.voice && opt.pre && opt.post)) {
      add("duck", "score duck under speech", null, "dB", `${opt.duckMin}–${opt.duckMax}`, false, "needs the voice, score-pre and score-post stems (--stems DIR from mix.sh --voice)");
    } else {
      const d = duck(opt.voice, opt.pre, opt.post);
      if (d.error) add("duck", "score duck under speech", null, "dB", `${opt.duckMin}–${opt.duckMax}`, false, d.error);
      else {
        add("duck", "score duck under speech", Math.round(d.depth * 100) / 100, "dB", `${opt.duckMin}–${opt.duckMax}`, d.depth >= opt.duckMin - 1e-9 && d.depth <= opt.duckMax + 1e-9);
        const dip = duck(opt.voice, opt.pre, opt.post, band(2000, 5000));
        extra.duck = { p10: r1(d.p10), p90: r1(d.p90), band2to5kDb: dip.error ? null : Math.round(dip.depth * 100) / 100, windows: d.windows, regions: d.regions, speechSeconds: d.speechSeconds, recoveryGainDb: d.recoveryGain === null ? null : r1(d.recoveryGain), recoveryWindows: d.recoveryWindows, voiceThresholdDb: d.voiceThresholdDb };
      }
      const V = loudness(opt.voice);
      add("voice_lufs", "voice stem loudness", V.I, "LUFS", `${opt.voiceLufs} ±${opt.voiceTol}`, Math.abs(V.I - opt.voiceLufs) <= opt.voiceTol + 1e-9);
    }
  }
} catch (e) { fatal = e.message; }

const pass = !fatal && checks.length > 0 && checks.every(c => c.pass);
const report = { tool: "audio-qa", file: input, pass, ...(fatal ? { error: fatal } : {}), checks, info: extra, stems: opt.voice ? { voice: opt.voice, scorePre: opt.pre, scorePost: opt.post } : null };
if (!opt.quiet) {
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`audio-qa · ${input}`);
  if (extra.duration !== undefined) console.log(`  ${r1(extra.duration)} s · ${extra.codec} · ${extra.sampleRate} Hz · ${extra.layout}`);
  console.log("  " + pad("check", 32) + pad("value", 14) + pad("target", 14) + "result");
  for (const c of checks) console.log("  " + pad(c.label, 32) + pad(c.value === null ? "n/a" : `${c.value} ${c.unit}`, 14) + pad(c.target, 14) + (c.pass ? "PASS" : "FAIL") + (c.note ? `  (${c.note})` : ""));
  if (extra.rmsFullDb !== undefined) console.log(`  info: LRA ${extra.LRA} LU · RMS full ${extra.rmsFullDb} · <60 Hz ${extra.rmsSub60Db} · 60–150 Hz ${extra.rms60to150Db} · 150 Hz–4 kHz ${extra.rms150to4kDb} dB`);
  if (extra.duck) console.log(`  info: duck p10 ${extra.duck.p10} / p90 ${extra.duck.p90} dB (2–5 kHz band alone: ${extra.duck.band2to5kDb ?? "n/a"} dB) over ${extra.duck.windows} windows in ${extra.duck.regions} speech regions (${extra.duck.speechSeconds} s); score between lines ${extra.duck.recoveryGainDb ?? "n/a"} dB vs pre (${extra.duck.recoveryWindows} windows)`);
  if (fatal) console.log("  ERROR: " + fatal);
  console.log(`RESULT: ${pass ? "PASS" : "FAIL"}`);
}
console.log(JSON.stringify(report));
if (opt.json) writeFileSync(opt.json, JSON.stringify(report, null, 2) + "\n");
process.exit(pass ? 0 : 1);
