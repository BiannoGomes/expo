import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire("/home/user/expo/dawnward/marketing/launch-film/package.json");
const { chromium } = require("playwright-core");
const id = process.argv[2];
const probe = process.argv[3] === "probe";
const DIR = "/home/user/expo/dawnward/marketing/selling-machine";
const FR = probe ? `${DIR}/probe/${id}` : `/tmp/claude-0/reel-${id}`;
mkdirSync(FR, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(`file://${DIR}/complaint-reel.html?id=${id}`);
await page.evaluate(() => document.fonts.ready);
const total = await page.evaluate(() => window.FILM_MS);
const frames = Math.round((total / 1000) * 30);
const shots = probe ? [0, 1500, 2700, 4200, 6500, 8000, 9200, 10500] : [...Array(frames).keys()].map((i) => (i * 1000) / 30);
for (let i = 0; i < shots.length; i++) {
  await page.evaluate(async (ms) => { window.SEEK(ms); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }, shots[i]);
  await page.screenshot({ path: `${FR}/f${String(i).padStart(5, "0")}.jpg`, type: "jpeg", quality: probe ? 82 : 93 });
}
console.log(JSON.stringify({ id, ms: total, frames: shots.length, errors }));
await browser.close();
