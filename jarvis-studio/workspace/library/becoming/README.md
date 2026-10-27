# Becoming motion library

The shared foundation for every BIANNO | THE BECOMING PROJECT motion piece: tokens, type, the gold line, word-by-word
captions, code-drawn sea plates, grain, the Night Watch score and the build gates. Pieces are HyperFrames 0.8.97
compositions (HTML + CSS + SVG + GSAP 3.14.2, one paused timeline), rendered offline to H.264 1080×1920 at 30 fps, then
scored, mixed and checked.

**Status: first draft, 27.10.2026.** The tokens are **PROPOSED**: the de facto values from Reel 01 v5 (the build Bianno
liked on 06.10.2026), as recorded in `brands/becoming-project/MOTION.md` field 1. The vault's tokens CSS is canonical
and hasn't been read; when it is, it wins. Bianno confirms or replaces the palette, the type sizes and the safe zone.

Everything committed here is synthetic or licensed for redistribution. His photos, videos and voice never go in this
folder (or anywhere in the public repo); renders that use them stay in the local scratchpad.

## What's here

```
README.md               this file
.gitignore              renders/, review/, snapshots/, *.mp4, *.mov, *.wav, *.webm, node_modules/
tokens.css              @font-face, palette custom properties, type-role classes, plate/scrim/caption/mark classes
tokens.json             the same tokens as data (+ timing grammar); a test keeps it equal to BM.color / BM.timing
fonts/                  woff2 (latin subset) + SIL OFL 1.1 texts, see "Fonts"
vendor/gsap.min.js      GSAP 3.14.2 core, licence header intact; provenance in vendor/README.md
lib/becoming-motion.js  the picture runtime, global BM (API below)
lib/night-watch.js      the house score as a browser module, global NightWatch
tools/                  build.sh (the pipeline) · night-watch-render.mjs · mix.sh · audio-qa.mjs (see each file's header)
templates/hello/        the end-to-end proof piece (synthetic, 8 s): index.html, data.json, cue.json, README.md
```

## Machine setup

The scripts never hard-code machine paths. They read these variables and fall back to the defaults shown.

| Variable | Used by | Default |
|---|---|---|
| `HF_CMD` | build.sh | `npx --offline hyperframes@0.8.97` (pinned: a bare `npx --offline hyperframes` asks for 0.8.98 and fails) |
| `HYPERFRAMES_BROWSER_PATH` | HyperFrames | its own browser resolution |
| `PLAYWRIGHT_MODULE` | night-watch-render.mjs | `/opt/node22/lib/node_modules/playwright` |
| `CHROMIUM_PATH` | night-watch-render.mjs | `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` |
| `BECOMING_OUT` | build.sh | `<composition-dir>/renders` (gitignored). Set it per build to keep renders outside the repo |
| `MOTION_REVIEW_SCRIPTS` | build.sh | `jarvis-studio/skills/motion-review/scripts`, found relative to `tools/` |
| `BECOMING_BRAND_DIR` | build.sh (brand-lint) | `jarvis-studio/workspace/brands/becoming-project`, found relative to `tools/` |
| `BECOMING_VOICE`, `BECOMING_VOICE_AT` | build.sh | unset: score-only mix. Set to a voice WAV (and its start in seconds) for the voice path and the duck gate |
| `FFMPEG`, `FFPROBE`, `NODE` | build.sh, mix.sh, audio-qa.mjs | `ffmpeg`, `ffprobe`, `node` on `PATH` (Node 22, ffmpeg 6.1 here) |
| `TARGET_LUFS`, `CEILING_DBTP`, `SCORE_HP`, `DUCK_DB`, … | mix.sh | see the header of `tools/mix.sh` (−14 LUFS, −1.5 dBTP, 140 Hz, 13 dB, …) |

On the Claude sandbox, `source <scratchpad>/creative-system/env.sh` sets all of them (it also sources the HyperFrames
sandbox env: Node 22 on `PATH`, the npm cache holding hyperframes 0.8.97, no telemetry, no skills install). It does
not set `BECOMING_OUT`, because that is per build.

Never pass `--browser-gpu` on a machine without a GPU: it exits 0 but silently renders with WebGL missing. The default
(SwiftShader on the CPU) is what was proven deterministic.

## Building a piece

1. **Folder.** A composition folder holds `index.html`, `cue.json` (the score) and usually `data.json` (copy, word
   times, geometry). Start from `templates/hello/`. `tools/build.sh` copies the folder into `<out>/stage/` and adds
   `tokens.css`, `fonts/`, `vendor/` and `lib/` beside `index.html`, unless the folder has its own. Paths are
   root-relative because HyperFrames lint rejects `../` asset paths (`invalid_parent_traversal_in_asset_path`). To
   open a folder in HyperFrames preview by hand, symlink those four in (symlinks were rendered and work) or copy them.
2. **Contract.** One root element with `data-composition-id="main"`, `data-duration`, `data-fps="30"`,
   `data-width="1080" data-height="1920"`; one paused GSAP timeline registered last as `window.__timelines["main"]`;
   seeded randomness only (`BM.rng`); no wall clock (no `requestAnimationFrame`, `Date`, `performance.now`, timers);
   canvases painted from composition time through `BM.onTime`. `cue.json`'s `duration` must equal `data-duration`
   (build.sh checks).
   **Make the state at t independent of seek history.** HyperFrames splits frames across workers, and each worker
   seeks in its own order. A GSAP `fromTo(..., {immediateRender: false})` leaves an element untouched until its first
   render, so a fresh page and a page that has already been seeked past the tween differ: `transform: none` versus
   `translate(0px, 0px)`. That alone changed how the gold line's ends rasterised, between renders. If an element is
   visible before its first transform tween, set that transform at build time (`gsap.set(el, {y: 0})`). Hello does
   this for the line layer and the plate. Prefer `fromTo` to `to`, whose start value is read at its first render.
3. **Data.** Hello reads `data.json` with a synchronous XHR before it builds the timeline, so the timeline exists
   when the renderer asks for it. This worked in lint, check and render. brand-lint reads only
   `.html/.css/.js`, so build.sh also lints every string in the folder's JSON files (see the gates).
4. **Skeleton.**

   ```html
   <link rel="stylesheet" href="tokens.css" />
   <script src="vendor/gsap.min.js"></script>
   <script src="lib/becoming-motion.js"></script>
   …
   <div id="root" class="bm-frame" data-composition-id="main" data-start="0" data-duration="8" data-fps="30" data-width="1080" data-height="1920">
     <canvas id="sea" class="bm-plate" width="1188" height="2112"></canvas>
     <div class="bm-scrim"></div>
     <canvas id="grain" class="bm-grain"></canvas>
     <svg id="lines" class="bm-lines" viewBox="0 0 1080 1920" width="1080" height="1920" aria-hidden="true"></svg>
     <div id="hook" class="bm-hook" style="top: 600px"></div>
     <div id="caps" class="bm-captions"></div>
     <div id="end" class="bm-layer"></div>
   </div>
   <script>
     var tl = gsap.timeline({ paused: true });
     BM.track(tl);
     BM.onTime(BM.seaPlate("#sea", { seed: 11, glow: "dawn" }));
     BM.onTime(BM.grain("#grain", { seed: 5 }));
     tl.fromTo("#sea", { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power1.out", immediateRender: false }, 0);
     var line = BM.goldPath("#lines", "horizon", BM.wob(160, 1010, 1180, { rng: BM.rng(7) }));
     BM.drawOn(tl, line, 0.3, 2.3);
     BM.revealWords(tl, "#hook", "Become the man you would be *proud* to meet.", { at: 0.8 });
     BM.captions(tl, "#caps", words);              // [{text, start, end}] from the voice timing
     BM.mark("#end", { at: 6.4, tl: tl });
     tl.set({}, {}, 8);
     window.__timelines = window.__timelines || {};
     window.__timelines["main"] = tl;
   </script>
   ```
5. **Build.** `tools/build.sh <composition-dir> [--draft]` (next section). Then read `review/index.md` and every image
   it lists, run the fresh-eyes critic (`jarvis-studio/agents/motion-critic.md`), and stop for Bianno. Nothing is
   published by any script here.

## The pipeline and its gates (`tools/build.sh`)

```
BECOMING_OUT=/outside/the/repo/<name> tools/build.sh <composition-dir> [--draft]
```

It prints one `PASS`/`FAIL` line per gate, then `RESULT: PASS|FAIL` and the MP4 path, and writes the same lines to
`<out>/review/gates.txt`. Exit 0 means every gate passed, 1 means a gate failed, 2 means a usage error (for example a
missing `cue.json`). The first six gates make the file, so a failure there stops the build. The last four judge the
file; all of them run, and all of them count.

| # | Gate | Command | Passes when |
|---|---|---|---|
| 1 | lint | `$HF_CMD lint . --verbose` (in the stage) | 0 errors |
| 2 | check | `$HF_CMD check .` | exit 0: runtime, layout, motion and WCAG AA contrast all clean |
| 3 | render | `$HF_CMD render . -o silent.mp4 --fps 30 --quality looks` (`--draft`: `--quality draft`) | the stream is h264 1080×1920 30/1 |
| 4 | score | `node tools/night-watch-render.mjs cue.json score.wav --json` | the WAV is written; cue `duration` = `data-duration` |
| 5 | mix | `tools/mix.sh [--voice V --voice-at S --stems mix.stems] score.wav mix.wav` | mix.sh's own check: −14 ±0.5 LUFS, ≤ −1.0 dBTP |
| 6 | mux | `ffmpeg -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart` | `<out>/<name>.mp4` is written |
| 7 | review-frames | `review-frames.mjs <mp4> --platform becoming --out review/` | the sheets and `index.md` exist. **The gate cannot look: you must read them** |
| 8 | spec-check | `spec-check.mjs <mp4> --platform reels` | no FAIL (warnings are listed) |
| 9 | brand-lint | `brand-lint.mjs stage/ --brand … --motion …`, plus the same on `copy-lint/index.html` | no violation in the composition, and none in its runtime copy (every string in the folder's JSON files, except `$`-keys and cue/meta/hyperframes.json, with each array's strings also joined) |
| 10 | audio-qa | `node tools/audio-qa.mjs <mp4> --json review/audio-qa.json [--stems mix.stems]` | −14 ±0.5 LUFS, ≤ −1.0 dBTP, band below 60 Hz ≥ 18 dB under 150 Hz–4 kHz; with a voice, the score ducks 12–15 dB and the voice stem sits at −16 ±1 LUFS |

Outputs in `<out>`: `<name>.mp4` (the final), `silent.mp4`, `score.wav`, `mix.wav` (+ `mix.stems/` with a voice),
`stage/` (the build copy), `copy-lint/`, `logs/<gate>.txt`, and `review/` (contact sheets, `index.md`,
`spec-check.json`, `brand-lint.json`, `brand-lint-copy.json`, `audio-qa.json`, `gates.txt`). The mix stems contain the
real voice when one is used, so keep `BECOMING_OUT` outside the repo for those builds (the `.gitignore` also excludes
`*.wav`).

Checked on 27.10.2026 with the gates themselves:
- `templates/hello` passes all ten.
- A copy that calls `Math.random()` stops at lint (`non_deterministic_code`) with exit 1.
- A copy with no `cue.json` exits 2.
- A copy whose `data.json` hook reads "B I A N N O …" renders, then fails brand-lint (`name-on-frame`, caught only by
  the runtime-copy pass) with exit 1.

## The score: Night Watch (`lib/night-watch.js`, `tools/night-watch-render.mjs`)

The house score is extracted from Jarvis Studio's `renderWatch()` with the synthesis code unchanged. It runs in
headless Chromium (OfflineAudioContext) and writes 16-bit, 48 kHz stereo, already mastered to about −14.2 LUFS.

Cue format (`cue.json`):

| Field | Meaning | Default |
|---|---|---|
| `kind` | `"watch"`; any other value is rejected | `"watch"` |
| `duration` | seconds (required); must equal the composition's `data-duration` | — |
| `turns` | `[t, …]`: on each turn the tick races in, stops dead 0.42 s before `t`, and the hit lands on `t` | `[]` |
| `card` | `[start, end]` or `null`: the title card gets the biggest hit (D bell), no tick or heartbeat under it, and a D major pad | `null` |
| `land` | seconds or `null`: the landing sting E-D-A, with a soft low D at `land + 0.64`; the tick slows to silence after it | `null` |
| `fade` | seconds of fade-out at the end | 1.4 under 20 s, else 2.5 |
| `stingAt` | when the opening sting A-E-D starts; `null`/`false` means no sting. Put it on the frame where the gold light ignites | 0 |
| `tickFrom` | when the first tick sounds | 0.9 |
| `ticks`, `heartbeat`, `pad`, `sea`, `hits` | layer toggles; turning one off never changes another layer's texture | `true` |

Hello's cue: `{"kind":"watch","duration":8,"turns":[5.8],"card":null,"land":6.4,"fade":1.4,"stingAt":0.05}`. The
sting starts at 0.05, the dead stop runs from 5.38, the hit lands at 5.8 and the landing sting at 6.4.

Regression, re-run on 27.10.2026: the THE-BEGINNING-shaped cue
`{"kind":"watch","duration":55.5,"turns":[16.95,21.7,45.4,50.8],"card":[45.4,50.8],"land":51.4,"fade":2.5}` renders
to −14.24 LUFS and −1.13 dBTP, with the band below 60 Hz 27.6 dB under 150 Hz–4 kHz. The v4 studio score
(`v4-night-watch-score.wav`) gives the same readings. The RMS of the dead-stop windows is −55.08 / −40.72 / −54.89 dB
at 16.55, 21.30 and 45.0 s (+0.38 s each), against −55.08 / −40.72 / −54.89 for v4. The second stop is higher in v4
too, because the first hit's bell rings through it. The render is not bit-identical run to run: Chromium's offline
audio varies by 2–4 LSB at 16-bit (about −102 dBFS), and today's studio code shows the same variation against v4. So a
final MP4's audio stream, and therefore its whole-file hash, changes between builds. Only the video stream is
reproducible, so determinism checks hash `-map 0:v` only.

## Mix, master and audio QA (`tools/mix.sh`, `tools/audio-qa.mjs`)

- **Score-only path:** the score is high-passed at 140 Hz (the house 150 Hz rule, set just under the landing low D
  at 146.8 Hz so the sting stays), then mastered.
- **Voice path** (`--voice`): the voice is high-passed at 80 Hz and set to −16 LUFS. The score is ducked 13 dB on every
  band, with 2 dB more at 2–5 kHz, keyed by a speech gate with 40 ms look-ahead. That bounds its drop under speech to
  13–15 dB.
- **Master:** high-pass 60 Hz, −14 LUFS integrated, a 4× oversampled true-peak limiter at −1.5 dBTP (AAC adds about
  0.25 dB), 48 kHz.
- **audio-qa:** measures with ffmpeg ebur128 and the band filters of the audit's score-band probe. It prints a table,
  a `RESULT:` line and one JSON line, and exits 1 on any FAIL.

The voice path has been tested only with a synthetic voice stem, never with a real one. The headers of both scripts
list every option and variable.

## The picture runtime, `BM`

Depends only on GSAP. Every scheduling helper takes the composition's timeline first.

| Call | What it does |
|---|---|
| `BM.rng(seed)` | mulberry32, floats in [0, 1). Same algorithm as Jarvis Studio's `rng()` |
| `BM.wob(x0, x1, y, {step=16, amp=2.6, rng})` | v5 `wob()`: a hand-drawn horizontal line, a point every 16 px jittered ±2.6 px |
| `BM.poly(points, {step=14, amp=2.2, rng})` | v5 `poly()`: resample a polyline every ~14 px, jitter ±0.6 px along and ±2.2 px across |
| `BM.pathD(points)` · `BM.pathLength(points)` | v5 `dstr()` / `plen()`: the `d` string and the length, computed (no DOM measuring) |
| `BM.goldPath(svg, id, points, {color, width=4, opacity=1})` | v5 `path()`: a round-capped gold `<path>` with dasharray `L L+40`, hidden by a dashoffset of `ceil(L) + 2` (attribute and style alike) and ready to draw |
| `BM.drawOn(tl, path, at, duration, ease='power2.out', {from, to})` | draw on by `strokeDashoffset`; `from`/`to` are drawn fractions (0→1 by default) so a line can draw in stages. Uses `autoRound: false`: GSAP otherwise rounds the offset to whole pixels, so a hidden offset of `L` rounds below `L` and leaves a stray round-cap dot |
| `BM.revealWords(tl, box, text, {at, times, stagger=.12, y=14, dur=.22, lead=.06})` | one span per word rising from y 14 over .22 s power2.out; `times` = spoken times (each rise starts .06 s early, as v5); `*word*` = italic pale-gold emphasis; `\n` = line break |
| `BM.chunkWords(words, {maxWords=4, breakBefore, hide})` | v5 caption chunking as a pure function (phrases end at `, . … ? ; :`, chunks ≤ 4 words, balanced) |
| `BM.captions(tl, box, words, opts)` | v5 captions: chunk in .18 s from y 10 at its first word −.1 s, out .16 s by min(last end + .7, next start − .04); each word flashes pale gold .08 s from its start −.03 s and settles to ink over .25 s from its end +.02 s |
| `BM.seaPlate(canvas, {seed, horizonY=1180, glow, density, glowX, stars, swell})` | code-drawn dark sea (`glow` = `'dawn'`, `'moon'` or `'none'`), a pure function of time: swell lines drift, glints sparkle and sway. Returns `draw(t)` |
| `BM.grain(canvas, {seed, amount=.05, scale=2})` | film grain, soft-light, new pattern every frame from `hash(seed, round(t·30))`. Returns `draw(t)` |
| `BM.shader(canvas, frag, {uniforms, alpha})` | minimal WebGL1 quad (`u_time`, `u_res` + yours), `preserveDrawingBuffer`. Returns `draw(t, extra)`; `draw.ok` is false without WebGL |
| `BM.onTime(fn)` | calls `fn(t)` on every frame: the runtime's `hf-seek` event (renders, snapshots) plus the `onUpdate` of every timeline given to a BM helper or `BM.track` (preview playback). Paints t = 0 at once; returns an unsubscribe |
| `BM.mark(box, {at, y=1450, tl})` | the end mark "THE BECOMING PROJECT" (Inter 24 px, .5em, gold) fading in over .9 s |
| `BM.track(tl)` · `BM.seek(t)` | bind a timeline to the canvases · drive every painter by hand (tests) |
| `BM.color` · `BM.timing` · `BM.safe` · `BM.plate` | the tokens (`tokens.json`) |
| `BM.rgba(token, a)` · `BM.mix(a, b, t)` | a token with alpha · a blend of two tokens (gradient stops) |

Notes:
- GSAP's `power2` is a cubic curve (`power1` is quadratic). The measured line extents in the proof match the cubic.
- The plate canvas is 1188×2112 at (−54, −96) like v5, so a 1.00 → 1.07 push never shows an edge. `seaPlate` puts the
  canvas's `transform-origin` on the horizon, so a push keeps a gold line drawn on the horizon in place.
- The default `rng` for `wob`/`poly` is one stream seeded 7 (as v5), so results depend on call order. Pass
  `{rng: BM.rng(n)}` to make a line independent of everything drawn before it.

## Grammar (decision 6 of the foundation spec; values in `tokens.json`)

- Eases: power1/power2/power3 `.out`/`.inOut`, sine; `.in` only for exits; `none` for pushes. Never bounce, elastic,
  back or an overshooting bezier; never scale from zero; no per-letter reveals; no letter-spacing tweens; no text
  gradients; no lens flares; no decorative particles; no glow.
- Text in 0.6–0.9 s. Hook words .22 s from y 14. Captions ≤ 4 words, in .18 s, out .16 s, flash .08 s, settle .25 s.
- Plates in .8 s power1.out, push 1.00 → 1.07 linear, out .7 s. Dip to black .5 s between unrelated states.
- The gold line: `#D8A45F`, 4 px (3 px secondary), round caps and joins, drawn on. It begins constrained, reaches the
  edge, and extends beyond it. It doesn't explode; it continues. One behaviour per movement.
- Type: Cinzel caps for titles and keywords (500, .12–.18em); Cormorant Garamond for the hook (500 96 px), body
  (400 74 px), italic emphasis in pale gold and captions (600 64 px); Inter tracked caps for labels and the mark.
- Safe zone: text inside x 80–940, y 250–1500 (the repo's `becoming` preset). Text blocks fill it, so centred text
  sits on x 510. Captions sit at y 1330–1490; the mark at y 1450.
- Legibility comes from the scrim. Text shadows are dark with a blur of 2 px or less (brand-lint reads 3 px or more as
  glow, whatever the colour).
- One accent per frame: the gold. Never his name on a frame, spaced or not; the mark is "THE BECOMING PROJECT".

## Grain and file size

Noise that changes every frame is the one thing an encoder can't compress. Measured on the 3 s proof at HyperFrames'
default CRF 16 (file sizes in bytes / 10^6): 0.82 MB without grain; 49.1 MB with an early full-resolution grain;
**7.5 MB with the default grain** (half resolution, soft-light, amount .05), about 19.9 Mbit/s. A 60 s piece at that
rate is about 150 MB, inside the 300 MB Reels limit. The default grain lifts the dark sky by about 0.5 of a level
(8-bit), has a standard deviation of about 1 level there and about 4 levels in the brighter band over the horizon, and
its pattern is uncorrelated from one frame to the next (correlation 0.09). If a long piece runs heavy, lower `amount`
before raising CRF.

## Determinism

Proven on 27.10.2026 with a 3 s scratch composition using every runtime piece (plate, grain, line, hook, captions,
mark): two renders gave the same video-stream MD5 and the same file SHA-256, and all 90 decoded frames matched. The
painters are pure functions of t (a plate painted at t = 1.5 after other times is identical to a fresh one). A WebGL
probe through `BM.shader` + `BM.onTime` drew a bar exactly t/1 s of the frame wide on every frame checked. Evidence is
kept in the local scratchpad (`creative-system/foundation-test/`), not in the repo.

The full pipeline was proven with `templates/hello` (8 s, every runtime piece plus the score). Three complete
`tools/build.sh` runs gave the same video-stream MD5 (`ffmpeg -i hello.mp4 -map 0:v -f md5 -`) and the same
`silent.mp4` SHA-256, and all 240 decoded frames matched (`framemd5`). Four extra lossless renders (`--crf 0`) of the
same build were also identical frame for frame. The audio streams differed, as expected (see "The score"). Hello's
final MP4 is 19.1 MB for 8 s (about 19 Mbit/s, mostly grain).

That determinism had to be earned. Earlier versions of hello rendered differently from run to run, in a few pixels,
on a few frames. Lossless renders found three causes:
- **Seek history.** HyperFrames gives each of its two workers alternate frames, so each page reaches a time from a
  different past. An element that a `fromTo(..., {immediateRender: false})` had not yet touched kept `transform: none`
  on a fresh page but had `translate(0px, 0px)` on a page already seeked past the tween. That changed how the line's
  stroke ends rasterised. Fix: set such transforms at build time (`gsap.set`), as in "Building a piece".
- **GSAP rounding.** GSAP rounds pixel CSS values by default (`autoRound`). A hidden dashoffset of `L` became `round(L)`,
  which can be less than `L`, so a stray round-cap dot appeared on some pages and not on others. Fixed in `BM.goldPath` /
  `BM.drawOn` (hidden offset `ceil(L) + 2`, `autoRound: false`).
- **An SVG `<circle>` moved by attributes** (the point of light) left a faint remnant, up to 2 levels, at its earlier
  position on some renders. `--no-browser-gpu` did not fix it. Fix: paint moving marks on a canvas from composition
  time, like the plate and the grain. Hello's head is now a canvas. The SVG path drawn by dashoffset is fine.

If a piece is ever non-deterministic, render it twice with `--crf 0` and diff the `framemd5` lists. The differing
frames and pixels point at the cause. The scripts used are kept in the scratchpad (`foundation-test/nd/run-ll.sh`).

## Fonts

Latin-subset woff2 from Fontsource (jsDelivr). All SIL OFL 1.1, with the licence text beside them. The OFL doesn't
reach videos made with the fonts.

| File | Source | SHA-256 (first 12) |
|---|---|---|
| `cinzel-latin-500-normal.woff2` | `@fontsource/cinzel@5.3.0` | `2864b2c9db37` |
| `cinzel-latin-600-normal.woff2` | `@fontsource/cinzel@5.3.0` | `61efc27ceb7d` |
| `cormorant-garamond-latin-400-normal.woff2` | `@fontsource/cormorant-garamond@5.3.0` | `8048ac209bec` |
| `cormorant-garamond-latin-500-normal.woff2` | `@fontsource/cormorant-garamond@5.3.0` (identical to the earlier reel's copy) | `8197bf53615d` |
| `cormorant-garamond-latin-500-italic.woff2` | `@fontsource/cormorant-garamond@5.3.0` (identical to the earlier reel's copy) | `4fb55a7a6d56` |
| `cormorant-garamond-latin-600-normal.woff2` | `@fontsource/cormorant-garamond@5.3.0` | `ae062b6d5ae3` |
| `inter-latin-400-normal.woff2` | `@fontsource/inter@5.2.8` (identical to the earlier reel's copy) | `8909904ab6c8` |
| `inter-latin-500-normal.woff2` | `@fontsource/inter@5.2.8` (identical to the earlier reel's copy) | `f3779f1efccc` |

Licence texts: `OFL-Cinzel.txt` (Fontsource's LICENSE: "Copyright 2020 The Cinzel Project Authors"),
`OFL-CormorantGaramond.txt`, `OFL-Inter.txt`. `@font-face` family names are the real ones ("Cinzel",
"Cormorant Garamond", "Inter"): a generic name can silently fall back to another face.
