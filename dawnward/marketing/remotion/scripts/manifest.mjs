// EDL (CMX 3600 style) and a JSON shot manifest from src/film/timeline.ts.
// Run: node --experimental-strip-types scripts/manifest.mjs
import { writeFileSync, mkdirSync } from "node:fs";
const { SHOTS, VO, SFX, SCORE, CARDS } = await import("../src/film/timeline.ts");
const FPS = 30;
const tc = (s) => { const f = Math.round(s * FPS); const p = (n) => String(n).padStart(2, "0"); return `${p(Math.floor(f / 108000))}:${p(Math.floor(f / 1800) % 60)}:${p(Math.floor(f / 30) % 60)}:${p(f % 30)}`; };
mkdirSync("deliver", { recursive: true });
let edl = "TITLE: DAWNWARD FLAGSHIP 60S\nFCM: NON-DROP FRAME\n\n";
SHOTS.forEach((s, i) => {
  const src = s.src ? s.src.split("/").pop() : "GENERATED";
  const inS = s.srcIn || 0;
  edl += `${String(i + 1).padStart(3, "0")}  ${src.slice(0, 8).padEnd(8)} V     C        ${tc(inS)} ${tc(inS + s.to - s.from)} ${tc(s.from)} ${tc(s.to)}\n* SHOT ${s.id}: ${s.note}\n* SOURCE: ${s.src || s.kind} | ${s.provenance}\n\n`;
});
writeFileSync("deliver/flagship-60s.edl", edl);
writeFileSync("deliver/shot-manifest.json", JSON.stringify({ fps: FPS, size: [1080, 1920], shots: SHOTS, narration: VO, cards: CARDS, sfx: SFX, score: SCORE }, null, 2));
console.log(`EDL ${SHOTS.length} events; manifest written`);
