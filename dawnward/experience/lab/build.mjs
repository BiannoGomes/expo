// Builds the lab prototypes (no new dependencies: the experience's three.js and esbuild).
import { build } from "esbuild";
await build({ entryPoints: ["src/a-holo.js", "src/b-transition.js", "src/c-constellation.js"], bundle: true, minify: true, format: "esm", outdir: "dist", target: "es2022", metafile: false, logLevel: "info" });
