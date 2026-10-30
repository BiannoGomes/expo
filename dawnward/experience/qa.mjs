// Automated QA: accessibility, transfer weight, frame timing, film determinism.
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";
const URL = "http://127.0.0.1:8770/index.html";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const out = {};

// 1. accessibility at three states (start, a world open, end) + text version
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL); await p.waitForFunction(() => document.documentElement.classList.contains("ready"));
  const axe = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
  const run = async (label) => { await p.addScriptTag({ content: axe }); const r = await p.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))); out[`axe_${label}`] = r; };
  await run("start");
  await p.evaluate(() => { window.DW.jump(3); window.DW.select("mind"); }); await p.waitForTimeout(2500); await run("world_open");
  await p.evaluate(() => { window.DW.close(); window.DW.jump(5); }); await p.waitForTimeout(1500); await run("end");
  await p.click("#textv"); await p.waitForTimeout(500); await run("text_version");
  // keyboard: can we reach the world buttons with Tab at the hub?
  await p.click("#closeStory"); await p.evaluate(() => window.DW.jump(3)); await p.waitForTimeout(1200);
  const tabbable = await p.evaluate(() => [...document.querySelectorAll(".wlabel")].filter((e) => e.tabIndex === 0).map((e) => e.dataset.key));
  out.keyboard_world_buttons = tabbable;
  await p.close();
}
// 2. transfer weight on first load (sound off)
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(URL); await p.waitForFunction(() => document.documentElement.classList.contains("ready")); await p.waitForTimeout(1500);
  out.transfer = await p.evaluate(() => {
    const r = performance.getEntriesByType("resource").concat(performance.getEntriesByType("navigation"));
    const kb = (n) => Math.round(n / 1024);
    return { requests: r.length, totalKB: kb(r.reduce((a, e) => a + (e.encodedBodySize || 0), 0)), audioLoaded: r.some((e) => e.name.endsWith(".mp3")), domContentLoadedMs: Math.round(performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd) };
  });
  await p.close();
}
// 3. frame timing (software GL in a container: an upper bound, not a device measurement)
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const cdp = await p.context().newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await p.goto(URL); await p.waitForFunction(() => document.documentElement.classList.contains("ready"));
  out.frames = {};
  for (const sv of [0.55, 1.6, 3.0]) {
    await p.evaluate((v) => window.DW.jump(v), sv); await p.waitForTimeout(800);
    out.frames[sv] = await p.evaluate(() => new Promise((res) => { const ts = []; let n = 0; const f = (t) => { ts.push(t); if (++n < 40) requestAnimationFrame(f); else { const d = ts.slice(1).map((x, i) => x - ts[i]).sort((a, b) => a - b); res({ medianMs: Math.round(d[d.length >> 1]), p90Ms: Math.round(d[Math.floor(d.length * 0.9)]) }); } }; requestAnimationFrame(f); }));
  }
  await p.close();
}
// 4. film determinism: the same millisecond, reached from different places, must match
{
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto(URL + "?film=1"); await p.waitForFunction(() => window.FILM_READY === true); await p.waitForTimeout(1200);
  const shot = async () => (await p.screenshot({ type: "png" }));
  const res = {};
  for (const ms of [8000, 25500, 48500]) {
    await p.evaluate(() => window.SEEK(0)); await p.evaluate((m) => window.SEEK(m), ms); const a = await shot();
    await p.evaluate(() => window.SEEK(59000)); await p.evaluate((m) => window.SEEK(m), ms); const c = await shot();
    res[ms] = a.equals(c) ? "identical" : "DIFFERENT";
  }
  out.determinism = res;
  await p.close();
}
await b.close();
writeFileSync("qa-results.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
