// The Knowledge galaxy as a Tree of Life: the map, the Tree lesson, the Cosmic Calendar,
// the Flower of Life, the Five Solids, the Hall of the Seven Principles and Inner Knowing.
// Checks honesty labels (science vs tradition, drafts), the members' gates, writing kept
// with the crisis check, real taps in 3D, axe, and frame times (SwiftShader).
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
const go = async (p, hash) => { await p.goto(BASE + "#/" + hash); await ready(p); await p.waitForTimeout(400); };
const world = (p) => p.waitForFunction(() => window.__dwCreative && document.querySelector("#cw-stage canvas"), null, { timeout: 15000 });
const store = (p) => p.evaluate(() => JSON.parse(localStorage.getItem("dw-creative-v1") || "{}"));
const shot = (p, n, full = false) => p.screenshot({ path: `${OUT}/t-${n}.png`, fullPage: full, timeout: 90000 });
const frames = async (p, name) => { await p.waitForTimeout(2200); results.frames[name] = await p.evaluate(() => window.__dwCreative?.frames()); check(`${name} draws (SwiftShader median frame, ms)`, results.frames[name]?.n > 15, JSON.stringify(results.frames[name])); };
const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const errors = [];
  const watch = (p) => { p.on("pageerror", (e) => errors.push(String(e))); p.on("console", (m) => { if (m.type() === "error" && /THREE|shader|WebGL|TypeError|ReferenceError/i.test(m.text())) errors.push(m.text().slice(0, 160)); }); };

  // ================= a free visitor =================
  const ctx = await browser.newContext(MOBILE);
  const page = await ctx.newPage(); watch(page);

  // ---- the galaxy is drawn as a Tree of Life ----
  await go(page, "universe/knowledge");
  check("the galaxy page shows the Tree of Life map", (await page.locator(".cw-treemap").count()) === 1 && (await page.locator(".cw-treemap .cw-node").count()) === 10);
  check("the tree has its 22 paths", (await page.locator(".cw-treemap line").count()) === 22);
  check("Inner Knowing is at the crown, the Observatory at the root", (await page.locator('.cw-node[data-node="keter"]').innerText()).includes("Inner Knowing") && (await page.locator('.cw-node[data-node="malkuth"]').innerText()).includes("Observatory"));
  const rows = await page.locator(".cw-planets").innerText();
  check("every world says what kind of knowledge it is", /SCIENCE|Science/.test(rows) && /WISDOM TRADITION|Wisdom tradition/.test(rows) && /PRACTICE|Practice/.test(rows));
  check("Go deeper names other authors without copying them", /isn't connected with these authors/.test(await page.locator(".cw-deeper").textContent()) && /The Kybalion/.test(await page.locator(".cw-deeper").textContent()));
  await axe(page, "the Knowledge tree page");
  await shot(page, "galaxy", true);
  await page.locator('.cw-node[data-node="hod"]').click();
  check("a sphere on the map opens its world", (await where(page))[1] === "#/knowledge/calendar");

  // ---- the Cosmic Calendar ----
  check("the calendar is labelled science, and a draft", /Science · Draft, not yet reviewed/i.test(await page.locator("#cw-page .kicker").first().innerText()));
  let ev = await page.locator("#cw-events").innerText();
  check("the year starts with the Big Bang on January 1", /January 1\s+The Big Bang/.test(ev));
  check("the Sun and Earth form at the end of August", /August 31\s+The Sun and Earth form|September 1\s+The Sun and Earth form/.test(ev), ev.match(/\w+ \d+\s+The Sun and Earth form/)?.[0]);
  await page.getByRole("radio", { name: "The last minute" }).click();
  ev = await page.locator("#cw-events").innerText();
  check("in the last minute: farming, writing, now", /Farming begins/.test(ev) && /Writing begins/.test(ev) && /Now/.test(ev) && !/Big Bang/.test(ev));
  check("writing begins about 12 seconds before midnight", /December 31, 23:59:4[6-9]\s+Writing begins/.test(ev), ev.match(/23:59:\d+\s+Writing/)?.[0]);
  await axe(page, "the Cosmic Calendar");
  await shot(page, "calendar");

  // ---- the Tree of Life lesson ----
  await go(page, "knowledge/tree");
  const tree = await page.locator("#cw-page").innerText();
  check("the Tree is introduced with its origin, respectfully", /Kabbalah, a Jewish mystical tradition/.test(tree) && /not as religious instruction/.test(tree));
  check("all ten spheres are listed in words", (await page.locator("#cw-page ol.cw-words li").count()) === 10);
  await page.locator('.cw-node[data-node="tiferet"]').click();
  { const d = await page.locator("#cw-sdetail").textContent(); check("a sphere explains itself", /Harmony and balance at the heart/.test(d) && /Hall of the Seven Principles/.test(d), d.slice(0, 80)); }
  await axe(page, "the Tree of Life lesson");

  // ---- the Flower of Life (free) ----
  await go(page, "knowledge/flower"); await world(page);
  check("the flower starts with one circle", /Step 1 of 5: One circle/.test(await page.locator("#cw-task").innerText()));
  await page.waitForTimeout(800);
  const box = await page.locator("#cw-stage canvas").boundingBox();
  await page.touchscreen.tap(box.width / 2, box.height * 0.3); await page.waitForTimeout(400);
  check("tapping the flower in 3D grows it", /Step 2 of 5: The Seed of Life/.test(await page.locator("#cw-task").innerText()) && (await page.evaluate(() => window.__dwCreative.api.at)) === 1);
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Grow" }).click();
  check("it grows to Metatron's Cube, and says what can be traced exactly", /Metatron's Cube/.test(await page.locator("#cw-panel").innerText()) && /only roughly/.test(await page.locator("#cw-panel").innerText()));
  check("the flower is labelled a wisdom tradition and a draft", /Wisdom tradition · Draft, not yet reviewed/.test(await page.locator("#cw-panel").innerText()));
  await page.waitForTimeout(1000);
  await shot(page, "flower");
  await axe(page, "the Flower of Life");
  await frames(page, "flower");

  // ---- Inner Knowing (free; writing) ----
  await go(page, "knowledge/knowing"); await world(page);
  await page.getByRole("button", { name: "I'm settled" }).click();
  await page.fill("#cw-kq", "Should I take the new role?");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Open" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.fill("#cw-kn", "My chest felt lighter when I read it.");
  await page.getByRole("button", { name: "Keep this" }).click();
  let s = await store(page);
  check("an inner knowing note is kept on this device", s.knowing?.length === 1 && s.knowing[0].felt === "Open" && /new role/.test(s.knowing[0].question));
  check("then it asks you to let it rest", /Let it rest/.test(await page.locator("#cw-task").innerText()));
  check("it reminds you to pair inner knowing with facts and people", /get proper advice too/.test(await page.locator("#cw-panel").innerText()));
  await page.getByRole("button", { name: "Begin again" }).click();
  await page.getByRole("button", { name: "I'm settled" }).click();
  await page.fill("#cw-kq", "I want to kill myself");
  await page.getByRole("button", { name: "Next" }).click();
  check("a crisis line in a question brings support first", /You matter more than any practice/.test(await page.locator(".cw-card").innerText()));
  await page.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await shot(page, "knowing");
  await axe(page, "Inner Knowing");
  await frames(page, "knowing");
  await go(page, "ai/gallery");
  check("the note appears in the Creation Gallery", /Should I take the new role/.test(await page.locator("#cw-page").innerText()));

  // ---- members' worlds by link ----
  for (const [hash, name] of [["knowledge/hall", "The Hall of the Seven Principles"], ["knowledge/solids", "The Five Solids"]]) {
    await go(page, hash); await page.waitForTimeout(300);
    check(`${name} shows the members' gate`, /This world is for members/.test(await page.locator("#cw-page").innerText()));
  }
  await ctx.close();

  // ================= a member =================
  const mctx = await browser.newContext(MOBILE);
  await mctx.addInitScript(() => { const k = "dw-expeditions-v1"; if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ plan: "plus" })); });
  const m = await mctx.newPage(); watch(m);

  // ---- the Hall of the Seven Principles ----
  await go(m, "knowledge/hall"); await world(m);
  await m.waitForTimeout(900);
  let tapped = null;
  for (let i = 0; i < 7 && tapped === null; i++) { const at = await m.evaluate((id) => window.__dwCreative.screenOf(id), `p-${i}`); if (at?.front && at.x > 30 && at.x < 360 && at.y > 200 && at.y < 760) { await m.touchscreen.tap(at.x, at.y); tapped = i; } }
  await m.waitForTimeout(400);
  check("tapping a pillar in 3D opens its principle", tapped !== null && /Principle \d of 7/i.test(await m.locator(".cw-card").innerText()), `pillar ${tapped}`);
  await m.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await m.getByRole("button", { name: "Things here" }).click();
  await m.locator("#cw-list button").first().click();
  const card = await m.locator(".cw-card").innerText();
  check("Mentalism quotes The Kybalion exactly, with its source", /THE ALL is MIND; The Universe is Mental\./.test(card) && /The Kybalion, 1908/.test(card));
  check("each principle has a practice and an honest note", /Try it/.test(card) && /Honestly: A philosophical teaching, not a scientific finding/.test(card));
  for (let i = 0; i < 6; i++) await m.locator(".cw-card").getByRole("button", { name: /^Next:/ }).click();
  check("the seventh is Gender, explained as active and receptive in everyone", /Gender/.test(await m.locator(".cw-card").innerText()) && /whatever their gender/.test(await m.locator(".cw-card").innerText()));
  check("all seven read, kept on this device", ((await store(m)).principles ?? []).length === 7 && /7 of 7 read/.test(await m.locator("#cw-task").innerText()));
  await m.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await m.getByRole("button", { name: "About" }).click();
  check("About says where the principles really come from", /New Thought movement/.test(await m.locator(".cw-card").innerText()) && /not as facts/.test(await m.locator(".cw-card").innerText()));
  await m.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await shot(m, "hall");
  await axe(m, "the Hall of the Seven Principles");
  await frames(m, "hall");

  // ---- the Five Solids ----
  await go(m, "knowledge/solids"); await world(m);
  await m.waitForTimeout(900);
  const st = await m.evaluate(() => window.__dwCreative.screenOf("star"));
  await m.touchscreen.tap(st.x, st.y); await m.waitForTimeout(400);
  check("tapping the star in 3D explains it, belief kept apart from geometry", /stella octangula/.test(await m.locator(".cw-card").innerText()) && /a belief, not geometry/.test(await m.locator(".cw-card").innerText()));
  await m.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await m.getByRole("button", { name: "Things here" }).click();
  await m.locator("#cw-list button", { hasText: "The tetrahedron" }).click();
  check("the tetrahedron: counts, Plato's fire, and real chemistry", /4 triangle faces, 4 corners, 6 edges/.test(await m.locator(".cw-card").innerText()) && /methane/.test(await m.locator(".cw-card").innerText()));
  await m.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await m.getByRole("button", { name: "About" }).click();
  check("About tells Kepler's beautiful wrong idea", /Kepler/.test(await m.locator(".cw-card").innerText()) && /letting evidence win/.test(await m.locator(".cw-card").innerText()));
  await m.locator(".cw-card").getByRole("button", { name: "Close" }).click();
  await shot(m, "solids");
  await axe(m, "the Five Solids");
  await frames(m, "solids");
  check("no page or shader errors", errors.length === 0, errors.join(" | "));
  await mctx.close();

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-tree-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
