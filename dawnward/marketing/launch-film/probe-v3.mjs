import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const LF = "/home/user/expo/dawnward/marketing/launch-film";
const OUT = `${LF}/probe-v3`;
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.log("[err]", e.message.slice(0, 160)));
await page.goto(`file://${LF}/film.html`);
await page.evaluate(() => document.fonts.ready);
const vd = await page.evaluate(async () => {
  const vids = [...document.querySelectorAll("video")];
  await Promise.all(vids.map((v) => new Promise((res) => {
    v.pause();
    if (v.readyState >= 1) res();
    else { v.addEventListener("loadedmetadata", res, { once: true }); setTimeout(res, 2500); }
  })));
  return vids.map((v) => [v.id, v.duration, v.videoWidth]);
});
console.log("videos:", JSON.stringify(vd));
for (const t of [6500, 9000, 24500, 29000, 39200, 44500, 47800, 53000]) {
  await page.evaluate(async (ms) => {
    window.SEEK(ms);
    const vids = [...document.querySelectorAll("video")];
    await Promise.all(vids.map((v) => {
      const start = +v.dataset.start;
      const lt = Math.min(Math.max((ms - start) / 1000, 0), (v.duration || 6) - 0.05);
      return new Promise((res) => { v.addEventListener("seeked", res, { once: true }); v.currentTime = lt; setTimeout(res, 1200); });
    }));
  }, t);
  await page.waitForTimeout(90);
  await page.screenshot({ path: `${OUT}/t${String(t).padStart(5, "0")}.jpg`, type: "jpeg", quality: 85 });
}
console.log("probed");
await browser.close();
