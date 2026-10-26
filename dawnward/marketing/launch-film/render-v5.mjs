import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const LF = "/home/user/expo/dawnward/marketing/launch-film";
const args = process.argv.slice(2);
const MODE = args[0] || "full";             // "full" or "probe"
const FR = MODE === "probe" ? `${LF}/probe-v5` : "/tmp/claude-0/film-v5-frames";
mkdirSync(FR, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.goto(`file://${LF}/film3.html`);
await page.evaluate(() => document.fonts.ready);
const meta = await page.evaluate(async () => {
  const vids = [...document.querySelectorAll("video")];
  await Promise.all(vids.map((v) => new Promise((res) => {
    v.pause(); if (v.readyState >= 1) res(); else { v.addEventListener("loadedmetadata", res, { once: true }); setTimeout(res, 3000); }
  })));
  return vids.map((v) => [v.id, v.duration, v.videoWidth]);
});
console.log("videos", JSON.stringify(meta));
await page.waitForTimeout(500);
async function frame(ms, path, q) {
  await page.evaluate(async (ms) => {
    window.SEEK(ms);
    const vids = [...document.querySelectorAll("video")];
    await Promise.all(vids.map((v) => {
      const lt = Math.min(Math.max(+v.dataset.offset + Math.max(ms - +v.dataset.start, 0) / 1000 * +v.dataset.rate, 0), (v.duration || 6) - 0.05);
      if (Math.abs(v.currentTime - lt) < 0.001) return;
      return new Promise((res) => { v.addEventListener("seeked", res, { once: true }); v.currentTime = lt; setTimeout(res, 1000); });
    }));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, ms);
  await page.screenshot({ path, type: "jpeg", quality: q });
}
if (MODE === "range") {
  const [a, b] = args.slice(1).map(Number);
  for (let i = a; i <= b; i++) await frame((i * 1000) / 30, `/tmp/claude-0/film-v5-frames/f${String(i).padStart(5, "0")}.jpg`, 93);
} else if (MODE === "probe") {
  const ts = args.slice(1).map(Number);
  for (const t of ts) await frame(t, `${FR}/t${String(t).padStart(5, "0")}.jpg`, 82);
} else {
  const t0 = Date.now();
  for (let i = 0; i < 1800; i++) {
    await frame((i * 1000) / 30, `${FR}/f${String(i).padStart(5, "0")}.jpg`, 93);
    if (i % 300 === 0) console.log(`frame ${i} (${((Date.now() - t0) / 1000) | 0}s)`);
  }
}
console.log("errors:", errors.length ? errors.join(" | ") : "none");
await browser.close();
