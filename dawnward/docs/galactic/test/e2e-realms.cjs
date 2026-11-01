// The galaxies beyond Creative Worlds' first slice: Spiritual Exploration, Knowledge and
// AI Creation, plus the Dream Architect and the Time Garden. Free and members' paths,
// writing kept on this device (with a crisis check), the gallery's save and delete,
// real taps in 3D, words-only and reduced motion, axe, and frame times (SwiftShader).
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const AXE = fs.readFileSync(path.join(__dirname, "../../../experience/node_modules/axe-core/axe.min.js"), "utf8");
const BASE = (process.env.DW_URL || "http://localhost:8771/home.html").replace(/#.*$/, "");
const OUT = path.join(__dirname, "shots");
const results = { when: new Date().toISOString(), checks: [], axe: {}, frames: {} };
const check = (name, ok, detail = "") => { results.checks.push({ name, ok: Boolean(ok), detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };
async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}×${v.nodes.length}`));
  results.axe[label] = r; check(`axe: ${label}`, r.length === 0, r.join(", "));
}
const ready = (p) => p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
const where = (p) => p.evaluate(() => [window.__dwHome.state.place, location.hash]);
const shot = (p, n) => p.screenshot({ path: `${OUT}/r-${n}.png`, timeout: 90000 });
const store = (p) => p.evaluate(() => JSON.parse(localStorage.getItem("dw-creative-v1") || "{}"));
const go = async (p, hash) => { await p.goto(BASE + "#/" + hash); await ready(p); await p.waitForTimeout(400); };
const world = (p) => p.waitForFunction(() => window.__dwCreative && document.querySelector("#cw-stage canvas"), null, { timeout: 15000 });
const write = async (p) => { if (await p.locator("#cw-panel").isHidden()) await p.getByRole("button", { name: "Write" }).click(); };
const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const MEMBER = () => { const k = "dw-expeditions-v1"; if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ plan: "plus" })); };
const frames = async (p, name) => { await p.waitForTimeout(2200); results.frames[name] = await p.evaluate(() => window.__dwCreative?.frames()); check(`${name} draws (SwiftShader median frame, ms)`, results.frames[name]?.n > 15, JSON.stringify(results.frames[name])); };

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const errors = [];
  const watch = (p) => { p.on("pageerror", (e) => errors.push(String(e))); p.on("console", (m) => { if (m.type() === "error" && /THREE|shader|WebGL|TypeError|ReferenceError/i.test(m.text())) errors.push(m.text().slice(0, 160)); }); };

  // =============== a free visitor ===============
  const ctx = await browser.newContext({ ...MOBILE, acceptDownloads: true });
  const page = await ctx.newPage(); watch(page);

  // ---- the three galaxy pages ----
  for (const [g, open, planned, label] of [["spiritual", 4, 1, "Spiritual Exploration"], ["knowledge", 8, 3, "Knowledge"], ["ai", 1, 4, "AI Creation"]]) {
    await go(page, `universe/${g}`);
    const rows = await page.locator(".cw-planets li").allInnerTexts();
    check(`${label}: ${open} open, ${planned} planned`, rows.length === open + planned && rows.filter((t) => /Planned/.test(t)).length === planned, rows.map((t) => t.split("\n")[0]).join(" | "));
    await axe(page, `${label} page`);
    await shot(page, `galaxy-${g}`);
  }
  check("AI planets say plainly they need an AI service", (await page.locator(".cw-planets").innerText()).match(/needs an AI service/g)?.length === 4);
  await go(page, "universe/spiritual");
  check("members' worlds are marked", (await page.locator(".cw-planets li", { hasText: "The Sound Sanctuary" }).innerText()).includes("Members"));
  await page.locator('#tabs [data-tab="universe"]').click();
  await page.locator('#a-inner [data-id="knowledge"]').click();
  await page.getByRole("button", { name: "Enter Knowledge" }).click();
  check("the Universe map opens Knowledge", JSON.stringify(await where(page)) === JSON.stringify(["creative", "#/universe/knowledge"]));

  // ---- the Time Garden (free): write, plant, read, let go ----
  await go(page, "creative/garden"); await world(page);
  check("the garden opens free", (await where(page))[1] === "#/creative/garden");
  await write(page); await page.fill("#cw-jtext", "The light on the kitchen table this morning.");
  await page.getByRole("button", { name: "Plant it" }).click();
  await page.waitForTimeout(1500);
  let s = await store(page);
  check("a moment is kept on this device", s.moments?.length === 1 && /kitchen table/.test(s.moments[0].text));
  check("the count says so", /1 moment growing/.test(await page.locator("#cw-task").innerText()));
  check("the writing folds away so the flower shows", await page.locator("#cw-panel").isHidden() && (await page.getAttribute("button:has-text('Write')", "aria-expanded")) === "false");
  const at = await page.evaluate((id) => window.__dwCreative.screenOf(id), s.moments[0].id);
  check("its flower is in the 3D garden", at?.front, JSON.stringify(at));
  await page.getByRole("button", { name: "Things here" }).click();
  await page.locator("#cw-list button").first().click();
  check("reading a moment opens it", /kitchen table/.test(await page.locator(".cw-card").innerText()));
  await page.locator(".cw-card").getByRole("button", { name: "Let it go" }).click();
  await page.locator(".cw-card").getByRole("button", { name: "Let it go" }).click();
  check("letting it go deletes it", ((await store(page)).moments ?? []).length === 0 && /Nothing planted yet/.test(await page.locator("#cw-task").innerText()));
  // a crisis line: support first, and the words are still kept
  await write(page); await page.fill("#cw-jtext", "I want to end my life");
  await page.getByRole("button", { name: "Plant it" }).click();
  await page.waitForTimeout(400);
  check("words that sound like crisis bring support first", /You matter more than any practice/.test(await page.locator(".cw-card").innerText()) && /findahelpline/.test(await page.locator(".cw-card").innerText()));
  check("and the words are still kept, privately", (await store(page)).moments?.length === 1);
  await page.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Things here" }).click();
  await page.locator("#cw-list button").first().click();
  await page.locator(".cw-card").getByRole("button", { name: "Let it go" }).click();
  await page.locator(".cw-card").getByRole("button", { name: "Let it go" }).click();
  await write(page); await page.fill("#cw-jtext", "Laughing with my sister on the phone.");
  await page.getByRole("button", { name: "Plant it" }).click();
  await page.waitForTimeout(1200);
  await shot(page, "garden");
  await axe(page, "the Time Garden");
  await frames(page, "garden");

  // ---- the Dream Realm (free) ----
  await go(page, "spiritual/dreams"); await world(page);
  await write(page); await page.fill("#cw-jtitle", "The glass staircase");
  await write(page); await page.fill("#cw-jtext", "I was climbing a staircase made of glass above the sea.");
  await page.getByRole("button", { name: "Keep this dream" }).click();
  await page.waitForTimeout(1500);
  s = await store(page);
  check("a dream is kept with its title", s.dreams?.length === 1 && s.dreams[0].title === "The glass staircase");
  check("the realm says it doesn't interpret dreams", /doesn't interpret dreams/.test(await page.locator("#cw-panel").innerText()));
  await shot(page, "dreams");
  await axe(page, "the Dream Realm");
  await frames(page, "dreams");

  // ---- the Temple of Stillness (free) ----
  await go(page, "spiritual/stillness"); await world(page);
  await page.getByRole("radio", { name: "1 minute" }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await page.waitForTimeout(600);
  check("the practice begins with breathing in", /Breathe in/.test(await page.locator("#cw-cue").innerText()));
  check("the choices fold away while you breathe", await page.evaluate(() => [...document.querySelectorAll("#cw-panel .cw-chips")].every((f) => f.hidden)));
  await page.waitForTimeout(4200);
  check("then out", /Breathe out/.test(await page.locator("#cw-cue").innerText()));
  await shot(page, "stillness");
  await page.getByRole("button", { name: "Pause" }).click();
  check("it pauses", /Paused/.test(await page.locator("#cw-cue").innerText()));
  await axe(page, "the Temple of Stillness");
  await frames(page, "stillness");

  // ---- the Cosmic Observatory (free) ----
  await go(page, "knowledge/observatory"); await world(page);
  await page.waitForTimeout(800);
  const sun = await page.evaluate(() => window.__dwCreative.screenOf("sun"));
  await page.touchscreen.tap(sun.x, sun.y); await page.waitForTimeout(400);
  check("tapping the Sun in 3D opens its facts", /The Sun/.test(await page.locator(".cw-card").innerText()) && /8 minutes/.test(await page.locator(".cw-card").innerText()));
  check("facts are marked as a draft awaiting review", /Draft · awaiting a reviewer/i.test(await page.locator(".cw-card").innerText()));
  await page.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Things here" }).click();
  await page.locator("#cw-list button", { hasText: "Earth" }).click();
  check("Earth's year is 365.25 days", /365\.25/.test(await page.locator(".cw-card").innerText()));
  await page.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Pause orbits" }).click();
  check("orbits can be paused", (await page.evaluate(() => window.__dwCreative.api.running)) === false);
  await shot(page, "observatory");
  await axe(page, "the Cosmic Observatory");
  await frames(page, "observatory");

  // ---- members' worlds without membership: the honest gate, even by link ----
  for (const [hash, name] of [["spiritual/sanctuary", "The Sound Sanctuary"], ["knowledge/lab", "The Discovery Lab"], ["creative/architect", "The Dream Architect"]]) {
    await go(page, hash); await page.waitForTimeout(300);
    check(`${name} by link shows the members' gate`, /This world is for members/.test(await page.locator("#cw-page").innerText()) && (await page.locator("#cw-title").innerText()) === name);
  }

  // ---- the Creation Gallery: read, save, delete ----
  await go(page, "ai/gallery");
  const gal = await page.locator("#cw-page").innerText();
  check("the gallery shows the garden and the dream", /Laughing with my sister/.test(gal) && /glass staircase/i.test(gal));
  await axe(page, "the Creation Gallery");
  await shot(page, "gallery");
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 5000 }).catch(() => null), page.getByRole("button", { name: "Save a copy" }).click()]);
  let saved = null; if (dl) { const f = await dl.path(); saved = JSON.parse(fs.readFileSync(f, "utf8")); }
  check("Save a copy gives a file with everything", saved?.worlds?.moments?.length === 1 && saved?.worlds?.dreams?.length === 1);
  await page.locator("#cw-del").click();
  await page.locator(".card").getByRole("button", { name: "Delete all of it" }).click();
  await page.waitForTimeout(300);
  check("Delete all of it empties this device", await page.evaluate(() => localStorage.getItem("dw-creative-v1") === null) && /Nothing here yet/.test(await page.locator("#cw-page").innerText()));

  // ---- no WebGL: the garden in words ----
  await page.evaluate(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a); }; });
  await page.evaluate(() => { location.hash = "#/creative/garden"; });
  await page.waitForTimeout(500);
  await write(page); await page.fill("#cw-jtext", "A walk without my phone.");
  await page.getByRole("button", { name: "Plant it" }).click();
  check("without WebGL the garden still keeps moments", (await store(page)).moments?.length === 1 && await page.evaluate(() => document.getElementById("cw-stage").classList.contains("words")));
  await ctx.close();

  // =============== a member (preview on this device) ===============
  const mctx = await browser.newContext(MOBILE);
  await mctx.addInitScript(MEMBER);
  const m = await mctx.newPage(); watch(m);

  // ---- the Dream Architect ----
  await go(m, "creative/architect"); await world(m);
  for (const n of ["Crystal", "Night", "A lighthouse", "Birds"]) await m.getByRole("radio", { name: n, exact: true }).click();
  check("four choices describe the place", (await m.locator("#cw-task").innerText()) === "A crystal island at night, with a lighthouse and birds.");
  await m.fill("#cw-aname", "Moonharbour");
  await m.getByRole("button", { name: "Keep this place" }).click();
  let ms = await store(m);
  check("the place is kept with its name", ms.places?.length === 1 && ms.places[0].name === "Moonharbour" && ms.places[0].build === "lighthouse");
  await m.getByRole("button", { name: "Design" }).click();
  await m.waitForTimeout(1200);
  const b = await m.evaluate(() => window.__dwCreative.screenOf("build"));
  await m.touchscreen.tap(b.x, b.y); await m.waitForTimeout(300);
  check("tapping the building in 3D lights it", await m.evaluate(() => window.__dwCreative.api.lampOn));
  await shot(m, "architect");
  await m.getByRole("button", { name: "Design" }).click();
  await axe(m, "the Dream Architect");
  await frames(m, "architect");
  await go(m, "ai/gallery");
  await m.locator(".cw-planets button", { hasText: "Moonharbour" }).click();
  await world(m);
  check("a kept place opens again from the gallery", (await m.locator("#cw-task").innerText()).startsWith("A crystal island at night"));

  // ---- the Sound Sanctuary ----
  await go(m, "spiritual/sanctuary"); await world(m);
  await m.getByRole("button", { name: "Things here" }).click();
  await m.locator("#cw-list button").nth(3).click();
  await m.getByRole("button", { name: "Hum" }).click();
  check("the hum switches on", (await m.getAttribute("button:has-text('Hum')", "aria-pressed")) === "true");
  await m.getByRole("button", { name: "Hum" }).click();
  await m.getByRole("button", { name: "Things here" }).click();
  await shot(m, "sanctuary");
  await axe(m, "the Sound Sanctuary");
  await frames(m, "sanctuary");

  // ---- the Inner Cosmos ----
  await go(m, "spiritual/cosmos"); await world(m);
  await m.getByRole("button", { name: "Things here" }).click();
  await m.locator("#cw-list button").nth(2).click();
  check("a star offers an invitation", /Breathe out slowly/.test(await m.locator(".cw-card").innerText()));
  await m.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await m.getByRole("button", { name: "Things here" }).click();
  await shot(m, "cosmos");
  await axe(m, "the Inner Cosmos");
  await frames(m, "cosmos");

  // ---- the Discovery Lab ----
  await go(m, "knowledge/lab"); await world(m);
  await m.getByRole("button", { name: "A circle" }).click();
  await m.waitForTimeout(300);
  check("a moon goes into orbit", (await m.evaluate(() => window.__dwCreative.api.count)) === 1 && /1 moon/.test(await m.locator("#cw-labstat").innerText()));
  await m.getByRole("button", { name: "Too fast" }).click();
  await m.waitForFunction(() => window.__dwCreative.api.count === 1, null, { timeout: 20000 }).catch(() => {});
  check("too fast, and it escapes", (await m.evaluate(() => window.__dwCreative.api.count)) === 1);
  await m.mouse.move(195, 300); await m.mouse.down(); await m.mouse.move(250, 300, { steps: 5 }); await m.mouse.up();
  await m.waitForTimeout(300);
  check("dragging on the sky throws a moon", (await m.evaluate(() => window.__dwCreative.api.count)) === 2);
  await m.waitForTimeout(2500);
  await shot(m, "lab");
  await axe(m, "the Discovery Lab");
  await frames(m, "lab");
  check("no page or shader errors", errors.length === 0, errors.join(" | "));
  await mctx.close();

  // ---- reduced motion ----
  {
    const c = await browser.newContext({ ...MOBILE, reducedMotion: "reduce" });
    const p = await c.newPage();
    await go(p, "knowledge/observatory"); await world(p);
    check("reduced motion: the planets wait to be played", (await p.evaluate(() => window.__dwCreative.api.running)) === false && await p.getByRole("button", { name: "Play orbits" }).isVisible());
    await c.close();
  }

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-realms-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
