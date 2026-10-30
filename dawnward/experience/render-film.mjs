// Renders the film from the experience engine: 1800 frames at 1080x1920.
// Usage: node render-film.mjs [startFrame] [endFrame]   (server on :8770)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const FR = "/tmp/claude-0/film-v6-frames"; mkdirSync(FR, { recursive: true });
const a = Number(process.argv[2] || 0), z = Number(process.argv[3] || 1799);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
await p.goto("http://127.0.0.1:8770/index.html?film=1");
await p.waitForFunction(() => window.FILM_READY === true, null, { timeout: 60000 });
await p.waitForTimeout(1500);
const t0 = Date.now();
for (let i = a; i <= z; i++) {
  await p.evaluate((ms) => { window.SEEK(ms); }, (i * 1000) / 30);
  await p.screenshot({ path: `${FR}/f${String(i).padStart(5, "0")}.jpg`, type: "jpeg", quality: 93 });
  if (i % 150 === 0) console.log(`frame ${i} (${((Date.now() - t0) / 1000) | 0}s)`);
}
console.log(JSON.stringify({ frames: z - a + 1, secs: ((Date.now() - t0) / 1000) | 0, errors: errs.slice(0, 3) }));
await b.close();
