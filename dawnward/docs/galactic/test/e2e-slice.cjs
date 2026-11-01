// The blueprint's vertical slice, end to end on a phone:
// Universe → Personal Growth → Soul → The Bridge (part 1) → reflect → done →
// "See it in your universe" (the galaxy, with the new star) → Journey → reload.
// Every step must lead somewhere real, Back must be predictable, and what's saved must stay.
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
const shot = (p, n) => p.screenshot({ path: `${OUT}/s-${n}.png`, timeout: 90000 }).catch(() => {});

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE + "#/home"); await ready(page); await page.waitForTimeout(600);

  // Universe → Personal Growth
  await page.locator('#tabs [data-tab="universe"]').click();
  await page.locator('#a-inner [data-id="growth"]').click();
  await page.getByRole("button", { name: "Enter Personal Growth" }).click();
  await page.waitForTimeout(800);
  check("Universe opens Personal Growth", JSON.stringify(await where(page)) === JSON.stringify(["home", "#/universe/growth"]));

  // tap Soul: the camera flies there and the world opens
  await page.locator("#planets .planet-soul").evaluate((b) => b.click());
  await page.waitForFunction(() => document.body.classList.contains("closeup-on"), null, { timeout: 15000, polling: 100 });
  check("tapping Soul opens Soul at its own address", (await where(page))[1] === "#/world/soul/overview");
  const intro = await page.locator("#w-body").innerText();
  check("Soul opens with its question and one primary action", /Who or what mattered today\?/.test(intro) && (await page.locator("#w-body .primary").count()) === 1);
  check("no label above the question, no extra explanation", (await page.locator("#w-body .kicker").count()) === 0 && (await page.locator("#w-body .w-start").count()) === 0);
  check("The Bridge is right there, one tap away", (await page.locator("#w-body .w-next").count()) === 1 && /The Bridge/.test(await page.locator("#w-body .w-next").innerText()));
  await shot(page, "1-soul");
  await axe(page, "Soul");

  // The Bridge, part 1
  await page.locator("#w-body .w-next").click();
  await page.waitForSelector("#x-body .s-title");
  check("The Bridge opens, with a way back to Soul", (await where(page))[0] === "explore" && /Soul/.test(await page.locator(".qhead .back").innerText()));
  await page.getByRole("button", { name: "Begin" }).click();
  await page.getByRole("button", { name: /Something has been on my mind/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.fill("#q-words", "When you cancelled on Friday I felt let down. Can we talk?");
  check("the writing box starts compact", await page.evaluate(() => document.getElementById("q-words").offsetHeight < 160));
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.fill("#q-action", "Ask Sam for ten minutes");
  await page.fill("#q-when", "Thursday evening");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.fill("#q-words", "Saying it without sounding angry.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#x-body .found").waitFor();
  const close = await page.locator("#x-body").innerText();
  const endTitle = await page.locator("#x-body .s-title").first().innerText();
  check("the ending is simple: Done, the action, the discovery", /^Done$/i.test(endTitle.trim()) && /Ask Sam for ten minutes/.test(close) && (await page.locator("#x-body .kicker", { hasText: "You practised" }).count()) === 0, `${endTitle} | ${close.slice(0, 160).replace(/\n/g, " / ")}`);
  check("one primary action: See it in your universe", (await page.locator("#x-body .primary").count()) === 1 && (await page.locator("#x-body .primary").innerText()) === "See it in your universe");
  await shot(page, "2-done");
  await axe(page, "the ending");

  // the universe changed
  await page.getByRole("button", { name: "See it in your universe" }).click();
  await page.waitForTimeout(1200);
  const st = await page.evaluate(() => [window.__dwHome.state.place, window.__dwHome.state.selStar]);
  check("it lands in the galaxy, with the new discovery picked out", st[0] === "home" && /^d:/.test(st[1] ?? ""), JSON.stringify(st));
  await shot(page, "3-universe");

  // Journey shows it, and it survives a reload
  await page.locator('#tabs [data-tab="journey"]').click();
  await page.locator('#m-views [data-v="miles"]').click();
  check("Journey lists the new discovery", /The Bridge/.test(await page.locator("#m-miles").innerText()));
  await page.reload(); await ready(page); await page.waitForTimeout(500);
  await page.locator('#tabs [data-tab="journey"]').click();
  await page.locator('#m-views [data-v="miles"]').click();
  check("after a reload it's still there", /The Bridge/.test(await page.locator("#m-miles").innerText()));
  await page.goto(BASE + "#/world/soul/overview"); await ready(page); await page.waitForTimeout(800);
  check("Soul now offers what comes next, not the part you finished", !/Part 1/.test(await page.locator("#w-body").innerText()) || (await page.locator("#w-body .w-next").count()) === 0);
  check("no page errors", errors.length === 0, errors.join(" | "));

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-slice-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
