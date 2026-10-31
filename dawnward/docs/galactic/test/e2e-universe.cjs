// The Infinite Universe vertical slice, end to end in the browser.
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
// Universe Atlas → Personal Growth → Mind → The Thought Labyrinth (lenses) →
// reflection → discovery → Return to Earth; plus list view, keyboard, breadcrumbs,
// closed galaxies saying so, reduced motion, reload, and no overlaps in the Atlas.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const AXE = fs.readFileSync(path.join(__dirname, "../../../experience/node_modules/axe-core/axe.min.js"), "utf8");
const PAGE = process.env.DW_URL || "http://localhost:8771/home.html";
const OUT = path.join(__dirname, "shots");
const results = { when: new Date().toISOString(), checks: [], axe: {}, timings: {} };
const check = (name, ok, detail = "") => { results.checks.push({ name, ok: Boolean(ok), detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };
async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}×${v.nodes.length}`));
  results.axe[label] = r;
  check(`axe: ${label}`, r.length === 0, r.join(", "));
}
const place = (p) => p.evaluate(() => window.__dwHome.state.place);
const ready = (p) => p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

  // ---- the Atlas at every size: galaxies never overlap, nothing scrolls sideways at page level ----
  for (const [name, w, h] of [["320x568", 320, 568], ["360x800", 360, 800], ["390x844", 390, 844], ["430x932", 430, 932], ["tablet", 820, 1180], ["desktop", 1440, 900]]) {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.goto(PAGE); await ready(p);
    await p.evaluate(() => document.getElementById("skip").click());
    await p.locator('#tabs [data-tab="universe"]').click();
    await p.waitForTimeout(400);
    const o = await p.evaluate(() => {
      const fr = document.getElementById("a-field").getBoundingClientRect();
      const rs = [...document.querySelectorAll("#a-inner .gx")].map((b) => ({ id: b.dataset.id, r: b.querySelector(".gx-name").getBoundingClientRect(), a: (b.querySelector("img,.gx-earth,.gx-gate")).getBoundingClientRect() }));
      const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const out = [];
      for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) if (hit(rs[i].r, rs[j].r) || hit(rs[i].a, rs[j].r) || hit(rs[i].r, rs[j].a)) out.push(`${rs[i].id}×${rs[j].id}`);
      const off = rs.filter((x) => x.r.left < fr.left - 1 || x.r.right > fr.right + 1 || x.a.top < fr.top - 1 || x.r.bottom > fr.bottom + 1).map((x) => x.id);
      return { out, off, page: document.documentElement.scrollWidth > innerWidth };
    });
    check(`${name}: Atlas galaxies and names never overlap`, o.out.length === 0, o.out.join(", "));
    check(`${name}: every galaxy and name is fully on screen`, o.off.length === 0, o.off.join(", "));
    check(`${name}: no sideways page scroll`, !o.page);
    await p.screenshot({ path: `${OUT}/u-${name}-atlas.png`, timeout: 90000 });
    await p.close();
  }

  for (const [name, vp, mobile] of [["phone", { width: 390, height: 844 }, true], ["desktop", { width: 1440, height: 900 }, false]]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(PAGE); await ready(page);

    // everyone opens on Home: the Daily Compass, with its reason and a way out
    await page.evaluate(() => document.getElementById("skip").click());
    await page.waitForTimeout(500);
    check(`${name}: Dawnward opens on Home`, (await place(page)) === "earth" && (await page.locator('#tabs [data-tab="home"][aria-current="page"]').count()) === 1);
    const comp = await page.textContent("#earth .compass");
    check(`${name}: the Compass offers a first expedition`, /Your daily compass/i.test(comp) && /Beyond Overthinking/.test(comp) && /Begin expedition · 8 min/.test(comp));
    await page.locator("#earth .c-why summary").click();
    check(`${name}: the Compass says why`, /short first expedition/.test(await page.textContent("#earth .c-why")) && /Nothing is read from your reflections/.test(await page.textContent("#earth .c-why")));
    check(`${name}: the first action is visible without scrolling`, await page.evaluate(() => { const b = document.querySelector("#earth .compass .primary").getBoundingClientRect(); return b.bottom <= innerHeight - 64 || innerWidth >= 1000; }));
    await page.getByRole("button", { name: "Not today" }).click();
    check(`${name}: "Not today" sets the suggestion aside`, /No suggestion today/.test(await page.textContent("#earth")));
    await page.getByRole("button", { name: "Show it" }).click();
    check(`${name}: and it comes back on request`, (await page.locator("#earth .compass .primary").count()) === 1);
    check(`${name}: five worlds on Home, each a button`, (await page.locator("#earth .wplanets button").count()) === 5);
    await axe(page, `${name} home`);
    await page.screenshot({ path: `${OUT}/u-${name}-home.png`, timeout: 90000 });
    await page.locator('#tabs [data-tab="universe"]').click();
    check(`${name}: the Universe tab opens the Atlas`, (await place(page)) === "atlas" && (await page.locator('#tabs [data-tab="universe"][aria-current="page"]').count()) === 1);
    check(`${name}: seven destinations, each a real button`, (await page.locator("#a-inner .gx").count()) === 7);
    await axe(page, `${name} atlas`);

    // every galaxy is also in a plain list
    await page.locator('#a-views [data-v="list"]').click();
    check(`${name}: list view has every destination`, (await page.locator("#a-list .row").count()) === 7);
    await page.locator('#a-views [data-v="map"]').click();

    // a closed galaxy says so, and has no way in
    await page.locator('#a-inner [data-id="ai"]').click();
    const ai = await page.textContent("#a-panel");
    check(`${name}: an unopened galaxy says so plainly`, /Not open yet/.test(ai) && /Planned/.test(ai) && !(await page.locator("#a-panel .primary").count()));
    await page.getByRole("button", { name: "Back to the Universe" }).click();

    // keyboard: select Personal Growth with Enter, move toward it, enter
    await page.locator('#a-inner [data-id="growth"]').focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
    check(`${name}: selecting moves toward the galaxy`, /scale/.test(await page.evaluate(() => document.getElementById("a-inner").style.transform)));
    await page.screenshot({ path: `${OUT}/u-${name}-selected.png`, timeout: 90000 });
    await page.getByRole("button", { name: "Enter Personal Growth" }).click();
    await page.waitForTimeout(500);
    check(`${name}: Personal Growth opens the five worlds`, (await place(page)) === "home" && (await page.locator("#planets .planet").count()) === 5);
    check(`${name}: no repeated Explore buttons; each world shows its name`, (await page.locator("#planets .planet", { hasText: "Explore" }).count()) === 0 && /Mind/.test(await page.textContent("#planets .planet-mind")));

    // Mind: its own way of playing, its solar system, the breadcrumb
    await page.locator("#planets .planet-mind").evaluate((b) => b.click());
    // polled on a timer, not on animation frames: a stalled render loop must not hide whether the world opened
    const arrived = await page.waitForFunction(() => document.body.classList.contains("closeup-on"), null, { timeout: 15000, polling: 100 }).then(() => true, () => false);
    if (!arrived) console.log("DIAG", JSON.stringify(await page.evaluate(() => ({ place: window.__dwHome.state.place, world: window.__dwHome.state.world, scene: window.__dwHome.scene, cls: document.body.className, frames: window.__dwFrames.length, last: window.__dwFrames.slice(-6).map(Math.round), mode: window.__dwHome.state.mode }))));
    check(`${name}: entering Mind arrives`, arrived);
    results.timings[`${name}.arrival_fallbacks`] = await page.evaluate(() => window.__dwArrivalFallbacks ?? 0);
    results.timings[`${name}.webgl_context_lost`] = await page.evaluate(() => window.__dwContextLost ?? 0);
    const crumbText = await page.textContent("#w-crumbs");
    check(`${name}: breadcrumb reads Universe › Personal Growth › Mind`, /Universe.*Personal Growth.*Mind/.test(crumbText));
    const world = await page.textContent("#w-body");
    check(`${name}: Mind shows its mechanic and the Thought Patterns system`, /Lenses/.test(world) && /Thought Patterns/.test(world) && /The Thought Labyrinth/.test(world));
    await page.screenshot({ path: `${OUT}/u-${name}-mind.png`, timeout: 90000 });
    await axe(page, `${name} mind world`);

    // the mission
    const t0 = Date.now();
    await page.getByRole("button", { name: /The Thought Labyrinth/ }).click();
    await page.waitForSelector("#x-body .s-title");
    check(`${name}: the mission keeps the trail back to Mind`, /Mind/.test(await page.textContent(".qhead")) && (await page.locator(".qhead .back").textContent()).includes("Mind"));
    await page.getByRole("button", { name: "Begin" }).click();
    results.timings[`${name}.to_first_step_ms`] = Date.now() - t0;
    // lenses: rate each reading
    const groups = page.locator(".lens-scale");
    check(`${name}: three readings to weigh`, (await groups.count()) === 3);
    check(`${name}: Continue waits until every reading is rated`, await page.getByRole("button", { name: "Continue" }).isDisabled());
    await groups.nth(0).getByRole("radio", { name: "Partly" }).click();
    await groups.nth(1).getByRole("radio", { name: "Fits well" }).click();
    await groups.nth(2).getByRole("radio", { name: "Fits well" }).click();
    check(`${name}: the lesson appears once all are rated`, /You know one thing for certain/.test(await page.textContent(".explain")));
    await page.screenshot({ path: `${OUT}/u-${name}-lens.png`, timeout: 90000 });
    await axe(page, `${name} lens step`);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.fill("#q-words", "My manager moved our one-to-one without saying why.");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.fill("#q-words", "Maybe something came up for her, nothing to do with me.");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.getByRole("button", { name: "Not this time" }).click();
    await page.waitForSelector("text=Discovered");
    const close = await page.textContent("#x-body");
    check(`${name}: discovery reward: a star for The Thought Labyrinth`, /A star: The Thought Labyrinth/.test(close));
    await page.getByRole("button", { name: "Return to Earth" }).first().click();
    await page.waitForTimeout(400);

    // Earth
    check(`${name}: Return to Earth lands on Home`, (await place(page)) === "earth");
    const earth = await page.textContent("#earth");
    check(`${name}: Home shows what was just discovered`, /Just discovered/.test(earth) && /The Thought Labyrinth/.test(earth));
    check(`${name}: the Compass moves on to an expedition not yet done`, /Beyond Overthinking/.test(await page.textContent("#earth .compass")));
    check(`${name}: Home has no urgency, streaks or scores`, !/streak|score|\bxp\b|hurry|don't miss|last chance/i.test(earth));
    await page.screenshot({ path: `${OUT}/u-${name}-earth.png`, timeout: 90000 });
    await axe(page, `${name} earth`);
    await page.locator('#tabs [data-tab="journey"]').click();
    await page.locator('#m-views [data-v="miles"]').click();
    const miles = await page.textContent("#m-miles");
    check(`${name}: Journey lists the star and the moon`, /The Thought Labyrinth/.test(miles) && /moon over Thought Patterns/i.test(miles));
    await page.locator('#tabs [data-tab="home"]').click();
    await page.locator("#earth").getByRole("button", { name: "Begin reflection" }).click();
    check(`${name}: reflecting is one tap from Earth`, await page.waitForSelector("#words", { timeout: 10000 }).then(() => true, () => false));

    // breadcrumbs go back up
    await page.locator("#w-crumbs button", { hasText: "Universe" }).click();
    check(`${name}: the Universe crumb returns to the Atlas`, (await place(page)) === "atlas");

    // progress survives a reload
    await page.reload(); await ready(page);
    await page.locator('#tabs [data-tab="journey"]').click();
    await page.locator('#m-views [data-v="miles"]').click();
    check(`${name}: after reload Journey still lists the discoveries`, /The Thought Labyrinth/.test(await page.textContent("#m-miles")));
    check(`${name}: no page errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
    await ctx.close();
  }

  // regression: a resize during the flight into a world (rotation, a phone's address bar)
  // used to drop the arrival, leaving the world without its close-up
  {
    const p = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await p.goto(PAGE); await ready(p);
    await p.evaluate(() => document.getElementById("skip")?.click());
    await p.locator('#tabs [data-tab="universe"]').click(); await p.locator('#a-inner [data-id="growth"]').click();
    await p.getByRole("button", { name: "Enter Personal Growth" }).click(); await p.waitForTimeout(1500);
    await p.locator("#planets .planet-mind").evaluate((b) => b.click());
    await p.setViewportSize({ width: 1180, height: 820 });
    check("a resize mid-flight still arrives in the world", await p.waitForFunction(() => document.body.classList.contains("closeup-on"), null, { timeout: 15000 }).then(() => true, () => false));
    await p.close();
  }

  // reduced motion: no move toward the galaxy, still fully usable
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(PAGE); await ready(p);
    check("reduced motion: opens on Home without an entrance", (await place(p)) === "earth" && await p.evaluate(() => document.getElementById("entrance").hidden));
    await p.locator('#tabs [data-tab="universe"]').click();
    check("reduced motion: no animated transition in the Atlas", (await p.evaluate(() => getComputedStyle(document.getElementById("a-inner")).transitionDuration)) === "0s");
    await p.locator('#a-inner [data-id="growth"]').click();
    await p.getByRole("button", { name: "Enter Personal Growth" }).click();
    check("reduced motion: Personal Growth opens", (await place(p)) === "home");
    await ctx.close();
  }

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-universe-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
