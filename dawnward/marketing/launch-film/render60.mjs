import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const LF = "/home/user/expo/dawnward/marketing/launch-film";
const FR = "/tmp/claude-0/film60-frames";
mkdirSync(FR, { recursive: true });
const FPS = 30, FRAMES = 1800;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(`file://${LF}/film.html`);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => {
  const vids = [...document.querySelectorAll("video")];
  await Promise.all(vids.map((v) => new Promise((res) => {
    v.pause();
    if (v.readyState >= 1) res();
    else v.addEventListener("loadedmetadata", res, { once: true });
  })));
});
await page.waitForTimeout(600);
const t0 = Date.now();
for (let i = 0; i < FRAMES; i++) {
  await page.evaluate(async (ms) => {
    window.SEEK(ms);
    const vids = [...document.querySelectorAll("video")];
    await Promise.all(vids.map((v) => {
      const start = +v.dataset.start;
      const lt = Math.min(Math.max((ms - start) / 1000, 0), (v.duration || 6) - 0.05);
      if (Math.abs(v.currentTime - lt) < 0.001) return;
      return new Promise((res) => {
        v.addEventListener("seeked", res, { once: true });
        v.currentTime = lt;
        setTimeout(res, 1000);
      });
    }));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, (i * 1000) / FPS);
  await page.screenshot({ path: `${FR}/f${String(i).padStart(5, "0")}.jpg`, type: "jpeg", quality: 92 });
  if (i % 200 === 0) console.log(`frame ${i}/${FRAMES} (${((Date.now() - t0) / 1000) | 0}s)`);
}
console.log(`done ${FRAMES} in ${((Date.now() - t0) / 1000) | 0}s`);
await browser.close();
