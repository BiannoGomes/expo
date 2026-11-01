// Read-only measured audit: every main screen at phone, tablet and desktop.
// Per screen: sideways overflow, visible text under 13px, tap targets under 44px,
// visible words, gold primaries, axe (WCAG 2.2 AA), page errors. Screenshots saved.
const { chromium } = require("playwright");
const fs = require("fs");
const AXE = fs.readFileSync("/home/user/expo/dawnward/experience/node_modules/axe-core/axe.min.js", "utf8");
const OUT = __dirname + "/png/", BASE = "http://localhost:8776/home.html";
const VPS = (process.env.VPS || "phone").split(",");
const SIZES = { phone: [390, 844, true], small: [320, 640, true], tablet: [768, 1024, true], desktop: [1440, 900, false] };
const rows = [];
const probe = () => {
  const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05 && r.bottom > 0 && r.top < innerHeight * 3 && !e.closest("[hidden],[aria-hidden=true],.sr-only,.vh"); };
  const small = [], words = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) { const t = n.textContent.trim(); const e = n.parentElement; if (!t || !e || !vis(e)) continue;
    if (["SCRIPT", "STYLE"].includes(e.tagName)) continue; words.push(t);
    const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 13) small.push(`${fs}px "${t.slice(0, 40)}"`); }
  const tiny = [];
  for (const e of document.querySelectorAll("button,a[href],[role=button],[role=radio],[role=tab],input,select,textarea,summary")) {
    if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 44 || r.height < 44) { const inline = e.tagName === "A" && getComputedStyle(e).display === "inline";
      if (!inline) tiny.push(`${Math.round(r.width)}x${Math.round(r.height)} ${(e.getAttribute("aria-label") || e.textContent || e.tagName).trim().slice(0, 30)}`); } }
  const prim = [...document.querySelectorAll(".primary")].filter(vis).length;
  const over = document.documentElement.scrollWidth - innerWidth;
  const text = words.join(" ");
  return { over, small: [...new Set(small)], tiny: [...new Set(tiny)], prim, words: text.split(/\s+/).filter(Boolean).length };
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const vp of VPS) {
    const [w, h, mob] = SIZES[vp];
    const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob });
    await c.addInitScript(() => { if (!localStorage.getItem("dw-expeditions-v1")) localStorage.setItem("dw-expeditions-v1", JSON.stringify({ plan: "plus" })); });
    const p = await c.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
    const ready = () => p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
    const go = async (hash, wait = 1500) => { await p.goto("about:blank"); await p.goto(BASE + "#/" + hash); await ready(); await p.waitForTimeout(wait); };
    const tab = async (t, wait = 1500) => { await p.locator(`#tabs [data-tab="${t}"]`).click(); await p.waitForTimeout(wait); };
    const m = async (name) => { const e0 = errs.length; const r = await p.evaluate(probe);
      await p.addScriptTag({ content: AXE }).catch(() => {});
      r.axe = await p.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}x${v.nodes.length}`)).catch((e) => ["axe-failed"]);
      if (vp === "phone" || vp === "tablet" || vp === "desktop") await p.screenshot({ path: `${OUT}${vp}-${name}.png`, timeout: 120000 }).catch(() => {});
      rows.push({ vp, name, ...r, errs: errs.slice(e0) }); console.log(vp, name, `over=${r.over} small=${r.small.length} tiny=${r.tiny.length} prim=${r.prim} words=${r.words} axe=${r.axe.join(",") || 0}`); };
    const step = async (name, fn) => { try { await fn(); await m(name); } catch (e) { rows.push({ vp, name, failed: String(e).slice(0, 160) }); console.log(vp, name, "FAILED", String(e).slice(0, 100)); } };
    // cold load timing (phone only, first)
    const t0 = Date.now(); await p.goto(BASE + "#/home"); await ready(); const loadMs = Date.now() - t0;
    const res = await p.evaluate(() => performance.getEntriesByType("resource").length + 1);
    rows.push({ vp, name: "_load", loadMs, requests: res }); await p.waitForTimeout(1500);
    await step("home", async () => {});
    await step("reflect", async () => { await go("home"); await tab("reflect"); });
    await step("saved", async () => { await p.fill("#words", "I walked without my phone today and my head felt clearer."); await p.locator("#words").dispatchEvent("input"); await p.getByRole("button", { name: "Save reflection" }).click(); await p.waitForTimeout(1200); });
    await step("direction-sheet", async () => { await go("home"); await p.getByRole("button", { name: "Set a direction" }).click(); await p.waitForTimeout(400); });
    await step("universe", async () => { await go("home"); await tab("universe", 1200); });
    await step("growth", () => go("universe/growth", 2500));
    await step("world-mind", () => go("world/mind/overview", 2500));
    await step("world-soul", () => go("world/soul/overview", 2500));
    await step("learn", () => go("learn"));
    await step("expedition", async () => { await go("learn"); await p.locator("#x-body button", { hasText: "Thought Labyrinth" }).first().click({ timeout: 8000 }); await p.waitForTimeout(1500); });
    await step("journey", () => go("journey"));
    await step("journey-list", async () => { await go("journey"); await p.locator('#m-views [data-v="list"]').click(); await p.waitForTimeout(500); });
    await step("creative", () => go("universe/creative"));
    await step("door", async () => { await go("creative/door", 400); await p.getByRole("button", { name: "Skip" }).click(); await p.waitForTimeout(500); });
    await step("kingdom", () => go("creative/kingdom", 3000));
    await step("knowledge", () => go("universe/knowledge"));
    await step("principles", async () => { await go("knowledge/hall", 2500); await p.getByRole("button", { name: "Things here" }).click(); await p.locator("#cw-list button").first().click(); await p.waitForTimeout(800); });
    await step("flower", async () => { await go("knowledge/flower", 2000); for (let i = 0; i < 4; i++) { await p.locator("#cw-grow").click(); await p.waitForTimeout(400); } });
    await step("knowing", () => go("knowledge/knowing", 2500));
    await step("calendar", () => go("knowledge/calendar"));
    await step("stillness", () => go("spiritual/stillness", 2500));
    await step("library", () => go("library"));
    await step("ai", () => go("universe/ai"));
    await step("wisdom", () => go("knowledge/wisdom"));
    await step("you", () => go("you"));
    await c.close();
  }
  fs.writeFileSync(__dirname + `/rows-${VPS.join("-")}.json`, JSON.stringify(rows, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
