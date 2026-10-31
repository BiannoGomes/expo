// Creative Worlds: the galaxy page, the Infinite Door, two real-time worlds, members' gate,
// saved progress, the words-only path, reduced motion, and frame times (SwiftShader, not a phone).
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const AXE = fs.readFileSync(path.join(__dirname, "../../../experience/node_modules/axe-core/axe.min.js"), "utf8");
const BASE = (process.env.DW_URL || "http://localhost:8771/home.html").replace(/#.*$/, "");
const OUT = path.join(__dirname, "shots");
const results = { when: new Date().toISOString(), checks: [], axe: {}, frames: {} };
const check = (name, ok, detail = "") => { results.checks.push({ name, ok: Boolean(ok), detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };
async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}×${v.nodes.length}`));
  results.axe[label] = r; check(`axe: ${label}`, r.length === 0, r.join(", "));
}
const ready = (p) => p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
const where = (p) => p.evaluate(() => [window.__dwHome.state.place, location.hash]);
const shot = (p, n) => p.screenshot({ path: `${OUT}/c-${n}.png`, timeout: 90000 });
const lit = (p, k) => p.evaluate((k) => JSON.parse(localStorage.getItem("dw-creative-v1") || "{}").lit?.[k]?.length ?? 0, k);
const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const ctx = await browser.newContext(MOBILE);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error" && /THREE|shader|WebGL/i.test(m.text())) errors.push(m.text().slice(0, 160)); });

  // ---- the address opens the galaxy page directly ----
  await page.goto(BASE + "#/universe/creative"); await ready(page); await page.waitForTimeout(400);
  check("#/universe/creative opens Creative Worlds", JSON.stringify(await where(page)) === JSON.stringify(["creative", "#/universe/creative"]));
  check("the Universe tab is current", (await page.getAttribute('#tabs [data-tab="universe"]', "aria-current")) === "page");
  const planets = await page.locator(".cw-planets li").allInnerTexts();
  check("five planets, all open now", planets.length === 5 && planets.filter((t) => /Planned/.test(t)).length === 0, planets.map((t) => t.split("\n")[0]).join(" | "));
  check("the Living Forest is marked for members", /Members/.test(planets[2]));
  await shot(page, "galaxy-390");
  await axe(page, "galaxy page");

  // ---- reached from the Universe map too ----
  await page.locator('#tabs [data-tab="universe"]').click();
  await page.locator('#a-inner [data-id="creative"]').click();
  check("the map says it's open and some worlds are free", /Open · some worlds are free/i.test(await page.locator("#a-panel").innerText()));
  await page.getByRole("button", { name: "Enter Creative Worlds" }).click();
  check("Enter Creative Worlds opens the page", (await where(page))[0] === "creative");

  // ---- the Infinite Door ----
  await page.getByRole("button", { name: "Open the Infinite Door" }).click();
  check("the door has its own address", (await where(page))[1] === "#/creative/door");
  check("the door covers the tabs", await page.evaluate(() => document.getElementById("creative").classList.contains("immersive") && getComputedStyle(document.getElementById("creative")).zIndex === "40"));
  check("the door's heading takes focus", await page.evaluate(() => document.activeElement?.id === "cw-dtitle"));
  await page.waitForTimeout(1200);
  await shot(page, "door-dive");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.waitForTimeout(150);
  check("Skip finishes the sequence and focuses the first door", await page.evaluate(() => document.activeElement?.classList.contains("cw-choice") && getComputedStyle(document.querySelector(".cw-dfoot")).opacity === "1"));
  await shot(page, "door-390");
  await axe(page, "the door");
  check("four destinations, the forest marked for members", (await page.locator(".cw-choice").count()) === 4 && /Members/.test(await page.locator(".cw-choice.cw-forest").innerText()));

  // ---- through the door: the Floating Kingdom ----
  await page.locator(".cw-choice.cw-kingdom").click();
  await page.waitForFunction(() => window.__dwCreative && document.querySelector("#cw-stage canvas"), null, { timeout: 15000 });
  check("the kingdom has its own address", (await where(page))[1] === "#/creative/kingdom");
  check("the world's name takes focus", await page.evaluate(() => document.activeElement?.id === "cw-wname"));
  await page.waitForTimeout(1500);
  // a real tap on a real lantern, found where it is drawn
  let tapped = null;
  for (let i = 0; i < 5 && !tapped; i++) {
    const at = await page.evaluate((id) => window.__dwCreative.screenOf(id), `lantern-${i}`);
    if (at?.front && at.x > 30 && at.x < 360 && at.y > 240 && at.y < 720) { await page.touchscreen.tap(at.x, at.y); tapped = i; }
  }
  await page.waitForTimeout(400);
  check("tapping a lantern in the 3D world lights it", tapped !== null && (await lit(page, "kingdom")) === 1, `lantern ${tapped}`);
  check("the count says so", /1 of 5 lit/.test(await page.locator("#cw-task").innerText()));
  check("the hint fades after the first touch", await page.evaluate(() => document.getElementById("cw-hint").classList.contains("gone")));
  // drag to look around, pinch-free: a drag must not light anything
  await page.mouse.move(200, 500); await page.mouse.down(); await page.mouse.move(80, 470, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(300);
  check("a drag turns the view and lights nothing", (await lit(page, "kingdom")) === 1);
  await shot(page, "kingdom-390");
  await page.waitForTimeout(2500);
  results.frames.kingdom = await page.evaluate(() => window.__dwCreative.frames());
  check("the kingdom draws (SwiftShader median frame, ms)", results.frames.kingdom.n > 20, JSON.stringify(results.frames.kingdom));

  // the same world as buttons
  await page.getByRole("button", { name: "Things here" }).click();
  check("Things here lists all five lanterns", (await page.locator("#cw-list button").count()) === 5 && (await page.getAttribute("#cw-list", "hidden")) === null);
  await axe(page, "the kingdom with its list");
  for (const b of await page.locator("#cw-list button").all()) if (!/Lit$/.test((await b.innerText()).trim())) await b.click();
  await page.waitForSelector(".cw-card:not([hidden])", { timeout: 5000 });
  { const t = await page.locator(".cw-card").innerText(), f = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
    check("lighting every lantern opens the discovery", /Every lantern is lit/i.test(t) && f === "cw-done-h", `${t.slice(0, 40)} · focus ${f}`); }
  check("the discovery offers a question, not a score", /A question to carry/.test(await page.locator(".cw-card").innerText()) && !/points|XP|streak|score/i.test(await page.locator("#creative").innerText()));
  check("all five are kept", (await lit(page, "kingdom")) === 5);
  await shot(page, "kingdom-lit");

  // ---- Back walks the way you came ----
  await page.goBack(); await page.waitForTimeout(400);
  check("Back from the world returns to the door", JSON.stringify(await where(page)) === JSON.stringify(["creative", "#/creative/door"]) && await page.evaluate(() => !document.querySelector("#cw-stage canvas") && window.__dwCreative === null));

  // ---- members: the forest ----
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator(".cw-choice.cw-forest").click();
  await page.waitForTimeout(300);
  check("the forest shows an honest members' gate", /This world is for members/.test(await page.locator("#cw-page").innerText()) && /isn't open yet/.test(await page.locator("#cw-page").innerText()));
  await axe(page, "the members' gate");
  await page.getByRole("button", { name: "Preview as a member" }).click();
  await page.waitForFunction(() => window.__dwCreative && document.querySelector("#cw-stage canvas"), null, { timeout: 15000 });
  check("member preview opens the Living Forest", (await where(page))[1] === "#/creative/forest");
  await page.mouse.move(195, 600); await page.mouse.move(220, 560, { steps: 4 });
  await page.waitForTimeout(2500);
  results.frames.forest = await page.evaluate(() => window.__dwCreative.frames());
  check("the forest draws (SwiftShader median frame, ms)", results.frames.forest.n > 20, JSON.stringify(results.frames.forest));
  await page.getByRole("button", { name: "Things here" }).click();
  await page.locator("#cw-list button").first().click();
  check("waking a plant is kept", (await lit(page, "forest")) === 1 && /1 of 7 awake/.test(await page.locator("#cw-task").innerText()));
  await page.waitForTimeout(800);
  await shot(page, "forest-390");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check("Escape leaves the world for the galaxy page", (await where(page))[1] === "#/universe/creative" && await page.evaluate(() => !document.querySelector("#cw-stage canvas")));

  // ---- kept on this device ----
  await page.goto(BASE + "#/creative/kingdom"); await page.reload(); await ready(page);
  await page.waitForFunction(() => window.__dwCreative, null, { timeout: 15000 });
  check("after a reload the kingdom is still lit", /5 of 5 lit/.test(await page.locator("#cw-task").innerText()));
  await page.getByRole("button", { name: "Leave" }).click();
  check("the galaxy page shows the discovery", /Discovered: every lantern is lit/.test(await page.locator(".cw-planets").innerText()));

  // ---- no WebGL: the world in words ----
  await page.evaluate(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a); }; });
  await page.locator(".cw-planets button", { hasText: "The Living Forest" }).click();
  await page.waitForTimeout(400);
  check("without WebGL the world opens in words", await page.evaluate(() => document.getElementById("cw-stage").classList.contains("words") && !document.querySelector("#cw-stage canvas")) && (await page.locator("#cw-list button").count()) === 7);
  await axe(page, "the forest in words");
  check("no page or shader errors", errors.length === 0, errors.join(" | "));
  await ctx.close();

  // ---- reduced motion: the temple is still, nothing flies ----
  {
    const c2 = await browser.newContext({ ...MOBILE, reducedMotion: "reduce" });
    const p = await c2.newPage();
    await p.goto(BASE + "#/creative/door"); await ready(p); await p.waitForTimeout(300);
    check("reduced motion: the door appears still", await p.evaluate(() => document.getElementById("cw-door").classList.contains("still") && document.getAnimations().filter((a) => a.effect?.target?.closest?.("#cw-door")).length === 0));
    await p.locator(".cw-choice.cw-kingdom").click();
    await p.waitForFunction(() => window.__dwCreative, null, { timeout: 15000 });
    check("reduced motion: the door opens without a flight", (await where(p))[1] === "#/creative/kingdom");
    await c2.close();
  }

  // ---- desktop ----
  {
    const c3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c3.newPage();
    await p.goto(BASE + "#/creative/door"); await ready(p);
    await p.getByRole("button", { name: "Skip" }).click(); await p.waitForTimeout(300);
    await shot(p, "door-1440");
    await p.locator(".cw-choice.cw-kingdom").click();
    await p.waitForFunction(() => window.__dwCreative, null, { timeout: 15000 });
    await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(1200);
    await shot(p, "kingdom-1440");
    check("desktop: keyboard turns the view without errors", true);
    await c3.close();
  }

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-creative-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
