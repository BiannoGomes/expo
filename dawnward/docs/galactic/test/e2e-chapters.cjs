// Beyond Overthinking, chapters 1 and 2 (drafts), end to end in the browser.
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
// Home's Compass → Chapter 1 (draft tag, worksheet, lesson with Listen, sort that
// accepts a different reading, your loop, the three questions, plan skipped) →
// star → Home suggests Chapter 2 and says why → Chapter 2 → Learn lists 7 chapters,
// 5 planned. axe on every new screen.
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
const shot = (p, n) => p.screenshot({ path: `${OUT}/c-${n}.png`, timeout: 90000 });

async function playChapter(page, name, n, { sortAgainst = false } = {}) {
  const sorts = page.locator(".sort-scale");
  check(`${name} ch${n}: six thoughts to sort`, (await sorts.count()) === 6);
  check(`${name} ch${n}: Continue waits until all are sorted`, await page.getByRole("button", { name: "Continue" }).isDisabled());
  for (let k = 0; k < 6; k++) await sorts.nth(k).getByRole("radio").nth(sortAgainst && k === 0 ? 1 : 0).click();
  const fb = await page.textContent(".explain");
  check(`${name} ch${n}: a reading of each, with reasons`, /One way to read them/.test(fb) && (await page.locator(".readings li").count()) === 6);
  if (sortAgainst) check(`${name} ch${n}: a different sorting is treated as fair, never wrong`, /fair reading too/.test(fb) && !/wrong answer|incorrect|\bscore/i.test(fb));
}

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const [name, vp] of [["phone", { width: 390, height: 844 }], ["small", { width: 320, height: 568 }]]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(PAGE); await page.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
    await page.evaluate(() => document.getElementById("skip")?.click());
    await page.waitForTimeout(400);

    const comp = await page.textContent("#earth .compass");
    check(`${name}: the Compass starts with Beyond Overthinking, Chapter 1 of 7`, /Beyond Overthinking/.test(comp) && /Chapter 1 of 7/.test(comp) && /draft/.test(comp));
    check(`${name}: "Practise" offers a different expedition, not Chapter 2`, !/Chapter 2/.test(await page.textContent("#earth .nextrow")));
    await page.locator("#earth .compass .primary").click();
    await page.waitForSelector("#x-body .draft-tag");
    check(`${name}: the chapter says it's a draft`, /Draft: not yet reviewed/.test(await page.textContent("#x-body")));
    check(`${name}: the safety note is there`, /findahelpline\.com/.test(await page.textContent("#x-body")));

    // the worksheet, before starting
    await page.getByRole("button", { name: "The Loop Check" }).click();
    const sheet = await page.textContent(".sheet");
    check(`${name}: worksheet opens with its table`, /The Loop Check/.test(sheet) && (await page.locator(".ws-table th").count()) === 4 && (await page.locator(".ws-table tbody tr").count()) === 4);
    check(`${name}: worksheet can be printed or saved`, (await page.getByRole("button", { name: "Print or save as PDF" }).count()) === 1);
    await shot(page, `${name}-worksheet`);
    await axe(page, `${name} worksheet`);
    await page.getByRole("button", { name: "Back" }).click();

    // Chapter 1
    await page.getByRole("button", { name: "Begin" }).click();
    check(`${name} ch1: the lesson reads in five short paragraphs`, (await page.locator(".lesson p").count()) === 5);
    check(`${name} ch1: Listen is offered`, (await page.getByRole("button", { name: "Listen" }).count()) === 1);
    check(`${name} ch1: no horizontal scroll while reading`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await shot(page, `${name}-lesson`);
    await axe(page, `${name} lesson`);
    await page.getByRole("button", { name: "Continue" }).click();
    await playChapter(page, name, 1, { sortAgainst: true });
    await shot(page, `${name}-sort`);
    await axe(page, `${name} sort`);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.fill("#q-words", "What if I've already left it too late to change careers?");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.fill("#q-words", "No new information. One step: look at two courses this week.");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.getByRole("button", { name: "Not this time" }).click();
    await page.locator("#x-body .found").waitFor();
    check(`${name} ch1: a star for the chapter, and the worksheet offered again`, /A star: Beyond Overthinking/.test(await page.textContent("#x-body")) && (await page.getByRole("button", { name: "Worksheet: The Loop Check" }).count()) === 1);
    check(`${name} ch1: no moon while chapters are still planned`, !/moon/i.test(await page.textContent("#x-body")));
    await page.getByRole("button", { name: "Return to Earth" }).first().click();
    await page.waitForTimeout(300);

    // the Compass moves on, and says why
    const comp2 = await page.textContent("#earth .compass");
    check(`${name}: the Compass now offers Chapter 2 of 7`, /Separate facts from assumptions/.test(comp2) && /Chapter 2 of 7/.test(comp2));
    await page.locator("#earth .c-why summary").click();
    check(`${name}: and says it's the next part of what you began`, /next part of Beyond Overthinking/.test(await page.textContent("#earth .c-why")));

    // Chapter 2
    await page.locator("#earth .compass .primary").click();
    await page.getByRole("button", { name: "Begin" }).click();
    check(`${name} ch2: lesson`, (await page.locator(".lesson p").count()) === 4);
    await page.getByRole("button", { name: "Continue" }).click();
    await playChapter(page, name, 2);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.fill("#q-words", "Whether to take the team-lead role. Facts: starts in May, 10% raise.");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.fill("#q-words", "That I'd be bad at managing. I could ask Sam.");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.fill("#q-action", "Ask Sam for twenty minutes");
    await page.fill("#q-when", "Thursday after lunch");
    await page.getByRole("button", { name: /Save/ }).last().click();
    await page.locator("#x-body .found").waitFor();
    check(`${name} ch2: the real action is kept`, /Ask Sam for twenty minutes/.test(await page.textContent("#x-body")));

    // follow the expedition from the end of a chapter
    await page.getByRole("button", { name: "Follow this expedition" }).click();
    check(`${name}: following is confirmed in plain words`, /You're following Beyond Overthinking/.test(await page.textContent("#x-body")));
    await page.getByRole("button", { name: "Return to Earth" }).first().click();
    await page.waitForTimeout(300);
    const comp3 = await page.textContent("#earth .compass");
    check(`${name}: the Compass offers Chapter 3 of 7, as the expedition you follow`, /Practise a pause/.test(comp3) && /Chapter 3 of 7/.test(comp3) && /You're following Beyond Overthinking · 2 of 7 chapters done/.test(comp3));
    await page.locator("#earth .c-why summary").click();
    check(`${name}: and says why: you chose to follow it`, /You chose to follow Beyond Overthinking/.test(await page.textContent("#earth .c-why")));

    // Chapter 3: the pause
    await page.locator("#earth .compass .primary").click();
    await page.getByRole("button", { name: "Begin" }).click();
    check(`${name} ch3: lesson`, (await page.locator(".lesson p").count()) === 4);
    await page.getByRole("button", { name: "Continue" }).click();
    check(`${name} ch3: a one-minute pause, waiting for you to start`, /About 1 minute/.test(await page.textContent("#x-body")) && /press Start/.test(await page.textContent(".cue")));
    await page.getByRole("button", { name: "Start" }).click();
    check(`${name} ch3: the first cue appears`, /Name it quietly/.test(await page.textContent(".cue")));
    await page.getByRole("button", { name: "Stop" }).click();
    check(`${name} ch3: the pause stops at once, kindly`, /Stopped\. That's fine/.test(await page.textContent(".cue")) && (await page.getByRole("button", { name: "Start" }).count()) === 1);
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByRole("button", { name: "Read the steps instead" }).click();
    check(`${name} ch3: every step can be read instead`, (await page.locator(".cue-list li").count()) === 6);
    await shot(page, `${name}-pause`);
    await axe(page, `${name} pause`);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /Pause, write one line/ }).click();
    check(`${name} ch3: the choice says what tends to happen, never right or wrong`, /tends to loosen its grip/.test(await page.textContent(".explain")) && !/wrong answer|correct/i.test(await page.textContent(".explain")));
    await page.getByRole("button", { name: "Continue" }).click();
    await page.fill("#q-words", "Quieter for a minute, then less urgent.");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.getByRole("button", { name: "Not this time" }).click();
    await page.locator("#x-body .found").waitFor();
    check(`${name} ch3: the pocket card is offered`, (await page.getByRole("button", { name: "Worksheet: The One-Minute Pause" }).count()) === 1);
    check(`${name} ch3: no second follow offer once following`, (await page.locator("#x-body .follow").count()) === 0);
    await page.getByRole("button", { name: "Worksheet: The One-Minute Pause" }).click();
    check(`${name} ch3: the card lists the five steps`, (await page.locator(".ws-items li").count()) === 5);

    // Learn shows the whole expedition honestly, and following can stop
    await page.locator('#tabs [data-tab="learn"]').click();
    await page.waitForTimeout(300);
    const learn = await page.textContent("#x-body");
    check(`${name}: Learn lists Beyond Overthinking as 7 chapters`, /expedition · 7 chapters/.test(learn));
    check(`${name}: chapters 4 to 7 are marked Planned and can't be opened`, (await page.locator("#x-body li.planned").count()) === 4 && (await page.locator("#x-body li.planned button").count()) === 0);
    const stopBtn = page.getByRole("button", { name: "Following · stop" });
    check(`${name}: Learn shows you're following, as a pressed toggle`, (await stopBtn.getAttribute("aria-pressed")) === "true");
    await stopBtn.click();
    check(`${name}: stopping is one tap`, (await page.getByRole("button", { name: "Follow this expedition" }).count()) === 1);
    check(`${name}: stopping keeps every chapter done`, (await page.locator("#x-body .mission.done").count()) >= 3);
    await shot(page, `${name}-learn`);
    await axe(page, `${name} learn`);
    check(`${name}: no page errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
    await ctx.close();
  }
  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-chapters-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
