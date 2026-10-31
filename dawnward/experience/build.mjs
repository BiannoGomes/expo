// Builds dist/ (multi-file site) and dist/dawnward-universe.html (one
// self-contained file: code, fonts, images and score inlined).
import { build, context } from "esbuild";
import { cpSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const watch = process.argv.includes("--watch");
const opts = { entryPoints: ["src/main.js"], bundle: true, format: "iife", minify: !watch, sourcemap: watch, target: ["es2020"], outfile: "dist/app.js", legalComments: "none" };
mkdirSync("dist", { recursive: true });

// Prototype C: the Memory Galaxy page, a second entry sharing fonts and three.
const galaxyOpts = { ...opts, entryPoints: ["src/galaxy-xr.js"], outfile: "dist/galaxy.js" };

function copyStatic() {
  cpSync("index.html", "dist/index.html");
  cpSync("galaxy.html", "dist/galaxy.html");
  cpSync("fonts.css", "dist/fonts.css");
  cpSync("fonts", "dist/fonts", { recursive: true });
  cpSync("assets", "dist/assets", { recursive: true });
}
const mime = { ".webp": "image/webp", ".mp3": "audio/mpeg", ".woff2": "font/woff2" };
function single() {
  const b64 = (p) => `data:${mime[extname(p)]};base64,${readFileSync(p).toString("base64")}`;
  const assets = {};
  for (const dir of ["img", "audio"]) for (const f of readdirSync(join("assets", dir))) assets[`${dir}/${f}`] = b64(join("assets", dir, f));
  let css = readFileSync("fonts.css", "utf8").replace(/url\("(fonts\/[^"]+)"\)/g, (_, p) => `url("${b64(p)}")`);
  let html = readFileSync("index.html", "utf8")
    .replace('<link rel="stylesheet" href="fonts.css">', `<style>${css}</style>`)
    .replace('<script src="app.js"></script>', () => `<script>${readFileSync("dist/app.js", "utf8")}</script>`);
  // the asset map must exist before the text-version script runs
  html = html.replace("<section id=\"story\"", () => `<script>window.DW_ASSETS=(function(m){return function(p){return m[p]||("assets/"+p)}})(${JSON.stringify(assets)});</script><section id="story"`);
  writeFileSync("dist/dawnward-universe.html", html);
  return statSync("dist/dawnward-universe.html").size;
}

if (watch) {
  const ctx = await context({ ...opts, plugins: [{ name: "static", setup(b) { b.onEnd(() => copyStatic()); } }] });
  await ctx.watch();
  console.log("watching src/ -> dist/");
} else {
  const r = await build({ ...opts, metafile: true });
  await build(galaxyOpts);
  copyStatic();
  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  console.log("app.js", kb(statSync("dist/app.js").size), "| galaxy.js", kb(statSync("dist/galaxy.js").size), "| single file", kb(single()));
}
