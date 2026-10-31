// The first playable expedition, end to end in the browser (no account: kept on this device).
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
// Explore → The Bridge 1 → choice (feedback) → rehearse → plan (unsafe refused) →
// reflect → Return to Earth (discovery) → reload → check-in (didn't) → landmark →
// journey log → hide discoveries → resume mid-mission after reload → crisis stops it →
// text view lists the practices → delete everything wipes it.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const AXE = fs.readFileSync(path.join(__dirname, "../../../experience/node_modules/axe-core/axe.min.js"), "utf8");
const PAGE = process.env.DW_URL || "http://localhost:8771/home.html";
const OUT = path.join(__dirname, "shots");
const results = { when: new Date().toISOString(), checks: [], axe: {} };
const check = (name, ok, detail = "") => { results.checks.push({ name, ok: Boolean(ok), detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };
async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}×${v.nodes.length}`));
  results.axe[label] = r;
  check(`axe: ${label}`, r.length === 0, r.join(", "));
}
const store = (p) => p.evaluate(() => JSON.parse(localStorage.getItem("dw-expeditions-v1") || "{}"));

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const [name, vp, mobile] of [["phone", { width: 390, height: 844 }, true], ["desktop", { width: 1440, height: 900 }, false]]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.addInitScript(() => localStorage.setItem("dw-home-seen", "1"));
    await page.goto(PAGE);
    await page.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });

    // three taps to a mission: Explore, the mission, Begin
    await page.locator('#tabs [data-tab="explore"]').click();
    await page.waitForSelector("#x-title");
    check(`${name}: Explore lists the Communication system`, (await page.textContent("#x-body")).includes("Communication"));
    check(`${name}: no XP, levels or scores anywhere`, !/\bxp\b|\blevel \d|\bscore|\bstreak/i.test(await page.textContent("body")));
    await page.screenshot({ path: `${OUT}/x-${name}-1-explore.png` });
    await axe(page, `${name} explore`);
    await page.getByRole("button", { name: /Part 1: Opening/ }).click();
    await page.waitForSelector(".s-title");
    check(`${name}: intro shows the objective, time and the safety note`, /About 6 minutes/.test(await page.textContent("#x-body")) && /findahelpline/.test(await page.textContent("#x-body")));
    await page.getByRole("button", { name: "Begin" }).click();

    // choice: feedback, not a score
    await page.getByRole("button", { name: /Something has been on my mind/ }).click();
    check(`${name}: choosing shows what tends to happen and why`, /curious rather than defensive/.test(await page.textContent(".explain")));
    await page.getByRole("button", { name: /You always do this/ }).click();
    check(`${name}: another choice can be read too`, /defend themselves/.test(await page.textContent(".explain")));
    await page.getByRole("button", { name: /Something has been on my mind/ }).click();
    await page.screenshot({ path: `${OUT}/x-${name}-2-choice.png` });
    await axe(page, `${name} choice`);
    await page.getByRole("button", { name: "Continue" }).click();

    // rehearse: empty refused, then saved
    await page.getByRole("button", { name: "Save and continue" }).click();
    check(`${name}: empty words refused`, /few words/.test(await page.textContent(".error")));
    await page.fill("#q-words", "When you cancelled on Friday I felt let down. Can we talk?");
    await page.getByRole("button", { name: "Save and continue" }).click();

    // plan: unsafe refused gently, then a real action
    await page.fill("#q-action", "get back at Sam");
    await page.fill("#q-when", "tonight");
    await page.getByRole("button", { name: "Save and continue" }).click();
    check(`${name}: unsafe action refused gently`, /smaller and safer/.test(await page.textContent(".error")));
    await page.fill("#q-action", "Ask Sam for ten minutes");
    await page.fill("#q-when", "Thursday evening");
    await page.getByRole("button", { name: "Save and continue" }).click();

    // reflect, then Return to Earth
    await page.fill("#q-words", "Saying it without sounding angry.");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.waitForSelector("text=Return to Earth");
    const close = await page.textContent("#x-body");
    check(`${name}: close shows what was practised, the action and the discovery`, /Begin a difficult conversation/.test(close) && /Ask Sam for ten minutes/.test(close) && /Discovered/.test(close));
    await page.screenshot({ path: `${OUT}/x-${name}-3-return.png` });
    await axe(page, `${name} return to earth`);
    const s1 = await store(page);
    check(`${name}: kept on this device: completed, one experiment, one star`, s1.attempts["bridge-1"].status === "completed" && s1.experiments.length === 1 && s1.discoveries.some((d) => d.key === "star:bridge-1"));
    await page.getByRole("button", { name: "Return to Earth" }).first().click();
    await page.waitForTimeout(800);
    check(`${name}: home, with the new discovery selected`, await page.evaluate(() => window.__dwHome.state.place === "home" && window.__dwHome.state.selStar === "d:star:bridge-1"));

    // reload: progress survives; the check-in waits
    await page.reload();
    await page.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
    await page.locator('#tabs [data-tab="explore"]').click();
    await page.waitForSelector("#x-title");
    const ex = await page.textContent("#x-body");
    check(`${name}: after reload, Part 1 is done and the action waits for a check-in`, /Waiting to hear how it went/.test(ex) && /Ask Sam for ten minutes/.test(ex));
    await page.getByRole("button", { name: /Ask Sam for ten minutes/ }).click();
    await page.getByRole("radio", { name: "I didn't, this time" }).click();
    await page.fill("#x-review", "I lost my nerve, but I know what I'd say now.");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForSelector("text=Thank you for coming back");
    check(`${name}: "I didn't" still counts: a landmark appears`, /lantern in Soul/.test(await page.textContent("#x-body")));

    // journey log, and hiding discoveries keeps the data
    await page.locator('#tabs [data-tab="you"]').click();
    const j = await page.textContent("#y-journey");
    check(`${name}: journey log explains each discovery`, /Why this appeared/.test(j) && /The Bridge/.test(j) && /lantern/i.test(j));
    await page.click("#y-game");
    check(`${name}: hiding discoveries deletes nothing`, (await page.textContent("#y-game")) === "Discoveries hidden" && (await store(page)).discoveries.length === 2);
    await page.click("#y-game");

    // resume mid-mission after a reload
    await page.locator('#tabs [data-tab="explore"]').click();
    await page.getByRole("button", { name: /Part 2: Listening back/ }).click();
    await page.getByRole("button", { name: "Begin" }).click();
    await page.getByRole("button", { name: /So work has been crushing you/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.fill("#q-words", "a draft I haven't saved");
    await page.waitForTimeout(200);
    await page.reload();
    await page.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
    await page.locator('#tabs [data-tab="explore"]').click();
    check(`${name}: Continue offers the open mission at step 3`, /Step 3 of 5/.test(await page.textContent("#x-body")));
    await page.getByRole("button", { name: /Part 2: Listening back.*Step 3/ }).click();
    check(`${name}: the unsaved draft comes back`, (await page.inputValue("#q-words")) === "a draft I haven't saved");

    // crisis words stop the mission and keep nothing
    await page.fill("#q-words", "I want to end my life");
    await page.getByRole("button", { name: "Save and continue" }).click();
    check(`${name}: crisis words show support and pause the mission`, /You matter more than any practice/.test(await page.textContent("#x-body")) && (await store(page)).attempts["bridge-2"].status === "paused");

    // text view lists the practices
    await page.locator('#tabs [data-tab="you"]').click();
    await page.click("#y-text");
    check(`${name}: text view lists the practices`, /Practise/.test(await page.textContent("#text")) && /Part 1: Opening/.test(await page.textContent("#text")));
    await page.click("#text-close");

    // delete everything on this device wipes the expeditions too
    await page.locator('#tabs [data-tab="reflect"]').click();
    await page.waitForSelector("#words");
    await page.fill("#words", "A quiet evening.");
    await page.getByRole("button", { name: "Keep it" }).click();
    await page.locator('#tabs [data-tab="you"]').click();
    check(`${name}: first light appears with the first reflection`, /First light/.test(await page.textContent("#y-journey")));
    await page.click("#y-delete");
    await page.getByRole("button", { name: "Delete everything", exact: true }).click();
    check(`${name}: delete everything removes the expeditions`, await page.evaluate(() => localStorage.getItem("dw-expeditions-v1") === null && localStorage.getItem("dw-local-v1") === null));
    check(`${name}: no page errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
    await ctx.close();
  }
  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-expedition-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
