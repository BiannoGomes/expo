// The Members' Library: packs Bianno makes with Opus, Fable and their Skool material.
// Uses a test-only pack injected into the page (window.DW_PACKS); nothing fake ships in the app.
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
const go = async (p, hash) => { await p.goto(BASE + "#/" + hash); await ready(p); await p.waitForTimeout(400); };
const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const TEST_PACKS = () => {
  window.DW_PACKS = [
    { id: "test-evening", title: "Test pack: an evening", summary: "A test pack used only by this test.", place: "spiritual", access: "plus", items: [
      { type: "lesson", title: "A test lesson", source: "opus", credit: "Written with Claude Opus, reviewed by Bianno", minutes: 3, paragraphs: ["First test paragraph.", "Second test paragraph."] },
      { type: "lesson", title: "A draft lesson", source: "opus", credit: "Written with Claude Opus, reviewed by Bianno", draft: true, paragraphs: ["Draft words."] },
      { type: "video", title: "A test film", source: "fable", credit: "Animated with Fable", src: "packs/test/film.mp4", captions: "packs/test/film.vtt", description: "A door opens." },
      { type: "audio", title: "A test recording", source: "bianno", credit: "By Bianno", src: "packs/test/a.mp3", transcript: "Breathe in. Breathe out." },
      { type: "worksheet", title: "A test worksheet", source: "skool", credit: "From Bianno's Skool community", src: "packs/test/sheet.pdf" },
    ] },
    { id: "test-mind", title: "Test pack: a free taster", summary: "A free test pack placed in Mind.", place: "mind", access: "free", items: [
      { type: "lesson", title: "A free test lesson", source: "bianno", credit: "By Bianno", paragraphs: ["Free words."] },
    ] },
  ];
};

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const errors = [];

  // ---- with no packs yet: an honest empty library ----
  {
    const c = await browser.newContext(MOBILE); const p = await c.newPage();
    p.on("pageerror", (e) => errors.push(String(e)));
    await go(p, "learn");
    await p.getByRole("button", { name: /Lessons, audio & films/ }).click();
    check("Learn leads to the Library", JSON.stringify(await where(p)) === JSON.stringify(["creative", "#/library"]));
    check("the Learn tab stays current", (await p.getAttribute('#tabs [data-tab="learn"]', "aria-current")) === "page");
    check("with no packs it says they're being prepared", /preparing the first packs/.test(await p.locator("#cw-page").innerText()));
    await axe(p, "the empty library");
    await c.close();
  }

  // ---- a free visitor with packs ----
  const ctx = await browser.newContext(MOBILE);
  await ctx.addInitScript(TEST_PACKS);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  await go(page, "library");
  const lib = await page.locator("#cw-page").innerText();
  check("packs are grouped by where they belong", /SPIRITUAL EXPLORATION|Spiritual Exploration/.test(lib) && /MIND|Mind/.test(lib));
  check("each pack shows what's inside and who it's for", /Lesson · Film · Listen · Worksheet/.test(lib) && /Members/.test(lib) && /Free/.test(lib));
  await axe(page, "the library");
  await page.screenshot({ path: `${OUT}/l-library.png` });
  await page.locator(".cw-planets button", { hasText: "Test pack: an evening" }).click();
  check("a members' pack has its own address", (await where(page))[1] === "#/library/test-evening");
  const gate = await page.locator("#cw-page").innerText();
  check("a members' pack shows what's inside, honestly, and nothing more", /This is for members/.test(gate) && /A test film \(film\)/.test(gate) && /isn't open yet/.test(gate) && !(await page.locator("#cw-page video, #cw-page audio").count()));
  await axe(page, "a members' pack, locked");
  await page.keyboard.press("Escape");
  check("Escape goes back to the library", (await where(page))[1] === "#/library");
  await page.locator(".cw-planets button", { hasText: "a free taster" }).click();
  check("a free pack opens for everyone", /Free words/.test(await page.locator("#cw-page").innerText()));
  await go(page, "universe/spiritual");
  check("a pack shows on its galaxy, under From Bianno", /From Bianno/i.test(await page.locator("#cw-page").innerText()) && (await page.locator(".cw-planets button", { hasText: "Test pack: an evening" }).count()) === 1);
  await go(page, "world/mind/library");
  check("a pack placed in a world shows in that world's Library", (await page.locator("#w-body button, #world button", { hasText: "a free taster" }).count()) >= 1);
  await ctx.close();

  // ---- a member ----
  const mctx = await browser.newContext(MOBILE);
  await mctx.addInitScript(TEST_PACKS);
  await mctx.addInitScript(() => { const k = "dw-expeditions-v1"; if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ plan: "plus" })); });
  const m = await mctx.newPage();
  m.on("pageerror", (e) => errors.push(String(e)));
  await go(m, "library/test-evening");
  const body = await m.locator("#cw-page").innerText();
  check("a member opens the pack by link", /First test paragraph/.test(body) && /Second test paragraph/.test(body));
  check("every item says how it was made", /Written with Claude Opus, reviewed by Bianno/.test(body) && /Animated with Fable/.test(body) && /From Bianno's Skool community/.test(body) && /By Bianno/.test(body));
  check("an unreviewed draft is labelled", /Draft, not yet reviewed/.test(body));
  check("the film has captions on by default", await m.evaluate(() => { const t = document.querySelector("#cw-page video track"); return !!t && t.kind === "captions" && t.default; }));
  check("the film describes what happens", /What happens: A door opens/.test(body));
  check("the recording has its transcript", await m.evaluate(() => /Breathe in/.test(document.querySelector("#cw-page details")?.textContent ?? "")));
  check("the worksheet opens as a PDF link", (await m.locator("#cw-page a", { hasText: "Open the worksheet" }).count()) === 1);
  await axe(m, "a members' pack, open");
  await m.screenshot({ path: `${OUT}/l-pack.png`, fullPage: true });
  check("no page errors", errors.length === 0, errors.join(" | "));
  await mctx.close();

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-library-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
