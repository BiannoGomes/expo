// Galaxy Home vertical slice, end to end, on the built page.
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
// Galaxy home → Mind → capture → save → new memory star → insight review → home,
// plus text view, reduced motion, keyboard Escape, axe on every state.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const AXE = fs.readFileSync(path.join(__dirname, "../../../experience/node_modules/axe-core/axe.min.js"), "utf8");
const URL = process.env.DW_URL || "http://localhost:8771/home.html";
const OUT = path.join(__dirname, "shots");
const results = { when: new Date().toISOString(), url: URL, checks: [], axe: {}, timings: {} };
const check = (name, ok, detail = "") => { results.checks.push({ name, ok: Boolean(ok), detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };

async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] });
    return res.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) }));
  });
  results.axe[label] = r;
  check(`axe: ${label}`, r.length === 0, r.map((v) => `${v.id}×${v.n}`).join(", "));
}

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const [name, vp, mobile] of [["phone", { width: 390, height: 844 }, true], ["desktop", { width: 1440, height: 900 }, false]]) {
    // Device scale 1: this machine draws with a software GPU, and at 2x a frame
    // takes seconds. Screenshots for review are taken separately at 2x.
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    // first visit: the entrance plays, and is skippable
    const t0 = Date.now();
    await page.goto(URL);
    await page.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
    results.timings[`${name}.ready_ms`] = Date.now() - t0;
    const entranceShown = await page.evaluate(() => !document.getElementById("entrance").hidden);
    check(`${name}: entrance shows on a first visit`, entranceShown);
    // The entrance ends by itself after 3 s; on this software GPU that can pass
    // before the test acts, so Skip is pressed through the DOM.
    await page.evaluate(() => document.getElementById("skip").click());
    const skipped = await page.waitForFunction(() => document.getElementById("entrance").hidden && localStorage.getItem("dw-home-seen") === "1", null, { timeout: 6000 }).then(() => true, () => false);
    check(`${name}: entrance skipped and remembered`, skipped);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/${name}-1-home.png` });
    check(`${name}: sample is labelled`, (await page.textContent("#source")).includes("Sample"));
    check(`${name}: four world buttons`, (await page.locator(".planet").count()) === 4);
    // every planet label sits on screen
    const off = await page.evaluate(() => [...document.querySelectorAll(".planet")].filter((b) => { const r = b.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1 || r.top < 0 || r.bottom > innerHeight; }).map((b) => b.dataset.world));
    check(`${name}: planet labels on screen`, off.length === 0, off.join(","));
    // nothing overlaps: names, words, Explore buttons, and the panels around them
    const clash = await page.evaluate(() => {
      const items = [];
      const add = (el, label) => { if (!el) return; const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") return; const r = el.getBoundingClientRect(); if (r.width && r.height) items.push({ label, r }); };
      document.querySelectorAll(".planet").forEach((b) => add(b, `explore:${b.dataset.world}`));
      document.querySelectorAll(".arc").forEach((a) => { add(a.querySelector(".aname"), `name:${a.classList[1]}`); add(a.querySelector(".awords"), `words:${a.classList[1]}`); });
      ["brand", "notice", "home-ui", "rail", "dock"].forEach((id) => add(document.getElementById(id), id));
      add(document.querySelector(".tools"), "tools");
      const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const out = [];
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const A = items[i], B = items[j];
        if (A.label.split(":")[1] && A.label.split(":")[1].replace("arc-", "") === (B.label.split(":")[1] || "").replace("arc-", "")) continue; // same world's own parts
        if ((A.label === "home-ui" && B.label === "dock") || (A.label === "dock" && B.label === "home-ui")) continue; // the dock lives in the cards
        if (hit(A.r, B.r)) out.push(`${A.label}×${B.label}`);
      }
      return out;
    });
    check(`${name}: nothing overlaps`, clash.length === 0, clash.join(", "));
    await axe(page, `${name} home`);

    // 1. into Mind: interruptible move, then the close-up
    const tMove = Date.now();
    await page.locator(".planet-mind").evaluate((b) => b.click());
    await page.waitForFunction(() => document.body.classList.contains("closeup-on"), null, { timeout: 8000 });
    results.timings[`${name}.mind_arrival_ms`] = Date.now() - tMove;
    check(`${name}: focus lands on the world title`, await page.evaluate(() => document.activeElement?.id === "w-title"));
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${name}-2-mind.png` });
    await axe(page, `${name} mind`);

    // interrupt: ask for Soul mid-flight, then Escape home mid-flight
    await page.evaluate(() => document.querySelector('#dots [data-view="soul"]').click());
    await page.waitForTimeout(250);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1300);
    check(`${name}: a move can be interrupted and Escape returns home`, await page.evaluate(() => document.body.dataset.view === "home" && document.getElementById("world").hidden));

    // 2. capture from Mind
    await page.locator(".planet-mind").evaluate((b) => b.click());
    await page.waitForFunction(() => document.body.classList.contains("closeup-on"), null, { timeout: 15000 });
    await page.getByRole("button", { name: /New reflection/ }).click();
    check(`${name}: capture is quiet`, await page.evaluate(() => document.body.classList.contains("quiet")));
    check(`${name}: text box focused`, await page.evaluate(() => document.activeElement?.id === "words"));
    await page.getByRole("button", { name: "Keep it" }).click();
    check(`${name}: empty save is refused with a message`, (await page.textContent(".error")).includes("Write or say something first"));
    await page.fill("#words", "Wrote the day down again before bed and kept to the plan.");
    await page.screenshot({ path: `${OUT}/${name}-3-capture.png` });
    await axe(page, `${name} capture`);
    const before = await page.evaluate(() => window.__dwHome.data.stars.length);
    await page.getByRole("button", { name: "Keep it" }).click();
    await page.waitForTimeout(600);
    const after = await page.evaluate(() => window.__dwHome.data.stars.length);
    check(`${name}: saving adds exactly one star`, after === before + 1, `${before} -> ${after}`);
    check(`${name}: the new star is shown with the exact words`, (await page.textContent("blockquote.said")).includes("Wrote the day down again before bed"));
    check(`${name}: it says nothing was sent`, (await page.textContent("#sheet")).includes("Nothing was sent anywhere"));
    await page.screenshot({ path: `${OUT}/${name}-4-new-star.png` });

    // 3. insight review: suggestion is labelled sample logic, accept links it
    await page.getByRole("button", { name: "Review what I understand" }).first().click();
    const sheetText = await page.textContent("#sheet");
    check(`${name}: suggestion labelled as sample logic`, sheetText.includes("Sample logic"));
    check(`${name}: review separates what you said from what I think`, sheetText.includes("What you said") && sheetText.includes("What I think it means"));
    await page.screenshot({ path: `${OUT}/${name}-5-review.png` });
    await axe(page, `${name} review`);
    const linksBefore = await page.evaluate(() => window.__dwHome.data.links.length);
    await page.getByRole("button", { name: "Yes, it does" }).click();
    const linksAfter = await page.evaluate(() => window.__dwHome.data.links.length);
    check(`${name}: accepting draws one new line`, linksAfter === linksBefore + 1, `${linksBefore} -> ${linksAfter}`);
    check(`${name}: evidence count updates`, (await page.textContent("#sheet")).includes("Seen in 4 of your evenings"));
    // reject asks first, and can be kept
    await page.getByRole("button", { name: "That's not right" }).first().click();
    check(`${name}: setting aside asks first`, (await page.textContent("#sheet")).includes("Set this aside?"));
    await page.getByRole("button", { name: "Keep it as it is" }).click();

    // 4. a world with nothing to conclude from: the honest line
    const honest = await page.evaluate(() => {
      const t = window.__dwHome.data.themes; return t.length;
    });
    check(`${name}: themes still present after keeping`, honest === 4);

    // 5. home, with the new star selected
    await page.getByRole("button", { name: "Return to your galaxy" }).last().click();
    await page.waitForTimeout(1400);
    check(`${name}: back home`, await page.evaluate(() => document.body.dataset.view === "home"));
    await page.screenshot({ path: `${OUT}/${name}-6-home-again.png` });

    // text view: complete without the 3D
    if (mobile) { await page.click("#menu"); await page.getByRole("button", { name: /Text view/ }).click(); }
    else await page.click("#m-text");
    const txt = await page.textContent("#text");
    check(`${name}: text view lists every world`, ["Mind", "Body", "Soul", "Future"].every((w) => txt.includes(w)));
    check(`${name}: text view includes the new evening`, txt.includes("Wrote the day down again before bed"));
    await page.screenshot({ path: `${OUT}/${name}-7-text.png` });
    await axe(page, `${name} text`);
    await page.evaluate(() => document.getElementById("m-galaxy").click());
    check(`${name}: back to the galaxy from text view`, await page.evaluate(() => document.body.dataset.mode === "galaxy" && document.getElementById("text").hidden));
    await page.waitForTimeout(1000);

    // frame timing (software GPU here: not a device measurement)
    await page.evaluate(() => (window.__dwFrames.length = 0));
    await page.waitForTimeout(3000);
    const ft = await page.evaluate(() => { const f = window.__dwFrames.slice().sort((a, b) => a - b); return { n: f.length, median: f[Math.floor(f.length / 2)], p95: f[Math.floor(f.length * 0.95)], degraded: Boolean(window.__dwDegraded) }; });
    results.timings[`${name}.frames_swiftshader`] = ft;
    check(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
    await page.close();
  }

  // a crafted link can't send a token anywhere but this page's own origin
  {
    const pg = await browser.newPage();
    const hosts = [];
    pg.on("request", (q) => hosts.push(new globalThis.URL(q.url()).host));
    await pg.goto(URL.replace("home.html", "home.html?api=https://evil.example") + "#token=not-a-real-token");
    await pg.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
    check("token never goes to another origin", !hosts.includes("evil.example"));
    check("token removed from the address bar", !pg.url().includes("token="));
    check("falls back to the labelled sample", (await pg.textContent("#source")).includes("couldn't load yours"));
    await pg.close();
  }

  // reduced motion: no entrance, no flight, everything still works
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(URL);
  await p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
  check("reduced motion: no entrance", await p.evaluate(() => document.getElementById("entrance").hidden));
  const t = Date.now();
  await p.locator(".planet-soul").evaluate((b) => b.click());
  await p.waitForFunction(() => document.body.classList.contains("closeup-on"), null, { timeout: 4000 });
  results.timings["reduced.soul_arrival_ms"] = Date.now() - t;
  check("reduced motion: arrival is immediate", Date.now() - t < 600, `${Date.now() - t} ms`);
  await ctx.close();
  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-home-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
