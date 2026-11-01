// The five gateway questions, end to end on a phone:
// Body (a world with no expedition before) → The Temple of Vitality → discover → reflect →
// one real action → Done → Home asks "How did it go?" → review → Journey → reload.
// Then Reflect: "Another question" moves through the world's questions, the draft keeps the
// question, and the saved reflection shows the question it answered, after a reload too.
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
const shot = (p, n) => p.screenshot({ path: `${OUT}/q-${n}.png`, timeout: 90000 }).catch(() => {});
const noSideways = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const cont = (p) => p.getByRole("button", { name: "Continue", exact: true }).click();

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  // a returning explorer: every galaxy already open (the path itself is tested in e2e-path.cjs)
  { const nc = browser.newContext.bind(browser); browser.newContext = async (o) => { const c = await nc(o); await c.addInitScript(() => { try { if (!localStorage.getItem("dw-progress-v1")) localStorage.setItem("dw-progress-v1", JSON.stringify({ unlocked: { knowledge: "seed", spiritual: "seed", creative: "seed", ai: "seed", gateway: "seed" }, celebrated: { knowledge: true, spiritual: true, creative: true, ai: true, gateway: true } })); } catch {} }); return c; }; }
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e)));

  // ----- Body: the guided question -----
  await page.goto(BASE + "#/world/body/overview"); await ready(page); await page.waitForTimeout(1200);
  const next = page.locator("#w-body .w-next");
  check("Body offers its guided question, one tap away", (await next.count()) === 1 && /The Temple of Vitality/.test(await next.innerText()), await next.innerText().catch(() => ""));
  await next.click();
  await page.waitForSelector("#x-body .s-title");
  await page.getByRole("button", { name: "Begin" }).click();
  const q1 = await page.locator("#x-body .s-title").first().innerText();
  check("Discover: the gateway question is the heading", q1.trim() === "If your body could tell you what it needs, what have you been ignoring?", q1);
  check("the step shows the world's own painting", await page.evaluate(() => !document.getElementById("x-art").hidden && /closeup-body/.test(document.querySelector("#x-art img").getAttribute("src"))));
  await shot(page, "1-discover");
  await axe(page, "Discover step");
  await page.fill("#q-words", "Sleep. I've been scrolling until one most nights.");
  await cont(page);
  check("Reflect follows", /What gets in the way\?/.test(await page.locator("#x-body .s-title").first().innerText()));
  await page.fill("#q-words", "I tell myself it's the only time that's mine.");
  // a reload mid-way keeps your place
  await page.reload(); await ready(page); await page.waitForTimeout(800);
  await page.goto(BASE + "#/world/body/overview"); await ready(page); await page.waitForTimeout(800);
  check("after a reload, Body offers to pick up where you left off", /The Temple of Vitality/.test(await page.locator("#w-body .w-next").innerText()));
  await page.locator("#w-body .w-next").click();
  await page.waitForSelector("#x-body .s-title");
  const resumed = await page.locator("#x-body .s-title").first().innerText();
  check("it resumes at Reflect, not the beginning", /What gets in the way\?/.test(resumed), resumed);
  if (!(await page.inputValue("#q-words"))) await page.fill("#q-words", "I tell myself it's the only time that's mine.");
  await cont(page);
  check("Choose: one small practice for seven days", /Seven days/.test(await page.locator("#x-body .s-title").first().innerText()) && (await page.locator("#q-action").count()) === 1);
  await page.fill("#q-action", "Phone in the kitchen at eleven");
  await page.fill("#q-when", "Every night this week");
  await cont(page);
  await page.waitForFunction(() => /Done/.test(document.querySelector("#x-body .s-title")?.textContent ?? ""), null, { timeout: 15000 });
  const close = await page.locator("#x-body").innerText();
  check("Done: shows the action you chose", /Phone in the kitchen at eleven/.test(close) && /Every night this week/.test(close));
  check("one primary action on the ending", (await page.locator("#x-body .primary").count()) === 1);
  check("no sideways scroll on the ending", await noSideways(page));
  await shot(page, "2-done");
  await axe(page, "the ending");

  // ----- Earth: how did it go? -----
  await page.goto(BASE + "#/home"); await ready(page); await page.waitForTimeout(800);
  const wait = page.locator("#e-body .e-wait");
  check("Home asks how the action went", (await wait.count()) === 1 && /Phone in the kitchen at eleven/.test(await wait.innerText()));
  await wait.click();
  await page.getByRole("radio", { name: "I did it" }).click();
  await page.fill("#x-review", "Five nights out of seven. I fell asleep faster.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForFunction(() => /Thank you for coming back/.test(document.getElementById("x-body")?.innerText ?? ""), null, { timeout: 15000 });
  check("the review is kept", true);
  await page.goto(BASE + "#/home"); await ready(page); await page.waitForTimeout(600);
  check("once reviewed, Home stops asking", (await page.locator("#e-body .e-wait").count()) === 0);

  // ----- Journey -----
  await page.locator('#tabs [data-tab="journey"]').click();
  await page.locator('#m-views [data-v="miles"]').click();
  const miles = await page.locator("#m-miles").innerText();
  check("Journey shows the finished question and the reviewed action", /The Temple of Vitality/.test(miles) && /Actions/.test(miles), miles.slice(0, 200).replace(/\n/g, " / "));
  await page.reload(); await ready(page); await page.waitForTimeout(500);
  await page.locator('#tabs [data-tab="journey"]').click();
  await page.locator('#m-views [data-v="miles"]').click();
  check("after a reload it's all still there", /The Temple of Vitality/.test(await page.locator("#m-miles").innerText()));

  // ----- Learn lists all five -----
  await page.locator('#tabs [data-tab="learn"]').click(); await page.waitForTimeout(800);
  const learn = await page.locator("#x-body").innerText();
  const five = ["The Mirror of Thought", "The Temple of Vitality", "The Garden of Becoming", "The Observatory of Being", "The Horizon of Possibility"];
  check("Learn lists all five guided questions", five.every((t) => learn.includes(t)), five.filter((t) => !learn.includes(t)).join(", "));

  // ----- Reflect: another question -----
  await page.goto(BASE + "#/world/mind/overview"); await ready(page); await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Begin reflection" }).click();
  await page.waitForSelector("#ed-q");
  check("Reflect opens on the everyday question", (await page.locator("#ed-q").innerText()) === "What's on your mind?");
  await page.getByRole("button", { name: "Another question" }).click();
  const deeper = await page.locator("#ed-q").innerText();
  check("Another question shows Mind's gateway question", deeper === "What if the thoughts you believe most strongly are the ones you need to question?", deeper);
  check("the input keeps focus after changing the question", await page.evaluate(() => document.activeElement?.id === "words"));
  const btn = await page.getByRole("button", { name: "Another question" }).boundingBox();
  check("Another question is a full-size target", btn && btn.height >= 44, JSON.stringify(btn));
  await page.fill("#words", "That I'm bad at starting things."); await page.locator("#words").dispatchEvent("input");
  await page.waitForTimeout(700);
  await shot(page, "3-another");
  await axe(page, "Reflect with another question");
  await page.reload(); await ready(page); await page.waitForTimeout(800);
  await page.goto(BASE + "#/world/mind/overview"); await ready(page); await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Begin reflection" }).click();
  await page.waitForSelector("#ed-q");
  check("an unsent draft comes back with its question", (await page.locator("#ed-q").innerText()) === deeper && (await page.inputValue("#words")) === "That I'm bad at starting things.");
  await page.getByRole("button", { name: "Save reflection" }).click();
  await page.waitForSelector(".said-q", { timeout: 10000 });
  check("the new star shows the question it answered", (await page.locator(".said-q").innerText()) === deeper);
  await page.reload(); await ready(page); await page.waitForTimeout(600);
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem("dw-local-v1")).stars.find((s) => /bad at starting/.test(s.excerpt)));
  check("the question is kept with the words, on this device", kept?.prompt === deeper, JSON.stringify(kept));
  await page.locator('#tabs [data-tab="journey"]').click();
  await page.locator('#m-views [data-v="list"]').click();
  await page.locator("#m-list button.memory", { hasText: "bad at starting" }).first().click();
  check("Journey shows the question with the reflection", (await page.locator("#m-detail .said-q").innerText().catch(() => "")) === deeper);
  // the everyday question isn't repeated as a label
  await page.goto(BASE + "#/world/soul/overview"); await ready(page); await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Begin reflection" }).click();
  await page.fill("#words", "Lunch with Dad."); await page.getByRole("button", { name: "Save reflection" }).click();
  await page.waitForSelector("blockquote.said", { timeout: 10000 });
  check("an everyday reflection carries no extra label", (await page.locator("#w-body .said-q").count()) === 0);
  const lunch = await page.evaluate(() => JSON.parse(localStorage.getItem("dw-local-v1")).stars.find((s) => s.excerpt === "Lunch with Dad."));
  check("saving straight after typing doesn't leak into the next reflection (kept in Soul, no old question)", lunch?.world === "soul" && !lunch.prompt, JSON.stringify(lunch));
  check("and no stale draft is left behind", await page.evaluate(() => !localStorage.getItem("dw-draft-v1")));

  // ----- small phone -----
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(BASE + "#/world/spirit/overview"); await ready(page); await page.waitForTimeout(800);
  await page.locator("#w-body .w-next").click();
  await page.getByRole("button", { name: "Begin" }).click();
  check("at 320 px the longest gateway question fits without sideways scroll", await noSideways(page));
  check("no page errors", errors.length === 0, errors.join(" | "));

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-questions-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
