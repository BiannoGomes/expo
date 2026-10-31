// Benchmarks the three lab prototypes against the shipped experience, same
// conditions: 390x844, CPU throttled 4x, software WebGL (SwiftShader).
// Results are UPPER BOUNDS from a container, not device measurements.
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";
import { build } from "esbuild";
import { gzipSync } from "node:zlib";

const LAB = "http://127.0.0.1:8771/lab/", PROD = "http://127.0.0.1:8770/index.html";
const axe = readFileSync("../node_modules/axe-core/axe.min.js", "utf8");
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-precise-memory-info"] });
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return Math.round(s[Math.min(s.length - 1, Math.floor(s.length * p))]); };

async function measure(name, url, { prep, act, ready = "window.LAB && window.LAB.ready", reduced = false }) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
  const cdp = await ctx.newCDPSession(p); await cdp.send("Performance.enable");
  const t0 = Date.now();
  await p.goto(url); await p.waitForFunction(ready, null, { timeout: 60000 });
  const loadMs = Date.now() - t0;
  if (prep) await prep(p); await p.waitForTimeout(1500);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const frames = await p.evaluate(() => new Promise((res) => { const ts = []; const f = (t) => { ts.push(t); ts.length < 121 ? requestAnimationFrame(f) : res(ts.slice(1).map((x, i) => x - ts[i])); }; requestAnimationFrame(f); }));
  const latency = act ? await p.evaluate(act) : null;
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  const metrics = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const gpu = await p.evaluate(() => window.__renderer ? { calls: window.__renderer.info.render.calls, triangles: window.__renderer.info.render.triangles, points: window.__renderer.info.render.points } : null);
  await p.addScriptTag({ content: axe });
  const ax = await p.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => `${v.id}(${v.nodes.length})`));
  // reduced motion: is the picture still at rest? (two captures 600 ms apart)
  let still = null;
  // checked after any interaction has settled (a focus ring arriving is not motion)
  if (reduced) { await p.waitForTimeout(1500); const a = await p.screenshot(); await p.waitForTimeout(600); const c = await p.screenshot(); still = a.equals(c); }
  await ctx.close();
  return { name, reduced, loadMs, frameMedianMs: pct(frames, 0.5), frameP95Ms: pct(frames, 0.95), interactionMs: latency, heapMB: +(metrics.JSHeapUsedSize / 1048576).toFixed(1), gpu, axe: ax, staticAtRest: still, errors: errs.slice(0, 2) };
}
const twoFrames = "new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))";
const cases = [
  ["Shipped experience (hub)", PROD, { ready: "document.documentElement.classList.contains('ready') && window.DW", prep: (p) => p.evaluate(() => window.DW.jump(3)),
    act: `(async () => { const t = performance.now(); window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" })); await ${twoFrames}; return Math.round(performance.now() - t); })()` }],
  ["A · Holographic interface", LAB + "a.html", { act: `(async () => { const t = performance.now(); window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" })); await ${twoFrames}; return Math.round(performance.now() - t); })()` }],
  ["B · World transition (in travel)", LAB + "b.html", { prep: (p) => p.evaluate(() => window.LAB.setGoal(1)),
    act: `(async () => { const t = performance.now(); window.LAB.setGoal(0); await ${twoFrames}; return Math.round(performance.now() - t); })()` }],
  ["C · Living constellation", LAB + "c.html", { act: `(async () => { const ta = document.getElementById("text"); ta.value = "Back in the cold water before work. Wrote after."; const t = performance.now(); document.getElementById("compose").requestSubmit(); await ${twoFrames}; return Math.round(performance.now() - t); })()` }],
];
const out = { conditions: "390x844, CPU 4x throttle, SwiftShader software WebGL in a container; upper bounds, not device numbers", runs: [] };
for (const [n, u, o] of cases) { out.runs.push(await measure(n, u, o)); out.runs.push(await measure(n, u, { ...o, reduced: true })); }
await b.close();

// bundle impact: each prototype's own code with three.js external (three is already shipped)
out.bundle = {};
for (const f of ["a-holo", "b-transition", "c-constellation"]) {
  const r = await build({ entryPoints: [`src/${f}.js`], bundle: true, minify: true, format: "esm", external: ["three"], write: false });
  const code = r.outputFiles[0].contents; out.bundle[f] = { minKB: +(code.length / 1024).toFixed(1), gzipKB: +(gzipSync(code).length / 1024).toFixed(1) };
}
writeFileSync("bench-results.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
