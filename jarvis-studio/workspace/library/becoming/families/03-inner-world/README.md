# 03 · THE INNER WORLD

**Gold line behaviour: scattered strands gather into one line.** Inside a soft-edged circular lens (the vault's
Instrument lens) on the abyss, faint ink and mist strands drift in a slow, tangled flow: scattered attention. The flow
bends until every strand runs the same way, the outer strands fade and the rest converge on the lens's centre line and become one crisp gold
line. Then the lens opens like an iris to the sea plate and the line runs on as its horizon. One Cormorant line that
names a practice: *Choose one thing. Let the rest wait.*

Purposes served (of the five): **2 · make the invisible visible** (attention drawn as a field) and **1 · feel something
true** (an interpretation, no claim). A small Inter label, "ILLUSTRATION", sits outside the lens for as long as the lens
is shown, so the field never reads as a scan or a measurement.

All copy is demo copy (`// DEMO COPY · not for posting` in `data.js`). Nothing in it is a photograph. The plate is
code-drawn (`BM.seaPlate`) and the field is a shader, so both read as illustration. The phrase is an invitation (a
practice), not a fact about the world, so it needs no source.

```
index.html   the composition (BM only; all values from data.js)
data.js      window.DATA: copy, word times, lens, strands, line, iris, plate source, variants, timings
cue.json     the Night Watch cue
```

## Inputs (`data.js`, `window.DATA`)

| Key | Type | Meaning |
|---|---|---|
| `duration` | number (s) | 12. Must equal `data-duration` in `index.html` and `duration` in `cue.json` |
| `field` | `'scattered' \| 'conflicting'` | scattered = one tangled flow (contours of seeded noise). conflicting = two opposing shears meeting in a seam, the halves drifting in opposite directions; both resolve the same way |
| `seed` | integer | the field's noise offset (deterministic) |
| `lens` | `{cx, cy, r, rFrom, soft, rim, rimIn, in:[start,dur], tint}` | centre and radius (px). The line crosses the lens at `cy`, so `cy` is also the horizon after the iris. The lens grows `rFrom → r` while it comes up (never from zero). `soft` = edge feather; `rim` = alpha of the thin mist rim, which comes up in `rimIn` s so the first light lands on the opening sting; `tint` = how much ocean colours the inside |
| `strands` | `{n, width, alpha, dither, drift, freq, shear, nGather, in, align, gather, gold, goldMax, out}` | `n` strands per lens radius when aligned (spacing r/n px); `freq` = noise frequency of the scattered flow (0.8) and `shear` = its directional tilt (0.3), which together keep closed contour loops rare; `nGather` = strands each side of the centre that survive the gather (3: the outer ones fade as it starts, so the bundle is 7 strands, never a barcode); 1.3 px strokes at peak alpha .5, `dither` = how much of the ordered (Bayer 4×4) halftone is mixed in, `drift` = how fast the breaks in the strands slide. `[start, dur]` spans for: fade up, align (bend to horizontal), gather (converge on the centre line), gold (warm towards gold near the centre, capped at `goldMax`), out (give way to the line) |
| `line` | `{at, lead, inDur, x0, x1, seed, amp, step, width}` | the gold line appears on `at` (= the cue's turn). It starts `lead` s early and comes up in `inDur` s, so the hit frame already shows it two-thirds lit. Hand-drawn with `BM.wob` from `x0` to `x1` (past both edges) at `lens.cy`, clipped to the lens with soft ends |
| `returnToPlate` | boolean | true: the iris opens to the plate. false: the lens stays, the line stays inside it, the label stays, and the phrase sits at `phrase.topNoReturn` |
| `iris` | `{at, dur, rTo, open:[start,dur], rimOut:[start,dur]}` | radius `r → rTo` (power2.inOut, past every corner); the inside of the lens turns transparent over `open` so the plate shows through; the rim fades over `rimOut` |
| `plate` | `{type: 'code'\|'photo', src, horizonY, seed, glow, glowX, push:[at, dur, from, to]}` | `code` = `BM.seaPlate`; `photo` = an image inside the composition folder (scratchpad builds only). `horizonY` must equal `lens.cy`. The push (linear) moves the plate and the line together, origin on the horizon |
| `grain` | `{seed, amount}` | `BM.grain` |
| `label` | `{text, top, topNoReturn, in:[start,dur], out:[start,dur]}` | the Inter label above the lens; with `returnToPlate: false` it moves below the lens (`topNoReturn`), because the phrase wraps to three lines and collided with it (caught by the check gate on the variant render) |
| `phrase` | `{text, top, topNoReturn, times[], lead}` | the one line (`\n` = break, `*word*` = italic pale gold), one start time per word (the page throws if the counts differ), `lead` = how early each word starts rising |
| `dip` | `{at, dur}` | dip to black |

## Duration, dimensions, timing map

12 s · 1080×1920 · 30 fps · H.264 + AAC 48 kHz. Text inside the safe zone (x 80–940, y 250–1500): the label at y 600,
the phrase at y ≈ 560–760, the lens 680–1440, the horizon at y 1060.

| t (s) | Picture | Sound (`cue.json`) | Measured (final render, Revision 1) |
|---|---|---|---|
| 0.00 | abyss | bed very low | |
| 0.15 | the lens comes up: the rim (alpha .5) in 0.2 s, the inside over 0.5 s, radius 340 → 380 (sine.out); the strands fade up with it over 0.7 s | opening sting A-E-D, `stingAt: 0.15` | lens-area YMAX 12 at 0.133 → 57 at 0.167 (rim) → **127 at 0.25** (strands inside the lens) |
| 0.15–0.85 | a flowing, sheared field of fine strands, halftone-dithered, drifting slowly | pad; heartbeat fades in from 2 s; no ticks; `sea: false` | |
| 0.7–1.3 | "ILLUSTRATION" fades in above the lens (opacity .85) | | |
| 1.4–4.0 | align: the flow bends until every strand is horizontal (sine.inOut) | | |
| 4.0 | every strand horizontal | **the watch tick starts (`tickFrom: 4.0`) and races into the turn** | tick onsets (ticks-only render) 4.00, 4.29, 4.54, 4.75, 4.92, 5.06: intervals 0.29 → 0.14 s |
| 4.2–5.5 | gather: the outer strands fade, 7 converge on y 1060 (power2.inOut) and warm towards gold near it (4.6–5.5, to 55 %) | dead stop from 5.08 | band height / strands at the centre: 80 px / 6 at 4.8, 43 / 5 at 4.9, 26 / 5 at 5.0, 8 / 1 at 5.2 |
| 5.5 | **the strands become one crisp gold line** (4 px, gold); the strands fade out by 6.05 | **turn: the hit lands on 5.5** | 150 Hz–4 kHz RMS (causal 4th-order band-pass, final MP4): race 4.6–5.08 −26.8 dB, dead stop 5.09–5.48 **−53.1 dB (26.3 dB below)**, −55.3 at 5.483 → −10.3 at 5.500 |
| 5.55–6.0 | the label fades out | ticks resume at 6.2, every 0.5 s | |
| 5.95–7.55 | the iris: the lens opens past every corner onto the sea plate, the rim fades; the line runs out to both edges as the horizon; push 1.00 → 1.04 to the end | | |
| 6.5–9.22 | "Choose *one* thing. / Let the rest wait." word by word at 6.5, 6.9, 7.3, 7.95, 8.3, 8.65, 9.0 (each rises .22 s, 0.03 s lead) | landing sting E-D-A at 9.0, soft low D at 9.64; ticks slow to silence | |
| 9.22–11.25 | hold: the whole line over the lit horizon | `fade: 1.2` from 10.8 | frames 9.233 and 11.2 show both lines complete |
| 11.25–11.85 | dip to black (power1.in) | | |

Readability: 7 words from 6.5 to 9.22 s = 2.57 words/s (limit 2.6). The whole line is fully on screen from 9.22 to the
dip at 11.25 (2.03 s; the rule asks 0.8 + 0.3 × 4 = 2.0 s). "ILLUSTRATION" is on screen ≈ 4.3 s. Words never reflow:
each sits in its final place from the start.

## Dependencies

The library foundation only: `tokens.css`, `fonts/` (Cormorant Garamond 500 + 500 italic, Inter 500),
`vendor/gsap.min.js` (GSAP 3.14.2), `lib/becoming-motion.js` (`BM.shader`, `BM.seaPlate`, `BM.grain`, `BM.wob`,
`BM.rng`, `BM.revealWords`, `BM.onTime`, `BM.track`, `BM.color`), staged by `tools/build.sh`. Night Watch via
`tools/night-watch-render.mjs`. WebGL1 is required (SwiftShader is fine; never `--browser-gpu` on this machine).

## Render

```bash
source <scratchpad>/creative-system/env.sh
BECOMING_OUT=<outside the repo>/03-inner-world \
  jarvis-studio/workspace/library/becoming/tools/build.sh jarvis-studio/workspace/library/becoming/families/03-inner-world
```

Add `--draft` for a quick look. A full build takes about 7 minutes here (4 CPUs, SwiftShader), almost all of it the
render. Then read `<out>/review/index.md` and every image it lists.

## How it is built (and why)

- **The field is contour lines, not particles.** One fragment shader evaluates a stream function per pixel: seeded
  two-octave value noise (scattered) or two opposing shears (conflicting), blended towards `q.y` by `align`. The
  strands are its contour lines: `fract(phi)` near 0, with the distance in pixels from a finite-difference gradient,
  so every strand is a 1.3 px antialiased stroke whatever the field does. Gathering multiplies `phi` by a gain that
  grows to about 67 (floor 1 − 0.985), which pulls the strands onto the line `phi = 0`; strands beyond n fade out, so none
  come in from the edges, and as the gather starts the window narrows to ±`nGather`. Breaks along each strand come from noise in x, sliding slowly with `drift`; they close up as the
  strands gather. An ordered 4×4 Bayer dither mixed into the strand alpha gives the halftone texture, and switches
  off as the strands gather, so the bundle is clean when it becomes the line.
- **Cheap on the CPU.** The strands are evaluated only inside the lens and only while they are visible; outside that
  the shader is a few multiply-adds. 360 frames render in about 6 minutes with SwiftShader.
- **Everything that moves is painted from composition time** (`BM.onTime`): the shader (all its uniforms are eased
  functions of t), the gold line canvas (clipped to the lens by a radial `destination-in`), the plate and the grain.
  Transforms are `gsap.set` before the timeline (seek-history independence, main README).
- **The line lands on the plate's horizon**: `plate.horizonY = lens.cy`, the plate's transform origin sits on the
  horizon and the line canvas is pushed with the same origin.

## Variants

- `field: 'conflicting'`: two flows tilted against each other (upper half one way, lower half the other, drifting
  apart) meet in a wavy seam, then resolve into the same line.
- `returnToPlate: false`: the piece stays in the inner world: no iris, no plate, no push; the label stays and the
  phrase sits above the lens (`topNoReturn`). Use it when the next shot is not the sea.
- `lens.r` / `lens.cx` / `lens.cy`: lens size and place (keep `plate.horizonY = lens.cy`).
- `strands.n` (density), `strands.dither` (0 = clean lines, 1 = full halftone), `strands.alpha`, `seed`.
- Real photo (scratchpad builds only): `plate: {type: 'photo', src: 'shot.jpg', horizonY: <its horizon after cover-fit>}`
  and set `lens.cy` to the same value.

Variant render (scratchpad only, `--draft`; done before Revision 1 and not repeated since): `field: 'conflicting'` + `returnToPlate: false` passes all ten gates
(spec-check: 1 warning). Frames looked at: two tilted flows meeting in a horizontal seam at 1.5 s, resolving to
parallel strands by 4.3 s, the same gold line at 5.6 s, the phrase above the lens with the label below it at 9.5 s.
Its first build failed the check gate (phrase wrapped to three lines over the label); `label.topNoReturn` fixed it.

## Do / don't

- Do keep the field faint and fine. It is an illustration of attention, not data: no numbers, no grid, no HUD.
- Do keep the label while the lens is on screen.
- Do keep the turn (`cue.turns[0]`) equal to `line.at`, `stingAt` equal to `lens.in[0]` and `land` equal to the last
  word's time.
- Don't let the gather finish later than `line.at`: the line should replace a bundle that is already thin.
- Don't add glow, particles or a bloom to the line; it gets brighter only by becoming one crisp stroke.
- Don't put more than one line of copy here, and give every word a time.

## Known limits

- The scattered field still has a few closed loops at the edges of the lens (fewer than before Revision 1); it now reads
  as flow lines more than terrain, but a viewer can still think "map" for a moment.
- The tick race comes from the library's fixed race curve (`lib/night-watch.js`): starting at 4.0 it begins at a 0.29 s
  interval, not 0.5 s. A 0.5 s start would mean ticking from about 1.1 s, which breaks "ticks off until the alignment".
  The race ends at 0.14 s (critic asked ≈ 0.12).
- Ticks resume at a steady 0.5 s after the hit (6.2 to 9.0) and only slow after the landing sting; the echo layer adds
  off-beat repeats from the turn on.
- At 0.167–0.2 s only the rim is lit (YMAX 57); the inside lights from 0.25 s.
- The dither is in screen space, so it "swims" slightly as strands move; at phone size it reads as texture.
- Not checked for frame-exact determinism across two renders (the foundation's method applies: `--crf 0` twice,
  compare `framemd5`).

## Revision 1 (27.10.2026)

A strict critic scored the first build REVISE (no hard fails; weakest: practical value, 5/10). What it found and what
changed (each change verified from frames or audio of the new render):

1. **The copy was an aphorism** ("Scattered attention, gathered, becomes a direction."): it named the picture and gave
   the viewer nothing to do. Now one practice, 7 words: *Choose one thing. Let the rest wait.* Word times re-spaced to
   2.57 words/s; the hold grew to 2.03 s (floor 2.0), so the piece is 12 s (was 11.5) and the land moved to 9.0.
2. **No tick race into the turn** (ticks only started 0.7 s after it, so the dead stop cut a pad). `tickFrom` 5.5 → 4.0,
   the moment the strands are horizontal (`align` now 1.4–4.0). Measured: ticks at 4.00 … 5.06 accelerating 0.29 → 0.14 s,
   dead stop 26.3 dB below the race, hit on 5.500.
3. **A near-black opening, a topographic field and a barcode bundle.** `lens.rim` .26 → .5, lens inside 1.0 → 0.5 s,
   strands in at 0.15 (was 0.45): lens-area YMAX 127 by 0.25 s (was 71 by 0.33). Noise frequency 1.35 → 0.8 plus a 0.3
   shear: flowing lines with few closed loops. Gather 3.7 → 4.2 s (1.3 s long), `nGather: 3` fades all but 7 strands as
   it starts, and the gain floor 0.995 → 0.985 keeps the last strands on whole pixels (with the old floor and 7 strands
   the bundle vanished at 5.45). Band never wider than 30 px with more than 5 strands: 80 px / 6 strands at 4.8 (spacing ≈
   14 px), 26 px / 5 at 5.0 (was ≈ 80 px of ~30 stripes at 4.8).
