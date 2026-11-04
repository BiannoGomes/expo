// The return loop, from the council's verdict (2 Nov 2026): a newcomer is told what this is for in plain
// words; a planned action can go into their own calendar as a file (no server, nothing sent); Home asks
// "How did it go?" and offers the reminder again; You says how to stop the browser clearing what's kept;
// Dawnward can be installed (manifest + icons) so iPhone Safari doesn't clear it after 7 days.
// Serve dawnward/experience/dist on :8771 first. Run with NODE_PATH=$(npm root -g).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const AXE = fs.readFileSync(path.join(__dirname, "../../../experience/node_modules/axe-core/axe.min.js"), "utf8");
const BASE = (process.env.DW_URL || "http://localhost:8771/home.html").replace(/#.*$/, "");
const ORIGIN = new URL(BASE).origin + new URL(BASE).pathname.replace(/[^/]*$/, "");
const results = { when: new Date().toISOString(), checks: [], axe: {} };
const check = (name, ok, detail = "") => { results.checks.push({ name, ok: Boolean(ok), detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };
async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}×${v.nodes.length}`));
  results.axe[label] = r; check(`axe: ${label}`, r.length === 0, r.join(", "));
}
const ready = (p) => p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
const go = async (p, hash, wait = 800) => { await p.goto("about:blank"); await p.goto(BASE + "#/" + hash); await ready(p); await p.waitForTimeout(wait); };
const cont = (p) => p.getByRole("button", { name: "Continue", exact: true }).click();

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e)));

  // ----- a first visit -----
  await go(page, "home", 1000);
  const body = page.locator("#e-body");
  const welcome = await body.locator(".e-welcome").innerText().catch(() => "");
  check("a newcomer is told what it's for, in plain words, and how long", (await page.locator("#e-title").innerText()) === "Going back and forth on something?" && /about 8 minutes/.test(welcome), welcome);
  check("…that they can stop and come back, and that their words stay on this phone", /Stop any time/.test(welcome) && /stays on this phone/.test(welcome));
  check("…and the one suggestion is the decision practice", /Beyond Overthinking/.test(await body.locator(".nextcard").innerText()));
  check("still one primary action", (await body.locator(".primary").count()) === 1);
  check("a first visit shows the five-world planet behind Home", await page.evaluate(() => document.getElementById("earth").classList.contains("newcomer") && /HM-1/.test(getComputedStyle(document.getElementById("earth")).getPropertyValue("--e-art"))));
  await axe(page, "Home, first visit");
  await page.setViewportSize({ width: 320, height: 568 }); await page.waitForTimeout(300);
  check("320 px: the Begin button is visible without scrolling", await page.evaluate(() => { const b = document.querySelector("#e-body .nextcard .primary").getBoundingClientRect(); const t = document.getElementById("tabs").getBoundingClientRect(); return b.bottom <= Math.min(innerHeight, t.top); }));
  await page.setViewportSize({ width: 390, height: 844 });

  // ----- a practice with an action, then Remind me -----
  await go(page, "world/body/overview", 1000);
  await page.locator("#w-body .w-next").click();
  await page.waitForSelector("#x-body .s-title");
  await page.getByRole("button", { name: "Begin" }).click();
  await page.fill("#q-words", "Tired shoulders."); await cont(page);
  await page.fill("#q-words", "Going to bed earlier."); await cont(page);
  await page.fill("#q-action", "Phone in the kitchen, at night; then sleep");
  await page.fill("#q-when", "Tuesday night");
  await cont(page);
  await page.waitForFunction(() => /Done/.test(document.querySelector("#x-body .s-title")?.textContent ?? ""), null, { timeout: 15000 });
  const remind = page.getByRole("button", { name: "Remind me", exact: true });
  check("Done offers Remind me when an action was chosen", (await remind.count()) === 1);
  await remind.click();
  const dlg = page.getByRole("dialog", { name: "Remind me" });
  check("a sheet asks for the day and time, defaulting to tomorrow at 9", (await dlg.count()) === 1 && (await page.inputValue("#rm-time")) === "09:00" && /^\d{4}-\d{2}-\d{2}$/.test(await page.inputValue("#rm-date")));
  check("it says nothing is sent anywhere", /Nothing is sent anywhere/.test(await dlg.innerText()));
  check("no stray \"null\" text in the sheet", !/\bnull/.test(await dlg.innerText()));
  check("the sheet shows the reminder mark, and focus lands on its title, not the date field (no picker popping open)", await page.evaluate(() => { const m = document.querySelector(".rm-mark"); return !!m && m.complete && m.naturalWidth > 0 && document.activeElement?.id === "rm-h"; }));
  await axe(page, "the Remind me sheet");
  await page.fill("#rm-date", "2026-11-10"); await page.fill("#rm-time", "21:30");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Save to my calendar" }).click()]);
  const ics = fs.readFileSync(await dl.path(), "utf8");
  check("the file is a calendar file named for Dawnward", dl.suggestedFilename() === "dawnward-reminder.ics" && /^BEGIN:VCALENDAR\r\n/.test(ics) && /END:VCALENDAR\r\n$/.test(ics));
  check("the event is on the chosen day and time, local", /\r\nDTSTART:20261110T213000\r\n/.test(ics) && /\r\nDTEND:20261110T220000\r\n/.test(ics), (ics.match(/DTSTART:[^\r]*/) || [""])[0]);
  check("the action is in it, with commas and semicolons escaped", ics.includes("SUMMARY:Dawnward: Phone in the kitchen\\, at night\\; then sleep"));
  check("lines are folded at 75 octets", ics.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75));
  check("it links back to Dawnward's Home", ics.replace(/\r\n /g, "").includes(`URL:${ORIGIN}home.html#/home`) || ics.replace(/\r\n /g, "").includes("#/home"));
  check("it has an alert at the start", /BEGIN:VALARM[\s\S]*TRIGGER:PT0M[\s\S]*END:VALARM/.test(ics));
  check("the sheet closes and focus returns to Remind me", (await dlg.count()) === 0 && await page.evaluate(() => document.activeElement?.id === "x-remind"));

  // ----- Home: how did it go, and the reminder again; the welcome is gone -----
  await go(page, "home");
  const homeText = await body.innerText().catch((e) => "ERR " + e.message);
  check("Home asks how it went", /How did it go\?/.test(homeText) && /Phone in the kitchen/.test(homeText), homeText.slice(0, 300).replace(/\n/g, " / ") + " | place=" + await page.evaluate(() => document.body.dataset.place + " " + location.hash));
  check("…and offers the calendar reminder there too", (await page.getByRole("button", { name: "Remind me in my calendar" }).count()) === 1);
  // ----- How did it go?: four outcomes as tiles, the note optional, "Not yet" counts like any other -----
  await page.locator("#e-body .e-wait").click();
  await page.waitForSelector(".x-tiles");
  check("How did it go? offers four outcomes as tiles", (await page.locator(".x-tiles [role=radio]").count()) === 4 && (await page.getByRole("radio", { name: "I changed my mind" }).count()) === 1 && (await page.getByRole("radio", { name: "Not yet" }).count()) === 1);
  check("…with the coming-back painting behind it", /RV-1/.test(await page.locator("#x-art img").getAttribute("src").catch(() => "")) && await page.evaluate(() => !document.getElementById("x-art").hidden));
  await axe(page, "How did it go?");
  await page.getByRole("radio", { name: "Not yet" }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForFunction(() => /Thank you for coming back/.test(document.getElementById("x-body")?.innerText ?? ""), null, { timeout: 15000 });
  check("Not yet, with no note, is saved and thanked", /Not yet is fine/.test(await page.locator("#x-body").innerText()));
  await go(page, "home");
  check("after a practice, Home is Earth again (not the first-visit planet)", await page.evaluate(() => !document.getElementById("earth").classList.contains("newcomer") && /E1/.test(getComputedStyle(document.getElementById("earth")).getPropertyValue("--e-art"))));
  check("the first-visit welcome is gone once you've begun", (await body.locator(".e-welcome").count()) === 0 && (await page.locator("#e-title").innerText()) === "Where will you grow today?");

  // ----- You: keeping it safe -----
  await go(page, "you");
  const keep = page.locator("#y-keep");
  check("You says how to keep what's here from being cleared", (await keep.isVisible()) && /save a copy as a file/.test(await keep.innerText()), await keep.innerText().catch(() => ""));
  const iphone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" });
  const ip = await iphone.newPage(); ip.on("pageerror", (e) => errors.push(String(e)));
  await go(ip, "you");
  check("on iPhone it explains the 7 days and Add to Home Screen", /7 days/.test(await ip.locator("#y-keep").innerText()) && /Add to Home Screen/.test(await ip.locator("#y-keep").innerText()));
  await iphone.close();

  // ----- installable -----
  const mf = await page.evaluate(async () => { const href = document.querySelector('link[rel="manifest"]')?.href; const r = await fetch(href); return { ok: r.ok, json: await r.json() }; });
  check("the manifest loads, standalone, starting at Home", mf.ok && mf.json.display === "standalone" && /home\.html#\/home/.test(mf.json.start_url) && mf.json.name === "Dawnward");
  const icons = await page.evaluate(async () => Promise.all(["assets/icons/icon-192.png", "assets/icons/icon-512.png", document.querySelector('link[rel="apple-touch-icon"]').getAttribute("href")].map(async (u) => (await fetch(u)).ok)));
  check("icons and the Home Screen icon load", icons.every(Boolean), JSON.stringify(icons));

  check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
  const failed = results.checks.filter((c) => !c.ok).length;
  results.summary = { total: results.checks.length, failed };
  fs.writeFileSync(path.join(__dirname, "e2e-return-results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed}/${results.checks.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
