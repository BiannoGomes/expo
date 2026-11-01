// The Wisdom Library and one Wisdom Constellation, end to end on a phone:
// Knowledge → the Wisdom Library (grouped by evidence, sources shown, no endorsement implied) →
// "Reflect on this" opens Reflect on that question → saved with the question →
// Becoming Consistent: question → four labelled perspectives → choice → seven-day action →
// Home asks how it went → review → Journey. Reloads in between.
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
const shot = (p, n) => p.screenshot({ path: `${OUT}/w-${n}.png`, timeout: 90000 }).catch(() => {});
const noSideways = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const cont = (p) => p.getByRole("button", { name: "Continue", exact: true }).click();

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e)));

  // ----- reaching it from the Knowledge galaxy -----
  await page.goto(BASE + "#/universe/knowledge"); await ready(page); await page.waitForTimeout(1000);
  const node = page.locator('#cw-page .cw-node[data-node="chesed"]');
  check("the Tree of Life has the Wisdom Library on it, open", (await node.count()) === 1 && /Wisdom Library/.test(await node.innerText()) && !/planned/i.test(await node.innerText()), await node.innerText().catch(() => ""));
  await node.click(); await page.waitForTimeout(600);
  check("it opens at its own address", (await page.evaluate(() => location.hash)) === "#/knowledge/wisdom");
  const body = await page.locator("#cw-page").evaluate((e) => e.textContent);
  check("grouped by evidence, research first, philosophy apart", ["Strong research", "Mixed or early research", "Philosophy or practice"].every((t) => body.includes(t)) && body.indexOf("Strong research") < body.indexOf("Mixed or early research") && body.indexOf("Mixed or early research") < body.indexOf("Philosophy or practice"));
  const cards = await page.locator("#cw-page .wz").count();
  check("21 thinkers, each a card", cards === 21, String(cards));
  check("every card shows its source", (await page.locator("#cw-page .wz").evaluateAll((cs) => cs.filter((c) => /\d{4}/.test(c.querySelector(".quiet.small")?.textContent ?? "")).length)) === 21);
  check("says plainly that none of them is connected with Dawnward", /None of these people is connected with Dawnward/.test(body));
  check("Frankl is under philosophy, not research", await page.evaluate(() => { const sec = [...document.querySelectorAll("#cw-page .cw-gsec")].find((s) => /Philosophy or practice/.test(s.textContent)); return /Viktor Frankl/.test(sec?.textContent ?? ""); }));
  check("no sideways scroll", await noSideways(page));
  await shot(page, "1-library");
  await axe(page, "the Wisdom Library");

  // ----- Reflect on this -----
  const frankl = page.locator("#cw-page .wz", { hasText: "Viktor Frankl" });
  const q = await frankl.locator(".wz-q").innerText();
  await frankl.getByRole("button", { name: "Reflect on this" }).click();
  await page.waitForSelector("#ed-q", { timeout: 15000 });
  check("Reflect opens in Spirit, on Frankl's question", (await page.locator("#ed-q").innerText()) === q && (await page.evaluate(() => window.__dwHome.state.world)) === "spirit", q);
  await page.fill("#words", "Calling my sister, even if the week falls apart.");
  await page.getByRole("button", { name: "Save reflection" }).click();
  await page.waitForSelector("#w-body .said-q", { timeout: 10000 });
  check("the saved reflection keeps the question", (await page.locator("#w-body .said-q").innerText()) === q);

  // ----- Becoming Consistent -----
  await page.goto(BASE + "#/knowledge/wisdom"); await ready(page); await page.waitForTimeout(800);
  await page.locator("#cw-page .wz-path").click();
  await page.waitForSelector("#x-body .s-title");
  check("Becoming Consistent opens, with the way back to the library", /The Wisdom Library/.test(await page.locator(".qhead .back").innerText().catch(() => "")));
  await page.getByRole("button", { name: "Begin" }).click();
  check("Question: what do you keep meaning to do", /What do you keep meaning to do/.test(await page.locator("#x-body .s-title").first().innerText()));
  await page.fill("#q-words", "Going for a run. The evening disappears.");
  await cont(page);
  const lesson = await page.locator("#x-body").innerText();
  check("Explore: four perspectives, each labelled by evidence, and where they disagree", /James Clear/.test(lesson) && /Gollwitzer/.test(lesson) && /Kristin Neff/.test(lesson) && /Viktor Frankl/.test(lesson) && /Strong research/.test(lesson) && /not a measured finding/.test(lesson) && /They don't all agree/.test(lesson));
  await shot(page, "2-explore");
  await cont(page);
  await page.getByRole("button", { name: /I forget, or the moment never feels right/ }).click();
  check("Choose: picking one shows what to try and why", /if-then plan/.test(await page.locator("#x-body .explain").innerText()));
  await cont(page);
  // reload in the middle: it resumes at the action
  await page.reload(); await ready(page); await page.waitForTimeout(600);
  await page.goto(BASE + "#/knowledge/wisdom"); await ready(page); await page.waitForTimeout(600);
  await page.locator("#cw-page .wz-path").click();
  await page.waitForSelector("#x-body .s-title");
  check("after a reload it resumes at the seven-day experiment", /Your seven-day experiment/.test(await page.locator("#x-body .s-title").first().innerText()));
  await page.fill("#q-action", "After I get home, shoes on and out for ten minutes");
  await page.fill("#q-when", "Every evening for seven days");
  await cont(page);
  await page.waitForFunction(() => /Done/.test(document.querySelector("#x-body .s-title")?.textContent ?? ""), null, { timeout: 15000 });
  check("Done shows the experiment", /shoes on and out for ten minutes/.test(await page.locator("#x-body").innerText()));
  await axe(page, "Becoming Consistent, done");

  // ----- review and Journey -----
  await page.goto(BASE + "#/home"); await ready(page); await page.waitForTimeout(800);
  const wait = page.locator("#e-body .e-wait");
  check("Home asks how the experiment went", /shoes on and out/.test(await wait.innerText().catch(() => "")));
  await wait.click();
  await page.getByRole("radio", { name: "Partly" }).click();
  await page.fill("#x-review", "Four evenings. The if-then plan helped on the tired days.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForFunction(() => /Thank you for coming back/.test(document.getElementById("x-body")?.innerText ?? ""), null, { timeout: 15000 });
  await page.reload(); await ready(page); await page.waitForTimeout(500);
  await page.locator('#tabs [data-tab="journey"]').click();
  await page.locator('#m-views [data-v="miles"]').click();
  check("Journey shows Becoming Consistent, after a reload", /Becoming Consistent/.test(await page.locator("#m-miles").innerText()));

  // ----- small phone -----
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(BASE + "#/knowledge/wisdom"); await ready(page); await page.waitForTimeout(800);
  check("at 320 px the library fits without sideways scroll", await noSideways(page));
  check("no page errors", errors.length === 0, errors.join(" | "));

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-wisdom-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
