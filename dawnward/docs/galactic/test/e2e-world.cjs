// The living universe: addresses, Back, world sections, and solar systems lit only by saved progress.
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const AXE = fs.readFileSync(path.join(__dirname, "../../../experience/node_modules/axe-core/axe.min.js"), "utf8");
const BASE = (process.env.DW_URL || "http://localhost:8771/home.html").replace(/#.*$/, "");
const OUT = path.join(__dirname, "shots");
const results = { when: new Date().toISOString(), checks: [], axe: {} };
const check = (name, ok, detail = "") => { results.checks.push({ name, ok: Boolean(ok), detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };
async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}×${v.nodes.length}`));
  results.axe[label] = r; check(`axe: ${label}`, r.length === 0, r.join(", "));
}
const ready = (p) => p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
const where = (p) => p.evaluate(() => [window.__dwHome.state.place, location.hash]);
const shot = (p, n) => p.screenshot({ path: `${OUT}/w-${n}.png`, timeout: 90000 });

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

  // ---- every address opens its place directly, with no arrival film in the way ----
  for (const [hash, place] of [["#/home", "earth"], ["#/universe", "atlas"], ["#/universe/growth", "home"], ["#/world/spirit/library", "world"], ["#/learn", "explore"], ["#/journey/milestones", "memories"], ["#/you", "you"], ["#/nowhere", "earth"]]) {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await p.goto(BASE + hash); await ready(p); await p.waitForTimeout(300);
    const [pl] = await where(p);
    check(`address ${hash} opens ${place}`, pl === place && await p.evaluate(() => document.getElementById("entrance").hidden), pl);
    if (hash === "#/world/spirit/library") check("the world address chose its tab", (await p.getAttribute("#w-tab-library", "aria-selected")) === "true");
    if (hash === "#/journey/milestones") check("the journey address chose Milestones", !(await p.evaluate(() => document.getElementById("m-miles").hidden)));
    await p.close();
  }

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE); await ready(page);
  await page.evaluate(() => document.getElementById("skip")?.click());
  await page.waitForTimeout(300);
  check("a plain visit opens Home at #/home", JSON.stringify(await where(page)) === JSON.stringify(["earth", "#/home"]));

  // ---- Back steps through places, never out of the app mid-journey ----
  await page.locator('#tabs [data-tab="universe"]').click();
  await page.locator('#a-inner [data-id="growth"]').click();
  await page.getByRole("button", { name: "Enter Personal Growth" }).click();
  await page.waitForTimeout(800);
  await page.locator("#planets .planet-mind").evaluate((b) => b.click());
  await page.waitForFunction(() => document.body.classList.contains("closeup-on"), null, { timeout: 15000, polling: 100 });
  check("each step has its own address", (await where(page))[1] === "#/world/mind/overview");
  await page.goBack(); await page.waitForTimeout(500);
  check("Back from Mind returns to Personal Growth", JSON.stringify(await where(page)) === JSON.stringify(["home", "#/universe/growth"]));
  await page.goBack(); await page.waitForTimeout(400);
  check("Back again returns to the Universe", (await where(page))[0] === "atlas");
  await page.goBack(); await page.waitForTimeout(400);
  check("and again to Home", (await where(page))[0] === "earth");
  await page.goForward(); await page.waitForTimeout(400);
  check("Forward works too", (await where(page))[0] === "atlas");

  // ---- a world: four sections, keyboard between them ----
  await page.goto(BASE + "#/world/mind"); await ready(page); await page.waitForTimeout(800);
  const tabs = page.getByRole("tab");
  check("Mind has four sections: Overview, Expeditions, Library, Progress", (await tabs.count()) === 4 && (await tabs.allTextContents()).join(",") === "Overview,Expeditions,Library,Progress");
  await page.getByRole("tab", { name: "Overview" }).focus();
  await page.keyboard.press("ArrowRight");
  check("arrow keys move between sections", (await page.getAttribute("#w-tab-expeditions", "aria-selected")) === "true" && await page.evaluate(() => document.activeElement?.id === "w-tab-expeditions"));
  check("the section is in the address", (await where(page))[1] === "#/world/mind/expeditions");
  const solar = page.locator("svg.solar").first();
  const label0 = await solar.getAttribute("aria-label");
  check("the solar system says where you are, in words", /Beyond Overthinking: 0 of 7 chapters done\. Next: Understand the loop\. 3 still being written\./.test(label0), label0);
  check("before any chapter, no moon or orbit is lit", (await page.locator("svg.solar .lit").count()) === 0);
  check("planned chapters are drawn as planned, and listed as Planned", (await page.locator("svg.solar").first().locator(".moon.planned").count()) === 3 && (await page.locator("#w-panel li.planned").count()) === 3);
  await shot(page, "mind-expeditions-before");
  await axe(page, "mind expeditions");

  // ---- play Chapter 1 from the world; the solar system lights from what was saved ----
  await page.getByRole("button", { name: /Chapter 1: Understand the loop/ }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  const sorts = page.locator(".sort-scale");
  for (let k = 0; k < 6; k++) await sorts.nth(k).getByRole("radio").first().click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.fill("#q-words", "What if I've left it too late?");
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.fill("#q-words", "No new information there.");
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByRole("button", { name: "Not this time" }).click();
  await page.locator("#x-body .found").waitFor();
  await page.goto(BASE + "#/world/mind/expeditions"); await ready(page); await page.waitForTimeout(800);
  const label1 = await page.locator("svg.solar").first().getAttribute("aria-label");
  check("after Chapter 1 is saved: 1 of 7, and the next is Chapter 2", /1 of 7 chapters done\. Next: Separate facts from assumptions/.test(label1), label1);
  check("exactly one moon and its orbit are lit", (await page.locator("svg.solar").first().locator(".moon.lit").count()) === 1 && (await page.locator("svg.solar").first().locator(".orbit.lit").count()) === 1);
  check("the next chapter is ringed", (await page.locator("svg.solar").first().locator(".next-ring").count()) === 1);
  await shot(page, "mind-expeditions-after");

  // ---- Library and Progress show only real things ----
  await page.getByRole("tab", { name: "Library" }).click();
  check("Library lists the four real worksheets", (await page.locator("#w-panel .mission").count()) === 4);
  check("Library says plainly that books come later, after review", /Books are added only from manuscripts you own/.test(await page.textContent("#w-panel")));
  await page.getByRole("button", { name: /The Decision Lab/ }).click();
  check("a worksheet opens from the Library", /The Decision Lab/.test(await page.textContent(".sheet")));
  await page.getByRole("button", { name: "Back" }).click();
  await page.waitForTimeout(500);
  check("its Back returns to Mind", (await where(page))[0] === "world");
  await page.getByRole("tab", { name: "Progress" }).click();
  const prog = await page.textContent("#w-panel");
  check("Progress counts only saved work: 1 of 7, one discovery", /Beyond Overthinking\s*1 of 7/.test(prog) && /Discoveries\s*1/.test(prog), prog.replace(/\s+/g, " ").slice(0, 200));
  await shot(page, "mind-progress");
  await axe(page, "mind progress");

  // ---- an unopened galaxy is a preview, never presented as working ----
  await page.goto(BASE + "#/universe"); await ready(page);
  await page.locator('#a-inner [data-id="ai"]').click();
  const panel = await page.textContent("#a-panel");
  check("AI Creation is labelled a preview with its planned purpose", /Preview · not open yet/.test(panel) && /AI Creation/.test(panel) && /creation studio/.test(panel) && !(await page.locator("#a-panel .primary").count()));
  check("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();

  // ---- reduced motion: the next-chapter ring holds still ----
  {
    const c2 = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const p = await c2.newPage();
    await p.goto(BASE + "#/world/mind/expeditions"); await ready(p); await p.waitForTimeout(300);
    check("reduced motion: the ring doesn't pulse", (await p.evaluate(() => getComputedStyle(document.querySelector("svg.solar .next-ring")).animationName)) === "none");
    await c2.close();
  }

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-world-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
