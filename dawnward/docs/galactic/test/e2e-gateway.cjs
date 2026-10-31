// The Quantum Gateway, end to end in the browser.
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
// Universe → Gateway → intention → portal → passage (plays, or is skipped) → a possible you
// → Mirror → Crossroads → First Step → Return to Earth; Escape can't strand anyone; reduced motion.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const AXE = fs.readFileSync(path.join(__dirname, "../../../experience/node_modules/axe-core/axe.min.js"), "utf8");
const BASE = (process.env.DW_URL || "http://localhost:8771/home.html").replace(/#.*$/, "");
const OUT = path.join(__dirname, "shots");
const results = { when: new Date().toISOString(), checks: [], axe: {}, timings: {} };
const check = (name, ok, detail = "") => { results.checks.push({ name, ok: Boolean(ok), detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };
async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}×${v.nodes.length}`));
  results.axe[label] = r; check(`axe: ${label}`, r.length === 0, r.join(", "));
}
const ready = (p) => p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
const shot = (p, n) => p.screenshot({ path: `${OUT}/g-${n}.png`, timeout: 90000 });
const place = (p) => p.evaluate(() => window.__dwHome.state.place);
const artSrc = (p) => p.evaluate(() => { const b = document.getElementById("x-art"); return b.hidden ? "" : b.querySelector("img").getAttribute("src"); });

async function toPortal(page, name) {
  await page.goto(BASE + "#/universe"); await ready(page);
  await page.locator('#a-inner [data-id="gateway"]').click();
  const panel = await page.textContent("#a-panel");
  check(`${name}: the Gateway is open, and says it's imagination, not prediction`, /Open/.test(panel) && /never a prediction/.test(panel));
  await page.getByRole("button", { name: "Enter the Gateway" }).click();
  await page.waitForSelector("#x-body .draft-tag");
  check(`${name}: the trail reads Universe › The Quantum Gateway`, /Universe.*The Quantum Gateway/.test(await page.textContent(".qhead .crumbs")));
  check(`${name}: opens on the unlit ring (B1)`, /B1/.test(await artSrc(page)) || (await artSrc(page)).startsWith("data:"));
  check(`${name}: says plainly it's not a prediction`, /not a prediction/.test(await page.textContent("#x-body")));
  await page.getByRole("button", { name: "Begin" }).click();
  await page.fill("#q-words", "Feeling at ease speaking up in meetings.");
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByRole("button", { name: "Open the gateway" }).waitFor();
}

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

  // ---- the whole journey, with the passage played in full ----
  for (const [name, vp] of [["phone", { width: 390, height: 844 }], ["desktop", { width: 1440, height: 900 }]]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: name === "phone", hasTouch: name === "phone" });
    const page = await ctx.newPage();
    const errors = []; page.on("pageerror", (e) => errors.push(String(e)));
    await toPortal(page, name);
    await shot(page, `${name}-portal`);
    await axe(page, `${name} portal`);
    // timed inside the page: from the passage appearing to it being gone (screenshots of it are slow on a software GPU)
    await page.evaluate(() => { window.__pass = {}; new MutationObserver(() => { const on = !!document.getElementById("passage"); if (on && !window.__pass.a) window.__pass.a = performance.now(); if (!on && window.__pass.a && !window.__pass.b) window.__pass.b = performance.now(); }).observe(document.body, { childList: true }); });
    await page.getByRole("button", { name: "Open the gateway" }).click();
    await page.waitForSelector("#passage");
    check(`${name}: the passage is a labelled dialog with Skip focused`, (await page.getAttribute("#passage", "aria-label")) === "Passing through the gateway" && await page.evaluate(() => document.activeElement?.classList.contains("skip-pass")));
    check(`${name}: four rings of the tunnel in depth`, (await page.locator("#passage .ring").count()) === 4);
    await page.mouse.move(vp.width * 0.3, vp.height * 0.4);
    await page.waitForTimeout(1300);
    await shot(page, `${name}-passage`);
    await page.waitForSelector("#passage", { state: "detached", timeout: 8000 });
    const ms = await page.evaluate(() => Math.round(window.__pass.b - window.__pass.a));
    results.timings[`${name}.passage_ms`] = ms;
    check(`${name}: the passage ends by itself in about 2.6 s (plus its fade)`, ms >= 2600 && ms < 4200, `${ms} ms`);
    check(`${name}: arrives at A possible you, framed as imagined`, /A possible you/.test(await page.textContent("#x-body .s-title")) && /not a prediction/.test(await page.textContent("#x-body")));
    await shot(page, `${name}-future-self`);
    await axe(page, `${name} future self`);
    await page.fill("#q-words", "Start smaller than you think.");
    await page.getByRole("button", { name: "Save and continue" }).click();
    check(`${name}: the Mirror`, /The Mirror/.test(await page.textContent("#x-body .s-title")));
    await page.fill("#q-words", "I speak up in small groups, not with my manager there.");
    await page.getByRole("button", { name: "Save and continue" }).click();
    check(`${name}: the Crossroads is the Decision Lab`, /The Crossroads/.test(await page.textContent("#x-body .s-title")) && (await page.locator("#lab-o1").count()) === 1);
    await page.fill("#lab-o1", "Present at the next team meeting");
    await page.fill("#lab-o2", "Share one idea in the weekly call");
    await page.fill("#lab-v1", "Confidence");
    await page.getByRole("button", { name: "Open the lab" }).click();
    const cells = page.locator(".lab-grid .sort-scale");
    await cells.nth(0).getByRole("radio").nth(2).click();
    await cells.nth(1).getByRole("radio").nth(0).click();
    await page.getByRole("button", { name: "Continue" }).click();
    check(`${name}: the First Step`, /The First Step/.test(await page.textContent("#x-body .s-title")));
    await page.fill("#q-action", "Write one idea before Thursday's call and say it");
    await page.fill("#q-when", "Thursday");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.locator("#x-body .found").waitFor();
    const close = await page.textContent("#x-body");
    check(`${name}: Return to Earth keeps the real step and finds a star`, /Write one idea before Thursday/.test(close) && /A star: The Quantum Gateway/.test(close));
    check(`${name}: the ending says the future isn't fixed`, /The future isn't fixed/.test(close));
    await shot(page, `${name}-return`);
    await page.getByRole("button", { name: "Return to Earth" }).first().click();
    await page.waitForTimeout(300);
    check(`${name}: home on Earth, with the action waiting`, (await place(page)) === "earth" && /Write one idea before Thursday/.test(await page.textContent("#earth")));
    await page.goto(BASE + "#/journey/milestones"); await ready(page);
    check(`${name}: the Gateway's moon is saved in Journey`, /moon over The Quantum Gateway/i.test(await page.textContent("#m-miles")));
    check(`${name}: no page errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
    await ctx.close();
  }

  // ---- Skip, and Escape: never trapped, never thrown out ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await toPortal(page, "skip");
    await page.getByRole("button", { name: "Open the gateway" }).click();
    await page.waitForSelector("#passage");
    await page.getByRole("button", { name: "Skip", exact: true }).click();
    await page.waitForSelector("#passage", { state: "detached", timeout: 3000 });
    check("skip: Skip ends the passage at once and carries on", /A possible you/.test(await page.textContent("#x-body .s-title")));
    await ctx.close();
  }
  {
    // a fresh visitor: the earlier one has the journey in progress, so it resumes past the intro
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await toPortal(page, "escape");
    await page.getByRole("button", { name: "Open the gateway" }).click();
    await page.waitForSelector("#passage");
    await page.keyboard.press("Escape");
    await page.waitForSelector("#passage", { state: "detached", timeout: 3000 });
    check("escape: Escape skips the passage and stays in the journey", (await place(page)) === "explore" && /A possible you/.test(await page.textContent("#x-body .s-title")));
    await ctx.close();
  }

  // ---- reduced motion: one still image, no travel, no streaks, no leaning ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await toPortal(page, "reduced");
    await page.mouse.move(50, 50); await page.mouse.move(300, 600);
    check("reduced: the scene doesn't lean with the pointer", (await page.evaluate(() => document.getElementById("x-art").style.transform)) === "");
    await page.getByRole("button", { name: "Open the gateway" }).click();
    await page.waitForSelector("#passage");
    check("reduced: a single still, no streaks", await page.evaluate(() => document.getElementById("passage").classList.contains("still") && getComputedStyle(document.querySelector("#passage .streaks")).display === "none"));
    await page.waitForSelector("#passage", { state: "detached", timeout: 4000 });
    check("reduced: carries on by itself", /A possible you/.test(await page.textContent("#x-body .s-title")));
    await ctx.close();
  }

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-gateway-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
