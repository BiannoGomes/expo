// Screenshots of Galaxy Home and a world at every viewport the directive names,
// plus layout facts (overflow, small targets, text over the edge). CSS pixels;
// DPR noted per device. Serve dawnward/experience/dist on :8771 first.
// Usage: NODE_PATH=$(npm root -g) node capture.cjs <outdir>
const { chromium } = require("playwright");
const fs = require("fs");
const out = process.argv[2];
const VPS = [
  ["320x568", 320, 568, 2, true], ["360x800", 360, 800, 3, true], ["390x844", 390, 844, 3, true], ["430x932", 430, 932, 3, true],
  ["tablet-portrait", 820, 1180, 2, true], ["tablet-landscape", 1180, 820, 2, true], ["desktop", 1440, 900, 1, false],
];
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const facts = {};
  for (const [name, w, h, dpr, mobile] of VPS) {
    // screenshots at DPR 1 (software GPU); the device DPR is recorded, not simulated
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    await p.addInitScript(() => { try { localStorage.setItem("dw-home-seen", "1"); } catch {} });
    await p.goto("http://localhost:8771/home.html");
    await p.waitForFunction(() => window.__dwHomeReady, null, { timeout: 30000 });
    await p.waitForTimeout(2500);
    const probe = () => p.evaluate(() => {
      const doc = document.documentElement;
      const small = [...document.querySelectorAll("button, a, [role=radio]")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width && r.height && cs.visibility !== "hidden" && (r.width < 44 || r.height < 44); }).map((e) => (e.id || e.className || e.textContent).toString().slice(0, 24));
      const off = [...document.querySelectorAll("button, a, h1, h2, p, .arc text")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width && cs.visibility !== "hidden" && cs.display !== "none" && (r.right > innerWidth + 1 || r.left < -1); }).map((e) => (e.id || e.textContent).toString().slice(0, 24));
      return { hOverflow: doc.scrollWidth > innerWidth, small: [...new Set(small)].slice(0, 12), offscreen: off.slice(0, 8) };
    });
    facts[`${name} home`] = await probe();
    await p.screenshot({ path: `${out}/${name}-home.png` });
    await p.locator(".planet-mind").evaluate((x) => x.click());
    await p.waitForFunction(() => document.body.classList.contains("closeup-on"), null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(800);
    facts[`${name} mind`] = await probe();
    await p.screenshot({ path: `${out}/${name}-mind.png` });
    await p.close();
  }
  fs.writeFileSync(`${out}/facts.json`, JSON.stringify(facts, null, 1));
  console.log(JSON.stringify(facts, null, 1));
  await b.close();
})();
