// Galaxy Home end to end, on the built page, with no invented data.
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
// Galaxy → Mind → reflect (draft survives navigation) → keep (verified, survives
// reload) → a second evening → possible connection → link → Memories (galaxy,
// filter, search, list, detail) → You (pattern review, delete everything) →
// text view; plus the blocked microphone, reduced motion, token safety, and
// "nothing overlaps" at every viewport the directive names.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const AXE = fs.readFileSync(path.join(__dirname, "../../../experience/node_modules/axe-core/axe.min.js"), "utf8");
const PAGE = process.env.DW_URL || "http://localhost:8771/home.html";
const OUT = path.join(__dirname, "shots");
const results = { when: new Date().toISOString(), url: PAGE, checks: [], axe: {}, timings: {} };
const check = (name, ok, detail = "") => { results.checks.push({ name, ok: Boolean(ok), detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };
const GPU = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];

async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] });
    return res.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) }));
  });
  results.axe[label] = r;
  check(`axe: ${label}`, r.length === 0, r.map((v) => `${v.id}×${v.n}`).join(", "));
}
// Everything a person can see or press on the home, pairwise: nothing may overlap.
const overlaps = (page) => page.evaluate(() => {
  const items = [];
  const add = (el, label) => { if (!el) return; const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") return; const r = el.getBoundingClientRect(); if (r.width && r.height) items.push({ label, r }); };
  document.querySelectorAll("#planets .planet").forEach((b) => add(b, `explore:${b.dataset.world}`));
  document.querySelectorAll(".arc").forEach((a) => { const w = a.classList[1].replace("arc-", ""); add(a.querySelector(".aname"), `name:${w}`); add(a.querySelector(".awords"), `words:${w}`); });
  ["brand", "search", "notice", "home-ui", "tabs"].forEach((id) => add(document.getElementById(id), id));
  const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
  const out = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const A = items[i], B = items[j], wa = A.label.split(":")[1], wb = B.label.split(":")[1];
    if (wa && wa === wb) continue; // a world's own name, words and button
    if (hit(A.r, B.r)) out.push(`${A.label}×${B.label}`);
  }
  const offscreen = items.filter(({ r }) => r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1).map((i) => i.label);
  return { out, offscreen, hOverflow: document.documentElement.scrollWidth > innerWidth };
});
const ready = (page) => page.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
const arrive = (page) => page.waitForFunction(() => document.body.classList.contains("closeup-on"), null, { timeout: 15000 });
const stars = (page) => page.evaluate(() => window.__dwHome.data.stars.length);
const kept = (page) => page.evaluate(() => { try { return JSON.parse(localStorage.getItem("dw-local-v1") || "{}").stars?.length ?? 0; } catch { return -1; } });

(async () => {
  const browser = await chromium.launch({ args: GPU });

  // ---- every viewport: nothing overlaps, nothing runs off the screen ----
  for (const [name, w, h, mobile] of [["320x568", 320, 568, true], ["360x800", 360, 800, true], ["390x844", 390, 844, true], ["430x932", 430, 932, true], ["tablet-portrait", 820, 1180, true], ["tablet-landscape", 1180, 820, true], ["desktop", 1440, 900, false]]) {
    const p = await browser.newPage({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
    await p.addInitScript(() => localStorage.setItem("dw-home-seen", "1"));
    await p.goto(PAGE); await ready(p); await p.waitForTimeout(1500);
    const o = await overlaps(p);
    check(`${name}: nothing overlaps`, o.out.length === 0, o.out.join(", "));
    check(`${name}: nothing off screen, no sideways scroll`, !o.offscreen.length && !o.hOverflow, o.offscreen.join(","));
    await p.screenshot({ path: `${OUT}/vp-${name}.png` });
    await p.close();
  }

  // ---- the journey, phone and desktop ----
  for (const [name, vp, mobile] of [["phone", { width: 390, height: 844 }, true], ["desktop", { width: 1440, height: 900 }, false]]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && !/getUserMedia|Permission|NotAllowed/i.test(m.text()) && errors.push(m.text()));
    const t0 = Date.now();
    await page.goto(PAGE); await ready(page);
    results.timings[`${name}.ready_ms`] = Date.now() - t0;
    check(`${name}: entrance shows on a first visit`, await page.evaluate(() => !document.getElementById("entrance").hidden));
    await page.evaluate(() => document.getElementById("skip").click());
    check(`${name}: entrance skipped and remembered`, await page.waitForFunction(() => document.getElementById("entrance").hidden && localStorage.getItem("dw-home-seen") === "1", null, { timeout: 15000 }).then(() => true, () => false));
    await page.waitForTimeout(1200);
    const body = await page.textContent("body");
    check(`${name}: no sample or invented data`, !/sample|invented/i.test(body) && (await stars(page)) === 0);
    check(`${name}: empty state invites the first reflection`, (await page.textContent("#home-meta")).includes("Your first reflection becomes your first star"));
    await page.screenshot({ path: `${OUT}/${name}-1-home-empty.png` });
    await axe(page, `${name} home`);

    // into Mind
    const tm = Date.now();
    await page.locator('#planets .planet-mind').evaluate((b) => b.click());
    await arrive(page);
    results.timings[`${name}.mind_arrival_ms`] = Date.now() - tm;
    check(`${name}: focus on the world's question`, await page.evaluate(() => document.activeElement?.id === "w-q"));
    check(`${name}: one primary action`, (await page.locator("#w-body .primary").count()) === 1);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${name}-2-mind.png` });
    await axe(page, `${name} mind`);

    // reflect: empty refused; a draft survives leaving and coming back
    await page.getByRole("button", { name: "Begin reflection" }).click();
    check(`${name}: editor is quiet and focused`, await page.evaluate(() => document.body.classList.contains("quiet") && document.activeElement?.id === "words"));
    check(`${name}: no stray "null" text`, !(await page.textContent("#w-body")).includes("null"));
    await page.getByRole("button", { name: "Keep it" }).click();
    check(`${name}: empty save refused with a message`, (await page.textContent(".error")).includes("Write or say something first"));
    await page.fill("#words", "A long walk before work and my head was clear all morning.");
    await page.waitForTimeout(700);
    check(`${name}: draft kept on this device`, (await page.textContent("#ed-status")).includes("Draft kept"));
    await page.locator('#tabs [data-tab="home"]').click();
    await page.waitForTimeout(400);
    await page.locator('#tabs [data-tab="reflect"]').click();
    await arrive(page);
    check(`${name}: draft comes back after navigating away`, (await page.inputValue("#words")).includes("A long walk before work"));
    await page.screenshot({ path: `${OUT}/${name}-3-editor.png` });
    await axe(page, `${name} editor`);

    // the blocked microphone (as in the preview window): said plainly
    if (await page.locator(".mic").count()) {
      await page.locator(".mic").click();
      await page.waitForTimeout(800);
      const st = await page.textContent("#ed-status");
      check(`${name}: blocked microphone is explained`, /microphone isn't available|Listening/.test(st), st.slice(0, 80));
    }

    // keep it: verified, survives a reload
    await page.getByRole("button", { name: "Keep it" }).click();
    await page.waitForTimeout(500);
    check(`${name}: one star, kept on this device`, (await stars(page)) === 1 && (await kept(page)) === 1);
    check(`${name}: the new star shows the exact words`, (await page.textContent("blockquote.said")).includes("A long walk before work"));
    check(`${name}: it says where it is kept`, (await page.textContent("#w-body")).includes("Kept on this device"));
    check(`${name}: draft cleared after keeping`, await page.evaluate(() => localStorage.getItem("dw-draft-v1") === null));
    await page.screenshot({ path: `${OUT}/${name}-4-new-star.png` });
    await page.reload(); await ready(page); await page.waitForTimeout(600);
    check(`${name}: still there after a reload`, (await stars(page)) === 1 && (await page.textContent("#home-meta")).includes("1 memory"));

    // a second evening in Body that shares a word: a possible connection
    await page.locator('#planets .planet-body').evaluate((b) => b.click());
    await arrive(page);
    await page.getByRole("button", { name: "Begin reflection" }).click();
    await page.fill("#words", "Took the walk at lunch and the afternoon felt lighter.");
    await page.getByRole("button", { name: "Keep it" }).click();
    await page.waitForTimeout(500);
    const sheetText = await page.textContent("#w-body");
    check(`${name}: possible connection offered, as a plain fact`, sheetText.includes("Possible connection") && sheetText.includes("“walk”"));
    await page.getByRole("button", { name: "Link them" }).click();
    check(`${name}: linking draws one line and keeps it`, (await page.evaluate(() => window.__dwHome.data.links.length)) === 1 && (await page.evaluate(() => JSON.parse(localStorage.getItem("dw-local-v1")).themes.length)) === 1);

    // Memories: galaxy, filter, search, list, detail
    await page.locator('#tabs [data-tab="memories"]').click();
    await page.waitForTimeout(300);
    check(`${name}: two stars, each a button`, (await page.locator(".mstar").count()) === 2);
    await page.screenshot({ path: `${OUT}/${name}-5-memories.png` });
    await axe(page, `${name} memories`);
    await page.locator('#m-filters [data-f="body"]').click();
    check(`${name}: filter by world`, (await page.locator(".mstar").count()) === 1);
    await page.locator('#m-filters [data-f="all"]').click();
    await page.fill("#m-q", "lunch");
    check(`${name}: search finds the evening`, (await page.locator(".mstar").count()) === 1);
    await page.fill("#m-q", "");
    await page.locator('#m-views [data-v="list"]').click();
    check(`${name}: list view`, (await page.locator("#m-list .memory").count()) === 2);
    await page.locator("#m-list .memory").first().click();
    check(`${name}: memory detail opens`, (await page.textContent("#m-detail")).includes("Took the walk at lunch"));
    await page.keyboard.press("Escape");
    check(`${name}: Escape closes the detail`, await page.evaluate(() => document.getElementById("m-detail").hidden));

    // You: the pattern with its evidence, review asks before setting aside
    await page.locator('#tabs [data-tab="you"]').click();
    await page.waitForTimeout(300);
    check(`${name}: pattern listed with its evidence count`, (await page.textContent("#y-understand")).includes("Seen in 2 of your evenings"));
    await axe(page, `${name} you`);
    await page.getByRole("button", { name: "See the evenings behind it" }).first().click();
    await arrive(page);
    check(`${name}: review shows what you said`, (await page.locator(".quote").count()) === 2);
    await page.getByRole("button", { name: "That's not right" }).click();
    check(`${name}: setting aside asks first`, (await page.textContent("#w-body")).includes("Set this aside?"));
    await page.getByRole("button", { name: "Keep it as it is" }).click();
    await page.screenshot({ path: `${OUT}/${name}-6-review.png` });

    // text view
    await page.locator('#tabs [data-tab="you"]').click();
    await page.click("#y-text");
    const txt = await page.textContent("#text");
    check(`${name}: text view has every world and both evenings`, ["Mind", "Body", "Soul", "Spirit", "Future"].every((w) => txt.includes(w)) && txt.includes("Took the walk at lunch"));
    await axe(page, `${name} text`);
    await page.click("#text-close");

    // delete everything
    await page.locator('#tabs [data-tab="you"]').click();
    await page.click("#y-delete");
    check(`${name}: delete asks first`, (await page.textContent("#y-delete-confirm")).includes("can't be undone"));
    await page.getByRole("button", { name: "Delete everything", exact: true }).click();
    check(`${name}: everything deleted from this device`, (await stars(page)) === 0 && (await page.evaluate(() => localStorage.getItem("dw-local-v1"))) === null);

    // frame timing (software GPU: not a device measurement)
    await page.locator('#tabs [data-tab="home"]').click();
    await page.evaluate(() => (window.__dwFrames.length = 0));
    await page.waitForTimeout(3000);
    results.timings[`${name}.frames_swiftshader`] = await page.evaluate(() => { const f = window.__dwFrames.slice().sort((a, b) => a - b); return { n: f.length, median: f[Math.floor(f.length / 2)], p95: f[Math.floor(f.length * 0.95)], degraded: Boolean(window.__dwDegraded) }; });
    check(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  // ---- 320 × 568: the compact world selector works ----
  {
    const p = await browser.newPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
    await p.addInitScript(() => localStorage.setItem("dw-home-seen", "1"));
    await p.goto(PAGE); await ready(p); await p.waitForTimeout(800);
    check("320x568: five world buttons shown", (await p.locator("#worldbar button").count()) === 5 && (await p.locator("#worldbar").isVisible()));
    await p.locator('#worldbar [data-world="soul"]').click();
    await arrive(p);
    check("320x568: a world opens from them", (await p.textContent("#w-name")) === "Soul");
    await p.close();
  }

  // ---- a crafted link can't send a token anywhere but this page's own origin ----
  {
    const pg = await browser.newPage();
    const hosts = [];
    pg.on("request", (q) => hosts.push(new globalThis.URL(q.url()).host));
    await pg.goto(PAGE.replace("home.html", "home.html?api=https://evil.example") + "#token=not-a-real-token");
    await ready(pg);
    check("token never goes to another origin", !hosts.includes("evil.example"));
    check("token removed from the address bar", !pg.url().includes("token="));
    check("says plainly that it couldn't reach Dawnward", (await pg.textContent("#note")).includes("couldn't reach your Dawnward"));
    await pg.close();
  }

  // ---- reduced motion: no entrance, no flight ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(PAGE); await ready(p);
    check("reduced motion: no entrance", await p.evaluate(() => document.getElementById("entrance").hidden));
    const t = Date.now();
    await p.locator("#planets .planet-soul").evaluate((b) => b.click());
    await p.waitForFunction(() => document.body.classList.contains("closeup-on"), null, { timeout: 4000 });
    results.timings["reduced.soul_arrival_ms"] = Date.now() - t;
    check("reduced motion: arrival is immediate", Date.now() - t < 600, `${Date.now() - t} ms`);
    await ctx.close();
  }

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-home-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
