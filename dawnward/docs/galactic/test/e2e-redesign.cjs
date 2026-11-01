// The Home and Reflect redesign pilot: one primary action, a compact next step, an
// optional direction in an accessible sheet, one way back, privacy that's findable but
// not repeated, an input that grows, no horizontal scroll, and room above the keyboard.
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const AXE = fs.readFileSync(path.join(__dirname, "../../../experience/node_modules/axe-core/axe.min.js"), "utf8");
const BASE = (process.env.DW_URL || "http://localhost:8771/home.html").replace(/#.*$/, "");
const results = { when: new Date().toISOString(), checks: [], axe: {} };
const check = (name, ok, detail = "") => { results.checks.push({ name, ok: Boolean(ok), detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };
async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}×${v.nodes.length}`));
  results.axe[label] = r; check(`axe: ${label}`, r.length === 0, r.join(", "));
}
const ready = (p) => p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
const noSideScroll = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll("#earth, #world")].every((e) => e.hidden || e.scrollWidth <= e.clientWidth + 1));

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const errors = [];

  // ---- every phone width: no sideways scroll, the main action above the fold ----
  for (const [w, h] of [[320, 568], [360, 800], [390, 844], [430, 932]]) {
    const c = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const p = await c.newPage(); p.on("pageerror", (e) => errors.push(String(e)));
    await p.goto(BASE + "#/home"); await ready(p); await p.waitForTimeout(500);
    check(`${w}×${h}: Home has no sideways scroll`, await noSideScroll(p));
    check(`${w}×${h}: "Explore your worlds" is visible without scrolling`, await p.evaluate(() => { const b = document.querySelector("#earth .primary").getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight - 64; }));
    await p.locator('#tabs [data-tab="reflect"]').click(); await p.waitForTimeout(1500);
    check(`${w}×${h}: Reflect has no sideways scroll`, await noSideScroll(p));
    check(`${w}×${h}: Save reflection is visible without scrolling`, await p.evaluate(() => { const b = [...document.querySelectorAll("#w-body .primary")].find((x) => x.textContent === "Save reflection")?.getBoundingClientRect(); return !!b && b.bottom <= innerHeight - 64; }));
    await c.close();
  }

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true });
  const page = await ctx.newPage(); page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE + "#/home"); await ready(page); await page.waitForTimeout(500);

  // ---- Home ----
  const earth = await page.locator("#earth").innerText();
  check("Home asks one question", /Where will you grow today\?/.test(earth));
  check("Home has exactly one primary action", (await page.locator("#earth .primary").count()) === 1 && (await page.locator("#earth .primary").innerText()) === "Explore your worlds");
  check("the next step is compact: title, one line, one button", (await page.locator("#earth .nextcard button.ghost").count()) === 1 && /Your next step/i.test(await page.locator("#earth .nextcard").innerText()));
  check("Why this? still explains the suggestion, on request", /Nothing is read from your reflections/.test(await page.locator("#earth .c-why").textContent()));
  check("no stray null on Home", !/\bnull\b/.test(earth));
  await axe(page, "Home");
  await page.getByRole("button", { name: "Explore your worlds" }).click();
  await page.waitForTimeout(500);
  check("Explore your worlds opens your five worlds", (await page.evaluate(() => window.__dwHome.state.place)) === "home");
  await page.locator('#tabs [data-tab="home"]').click(); await page.waitForTimeout(400);

  // ---- the direction sheet ----
  await page.getByRole("button", { name: "Set your direction" }).click();
  check("the direction opens in a modal sheet, focus inside", await page.evaluate(() => { const d = document.querySelector("dialog.sheetdlg"); return !!d && d.open && d.contains(document.activeElement); }));
  check("it asks the audit's question", /What do you want to change\?/.test(await page.locator("dialog.sheetdlg").innerText()));
  await axe(page, "the direction sheet");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  check("Escape closes it and focus returns", await page.evaluate(() => !document.querySelector("dialog.sheetdlg") && document.activeElement?.id === "e-dir-btn"));
  await page.getByRole("button", { name: "Set your direction" }).click();
  await page.fill("#dir-text", "Spend less time in my head and more time outside.");
  await page.locator("dialog.sheetdlg").getByRole("button", { name: "Save", exact: true }).click();
  check("the direction shows on Home, with Edit", /Spend less time in my head/.test(await page.locator("#earth .e-dir").innerText()) && (await page.getByRole("button", { name: "Edit your direction" }).count()) === 1);
  check("the direction is kept on this device", await page.evaluate(() => /less time in my head/.test(JSON.parse(localStorage.getItem("dw-direction-v1") || "{}").text ?? "")));
  await page.getByRole("button", { name: "Edit your direction" }).click();
  await page.fill("#dir-text", "I want to end my life");
  await page.locator("dialog.sheetdlg").getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForTimeout(300);
  check("crisis words in a direction bring support first", /findahelpline/.test(await page.locator("body").innerText()));
  check("support stays in the sheet, with focus on it", await page.evaluate(() => document.querySelector("dialog.sheetdlg")?.contains(document.activeElement)));
  await page.locator("dialog.sheetdlg").getByRole("button", { name: "Close" }).click();
  check("and aren't saved as a direction", await page.evaluate(() => /less time in my head/.test(JSON.parse(localStorage.getItem("dw-direction-v1") || "{}").text ?? "")));

  // ---- Reflect ----
  await page.goto(BASE + "#/home"); await ready(page); await page.waitForTimeout(400);
  await page.locator('#tabs [data-tab="reflect"]').click(); await page.waitForTimeout(1500);
  check("Reflect asks one question", (await page.locator("#ed-q").innerText()) === "What's on your mind?");
  check("no 'a private reflection' label, no 'Kept in'", !/private reflection|Kept in/i.test(await page.locator("#w-body").innerText()));
  check("one way back: no second back link, no breadcrumbs", (await page.locator("#w-body .text-btn.back").count()) === 0 && !(await page.locator("#w-crumbs").isVisible()) && (await page.getAttribute("#w-back", "aria-label")) === "Close");
  check("privacy isn't repeated on screen, but screen readers hear it", !(await page.locator("#ed-private").isVisible()) && /ed-private/.test(await page.getAttribute("#words", "aria-describedby")) && /Only you can see this/.test(await page.locator("#ed-private").textContent()));
  await page.getByRole("button", { name: "Private" }).click();
  check("the Private chip shows the privacy note", await page.locator("#ed-private").isVisible() && (await page.getAttribute("button:has-text('Private')", "aria-expanded")) === "true");
  const h0 = await page.evaluate(() => document.getElementById("words").offsetHeight);
  await page.fill("#words", "One.\nTwo.\nThree.\nFour.\nFive.\nSix.\nSeven lines of a longer evening.");
  await page.locator("#words").dispatchEvent("input");
  const h1 = await page.evaluate(() => document.getElementById("words").offsetHeight);
  check("the input starts compact and grows as you write", h0 < 140 && h1 > h0, `${h0}px to ${h1}px`);
  await page.getByRole("button", { name: /World: Mind/ }).click();
  await page.getByRole("radio", { name: "Body" }).click();
  check("the world chip changes the world", (await page.getByRole("button", { name: /World: Body/ }).count()) === 1);
  await axe(page, "Reflect");
  await page.getByRole("button", { name: "Save reflection" }).click();
  await page.waitForTimeout(600);
  check("Save reflection keeps it in Body", await page.evaluate(() => (JSON.parse(localStorage.getItem("dw-local-v1") || "{}").stars ?? []).some((s) => s.world === "body" && /Seven lines/.test(s.excerpt))));
  // the close button returns from the editor to the world
  await page.locator('#tabs [data-tab="reflect"]').click(); await page.waitForTimeout(1200);
  await page.locator("#w-back").click(); await page.waitForTimeout(300);
  check("Close leaves the editor, not the app", await page.evaluate(() => !document.body.classList.contains("quiet") && window.__dwHome.state.place === "world"));

  // ---- with a phone keyboard open (about 340 px taken) ----
  {
    const c = await browser.newContext({ viewport: { width: 390, height: 500 }, isMobile: true, hasTouch: true });
    const p = await c.newPage();
    await p.goto(BASE + "#/home"); await ready(p); await p.waitForTimeout(400);
    await p.locator('#tabs [data-tab="reflect"]').click(); await p.waitForTimeout(1400);
    await p.locator("#words").focus();
    check("with the keyboard open, the question and the input both fit", await p.evaluate(() => { const q = document.getElementById("ed-q").getBoundingClientRect(), t = document.getElementById("words").getBoundingClientRect(); return t.top >= 0 && t.bottom <= innerHeight && q.bottom <= t.top; }));
    await c.close();
  }

  // ---- export includes the direction ----
  await page.goto(BASE + "#/you"); await ready(page); await page.waitForTimeout(400);
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 5000 }).catch(() => null), page.locator("#y-export").click()]);
  let json = null; if (dl) json = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
  check("You › Export includes your direction", /less time in my head/.test(json?.direction?.text ?? ""));
  check("no page errors", errors.length === 0, errors.join(" | "));

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-redesign-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
