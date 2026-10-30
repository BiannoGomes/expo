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
  // focus moves into the world dialog, and Escape brings it back to the world's label
  out.world_dialog_focus = await p.evaluate(() => document.activeElement && document.activeElement.id);
  await p.keyboard.press("Escape"); await p.waitForTimeout(400);
  out.focus_after_escape = await p.evaluate(() => document.activeElement && (document.activeElement.dataset.key || document.activeElement.id || document.activeElement.className));
  out.panel_inert_when_closed = await p.evaluate(() => document.getElementById("panel").inert);
  // the Memory Constellation (prototype): opens from the hub, passes axe, keyboard round trip
  await p.evaluate(() => window.DW.jump(3)); await p.waitForTimeout(1500);
  await p.focus("#momentsBtn"); await p.keyboard.press("Enter"); await p.waitForTimeout(700);
  out.moments_focus_on_open = await p.evaluate(() => document.activeElement.id);
  await p.click('.mo-list button[data-id="m7"]', { force: true }).catch(() => {});
  await p.evaluate(() => document.querySelector('.mo-star[data-id="m7"]').dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await p.waitForTimeout(300);
  await run("moments_open");
  out.moments_links_for_m7 = await p.evaluate(() => document.querySelectorAll(".mo-why").length);
  await p.click(".mo-reject"); await p.waitForTimeout(200);
  out.moments_links_after_reject = await p.evaluate(() => document.querySelectorAll(".mo-why").length);
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
  out.moments_focus_after_close = await p.evaluate(() => document.activeElement.id);
  await p.evaluate(() => window.DW.jump(4.3)); await p.waitForTimeout(1500); await run("understands");
  await p.evaluate(() => { window.DW.close(); window.DW.jump(5); }); await p.waitForTimeout(1500); await run("end");
  await p.click("#textv"); await p.waitForTimeout(500); await run("text_version");
  // the story behind the text version is frozen and unreachable; Escape returns
  const s0 = await p.evaluate(() => window.DW.s);
  await p.keyboard.press("ArrowDown"); await p.mouse.wheel(0, 600); await p.waitForTimeout(600);
  out.story_open_blocks_navigation = (await p.evaluate(() => window.DW.s)) === s0;
  out.story_open_behind_inert = await p.evaluate(() => ["top", "nav", "experience"].every((id) => document.getElementById(id).inert));
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
  out.story_escape_focus = await p.evaluate(() => document.activeElement.id);
  await p.click("#textv"); await p.waitForTimeout(300);
  // keyboard: can we reach the world buttons with Tab at the hub?
  await p.click("#closeStory"); await p.evaluate(() => window.DW.jump(3)); await p.waitForTimeout(1200);
  const tabbable = await p.evaluate(() => [...document.querySelectorAll(".wlabel")].filter((e) => e.tabIndex === 0).map((e) => e.dataset.key));
  out.keyboard_world_buttons = tabbable;
  await p.close();
}
// 1b. reduced motion: one gesture moves exactly one chapter, with no travel
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(URL); await p.waitForFunction(() => document.documentElement.classList.contains("ready")); await p.waitForTimeout(600);
  await p.mouse.move(700, 450); await p.mouse.wheel(0, 300); await p.waitForTimeout(450);
  const a = await p.evaluate(() => window.DW.s);
  await p.keyboard.press("ArrowDown"); await p.waitForTimeout(450);
  const c = await p.evaluate(() => window.DW.s);
  out.reduced_motion_steps = { afterWheel: a, afterArrow: c };
  await ctx.close();
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
  for (const sv of [0.55, 1.62, 3.0, 4.3]) {
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
  for (const ms of [3000, 11500, 25500, 38500, 42000]) {
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
