---
name: dawnward-film-render
description: Render, encode and cut Dawnward films from the Living Universe engine deterministically.
---
# Dawnward film render

1. `cd dawnward/experience && npm install && npm run build`
2. Serve: `python3 -m http.server 8770 --bind 127.0.0.1 -d dist` (WebGL refuses file:// images).
3. Probe: `node probe.mjs film 4.5 15.4 35.5 48.5` and look at every frame before a full render.
4. Frames: `node render-film.mjs 0 599 & node render-film.mjs 600 1199 & node render-film.mjs 1200 1799 & wait` (writes `/tmp/claude-0/film-v6-frames`).
5. Audio: `sh film/make-audio.sh`. Encode and cut: `sh film/encode.sh` (master, 30 s, three 15 s hooks, posters).
- Chromium here has no H.264: any video inputs must be VP9 WebM. SwiftShader WebGL is slow but exact.
- QC: contact sheet, black-frame scan (`blackdetect`), ebur128 loudness, determinism in `node qa.mjs`.
