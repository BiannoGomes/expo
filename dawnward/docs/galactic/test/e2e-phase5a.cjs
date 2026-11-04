// Phase 5a, measured against the audit of 2026-11-01 (docs/audit/2026-11-01): Learn, Journey and You,
// and the app-wide fixes. Each check is one of the audit's acceptance tests.
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
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}×${v.nodes.length} ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`));
  results.axe[label] = r; check(`axe: ${label}`, r.length === 0, r.join(", "));
}
const ready = (p) => p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
const go = async (p, hash, wait = 900) => { await p.goto("about:blank"); await p.goto(BASE + "#/" + hash); await ready(p); await p.waitForTimeout(wait); };
const shot = (p, n) => p.screenshot({ path: `${OUT}/a-${n}.png`, timeout: 90000 }).catch(() => {});
const noSideways = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
// visible text and targets on screen, as the audit measured them
const measure = (p, rootSel) => p.evaluate((rootSel) => {
  const root = document.querySelector(rootSel), vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && r.top < innerHeight && r.bottom > 0 && !e.closest("[hidden], details:not([open]) > :not(summary), .sr"); };
  const words = [], small = [], caps = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) { const e = n.parentElement, t = n.textContent.trim(); if (!t || !e || !vis(e)) continue;
    words.push(t); const s = getComputedStyle(e); if (parseFloat(s.fontSize) < 12.5) small.push(`${s.fontSize} ${t.slice(0, 30)}`); if (s.textTransform === "uppercase" && /[a-z]/i.test(t)) caps.push(t.slice(0, 30)); }
  const tiny = [...root.querySelectorAll("button, a[href], summary, input")].filter(vis).map((e) => [e.getBoundingClientRect(), (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 24)]).filter(([r]) => r.height < 44 || r.width < 24).map(([r, t]) => `${Math.round(r.width)}x${Math.round(r.height)} ${t}`);
  return { words: words.join(" ").split(/\s+/).length, small, caps, tiny, primaries: [...root.querySelectorAll(".primary")].filter(vis).length };
}, rootSel);

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  // a returning explorer: every galaxy already open (the path itself is tested in e2e-path.cjs)
  { const nc = browser.newContext.bind(browser); browser.newContext = async (o) => { const c = await nc(o); await c.addInitScript(() => { try { if (!localStorage.getItem("dw-progress-v1")) localStorage.setItem("dw-progress-v1", JSON.stringify({ unlocked: { knowledge: "seed", spiritual: "seed", creative: "seed", ai: "seed", gateway: "seed" }, celebrated: { knowledge: true, spiritual: true, creative: true, ai: true, gateway: true } })); } catch {} }); return c; }; }
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e)));

  // ----- Learn -----
  await go(page, "learn");
  const learn = page.locator("#x-body");
  check("Learn says Learn once", (await learn.evaluate((e) => (e.textContent.match(/Learn(?![a-z])/g) || []).length)) === 1, String(await learn.evaluate((e) => (e.textContent.match(/Learn(?![a-z])/g) || []).length)));
  const feat = learn.locator(".x-feature");
  check("one featured next step, with the only gold button", (await feat.count()) === 1 && (await learn.locator(".primary").count()) === 1 && (await feat.locator(".primary").count()) === 1, await feat.innerText().catch(() => ""));
  check("its button says what happens and how long", /^Begin · \d+ min$/.test((await feat.locator(".primary").innerText()).trim()));
  const order = await learn.evaluate((e) => [...e.querySelectorAll("section.group > h3, section.group.system h3")].map((h) => h.textContent));
  check("Library comes last, after the practices", order[order.length - 1] === "Library" && order.length > 3, order.join(" | "));
  const rows = await learn.evaluate((e) => { const cw = e.getBoundingClientRect().width; return [...e.querySelectorAll("button.mission")].slice(0, 6).map((b) => { const t = b.querySelector(".rtitle"), lh = parseFloat(getComputedStyle(t).lineHeight) || 22; return { full: b.getBoundingClientRect().width / cw, lines: Math.round(t.getBoundingClientRect().height / lh) }; }); });
  check("chapter rows run full width, titles on one or two lines", rows.length > 0 && rows.every((r) => r.full > 0.8 && r.lines <= 2), JSON.stringify(rows));
  let m = await measure(page, "#x-body");
  check("no small or all-caps text on Learn", m.small.length === 0 && m.caps.length === 0, [...m.small, ...m.caps].join(" | "));
  check("no sideways scroll on Learn", await noSideways(page));
  await shot(page, "learn");
  await axe(page, "Learn");
  await feat.locator(".primary").click(); await page.waitForTimeout(800);
  check("the featured step opens that practice", (await page.locator("#x-body .s-title").count()) > 0 && (await page.evaluate(() => window.__dwHome.state.place)) === "explore" && !/Explore\. Practise\. Grow\./.test(await page.locator("#x-body").innerText()));
  await page.getByRole("button", { name: "Begin" }).click(); await page.waitForTimeout(400);
  await go(page, "learn");
  check("once started, the featured step says Continue and how far", /^Continue · \d+ of \d+$/.test((await page.locator("#x-body .x-feature .primary").innerText()).trim()) && (await page.locator('#x-body .x-feature [role="progressbar"]').count()) === 1);

  // ----- Journey -----
  await go(page, "world/mind/overview");
  await page.getByRole("button", { name: "Begin reflection" }).click();
  await page.fill("#words", "A walk without my phone."); await page.getByRole("button", { name: "Save reflection" }).click(); await page.waitForTimeout(600);
  await go(page, "journey");
  const sum = await page.locator("#m-count").innerText();
  check("Journey starts with a plain summary", /^1 reflection/.test(sum), sum);
  check("with one reflection it opens on Milestones, not an empty sky", (await page.locator('#m-views [data-v="miles"]').getAttribute("aria-checked")) === "true" && await page.locator("#m-miles").isVisible());
  const controls = await page.evaluate(() => [...document.querySelectorAll("#memories .mhead button, #memories .mhead input")].filter((e) => e.offsetParent && !e.closest("[hidden]")).length);
  check("search and six world filters sit behind one Filter chip", (await page.locator("#m-filterbox").isHidden()) && (await page.locator("#m-filter-btn").isVisible()) && controls <= 5, String(controls)); // 4 views (Galaxy, List, Milestones, Week) + Filter; the six world filters stay folded
  await page.locator("#m-filter-btn").click();
  check("Filter opens them, and says it's open", (await page.locator("#m-filterbox").isVisible()) && (await page.locator("#m-filter-btn").getAttribute("aria-expanded")) === "true");
  await page.locator('#m-filters [data-f="body"]').click();
  check("an active filter shows on the chip", /Filter · Body/.test(await page.locator("#m-filter-btn").innerText()));
  await page.locator('#m-filters [data-f="all"]').click();
  await page.locator('#m-views [data-v="galaxy"]').click();
  check("Galaxy is still there, and its stars open", (await page.locator(".mstar").count()) === 1);
  await page.locator(".mstar").first().click();
  check("a star opens its memory", /A walk without my phone/.test(await page.locator("#m-detail").innerText()));
  await page.keyboard.press("Escape");
  await page.locator('#tabs [data-tab="home"]').click(); await page.waitForTimeout(300);
  await page.locator('#tabs [data-tab="journey"]').click(); await page.waitForTimeout(300);
  check("a chosen view is kept while you move around", (await page.locator('#m-views [data-v="galaxy"]').getAttribute("aria-checked")) === "true");
  await page.locator('#m-views [data-v="miles"]').click();
  await shot(page, "journey");
  await axe(page, "Journey");
  check("no sideways scroll on Journey", await noSideways(page));

  // ----- You -----
  await go(page, "you");
  m = await measure(page, "#you");
  check("You: under 120 words on the first screen", m.words < 120, String(m.words));
  check("You: no all-caps labels, no small text", m.caps.length === 0 && m.small.length === 0, [...m.caps, ...m.small].join(" | "));
  const heads = await page.locator("#you h3").allTextContents();
  check("You: short sections, data and privacy first after what's noticed", heads.slice(0, 5).join("|") === "What I've noticed|Your data|Privacy|Your plan|Display", heads.join("|"));
  check("plan details are behind More, and still there", /reminder before any charge/.test(await page.locator("#y-plan").textContent()) && !(await page.locator("#y-plan details").evaluate((d) => d.open)));
  check("settings, privacy and data actions stay on screen", (await page.locator("#y-text").isVisible()) && (await page.locator("#y-game").isVisible()));
  await page.locator("#y-plan summary").click();
  check("More opens the plan details", await page.locator("#y-plan details").evaluate((d) => d.open));
  await shot(page, "you");
  await axe(page, "You");

  // ----- app-wide fixes -----
  await go(page, "world/soul/overview", 1200);
  const crumbs = await page.evaluate(() => [...document.querySelectorAll("#w-crumbs .crumbs button")].map((b) => Math.round(b.getBoundingClientRect().height)));
  check("world breadcrumbs are 44 px targets", crumbs.length >= 2 && crumbs.every((h) => h >= 44), JSON.stringify(crumbs));
  await page.locator("#w-body .w-next").click(); await page.getByRole("button", { name: "Begin" }).click();
  await page.getByRole("button", { name: /Something has been on my mind/ }).click(); await page.getByRole("button", { name: "Continue", exact: true }).click();
  const say = (await page.locator("#x-body").innerText()).match(/Kept on this device, in your words/g)?.length ?? 0;
  await page.fill("#q-words", "When you cancelled I felt let down."); await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.fill("#q-action", "Ask Sam"); await page.fill("#q-when", "Thursday"); await page.getByRole("button", { name: "Continue", exact: true }).click();
  const again = (await page.locator("#x-body").innerText()).match(/Kept on this device, in your words/g)?.length ?? 0;
  check("the privacy line is said once per practice, not on every step", say === 1 && again === 0, `${say}, ${again}`);
  const label = await page.locator("#x-body .qhead .kicker").innerText();
  check("the step label doesn't repeat the title from the breadcrumb", !/The Bridge/.test(label) && /Soul/.test(label), label);
  check("the step label is in normal case", (await page.locator("#x-body .qhead .kicker").evaluate((e) => getComputedStyle(e).textTransform)) === "none");
  await go(page, "knowledge/tree");
  const nsub = await page.evaluate(() => [...document.querySelectorAll(".cw-nsub")].map((e) => parseFloat(getComputedStyle(e).fontSize)));
  check("Tree of Life labels are at least 13 px", nsub.length > 0 && nsub.every((f) => f >= 13), JSON.stringify(nsub.slice(0, 3)));
  await go(page, "creative/kingdom", 2500);
  const hint = await page.locator("#cw-task, .cw-hint").allInnerTexts().catch(() => []);
  check("the Kingdom's hint leads with the one thing to do", (await page.evaluate(() => document.body.innerText)).includes("Tap a lantern to light it. Drag to look around."));
  check("no page errors", errors.length === 0, errors.join(" | "));

  // ----- every width -----
  for (const [w, h] of [[320, 640], [768, 1024], [1440, 900]]) {
    await page.setViewportSize({ width: w, height: h });
    let ok = true;
    for (const r of ["learn", "journey", "you"]) { await go(page, r, 500); ok = ok && await noSideways(page); }
    check(`no sideways scroll on Learn, Journey and You at ${w} px`, ok);
    if (w === 320) { await go(page, "learn", 500); await shot(page, "learn-320"); }
  }

  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-phase5a-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
