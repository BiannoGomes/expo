// The user council's slice A (4 Nov 2026, docs/blueprint/2026-11-04-user-council.md):
// 1 your decision first (sort YOUR thoughts; the long reading one tap away)  2 the beta is all free, no plan talk
// 3 one card on Today  5 focus mode inside a practice  7 an honest promise of the payoff  8 a weekly "Your week" reminder.
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
const ready = (p) => p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 60000 });
const go = async (p, hash, wait = 900) => { await p.goto("about:blank"); await p.goto(BASE + "#/" + hash); await ready(p); await p.waitForTimeout(wait); };
const cont = (p) => p.getByRole("button", { name: "Continue", exact: true }).click();
// the tab bar slides away in focus mode and is then hidden from touch, keyboard and screen readers
const tabsShown = (p) => p.locator("#tabs").isVisible();

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const errors = [];
  const fresh = async (init) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true });
    if (init) await ctx.addInitScript(init.fn, init.arg);
    const page = await ctx.newPage(); page.on("pageerror", (e) => errors.push(String(e)));
    return { ctx, page };
  };

  // ===== 1 + 5: a newcomer's first chapter, their own decision first, in focus mode =====
  {
    const { ctx, page } = await fresh();
    await go(page, "home", 1000);
    await page.locator("#e-body .nextcard .primary").click();
    await page.waitForSelector("#x-body .s-title");
    check("focus mode: no tab bar inside a practice", !(await tabsShown(page)));
    check("focus mode: one way out at the top, no breadcrumb trail", (await page.locator("#x-body .qhead .back").count()) === 1 && (await page.locator("#x-body .qhead .crumbs").count()) === 0);
    check("the intro says what you'll do, in plain words", /write down the thoughts that keep coming back/.test(await page.locator("#x-body").innerText()));
    await page.getByRole("button", { name: "Begin" }).click();
    await page.waitForSelector("#q-words");
    check("your own words come at step 2, before any lesson", /What are you going back and forth on\?/.test(await page.locator("#x-body").innerText()) && (await page.locator(".lesson").count()) === 0);
    await page.fill("#q-words", "Should I take the new job?\nWhat if I hate it after a month?\nWhen would I need to tell my manager?");
    await cont(page);
    await page.waitForSelector(".sort-scale");
    const items = await page.locator(".lens-text").allInnerTexts();
    check("the sort shows YOUR thoughts, one per line", JSON.stringify(items) === JSON.stringify(["Should I take the new job?", "What if I hate it after a month?", "When would I need to tell my manager?"]), JSON.stringify(items));
    check("no stranger's thoughts to sort", !/application close|good enough/.test(await page.locator("#x-body").innerText()));
    check("Continue waits until each is sorted", await page.getByRole("button", { name: "Continue", exact: true }).isDisabled());
    const sorts = page.locator(".sort-scale");
    await sorts.nth(0).getByRole("radio", { name: "Moves forward" }).click();
    await sorts.nth(1).getByRole("radio", { name: "Goes round" }).click();
    await sorts.nth(2).getByRole("radio", { name: "Moves forward" }).click();
    const fb = await page.locator(".explain").innerText();
    check("afterwards: your own count, never a 'reading' of your thoughts or a score", /Moves forward: 2 · Goes round: 1/.test(fb) && !/One way to read them|fair reading|wrong|correct|score/i.test(fb), fb.replace(/\n/g, " / "));
    await axe(page, "sorting your own thoughts");
    await cont(page);
    await page.waitForSelector(".lesson");
    check("the lesson is short: two paragraphs", (await page.locator("#x-body > .lesson p").count()) === 2);
    const more = page.locator("details.lesson-more");
    check("the full reading is one tap away, closed by default", (await more.count()) === 1 && !(await more.evaluate((d) => d.open)) && /Why this works/.test(await more.locator("summary").innerText()));
    await more.locator("summary").click();
    check("…and opens to the longer reading", (await more.locator("p").count()) === 3);
    await axe(page, "the short lesson");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForSelector("#q-words");
    check("the three questions ask about one of YOUR thoughts that goes round", /Pick one thought that goes round/.test(await page.locator("#x-body").innerText()));
    await page.fill("#q-words", "What if I hate it? No new information. Next step: ask someone on the team.");
    await cont(page);
    await page.waitForSelector("#q-action");
    await page.fill("#q-action", "Ask Sam what the team is really like"); await page.fill("#q-when", "Friday");
    await cont(page);
    await page.waitForFunction(() => /Done/.test(document.querySelector("#x-body .s-title")?.textContent ?? ""), null, { timeout: 20000 });
    check("Done says what you did", /You sorted your own thoughts/.test(await page.locator("#x-body").innerText()));
    check("on Done the tab bar is back (you're finished, and the star lands in Journey)", await tabsShown(page));
    // leaving the practice brings the tab bar back
    await page.getByRole("button", { name: "Go home", exact: true }).first().click().catch(async () => { await go(page, "home"); });
    await page.waitForTimeout(800);
    check("focus mode ends when you leave: the tab bar is back", await tabsShown(page));

    // ===== 2: the beta is all free =====
    const card = await page.locator("#e-body .nextcard").first().innerText();
    check("beta: Home offers Chapter 2 of 4 next (no members' gate)", /Separate facts from assumptions/.test(card) && /Chapter 2 of 4/.test(card), card.replace(/\n/g, " / "));
    check("…and the step chosen today waits as a quiet row, not a second card", (await page.locator("#e-body .nextcard").count()) === 1 && (await page.locator("#e-body .row.e-wait").count()) === 1);
    await go(page, "learn");
    const learn = await page.locator("#x-body").innerText();
    check("beta: Learn shows no Plus labels", !/\bPlus\b/.test(learn));
    await page.locator('#x-body [aria-labelledby="x-mind-beyond-overthinking"] details summary').click();
    await page.locator('#x-body [aria-labelledby="x-mind-beyond-overthinking"] details .mission', { hasText: "Separate facts from assumptions" }).click();
    await page.waitForSelector("#x-body .s-title");
    check("beta: Chapter 2 opens straight away, no gate", (await page.locator(".plus-card").count()) === 0 && (await page.getByRole("button", { name: "Begin" }).count()) === 1);
    await go(page, "you");
    const you = await page.locator("#you").innerText();
    check("beta: You says nothing about plans or membership", !(await page.locator("#y-plan-h").isVisible()) && !/Preview as a member|Your plan/.test(you));
    await ctx.close();
  }

  // ===== 3: one card on Today; unlock news is a quiet line =====
  {
    const y = new Date(Date.now() - 36 * 3600e3).toISOString();
    const { ctx, page } = await fresh({ fn: (y) => { try { if (location.protocol === "about:") return;
      if (!localStorage.getItem("dw-expeditions-v1")) localStorage.setItem("dw-expeditions-v1", JSON.stringify({ attempts: {}, experiments: [{ id: "exp-1", attempt_id: "a1", world: "body", action: "Phone in the kitchen at night", when_text: "Tuesday night", status: "planned", outcome: null, created_at: y }], events: [], discoveries: [], gameLayer: true, following: [], plan: "free" }));
      if (!localStorage.getItem("dw-progress-v1")) localStorage.setItem("dw-progress-v1", JSON.stringify({ unlocked: { knowledge: "2026-11-03" }, celebrated: {} }));
      localStorage.setItem("dw-home-seen", "1"); } catch {} }, arg: y });
    await go(page, "home", 1200);
    const body = page.locator("#e-body");
    check("a step chosen before today comes first: one card asks how it went", (await body.locator(".nextcard").count()) === 1 && (await body.locator(".nextcard.e-due").count()) === 1 && /How did it go\?/.test(await body.locator(".nextcard").innerText()) && /Phone in the kitchen/.test(await body.locator(".nextcard").innerText()));
    check("…and it's the only gold button", (await body.locator(".primary").count()) === 1);
    const un = body.locator(".card.unlocked");
    check("a galaxy opening is a quiet line under the card, with no big painting", (await un.count()) === 1 && (await un.locator("img").count()) === 0 && /Knowledge is open/.test(await un.innerText()));
    await axe(page, "Today with one card");
    await body.locator(".nextcard .e-wait").click();
    await page.waitForSelector(".x-tiles");
    check("the card opens How did it go?", (await page.locator(".x-tiles [role=radio]").count()) === 4);
    await ctx.close();
  }

  // ===== 7: the honest promise of the payoff =====
  {
    const { ctx, page } = await fresh();
    await go(page, "world/mind/overview", 1000);
    await page.getByRole("button", { name: "Begin reflection" }).click();
    await page.waitForSelector("#words");
    check("Reflect says when noticing can start (0 so far)", /After 3 reflections, Dawnward can start noticing/.test(await page.locator(".ed-payoff").innerText()));
    await page.fill("#words", "Slept badly again and the meeting went round in my head.");
    await page.getByRole("button", { name: "Save reflection" }).click();
    await page.waitForTimeout(1500);
    await go(page, "world/mind/overview", 1000);
    await page.getByRole("button", { name: "Begin reflection" }).click();
    await page.waitForSelector("#words");
    check("…and counts down honestly (1 so far)", /^2 more reflections and Dawnward can start noticing/.test(await page.locator(".ed-payoff").innerText()));
    await go(page, "journey/week", 1000);
    check("Your week says the same, instead of an empty space", /2 more reflections and Dawnward can start noticing/.test(await page.locator("#m-miles").innerText()));

    // ===== 8: the weekly ritual =====
    const btn = page.getByRole("button", { name: "Remind me each week" });
    check("Your week offers a weekly reminder", (await btn.count()) === 1);
    await btn.click();
    const dlg = page.getByRole("dialog", { name: "Your week, every week" });
    check("the sheet explains it repeats, and nothing is sent", (await dlg.count()) === 1 && /repeats on that day and time/.test(await dlg.innerText()) && /Nothing is sent anywhere/.test(await dlg.innerText()));
    check("…with no stray \"null\" text (found in a screenshot, 4 Nov)", !/\bnull/.test(await dlg.innerText()));
    const d = await page.inputValue("#rm-date"), t = await page.inputValue("#rm-time");
    check("it starts on the next Sunday, at 18:00", new Date(`${d}T12:00:00`).getDay() === 0 && t === "18:00", `${d} ${t}`);
    await axe(page, "the weekly reminder");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Save to my calendar" }).click()]);
    const ics = fs.readFileSync(await dl.path(), "utf8"), flat = ics.replace(/\r\n /g, "");
    check("the file repeats weekly and opens Your week", dl.suggestedFilename() === "dawnward-your-week.ics" && /\r\nRRULE:FREQ=WEEKLY\r\n/.test(ics) && /#\/journey\/week/.test(flat));
    check("lines are folded at 75 octets", ics.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75));
    await ctx.close();
  }

  check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-council-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
