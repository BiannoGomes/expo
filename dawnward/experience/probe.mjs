// QA probe: film frames by time, or interactive frames by story time.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const [mode, ...pts] = process.argv.slice(2);
const OUT = `probe/${mode}`; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const vw = mode === "mobile" ? { width: 390, height: 844 } : mode === "film" ? { width: 1080, height: 1920 } : { width: 1440, height: 900 };
const p = await b.newPage({ viewport: vw, deviceScaleFactor: 1 });
const errs = []; p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto(`http://127.0.0.1:8770/index.html${mode === "film" ? "?film=1" : "?quality=high"}`); // fixed tier: comparable captures
await p.waitForFunction(() => document.documentElement.classList.contains("ready"), null, { timeout: 30000 });
if (mode === "film") await p.waitForFunction(() => window.FILM_READY, null, { timeout: 60000 });
await p.waitForTimeout(800);
for (const x of pts) {
  if (mode === "film") await p.evaluate((ms) => window.SEEK(ms), Number(x) * 1000);
  else {
    const [sv, world] = x.split(":");
    await p.evaluate(([sv, world]) => { window.DW.close(); window.DW.jump(Number(sv)); if (world) { window.DW.select(world); } }, [sv, world]);
    await p.waitForTimeout(world ? 5200 : 1400);
  }
  await p.screenshot({ path: `${OUT}/${x.replace(":", "_")}.jpg`, type: "jpeg", quality: 80 });
}
console.log(JSON.stringify({ mode, shots: pts.length, errorCount: errs.length, firstErrors: errs.slice(0, 2).map((e) => e.slice(0, 200)) }));
await b.close();
