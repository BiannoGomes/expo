# 04 · The Memory Fragment

**Gold line behaviour: it underlines a date, then traces the memory's contour.**

A still builds itself from horizontal slices, the way a memory comes back: a few pixels out of register, with black
between the pieces, then settling into place. A small date stamp sits in the dark water just under the horizon, and
the gold light underlines it. The underline ends exactly at the foot of the headland, so when the line leaves the date
it is already on the contour: its tail erases the underline while its head traces the ridge past the edge of the
frame. One italic line says what the gesture shows.

Status: Revision 1, 27.10.2026 (see "Revision 1" below). All demo copy (`// DEMO COPY · not for posting`). Synthetic
plate only.

## Purpose

Of the five purposes, this serves **feel something true (1)** and **make the story compelling (3)**. Use it to open or
close a story about a place or a moment, wherever a real photo and its real date carry the weight.

## Files

| File | What it holds |
|---|---|
| `index.html` | the composition (HyperFrames 0.8.97, one paused GSAP timeline). It uses only `BM` and contains no copy or timings |
| `data.js` | `window.DATA`: every value the piece uses (copy, times, geometry, seeds, plate source). Swap only this file for a real build |
| `cue.json` | the Night Watch cue, aligned to the visual beats |

## Inputs (`data.js`)

| Key | Type | Meaning |
|---|---|---|
| `duration` | number, s | 9. Must equal `data-duration` in `index.html` and `duration` in `cue.json` (build.sh checks the cue) |
| `plate` | `{type: 'code'\|'photo', src, seed, glow, glowX, horizonY, density, freezeAt}` | `code`: a `BM.seaPlate` frozen at `freezeAt` (a still, so the water doesn't move), plus a code-drawn headland whose ridge is exactly `contour`. The headland is filled down to its shore at `contour[0]`'s y (or just under the horizon if that is higher), so its foot can stand in the water in front of the horizon. `photo`: `src` is an image inside the composition folder. It is cover-fitted to the 1188×2112 overscan plate, and the plate is repainted when it loads. **Scratchpad builds only** |
| `grain` | `{seed, amount}` | `BM.grain` (0.06) |
| `push` | `{from, to, origin: [x, y]}` | 1.00 → 1.07, linear over the whole piece. It applies to the still and to everything printed on it (stamp and line), about the frame point `origin` |
| `slices` | `0 \| 2 \| 3` | how many horizontal slices the still assembles from (0 = a plain fade) |
| `cuts` | `{2: [y], 3: [y, y]}` | frame y of the slice boundaries for each count |
| `sliceIn` | `[{at, fade, dx, settle}]` per slice, top to bottom | when the slice fades in from black, its starting offset in px, and how long it takes to slide into register (power3.out) |
| `seam` | `{px, at, dur}` | width of the black seams between slices, and when they close |
| `stamp` | `'DD.MM.YYYY'` or `null` | the date stamp. In real use, the photo's EXIF date (put it in `facts.md` with its source). In the demo, `00.00.0000`, so nothing pretends to be real. With `null` there is no stamp and no underline, and the line ignites on `contour[0]` |
| `stampBox`, `stampIn`, `stampFade` | px / s | where the stamp sits (Inter 500, 30 px, .16em, cream; demo: x 158, top 1192, in the dark water under the horizon), when it appears, and how far it recedes (to .55) while "not the date." arrives |
| `line` | object | `underline0/1`: the underline's ends (frame px, set by hand to the stamp's width). **`underline1` should equal `contour[0]`**: the underline ends where the contour starts, so no stroke crosses anything that isn't in the image. If they differ, a straight joining stroke is drawn (keep it under ~12 px). `ignite`, `igniteDur`: the point of light. `underline`: [start, dur] of the draw (power2.out). `travel`: [start, dur] of the head (sine.inOut) from the underline's end to past the edge; the head rests on the underlined date until then. `tail`: [start, dur] of the tail (power1.inOut) erasing the underline |
| `contour` | `[[x, y], …]` frame px, left to right | the one real contour the line traces: a horizon or a ridge, starting where the underline ends. Its last point should sit past the right edge (x > 1080) so the line continues out of frame. For a photo, measure it on the cover-fitted image and put the stamp so its underline lands on the contour's first point |
| `phrase` | `{text, top, size, times}` | the one italic Cormorant line. `*word*` = pale-gold emphasis, `\n` = line break, `times` = when each word starts to rise |
| `dip` | `{at, dur}` | the dip to black |

## Duration, dimensions, timing map

9 s · 1080×1920 · 30 fps · 270 frames. All text sits inside the safe zone (x 80–940, y 250–1500), including after
the 1.07 push.

| t (s) | Picture | Sound (`cue.json`) |
|---|---|---|
| 0.00 | black | sea bed and pad from 0 |
| 0.05 | the middle slice (ridge foot + lit horizon) fades in, 16 px right of register: the first thing seen is the light (band y 1100–1200 mean luma 26 at 0.17 s, 46 at 0.5 s, measured) | |
| 0.25 | the top slice (sky + peaks) fades in, 14 px left | |
| 0.45 | the bottom slice (sea + the headland's shore) fades in, 9 px right | |
| 0.5–1.4 | the black seams close; every slice is home by 1.2 s | |
| 0–9 | push 1.00 → 1.07, linear | |
| 1.50–1.90 | the date stamp appears in the dark water under the horizon | |
| **2.00** | the gold light ignites at the stamp's left (first visible on frame 62, 2.033 s) and underlines the date; the underline ends on the headland's foot at 2.9 | **opening sting A-E-D, `stingAt: 2.0`** (measured onset 2.00 s) |
| 2.9–3.7 | the light rests at the end of the underline, on the foot of the ridge | the sting rings out |
| **3.70** | the head leaves the date and traces the ridge past the right edge (about 6.4) | **first tick, `tickFrom: 3.7`** (measured onset 3.70 s, +10 dB above the bell tail in the >2 kHz band), then one every 0.5 s |
| 3.7–4.5 | the tail erases the underline and rests at the ridge foot | |
| 3.24–6.03 | "Memory keeps the *shape*, / not the date." rises word by word (7 words, same spacing as the first build: 2.54 words/s) | |
| 5.1–6.1 | the stamp recedes to .55 while "not the date." arrives | |
| **6.03** | "date." is fully up (frame 182, measured from frames) | **landing sting E-D-A, `land: 6.06`** (measured onset 6.06 s, 0.027 s after), soft low D at 6.70; the ticks slow to silence after it |
| 6.03–8.30 | the whole phrase is fully on screen: 2.27 s (floor for 7 words: 0.8 + 4 × 0.3 = 2.0 s) | |
| 8.3–8.9 | dip to black (power1.in) | fade over the last 1.4 s |

Cue: `{"kind":"watch","duration":9,"turns":[],"card":null,"land":6.06,"fade":1.4,"stingAt":2.0,"tickFrom":3.7,"heartbeat":false,"hits":false}`.
Sea, pad, slow ticks, the two stings; no turns, no hits, no heartbeat.

## Render

```
source <scratchpad>/creative-system/env.sh
BECOMING_OUT=<scratchpad>/creative-system/families/04-memory-fragment \
  jarvis-studio/workspace/library/becoming/tools/build.sh jarvis-studio/workspace/library/becoming/families/04-memory-fragment
```

Revision 1 result on 27.10.2026, all ten gates PASS: lint 0/0 · check (contrast 22/22 AA) · render h264 1080×1920
30/1, 270 frames · score (9 s, stingAt 2, land 6.06) · mix −14.00 LUFS / −1.81 dBTP · mux 9.0 s · review-frames ·
spec-check (reels, 0 warnings) · brand-lint · audio-qa −14 LUFS, −1.78 dBTP, sub-60 gap 57.5 dB. The MP4 stays in the
scratchpad.

## Dependencies

The foundation only: `tokens.css`, `fonts/` (Cormorant Garamond 500 italic, Inter 500), `vendor/gsap.min.js`
(3.14.2), `lib/becoming-motion.js` (`BM.seaPlate`, `BM.grain`, `BM.wob`, `BM.poly`, `BM.pathLength`,
`BM.revealWords`, `BM.onTime`, `BM.track`, `BM.seek`, `BM.mix`, `BM.rgba`) and the Night Watch tools. No WebGL. Every
moving thing (slices, line, point of light) is painted on a canvas from composition time. No SVG element moves. The
push is set with `gsap.set` before the timeline exists.

## Variants

- `slices: 3` (default), `2` or `0`. `slices: 2` with `stamp: null` was draft-built on 27.10.2026 (first build, before
  Revision 1) and passed every gate; it has not been rebuilt since the retime. With no stamp the line ignites on
  `contour[0]` at `line.ignite` and traces it.
- `stamp: null`: no date. **Change the phrase too**: "not the date." means nothing without a date on screen.
- `contour`: any horizon or ridge in the photo. A flat horizon works (two points, from x ≈ 80 to x 1150).
- `plate.type: 'photo'`: his real photo, **in a scratchpad copy only**. Measure `contour` and the horizon after the cover
  fit, put the stamp where the photo is quiet, and check the stamp's contrast (`check` measures it).
- Sound: `land` sits on the frame the last word is fully up. If the phrase changes, re-measure that frame and move
  `land` with it. `"land": null` keeps the ticks steady to the fade.

## Do / don't

- Do use the real EXIF date in real use, with its source in the project's `facts.md`. Never invent a date. In the demo,
  keep the obviously fake `00.00.0000`.
- Do trace a contour that is really in the image. The line must sit on the ridge or horizon, not near it, and the
  underline must end where the contour starts (no free stroke across the water).
- Do keep the slices small (≤ 16 px) and slow (power3.out over 1.3–1.9 s). This is memory assembling, never a glitch:
  no RGB split, no jitter, no flicker, no repeated offsets.
- Don't put the stamp over a bright part of the photo. It is small (30 px) and needs the dark around it.
- Don't add a second line of copy, captions or the mark. This family is one gesture and one sentence.
- Don't commit a build that uses his photo. `plate.src` must stay `null` in the repo.

## Known limits (honest)

- **The bell is still three bells.** The brief asks for a single soft bell on the underline. Night Watch has no
  single-bell event, and this family may only write inside its own folder, so the opening sting A-E-D (three soft struck
  notes, 0.16 s apart) still fires on the ignite. A proposed foundation patch is ready and proven in the scratchpad (see
  Revision 1). Until it lands, the brief's "single soft bell" is not met.
- The landing sting on "date." is three notes and a low D too. It marks the phrase completing, which the critic asked
  for, but the piece now has two stings in 9 s. With the single-bell patch the opening becomes one note and the
  balance is better.
- The ticks run at the engine's steady 0.5 s until `land`, then slow to silence.
- The underline length is set by hand (`underline0/1`). Measuring the stamp's text width at load time would race the
  font load and break determinism. If the stamp text or size changes, re-measure from a frame.
- The code-drawn headland now comes forward of the horizon: its shore is a flat line at y 1230 with a faint wet edge.
  It reads as an illustration, which is right for the repo, but the flat bottom is a little graphic. The family is
  meant for a real photo, where the contour and the stamp are measured on the image.
- The opening is faster (light at 0.05, assembled by 1.4) but the frame is still a night sea: whole-frame mean luma
  is 12 at 0.5 s and 17 from 1 s on (the lit band over the horizon is 46). It has not been watched on a phone.
- Determinism wasn't re-proven for this family (no double render). It follows the foundation's rules: canvases are
  pure functions of t, transforms are set before the timeline, randomness is seeded.

## Revision 1 (27.10.2026)

A strict critic scored the first build REVISE (no hard fails; weakest: sound design 6). What it found, and what changed:

1. **The climb crossed open water.** The line went from the underline (y 1424) up to the ridge foot on a free bezier,
   a vertical gold stroke over the sea and the moon path for about 0.9 s: not a contour in the image.
   **Change:** the stamp moved into the dark water just under the horizon (top 1192), its underline (y 1230) ends at
   the headland's foot, and the headland now comes forward to a shore at that point, so `underline1 = contour[0]`.
   The climb and `climbCtrl` are gone; if data puts the two apart, only a straight joiner is drawn.
   **Measured** on all 270 frames: every line pixel is within 3.2 px of the (pushed) underline or contour, frames
   62–240. The only gold-coloured pixels farther out are two moon glints in the reflection column (x ≈ 250, y ≈ 1340),
   present before the line exists.
2. **Slow, dark opening.** First bright event at 3.03 s, first word at 4.3 s, assembly until 2.3 s.
   **Change:** slices in at 0.05 / 0.25 / 0.45 and home by 1.2, seams closed by 1.4, stamp at 1.5, ignite and sting
   at 2.0, phrase from 3.24; the piece is 9 s (was 10). **Measured:** the y 1100–1200 band is 26 mean luma at 0.17 s
   and 46 at 0.5 s (target ≥ 30); first gold on frame 62 (2.033 s); first word rising at 3.24 s.
3. **The sound didn't follow the beats.** Ticks started under the sting's ring (the 4.0 and 4.5 ticks didn't register),
   nothing marked the line meeting the ridge or the phrase completing.
   **Change:** the head rests on the date from 2.9 to 3.7 while the sting rings out, and the first tick (`tickFrom
   3.7`) falls on the frame the line leaves the date to trace the ridge. `land: 6.06` puts the landing sting on
   "date." and slows the ticks to silence after it. **Measured** (>2 kHz onset detector, 10 ms hops, ≥ 6 dB rise):
   onsets at 2.00 (sting), 3.70 (first tick, +10.0 dB), 4.20, 4.70, 5.20, 5.70, 6.06 (land). "date." is fully up on
   frame 182 (6.033 s): the land is 0.027 s after it. In tests, a first tick at 3.3 did not register and 3.5 rose only
   8 dB, which is why the rest lasts until 3.7.
   **Not done:** the single soft bell. It needs an optional cue field in `lib/night-watch.js`, outside this family's
   folder. The patch (`bellAt`: one struck A5, the sting's first note, same level) and its proof are in the scratchpad
   at `creative-system/families/04-memory-fragment/r1/nw-single-bell/` (`night-watch-bellAt.patch`, `cue-bell.json`,
   `score-bell.wav`). With it, the first tick rises 22.9 dB above the bell tail instead of 10.0, and a cue without
   `bellAt` renders the same samples as today's engine (max difference 2 LSB, the engine's own run-to-run noise). To
   adopt it: apply the patch to the foundation, then set `"stingAt": null, "bellAt": 2.0` in `cue.json`.
