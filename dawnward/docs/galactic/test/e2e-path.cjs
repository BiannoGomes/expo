// The path through the galaxies, as a brand-new person on a phone, using only real practices:
// every galaxy visible; locked ones say what opens them and how far along you are; deep links can't skip;
// one practice opens Knowledge, two open Spiritual, three in two worlds open Creative, a Future practice and
// a direction open the Gateway, something made opens AI Creation. Unlocks persist, happen once, are
// celebrated once, survive a reload, migrate quietly for people who were already here, and Delete resets them.
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
const go = async (p, hash, wait = 700) => { await p.goto("about:blank"); await p.goto(BASE + "#/" + hash); await ready(p); await p.waitForTimeout(wait); };
const shot = (p, n) => p.screenshot({ path: `${OUT}/p-${n}.png`, timeout: 90000 }).catch(() => {});
const kept = (p) => p.evaluate(() => JSON.parse(localStorage.getItem("dw-progress-v1") || "null"));
const noSideways = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const cont = (p) => p.getByRole("button", { name: "Continue", exact: true }).click();
async function guided(p, w, action) {
  await go(p, `world/${w}/overview`, 1000);
  await p.locator("#w-body .w-next").click();
  await p.waitForSelector("#x-body .s-title");
  await p.getByRole("button", { name: "Begin" }).click();
  await p.fill("#q-words", "Something true."); await cont(p);
  await p.fill("#q-words", "Something else true."); await cont(p);
  await p.fill("#q-action", action); await p.fill("#q-when", "This week"); await cont(p);
  await p.waitForFunction(() => /Done/.test(document.querySelector("#x-body .s-title")?.textContent ?? ""), null, { timeout: 15000 });
}
async function atlasList(p) {
  await go(p, "home");
  await p.locator('#tabs [data-tab="universe"]').click(); await p.waitForTimeout(500);
  await p.locator('#a-views [data-v="list"]').click();
  return p.locator("#a-list").innerText();
}

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e)));

  // ----- a new person: everything visible, the right things locked -----
  let list = await atlasList(page);
  check("the path lists every galaxy, in the order they open", ["Personal Growth", "Earth Realm", "Knowledge", "Spiritual Exploration", "Creative Worlds", "AI Creation", "Quantum Gateway"].every((t) => list.includes(t)) && list.indexOf("Knowledge") < list.indexOf("Spiritual Exploration") && list.indexOf("Creative Worlds") < list.indexOf("AI Creation"));
  check("Personal Growth and Earth are open from the start", /Personal Growth[\s\S]*?Open/.test(list) && /Earth Realm[\s\S]*?Open/.test(list));
  check("Knowledge says exactly what opens it, and where you stand", /Finish one expedition in Personal Growth\.[\s\S]*?Locked · 0 of 1/.test(list));
  check("five galaxies are locked on the map, and say so", (await page.locator("#a-inner .gx.locked").count()) === 5 && /Locked\. Finish one expedition/.test(await page.locator('#a-inner [data-id="knowledge"]').getAttribute("aria-label")));
  check("no sideways scroll on the path", await noSideways(page));
  check("the path card says where you stand: 0 of 5", /0 of 5 galaxies opened/.test(await page.locator("#a-landing").innerText()));
  await go(page, "journey/milestones");
  check("a new person isn't shown a Becoming image they haven't earned", (await page.locator("#m-miles .becoming").count()) === 0);
  await go(page, "universe"); await page.locator('#a-views [data-v="list"]').click();
  await shot(page, "1-list");
  await axe(page, "the path list");
  await page.locator('#a-views [data-v="map"]').click();
  await page.locator('#a-inner [data-id="knowledge"]').click();
  const panel = page.locator("#a-panel");
  check("a locked galaxy shows its progress, with no Enter button", (await panel.locator('[role="progressbar"][aria-valuenow="0"][aria-valuemax="1"]').count()) === 1 && (await panel.getByRole("button", { name: "Enter Knowledge" }).count()) === 0);
  await shot(page, "2-locked-panel");
  await axe(page, "a locked galaxy");
  await panel.getByRole("button", { name: "Find a practice" }).click(); await page.waitForTimeout(500);
  check("its button leads somewhere real: Learn", (await page.evaluate(() => window.__dwHome.state.place)) === "explore");

  // ----- deep links can't skip the path -----
  for (const [hash, name] of [["knowledge/tree", "Knowledge"], ["creative/kingdom", "Creative Worlds"], ["creative/door", "Creative Worlds"], ["universe/spiritual", "Spiritual Exploration"], ["universe/ai", "AI Creation"]]) {
    await go(page, hash);
    const t = await page.locator("#cw-page").innerText().catch(() => "");
    check(`#/${hash} shows the locked ${name}, not its worlds`, /Opens when you/.test(t) && !(await page.locator("#cw-stage canvas").count()) && !(await page.locator(".cw-treemap").count()), t.slice(0, 80).replace(/\n/g, " / "));
  }
  await go(page, "world/future/overview", 1000);
  check("Future offers its own practice first, not the locked Gateway", /The Horizon of Possibility/.test(await page.locator("#w-body .w-next").innerText()));
  await go(page, "learn");
  const gw = page.locator('#x-body button.mission[aria-label*="Quantum Gateway"]').first();
  check("Learn shows the Gateway as opening later, with why", (await gw.count()) === 1 && /Opens later/.test(await gw.innerText()) && /Opens when you: Finish a practice in Future/.test(await gw.getAttribute("aria-label")));
  await gw.click(); await page.waitForTimeout(600);
  check("playing it shows what opens it instead", /Opens when you/.test(await page.locator("#x-body").innerText()) && (await page.locator("#q-words, #q-action").count()) === 0);

  // ----- one practice opens Knowledge -----
  await guided(page, "body", "Phone in the kitchen at eleven");
  await go(page, "home");
  const card = page.locator("#e-body .card.unlocked");
  check("Home says Knowledge is open, once, quietly", (await card.count()) === 1 && /Knowledge is open/.test(await card.evaluate((e) => e.textContent)) && (await page.locator("#e-body .primary").count()) <= 1);
  await shot(page, "3-unlocked");
  await axe(page, "the unlock card");
  const k1 = await kept(page);
  check("the opening is kept, with when", typeof k1?.unlocked?.knowledge === "string" && k1.celebrated?.knowledge === true);
  await card.getByRole("button", { name: "Go there" }).click(); await page.waitForTimeout(800);
  check("Go there opens Knowledge itself", (await page.evaluate(() => location.hash)) === "#/universe/knowledge" && !/Opens when you/.test(await page.locator("#cw-page").innerText()));
  await page.reload(); await ready(page); await page.waitForTimeout(500);
  await go(page, "home");
  check("after a reload it's still open, and the card doesn't repeat", (await page.locator("#e-body .card.unlocked").count()) === 0 && !/Opens when you/.test(await (async () => { await go(page, "knowledge/tree"); return page.locator("#cw-page").innerText(); })()));
  await go(page, "journey/milestones");
  check("after a first practice, Journey shows Kindled", /Kindled/.test(await page.locator("#m-miles .becoming").innerText().catch(() => "")));
  const k2 = await kept(page);
  check("idempotent: opening again changes nothing", k2.unlocked.knowledge === k1.unlocked.knowledge && Object.keys(k2.unlocked).length === 1);

  // ----- two practices open Spiritual; three in two worlds open Creative -----
  list = await atlasList(page);
  check("Spiritual counts real progress: 1 of 2", /Finish two different practices\.[\s\S]*?Locked · 1 of 2/.test(list));
  await guided(page, "spirit", "Ten minutes on the bench");
  await go(page, "home");
  check("the second practice opens Spiritual Exploration", /Spiritual Exploration is open/.test(await page.locator("#e-body").evaluate((e) => e.textContent)));
  await guided(page, "future", "Email the course");
  await go(page, "home");
  check("the third, in a third world, opens Creative Worlds", /Creative Worlds is open/.test(await page.locator("#e-body").evaluate((e) => e.textContent)));
  list = await atlasList(page);
  check("the Gateway needs both: 1 of 2 (Future done, no direction yet)", /Finish a practice in Future, and set your direction on Home\.[\s\S]*?Locked · 1 of 2/.test(list));
  await go(page, "home");
  await page.getByRole("button", { name: "Set a direction" }).click();
  await page.fill("#dir-text", "More time outside.");
  await page.locator("dialog.sheetdlg").getByRole("button", { name: "Save", exact: true }).click(); await page.waitForTimeout(500);
  check("setting a direction opens the Quantum Gateway", /Quantum Gateway is open/.test(await page.locator("#e-body").evaluate((e) => e.textContent)));

  // ----- making something opens AI Creation -----
  list = await atlasList(page);
  check("AI Creation: make something, 0 of 1", /Make something in Creative Worlds and keep it[\s\S]*?Locked · 0 of 1/.test(list));
  await go(page, "creative/garden");
  await page.waitForFunction(() => window.__dwCreative && document.querySelector("#cw-stage canvas"), null, { timeout: 15000 });
  if (await page.locator("#cw-panel").isHidden()) await page.getByRole("button", { name: "Write" }).click();
  await page.fill("#cw-jtext", "The light on the kitchen table.");
  await page.getByRole("button", { name: "Plant it" }).click(); await page.waitForTimeout(1200);
  await go(page, "home");
  check("a moment kept in the Time Garden opens AI Creation", /AI Creation is open/.test(await page.locator("#e-body").evaluate((e) => e.textContent)));
  list = await atlasList(page);
  check("now nothing is locked", !/Locked/.test(list) && (await page.locator("#a-inner .gx.locked").count()) === 0);
  check("and the path card says every galaxy is open", /Every galaxy is open/.test(await page.locator("#a-landing").innerText()));
  await go(page, "journey/milestones");
  check("with every galaxy open, Becoming is Whole", /Whole/.test(await page.locator("#m-miles .becoming").innerText()));

  // ----- Back closes a sheet -----
  await go(page, "home");
  await page.getByRole("button", { name: /Your direction|Set a direction/ }).first().click();
  await page.waitForSelector("dialog.sheetdlg[open]");
  await page.goBack(); await page.waitForTimeout(600);
  check("Back with a sheet open closes the sheet", (await page.locator("dialog.sheetdlg[open]").count()) === 0);

  // ----- Delete everything resets the path -----
  await go(page, "you");
  await page.locator("#y-delete").click();
  await page.getByRole("button", { name: "Delete everything", exact: true }).click(); await page.waitForTimeout(800);
  await go(page, "knowledge/tree");
  check("after Delete everything, Knowledge is locked again", /Opens when you/.test(await page.locator("#cw-page").innerText()) && !(await kept(page))?.unlocked?.knowledge);

  // ----- someone who was already here: what they used stays open, quietly -----
  const c2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await c2.addInitScript(() => { if (location.protocol === "about:") return; if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1");
    localStorage.setItem("dw-local-v1", JSON.stringify({ stars: [{ id: "m-1", world: "mind", date: "2026-10-30", excerpt: "An old evening." }], themes: [] }));
    localStorage.setItem("dw-creative-v1", JSON.stringify({ dreams: [{ id: "d1", text: "Flying.", at: "2026-10-30" }], principles: ["mentalism"] })); } });
  const p2 = await c2.newPage(); p2.on("pageerror", (e) => errors.push(String(e)));
  await go(p2, "home");
  const k3 = await kept(p2);
  check("an existing explorer keeps Knowledge and Spiritual (they'd used them)", !!k3?.unlocked?.knowledge && !!k3?.unlocked?.spiritual && !k3?.unlocked?.creative);
  check("and isn't greeted with unlock cards for them", (await p2.locator("#e-body .card.unlocked").count()) === 0);
  await go(p2, "universe/spiritual");
  check("their galaxy opens normally", !/Opens when you/.test(await p2.locator("#cw-page").innerText()));

  // ----- reduced motion: the ring doesn't move -----
  const c3 = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const p3 = await c3.newPage();
  await c3.addInitScript(() => { if (location.protocol === "about:") return; if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1");
    localStorage.setItem("dw-progress-v1", JSON.stringify({ unlocked: { knowledge: "2026-11-01" }, celebrated: {} })); } });
  await go(p3, "home");
  // the unlock is a quiet line now (user council): with reduced motion it's there, and nothing in it moves
  check("with reduced motion the unlock line is there, and nothing in it moves", (await p3.locator("#e-body .card.unlocked").count()) === 1 && await p3.locator("#e-body .card.unlocked").evaluate((c) => [c, ...c.querySelectorAll("*")].every((e) => getComputedStyle(e).animationName === "none")));

  // ----- small phone -----
  await page.setViewportSize({ width: 320, height: 640 });
  await atlasList(page);
  check("at 320 px the path fits without sideways scroll", await noSideways(page));
  const c4 = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
  const p4 = await c4.newPage();
  await go(p4, "universe", 1200);
  const off = await p4.evaluate(() => { const f = document.getElementById("a-field").getBoundingClientRect();
    return [...document.querySelectorAll("#a-inner .gx")].filter((g) => { const r = g.getBoundingClientRect(); return r.top < f.top - 1 || r.bottom > f.bottom + 1 || r.left < f.left - 1 || r.right > f.right + 1; }).map((g) => g.dataset.id); });
  check("a new person on a 320 × 568 phone sees every galaxy, locks and all, fully on the map", off.length === 0, off.join(", "));
  check("no page errors", errors.length === 0, errors.join(" | "));

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-path-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
