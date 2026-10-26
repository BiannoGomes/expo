import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const LF = process.cwd();
const OUT = `${LF}/probe-v4`;
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(`file://${LF}/film2.html`);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => {
  const vids = [...document.querySelectorAll("video")];
  await Promise.all(vids.map((v) => new Promise((res) => {
    v.pause();
    if (v.readyState >= 1) res();
    else { v.addEventListener("loadedmetadata", res, { once: true }); setTimeout(res, 2500); }
  })));
  console.log(JSON.stringify(vids.map((v) => [v.id, v.duration, v.videoWidth])));
});
const vmeta = await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => [v.id, v.duration, v.videoWidth]));
console.log("videos:", JSON.stringify(vmeta));
for (const t of [1500, 5600, 8800, 16000, 22600, 27900, 33000, 35600, 37600, 42000, 44300, 50500, 54000, 58000]) {
  await page.evaluate(async (ms) => {
    window.SEEK(ms);
    const vids = [...document.querySelectorAll("video")];
    await Promise.all(vids.map((v) => {
      const start = +v.dataset.start;
      const lt = Math.min(Math.max((ms - start) / 1000, 0), (v.duration || 6) - 0.05);
      return new Promise((res) => { v.addEventListener("seeked", res, { once: true }); v.currentTime = lt; setTimeout(res, 1200); });
    }));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, t);
  await page.waitForTimeout(90);
  await page.screenshot({ path: `${OUT}/t${String(t).padStart(5, "0")}.jpg`, type: "jpeg", quality: 85 });
}
console.log("probed");
await browser.close();
