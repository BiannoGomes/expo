// Dawnward without AI (4 Nov 2026): simpler, and the payoff comes from the person's own words, worked out on the phone.
// - People see only what exists: no "Planned" chapters or places, no "draft" labels; one clear next chapter per series.
// - Journey › Week: a weekly summary (counts, steps and how they went, a line you wrote), printable as a PDF.
// - Noticing: patterns quoted from your own reflections, which you can confirm or hide; nothing is sent anywhere.
// - Worksheets: filled in inside the app, saved as you type, back after a reload, printed with your answers.
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
const iso = (daysAgo) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  // a returning person: every galaxy open, six reflections over the last days
  const STARS = [
    [6, "mind", "Work was relentless today. I felt tired all evening."],
    [5, "mind", "Another long day at work. I can't switch off."],
    [4, "soul", "Called my sister. Felt lighter, less tired."],
    [3, "mind", "Work emails again until late. Tired and restless."],
    [1, "body", "Walked by the river after work. The deadline can wait."],
    [0, "mind", "Slept well for once, and the morning felt calm."],
  ].map(([d, w, t], i) => ({ id: `s${i}`, world: w, date: iso(d), excerpt: t }));
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript((stars) => { try { if (location.protocol === "about:") return;
    if (!localStorage.getItem("dw-progress-v1")) localStorage.setItem("dw-progress-v1", JSON.stringify({ unlocked: { knowledge: "seed", spiritual: "seed", creative: "seed", ai: "seed", gateway: "seed" }, celebrated: { knowledge: true, spiritual: true, creative: true, ai: true, gateway: true } }));
    if (!localStorage.getItem("dw-local-v1")) localStorage.setItem("dw-local-v1", JSON.stringify({ stars, themes: [] }));
    localStorage.setItem("dw-home-seen", "1"); } catch {} }, STARS);
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e)));

  // ----- people see only what exists -----
  await go(page, "learn");
  const learn = await page.locator("#x-body").textContent();
  check("Learn shows nothing planned and no draft labels", !/Planned/.test(learn) && !/draft/i.test(learn) && (await page.locator("#x-body li.planned").count()) === 0, learn.match(/Planned|draft/gi)?.join(",") ?? "");
  check("Beyond Overthinking counts only its real chapters", /Mind · 4 chapters/.test(learn));
  check("each series shows one next chapter, with all chapters a tap away", (await page.locator('#x-body [aria-labelledby="x-mind-beyond-overthinking"] .mission.current').count()) === 1 && /All 4 chapters/.test(learn));
  // start two chapters: only the current one says Continue
  for (const id of ["Understand the loop", "Separate facts from assumptions"]) {
    await go(page, "learn");
    const box = page.locator('#x-body [aria-labelledby="x-mind-beyond-overthinking"]');
    await box.locator("details summary").click();
    await box.locator("details .mission", { hasText: id }).click();
    await page.waitForSelector("#x-body .s-title");
    await page.getByRole("button", { name: "Begin" }).click().catch(() => {});
    await page.waitForTimeout(400);
  }
  await go(page, "learn");
  const series = page.locator('#x-body [aria-labelledby="x-mind-beyond-overthinking"]');
  const txt = await series.textContent();
  check("two chapters started: one says Continue, the other just Started", (txt.match(/Continue · step/g) || []).length === 1 && /Started/.test(txt) && !/In progress/.test(txt), txt.replace(/\s+/g, " ").slice(0, 200));
  await axe(page, "Learn, simplified");
  await go(page, "world/mind/overview", 1200);
  await page.locator("#w-tab-systems").click().catch(() => {}); await page.waitForTimeout(400);
  const world = await page.locator("#w-body").textContent();
  check("a world shows no planned chapters or pathways", !/Planned|being written/i.test(world) && (await page.locator("#w-body li.planned, #w-body .moon.planned").count()) === 0);
  await go(page, "universe/ai", 1200);
  const ai = await page.locator("#cw-page").textContent().catch(() => "");
  check("AI Creation lists only what's open (no AI studios promised)", !/Planned|needs an AI service|AI studios/i.test(ai), ai.slice(0, 160));

  // ----- Journey › Week -----
  await go(page, "journey/week", 1200);
  const week = page.locator("#m-miles");
  const wt = await week.textContent();
  check("Journey has a Week view", (await page.locator('#m-views [data-v="week"][aria-checked="true"]').count()) === 1 && /Your week/.test(wt));
  check("the week counts what you did, in plain numbers", /6\s*Reflections/.test(wt.replace(/\s+/g, " ")) || /6Reflections/.test(wt.replace(/\s+/g, "")), wt.replace(/\s+/g, " ").slice(0, 160));
  const quoted = (await week.locator(".sheet blockquote").textContent().catch(() => "")).trim();
  check("it quotes one line you wrote, word for word", !!quoted && STARS.some((s) => s.excerpt.includes(quoted)) && (await week.locator(".sheet blockquote").count()) === 1, quoted);
  check("it offers Save as PDF", (await week.getByRole("button", { name: "Save as PDF" }).count()) === 1);

  // ----- noticing, from your own words -----
  const cards = week.locator(".notice-card");
  const first = await cards.first().textContent().catch(() => "");
  check("noticing: a word you keep coming back to, counted honestly", /You wrote about “work” in 4 of your 6 reflections/.test(first), first.slice(0, 120));
  check("…with your own words as evidence", (await cards.first().locator(".notice-ev q").count()) >= 1);
  check("…and a feeling you named, counted, never interpreted", /The feeling you named most often is “tired”, in 3 reflections/.test(wt));
  check("it says plainly that nothing left the phone", /Nothing is sent anywhere/.test(wt));
  await axe(page, "Journey › Week");
  await cards.first().getByRole("button", { name: "That's right" }).click();
  check("That's right: kept, and it says so", /You said this sounds right/.test(await week.locator(".notice-card").first().textContent()));
  const feelCard = week.locator(".notice-card", { hasText: "feeling you named" });
  await feelCard.getByRole("button", { name: "Not quite" }).click();
  await go(page, "journey/week", 1000);
  check("Not quite: hidden, and it stays hidden after a reload", !/feeling you named/.test(await page.locator("#m-miles").textContent()));
  await go(page, "you", 800);
  check("You › What I've noticed shows the same honest patterns", /You wrote about “work”/.test(await page.locator("#y-understand").textContent()));

  // ----- worksheets you fill in -----
  await go(page, "learn");
  // reachable from Learn even mid-chapter (this person is part-way through chapter 1)
  await page.locator('#x-body [aria-labelledby="x-mind-beyond-overthinking"] .ws-links').getByRole("button", { name: "The Loop Check" }).click();
  await page.waitForSelector("#ws-title", { timeout: 15000 }).catch(() => {});
  const cell = page.getByRole("textbox", { name: "The thought, row 1" });
  check("the worksheet opens with fields to type into", (await cell.count()) === 1);
  await cell.fill("I'll mess up the presentation");
  await page.getByRole("button", { name: "Add a row" }).first().click();
  check("Add a row adds a fifth row", (await page.getByRole("textbox", { name: "The thought, row 5" }).count()) === 1);
  await page.waitForTimeout(700);
  check("it says it saved on this phone", /Saved on this phone/.test(await page.locator("#x-body").textContent()));
  await page.emulateMedia({ media: "print" });
  check("printing shows your answers as text", await page.evaluate(() => [...document.querySelectorAll(".ws-print")].some((e) => getComputedStyle(e).display !== "none" && /mess up the presentation/.test(e.textContent))));
  await page.emulateMedia({ media: "screen" });
  await axe(page, "a worksheet being filled in");
  await go(page, "journey/milestones", 1000);
  const ms = await page.locator("#m-miles").textContent();
  check("Journey lists your worksheet", /Your worksheets/.test(ms) && /The Loop Check/.test(ms));
  await page.locator("#m-miles button", { hasText: "The Loop Check" }).click();
  await page.waitForSelector("#ws-title");
  check("reopened after a reload, your answers are back", (await page.getByRole("textbox", { name: "The thought, row 1" }).inputValue()) === "I'll mess up the presentation" && (await page.getByRole("textbox", { name: "The thought, row 5" }).count()) === 1);

  // ----- Delete everything takes these too -----
  await go(page, "you", 800);
  await page.locator("#y-delete").click();
  await page.locator("#y-delete-confirm .danger").click();
  await page.waitForTimeout(500);
  check("Delete everything removes worksheet answers and noticing choices", await page.evaluate(() => !localStorage.getItem("dw-sheets-v1") && !localStorage.getItem("dw-notice-v1")));

  // ----- found by the newcomer walk-through (4 Nov): empty screens and Home's progress -----
  const fresh = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const np = await fresh.newPage(); np.on("pageerror", (e) => errors.push(String(e)));
  // append(null) makes a text node that is just "null" (or "nullnull"): look for exactly that
  const strayNull = (p) => p.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/^\s*(null|undefined)+\s*$/.test(n.textContent) && n.parentElement?.offsetParent) return true; return false; });
  // every main screen, brand new: DOM append() prints a missing part as the word "null" (found 3 times, 4 Nov)
  const nullOn = [];
  for (const r of ["home", "universe", "universe/growth", "world/mind/overview", "world/mind/expeditions", "world/mind/library", "world/mind/progress", "learn", "journey", "journey/milestones", "journey/week", "you", "knowledge/wisdom", "library"]) { await go(np, r, 1000); if (await strayNull(np)) nullOn.push(r); }
  check(`no main screen prints a stray "null" for a brand-new person (14 screens)`, nullOn.length === 0, nullOn.join(", "));
  await go(np, "home", 1000);
  await np.locator("#e-body .nextcard .primary").click();
  await np.waitForSelector("#x-body .s-title");
  await np.getByRole("button", { name: "Begin" }).click(); await np.waitForTimeout(500);
  await np.fill("#q-words", "Should I take it?\nWhat if I hate it?");
  await np.getByRole("button", { name: "Continue", exact: true }).click(); await np.waitForTimeout(500);
  await np.locator("#x-body .qhead .back").click(); await np.waitForTimeout(1200); // focus mode: the one way out
  const homeBtn = await np.locator("#e-body .nextcard .primary").innerText();
  await np.locator('#tabs [data-tab="learn"]').click(); await np.waitForTimeout(1200);
  const learnBtn = await np.locator("#x-body .x-feature .primary").innerText();
  const num = (s) => (s.match(/(\d+) of (\d+)/) || []).slice(1).join("/");
  check("Home's Continue shows the same step as Learn, without a reload", /Continue/.test(homeBtn) && num(homeBtn) === num(learnBtn) && !/^1\//.test(num(homeBtn)), `home "${homeBtn}" · learn "${learnBtn}"`);
  await fresh.close();

  check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-noai-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
