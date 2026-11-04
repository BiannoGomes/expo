// How Dawnward moves (4 Nov 2026): Flow is the default (springs, a card that becomes its practice, sheets you can
// pull down, a tab bar that steps aside in a practice). The lab directions (Calm, Living, Depth) stay switchable
// on a pill for comparison; Still adds nothing. A choice is kept on this device; nothing is ever left hidden at
// rest; prefers-reduced-motion turns all of it off; the switcher is accessible.
// Runs WITHOUT still.cjs (this is the suite that tests motion).
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
const tab = async (p, t) => { await p.locator(`#tabs [data-tab="${t}"]`).click(); await p.waitForTimeout(120); };
const ours = (p) => p.evaluate(() => document.getAnimations().filter((a) => a.id === "dw-motion").length);
const mode = (p) => p.evaluate(() => document.documentElement.dataset.motion);
const kept = (p) => p.evaluate(() => localStorage.getItem("dw-motion"));
// after everything has landed: nothing in the visible place is faded, shifted or blurred
const settled = (p) => p.evaluate(() => {
  const place = [...document.querySelectorAll("#earth, #atlas, #memories, #explore, #you, #creative")].find((e) => !e.hidden);
  const bad = [...(place?.querySelectorAll("h2, .card, .row, .mission, .nextcard, .actions") ?? [])].filter((e) => e.offsetParent)
    .map((e) => getComputedStyle(e)).filter((s) => +s.opacity < 0.99 || (s.transform !== "none" && s.transform !== "matrix(1, 0, 0, 1, 0, 0)") || s.filter.includes("blur"));
  const root = place && getComputedStyle(place);
  return bad.length === 0 && (!root || (+root.opacity > 0.99 && !root.filter.includes("blur")));
});
const pick = async (p, label) => { await p.getByRole("radio", { name: label, exact: true }).click(); await p.waitForTimeout(150); };

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  { const nc = browser.newContext.bind(browser); browser.newContext = async (o) => { const c = await nc(o); await c.addInitScript(() => {
    // count View Transitions (the Flow morph), without changing what they do
    if (typeof document.startViewTransition === "function") { const vt = document.startViewTransition.bind(document); window.__vt = 0; document.startViewTransition = (...a) => { window.__vt++; return vt(...a); }; }
  }); await c.addInitScript(() => { try { if (location.protocol !== "about:" && !localStorage.getItem("dw-progress-v1")) localStorage.setItem("dw-progress-v1", JSON.stringify({ unlocked: { knowledge: "seed", spiritual: "seed", creative: "seed", ai: "seed", gateway: "seed" }, celebrated: { knowledge: true, spiritual: true, creative: true, ai: true, gateway: true } })); } catch {} }); return c; }; }
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e)));

  // ----- Flow (the default) -----
  await go(page, "home");
  check("Flow is the default, and nothing needs keeping to have it", (await mode(page)) === "flow" && (await kept(page)) === null, String(await mode(page)));
  check("no comparison pill on Flow", await page.locator("#m-pill").isHidden());
  let n = 0; for (const t of ["universe", "journey", "learn", "home"]) { await tab(page, t); n += await ours(page); }
  check("Flow: places arrive with motion", n > 0, String(n));
  await page.waitForTimeout(2200);
  check("Flow: once landed, nothing is left faded, shifted or blurred", await settled(page));
  // the card you tap becomes the practice's heading (View Transitions)
  await go(page, "home", 1000);
  const vt0 = await page.evaluate(() => window.__vt ?? -1);
  await page.locator("#e-body .nextcard .primary").click();
  await page.waitForSelector("#x-body .s-title");
  await page.waitForTimeout(900);
  check("Flow: opening a practice from Today is one continuous transition", vt0 >= 0 && (await page.evaluate(() => window.__vt)) === vt0 + 1, `${vt0} → ${await page.evaluate(() => window.__vt)}`);
  check("…that leaves no transition names behind, and focus on the heading", await page.evaluate(() => ![...document.querySelectorAll("*")].some((e) => e.style?.viewTransitionName) && document.activeElement?.classList.contains("s-title")));
  check("Flow: the tab bar has stepped aside inside the practice", !(await page.locator("#tabs").isVisible()));
  const dots = await page.evaluate(() => [...document.querySelectorAll("#x-body .qpos span")].map((e) => Math.round(e.getBoundingClientRect().width)));
  check("the step you're on is a short bar, the others dots", dots.length > 2 && dots[0] > dots[1], JSON.stringify(dots));
  await page.locator("#x-body .qhead .back").click(); await page.waitForTimeout(600);
  check("…and slides back when you leave", await page.locator("#tabs").isVisible());
  // sheets rise, and can be pulled down
  await page.getByRole("button", { name: "Set a direction" }).click();
  await page.waitForTimeout(700);
  const sheet = page.locator("dialog.sheetdlg[open]");
  check("a sheet rises into place", (await sheet.count()) === 1 && await sheet.evaluate((d) => { const t = getComputedStyle(d).transform; return t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)"; }) && /transform/.test(await sheet.evaluate((d) => getComputedStyle(d).transitionProperty)));
  let box = await sheet.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 14); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2, box.y + 30, { steps: 3 }); await page.mouse.up();
  await page.waitForTimeout(700);
  check("a small pull springs back: the sheet stays", (await sheet.count()) === 1 && await sheet.evaluate((d) => !d.style.transform));
  box = await sheet.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 14); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2, box.y + 14 + box.height * 0.6, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(900);
  check("pulling it most of the way down dismisses it", (await page.locator("dialog.sheetdlg[open]").count()) === 0);

  // ----- the switcher in You › Display -----
  await go(page, "you");
  const group = page.getByRole("radiogroup", { name: "Motion style" });
  check("You › Display has the motion switcher with five choices", (await group.getByRole("radio").count()) === 5, String(await group.getByRole("radio").count()));
  check("Flow is checked to begin with", (await page.getByRole("radio", { name: "Flow", exact: true }).getAttribute("aria-checked")) === "true");
  await pick(page, "Living");
  check("choosing Living checks it and is kept on this device", (await page.getByRole("radio", { name: "Living", exact: true }).getAttribute("aria-checked")) === "true" && (await kept(page)) === "living" && (await mode(page)) === "living");
  check("the comparison pill appears with the three lab directions", (await page.locator("#m-pill").isVisible()) && (await page.locator("#m-pill button").count()) === 3);
  check("the pill marks Living as on", (await page.locator('#m-pill button[aria-pressed="true"]').innerText()).trim() === "Living");
  await axe(page, "You with the motion switcher and pill");

  // ----- each direction animates arrivals, then leaves everything at rest -----
  for (const [label, key] of [["Living", "living"], ["Calm", "calm"], ["Depth", "depth"]]) {
    await page.locator("#m-pill button", { hasText: label }).click(); await page.waitForTimeout(100);
    check(`${label}: the pill switches the direction`, (await mode(page)) === key && (await kept(page)) === key);
    let started = 0; for (const t of ["universe", "journey", "learn", "home"]) { await tab(page, t); started += await ours(page); }
    check(`${label}: arrivals animate`, started > 0, `${started} animations over 4 places`);
    await page.waitForTimeout(2200);
    check(`${label}: once landed, nothing is left faded, shifted or blurred`, await settled(page));
    check(`${label}: tabs still work straight away (no click is delayed)`, await (async () => { await page.locator('#tabs [data-tab="journey"]').click(); return page.locator("#memories").isVisible(); })());
  }

  // ----- a step in an expedition arrives in the chosen direction too -----
  await page.locator("#m-pill button", { hasText: "Calm" }).click();
  await go(page, "learn", 900);
  await page.locator("#x-body .x-feature .primary").click();
  await page.waitForSelector("#x-body .s-title");
  check("Calm: an expedition step arrives with motion", (await ours(page)) > 0, String(await ours(page)));

  // ----- the signature moment: a finished practice releases a star that settles into Journey -----
  await go(page, "world/body/overview", 1000);
  await page.locator("#w-body .w-next").click();
  await page.waitForSelector("#x-body .s-title");
  await page.getByRole("button", { name: "Begin" }).click();
  for (const t of ["One true thing.", "Another true thing."]) { await page.fill("#q-words", t); await page.getByRole("button", { name: "Continue", exact: true }).click(); }
  await page.fill("#q-action", "Test the fairer version once"); await page.fill("#q-when", "This week");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => /Done/.test(document.querySelector("#x-body .s-title")?.textContent ?? ""), null, { timeout: 15000 });
  const flying = await page.locator(".m-star").count();
  const hidden = await page.locator(".m-star").getAttribute("aria-hidden").catch(() => null);
  await page.waitForTimeout(2000);
  check("Done: one star flies to Journey, hidden from screen readers, then is gone", flying === 1 && hidden === "true" && (await page.locator(".m-star").count()) === 0, `${flying} ${hidden}`);
  check("Done: the focus stays on the Done heading", await page.evaluate(() => document.activeElement?.classList.contains("s-title")));

  // ----- it survives a reload; Still turns it all off; Flow forgets the choice -----
  await go(page, "journey");
  check("the choice survives a reload", (await mode(page)) === "calm" && (await page.locator("#m-pill").isVisible()));
  await go(page, "you");
  await pick(page, "Still");
  check("Still: kept, no pill", (await kept(page)) === "now" && (await mode(page)) === "now" && (await page.locator("#m-pill").isHidden()));
  n = 0; for (const t of ["universe", "journey"]) { await tab(page, t); n += await ours(page); }
  check("Still: no arrivals animate", n === 0, String(n));
  await go(page, "home", 1000);
  const vts = await page.evaluate(() => window.__vt ?? 0);
  await page.locator("#e-body .nextcard .primary").click(); await page.waitForSelector("#x-body .s-title");
  check("Still: opening a practice is a plain cut, no transition", (await page.evaluate(() => window.__vt ?? 0)) === vts);
  await go(page, "you"); await pick(page, "Flow");
  check("back to Flow: nothing kept (it's the default)", (await kept(page)) === null && (await mode(page)) === "flow");

  // ----- reduced motion wins over any choice -----
  const rctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  await rctx.addInitScript(() => { try { if (location.protocol !== "about:") localStorage.setItem("dw-motion", "depth"); } catch {} });
  const rp = await rctx.newPage(); rp.on("pageerror", (e) => errors.push(String(e)));
  await go(rp, "home");
  check("reduced motion: the lab stands down even with Depth chosen", (await mode(rp)) === "reduced");
  n = 0; for (const t of ["universe", "journey", "learn", "home"]) { await tab(rp, t); n += await ours(rp); }
  check("reduced motion: no motion-lab animations at all", n === 0, String(n));
  check("reduced motion: no star element", (await rp.locator(".m-star").count()) === 0);
  await go(rp, "home", 1000);
  const rvt = await rp.evaluate(() => window.__vt ?? 0);
  await rp.locator("#e-body .nextcard .primary").click(); await rp.waitForSelector("#x-body .s-title");
  check("reduced motion: no transition when a practice opens", (await rp.evaluate(() => window.__vt ?? 0)) === rvt);
  check("reduced motion: the tab bar leaves without sliding", await rp.evaluate(() => getComputedStyle(document.getElementById("tabs")).transitionDuration.split(",").every((d) => parseFloat(d) === 0)));
  await rctx.close();

  // ----- small phones: the pill fits and never pushes the page sideways -----
  await page.setViewportSize({ width: 320, height: 568 });
  await go(page, "you"); await pick(page, "Depth"); await go(page, "journey");
  const fit = await page.evaluate(() => { const r = document.getElementById("m-pill").getBoundingClientRect(), t = document.getElementById("tabs").getBoundingClientRect(); return { inside: r.left >= 0 && r.right <= innerWidth, aboveTabs: r.bottom <= t.top + 1, sideways: document.documentElement.scrollWidth > innerWidth }; });
  check("320 px: the pill sits inside the screen, above the tabs, no sideways scroll", fit.inside && fit.aboveTabs && !fit.sideways, JSON.stringify(fit));
  const tgt = await page.evaluate(() => [...document.querySelectorAll("#m-pill button")].every((b) => { const r = b.getBoundingClientRect(); return r.height >= 24 && r.width >= 24; }));
  check("pill buttons meet the 24 px target minimum", tgt);
  fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: `${OUT}/motion-pill-320.png` }).catch(() => {});

  check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-motion-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
