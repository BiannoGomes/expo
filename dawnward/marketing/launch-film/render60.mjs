import { chromium } from "/tmp/claude-0/-home-user-expo/c4969e02-0573-5455-9d7c-fc777b8629a9/scratchpad/node_modules/playwright-core/index.mjs";
import { mkdirSync } from "node:fs";
const LF = "/home/user/expo/dawnward/marketing/launch-film";
const FR = "/tmp/claude-0/film60-frames";
mkdirSync(FR, { recursive: true });
const FPS = 30, FRAMES = 1800;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(`file://${LF}/film.html`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(900);
const t0 = Date.now();
for (let i = 0; i < FRAMES; i++) {
  await page.evaluate((ms) => window.SEEK(ms), (i * 1000) / FPS);
  await page.screenshot({ path: `${FR}/f${String(i).padStart(5, "0")}.jpg`, type: "jpeg", quality: 92 });
  if (i % 200 === 0) console.log(`frame ${i}/${FRAMES} (${((Date.now() - t0) / 1000) | 0}s)`);
}
console.log(`done ${FRAMES} in ${((Date.now() - t0) / 1000) | 0}s`);
await browser.close();
