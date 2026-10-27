# 02 · The Threshold

Gold line behaviour: **meets a wall, strains, passes through.** It never explodes; it continues past the frame edge.

## Purpose

A two-state idea, shown as a passage: a cold, tight "before" world on one side of an unseen wall, a warm, open "after"
world on the other. The line runs into the wall, the wall shows itself only on contact, the line strains (small,
quickening jolts while the tick races), everything stops dead, and on the hit the wall dissolves, the line passes
through and a precise divider sweeps the second state open. Once the line of copy lands, the seam feathers and the
tested world floods back across the frame: the crossing completes instead of ending on a split screen.

Serves purposes **2 (make a difficult idea easier)** and **3 (make the story compelling)**. Use it when a post turns on
a contrast between two states (handed-down vs tested, borrowed vs owned, comfort vs growth), with the turn as the
moment of crossing.

## Files

| File | What |
|---|---|
| `index.html` | the composition (HyperFrames 0.8.97 contract, one paused GSAP timeline, all painters pure functions of t) |
| `data.js` | `window.DATA`: every value the piece uses (copy, timings, geometry, palette tokens, seeds, plate). Loaded synchronously before the timeline. `// DEMO COPY · not for posting` |
| `cue.json` | Night Watch cue aligned to the visual beats |
| `README.md` | this file |

## Inputs (`data.js`)

| Key | Type | Meaning |
|---|---|---|
| `duration` | number, s | 9.5. Must equal `data-duration` in `index.html` and `duration` in `cue.json` |
| `variant` | `'vertical' \| 'horizontal'` | picks an entry of `variants`; its keys replace the base keys (one level). `window.THRESHOLD_VARIANT` overrides it |
| `divider` | `'vertical' \| 'horizontal'` | wall upright (line runs left→right, after opens right) or flat (line runs top→bottom, after opens below) |
| `line` | `{seed, v, u0, u1, ignite, igniteDur, run:[start, dur]}` | travel axis u (x for vertical), cross position v; ignites at `ignite`; linear run into the wall |
| `wall` | `{at, gap, hold, dash:[8,12], opacity, appear, dissolve, bend, press, bendSigma, stroke}` | wall position on u; `hold` = seconds of strain at the wall before the dead stop; colour token `wall` (#D6E4F5), opacity ≤ .55 (default .55), dash stroke 2.5 px; `press` = steady push (16 px), `bend` = jolt peak cap (40 px; jolts grow from ~20 to 40 px), `bendSigma` = width of the bulge (110 px) |
| `through` | `{dur, ease, lead}` | how the line passes through (power3.out); `lead` puts the first moving frame on the hit's frame |
| `sweep` | `{delay, dur, ease, edgeOpacity}` | the divider sweep that reveals the after state, and its hairline edge |
| `states.before` / `states.after` | `{keyword, color, seed, …}` | copy and palette of each side: keyword (Cinzel), colour token, plate seed; before `tight` (darkness pressing in), after `glow`, `glowX`, `horizonV`, `push`, `wash` (0.52), `washSize` ([1150, 1300]), `exposure` (CSS brightness on the after plate, 1.95) |
| `keywords` | `{before:{x,y,at}, after:{x,y,lag}}` | keyword centres; the after keyword rises `lag` s after the divider passes its centre (computed) |
| `phrase` | `{text, top, left?, width?, at, stagger}` | one Cormorant line, word by word (`*word*` = italic pale gold) |
| `take` | `{after, dur, ease, feather, to}` | the take-over: `after` s after the last word is fully on, the after state's near edge moves from `wall.at` to `to` (−160 = off frame) over `dur`, with a `feather` px soft edge. `null` keeps the old hard seam |
| `mark` | `{show, at}` | "THE BECOMING PROJECT" end mark |
| `fade` | `{at, dur}` | fade to black |
| `plate.src` | string or null | **scratchpad builds only**: an image file for the after state instead of the code sea. Never a real photo in the repo |

Derived times are written to `window.THRESHOLD_TIMES` (`contact`, `stop`, `turn`, `land`, `kwAfter`) and
`window.THRESHOLD_TAKE` (start of the take-over, 7.33 s by default). The turn is
`contact + hold + 0.42`, rounded to a frame. **If you change `line.run` or `wall.hold`, set `cue.json` `turns[0]` to the
new `turn` and `land` to the phrase's last-word time** (`phrase.at + (words − 1) · stagger`).

## Duration and dimensions

9.5 s · 1080×1920 · 30 fps · H.264 + AAC 48 kHz. All text inside the safe zone x 80–940, y 250–1500.

## Timing map (default data, vertical divider, measured from the render on 27.10.2026; strain and after-state rows re-measured after Revision 1)

| t (s) | Picture | Sound (cue) | Measured |
|---|---|---|---|
| 0.05 | gold point ignites at the left on the grey "given" path | opening sting A-E-D (`stingAt` 0.05) | biggest audio rise at 0.05 s (+22.9 dB) |
| 0.1–0.9 | the cold, tight world fades up left of centre; the right stays closed (black) | sea, pad | |
| 0.25–2.40 | the line runs linearly to the unseen wall | ticks from 1.0 (`tickFrom`) | gold head reaches x 535 on frame 72 (2.40 s) |
| 0.9–1.6 | keyword 1 **GIVEN** (mist) rises | | fully on from ~1.6 s to the end |
| 2.40 | contact: the dashed wall appears and bulges where the line presses | | |
| 2.40–3.68 | strain: quickening x jolts of 20–40 px into the wall, the wall bulging with them | tick races | head x 535–587 over frames 72–110 (50 px range; peaks 561, 573, 579, 583, 585: growing); wall bulge 33 px at frame 105 (x 540→573 at y 1000) |
| 3.68–4.10 | dead stop: everything holds | dead stop (0.42 s) | head still at x 577 from frame 111 (3.70) to 122; audio −40.2 dB mean in 3.70–4.08 vs −22.5 dB before |
| 4.10 | the hit: the wall dissolves dash by dash; the line passes through | turn `[4.1]`, hit | audio rise at 4.10 s (+34.5 dB); first moving frame 123 (4.100 s), head x 577→655 |
| 4.2–5.35 | the vertical divider sweeps right and reveals the warm, open dawn sea | | head past the right edge by 4.67 s |
| ~4.75 | keyword 2 **TESTED** (cream) rises as the divider passes it | | |
| 5.3–7.07 | "What you test becomes *yours.*" word by word (0.4 s per word = 2.5 words/s) | | |
| 6.84–7.07 | last word *yours.* rises | landing sting E-D-A (`land` 6.9) | audio rise at 6.90 s; the word is fully on from frame 212 (7.07 s) |
| 6.0–7.0 | the two states side by side: cold given (left), warm open tested (right) | | mean luma right half 40.3–40.9, left half 15.5–15.7 (ratio 2.58–2.61) |
| 7.33–8.53 | the take-over: the seam feathers to 150 px and the tested world floods left until it fills the frame | | frame 250 (8.33 s): luma step at x 540 = 0.7, largest column step in x 440–640 = 3.2; left half 32.6, right half 41.0 |
| 7.5 | the mark fades in | tick slows to silence | |
| 8.8–9.5 | fade to black | score fade 1.4 s | phrase fully legible 7.07–8.97 s (1.9 s; the rule asks 1.4 s for 5 words) |

## Dependencies

The Becoming foundation (`../../tokens.css`, `fonts/`, `vendor/gsap.min.js` 3.14.2, `lib/becoming-motion.js`), staged
beside `index.html` by `tools/build.sh`. Night Watch via `tools/night-watch-render.mjs`. HyperFrames 0.8.97, Chromium
headless (SwiftShader). No WebGL, no network, no external assets.

## Render

```sh
source <scratchpad>/creative-system/env.sh
BECOMING_OUT=<scratchpad>/creative-system/families/02-threshold \
  jarvis-studio/workspace/library/becoming/tools/build.sh jarvis-studio/workspace/library/becoming/families/02-threshold
```

All ten gates passed on 27.10.2026 after Revision 1 (lint, check with contrast 16/16, render, score, mix, mux,
review-frames, spec-check, brand-lint, audio-qa: −14.01 LUFS, −1.67 dBTP, band below 60 Hz 43.1 dB under). About 2.5 min on 4 CPUs. Final MP4 24.1 MB
(grain-heavy, as the foundation README predicts).

## Variants

- **Divider:** `variant: 'horizontal'` (wall lies flat at y 900; the line drops from the top; the after state opens
  below). Rendered from a scratchpad copy with only `variant` changed before Revision 1; all ten gates passed (contrast
  17/17). It shares the Revision 1 code and wall/after values but has **not been re-rendered since**.
- **States:** swap `states.before/after` keyword, colour token, plate seed and glow; keep one gold accent.
- **Hold:** `wall.hold` lengthens or shortens the strain (re-time `cue.json`, see Inputs).
- **Photo plate (scratchpad only):** `plate.src` puts a real image behind the after state.

## Do

- Keep the two keywords a genuine pair of states (one word each) and the phrase to one interpretive line.
- Keep the wall at the `wall` token, dash 8 12, opacity ≤ .55; let it appear only on contact.
- Keep the strain big enough to read on a phone: head travel of 40 px or more across the hold, a bulge visible at
  360 px wide.
- Re-time the cue whenever the line or hold changes; check the hit frame by measuring the head position.

## Don't

- Don't add a second accent colour, a glow, particles, a flash on the hit or a whoosh on the sweep.
- Don't let the line stop at the frame edge or "burst" through: it continues.
- Don't state facts about the world in the phrase without a source in the caption.
- Never put a real photo, voice or the name on the frame in the repo build.

## Known limits

- The after state now measures 2.6x the before side, but it is still a dusk-to-dawn sea (right-half mean luma ~41/255),
  not a bright day; the sky top stays near-black. A real photo plate would carry more.
- Between 5.35 and 7.33 s the seam at x 540 is still a hard edge (the two states side by side while the phrase reads);
  it only feathers and opens after the phrase lands.
- The take-over has no sound of its own (the score has no cue for it); it rides the landing sting's tail.
- The horizontal variant is weaker: the gold line becomes a vertical stroke cutting across the sea's horizon, and the
  phrase wraps to two lines in a narrow column. Use it only when the copy is vertical by nature.
- The landing sting starts at 6.90 while the last word finishes rising at 7.07 (it starts at 6.84): within a few
  frames, but not on the frame the word is complete.
- Demo copy ("GIVEN", "TESTED", "What you test becomes yours.") is a placeholder and not approved for posting.
- The video stream is reproducible only to the extent the foundation's is; this family was not separately re-rendered
  twice for a determinism diff.

## Revision 1 (27.10.2026)

A strict critic scored the first build REVISE (weakest: emotional resonance 5/10; no hard fails) and named three problems:

1. **The strain barely showed.** The wall was a 1 px dashed hairline that bent 4–8 px; the head moved 16 px (x 535–551)
   in 1.28 s, about 5 px on a phone. Changed: `wall.bend` 12 → 40, `wall.press` 4 → 16, `bendSigma` 80 → 110, jolt
   amplitude now `min(bend, (0.55 + 0.45k) · bend · (0.9–1.1))` so peaks grow from ~20 to 40 px, wall opacity .5 → .55,
   dash stroke 2 → 2.5 px (`wall.stroke`). Measured: head x range 50 px over frames 72–110, bulge 33 px at frame 105,
   visible in a 360 px-wide downscale.
2. **The after state did not pay off** (right-half luma 22.8, ratio 1.6x). Changed: `wash` 0.30 → 0.52, `washSize`
   [1150, 820] → [1150, 1300], new `states.after.exposure` 1.95 (CSS brightness on the after plate). Measured at
   6.0–7.0 s: right half 40.3–40.9, left half 15.5–15.7, ratio 2.58–2.61.
3. **The ending read as a split-screen card** (hard x 540 seam to the end). Changed: new `take` step: from 7.33 s the
   after state's mask edge feathers to 150 px and slides from x 540 to −160 over 1.2 s (power2.inOut), so the tested
   world fills the frame. Measured at frame 250 (8.33 s): step at x 540 = 0.7, largest column step in x 440–640 = 3.2.

Timing, copy and the cue are unchanged (`turns` [4.1], `land` 6.9). Re-measured: the head holds still at x 577 on
frames 111–122 (dead stop) and first moves on frame 123 (4.100 s, x 577 → 655), the hit's own frame as before.

