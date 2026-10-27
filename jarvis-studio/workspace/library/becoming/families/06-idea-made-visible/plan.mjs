// 06 · plan.mjs · prints each variant's beat times (computed from data.js and its cue, with the same tick schedule as
// lib/night-watch.js) and checks that cue.json equals the default variant's cue.
//   node plan.mjs            print the timing map of every variant
//   node plan.mjs --check    also exit 1 if cue.json differs from DATA.cue (default variant) or a reach tick is missing
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(HERE, "data.js"), "utf8");
const load = (v) => { const g = { LOOP_VARIANT: v }; new Function("window", src)(g); return g.DATA; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function tickTimes(c) {   // mirrors lib/night-watch.js render(), "the watch tick"
  const D = c.duration, turns = c.turns || [], land = c.land ?? Infinity, fade = c.fade ?? 1.4;
  let t = c.tickFrom ?? 0.9, i = 0; const outEnd = D - fade * 0.5, res = [];
  while (t < outEnd) {
    const next = turns.find((x) => x > t - 1e-3);
    if (next !== undefined && t > next - 0.42) { t = next + 0.7; continue; }
    let iv = 0.5, vel = 0.5 + 0.06 * (i % 2 === 0);
    if (next !== undefined) { const d = next - 0.42 - t; if (d < 4) { const k = 1 - d / 4; iv = 0.5 - 0.39 * k * k; vel += 0.25 * k; } }
    if (t >= land) { const k = clamp((t - land) / Math.max(1, outEnd - land), 0, 1); iv = 0.5 + 1.1 * k; vel *= 1 - k; if (vel < 0.03) break; }
    res.push(t); t += iv; i++;
  }
  return res;
}
let bad = 0;
const base = load();
for (const v of base.variants) {
  const D = load(v), T = tickTimes(D.cue), f = (x) => x.toFixed(3);
  console.log(`\n${v}  (${D.duration} s, close: ${D.close})`);
  console.log(`  ${f(D.ignite.at)}  ignite on ${D.steps[0]} + opening sting (stingAt ${D.cue.stingAt})`);
  D.steps.forEach((s, k) => { if (!k) return; const t = T[D.reachTicks[k]]; if (t === undefined) { bad++; console.log(`  MISSING tick ${D.reachTicks[k]} for ${s}`); } else console.log(`  ${f(t)}  ${s} reached on tick ${D.reachTicks[k]}`); });
  const turn = D.cue.turns[0];
  console.log(`  ${f(turn - 0.42)}  dead stop (head stops ${D.ring.gap} deg short)`);
  console.log(`  ${f(turn)}  hit: ${D.close === "open" ? "the line passes its start and widens outwards" : "the ring closes, eclipse"}`);
  const words = D.phrase.text.split(/\s+/).filter(Boolean).length, last = D.phrase.at + (words - 1) * D.phrase.stagger + 0.22;
  const need = 0.8 + 0.3 * Math.max(0, words - 3), have = D.fade.at - last;
  console.log(`  ${f(D.phrase.at)}  phrase starts, landing sting (land ${D.cue.land}); ${words} words, ${(1 / D.phrase.stagger).toFixed(2)} words/s`);
  console.log(`  ${f(last)}  phrase fully on screen; held ${have.toFixed(2)} s before the fade (needs ${need.toFixed(2)})${have + 1e-9 < need ? "  FAIL" : ""}`);
  if (have + 1e-9 < need) bad++;
  if (Math.abs(D.cue.land - D.phrase.at) > 0.034) { bad++; console.log("  FAIL land is not on the phrase's first word"); }
  if (D.cue.duration !== D.duration) { bad++; console.log("  FAIL cue duration"); }
  console.log(`  ticks: ${T.map(f).join(" ")}`);
}
if (process.argv.includes("--check")) {
  const cue = JSON.parse(readFileSync(join(HERE, "cue.json"), "utf8"));
  if (JSON.stringify(cue) !== JSON.stringify(base.cue)) { bad++; console.log("\nFAIL cue.json differs from DATA.cue (default variant)"); }
  console.log(bad ? `\nRESULT: FAIL (${bad})` : "\nRESULT: PASS");
  process.exit(bad ? 1 : 0);
}
