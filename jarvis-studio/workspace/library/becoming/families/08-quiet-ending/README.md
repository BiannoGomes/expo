# 08 · THE QUIET ENDING

**Gold line behaviour: it runs past the edge and goes nowhere; the last frame stays open.**

The closing beat of a Becoming reel. The piece it ends is already on screen (a dim sea plate, its last caption), then
everything thins out: the plate and grain fade down and the last warm light leaves the sea. One question rises in
Cormorant italic, carried by the landing sting E-D-A. Under it, the gold line leaves slowly from x 70, gathers speed
and runs off the right edge. The frame cuts the line; it never ends inside the picture. The mark appears small, and
the frame stays open in near silence. There is no fade to black.

Purposes served: **feel something true (1)** and **make the identity recognisable (4)**: the question ending, the gold
line and the mark are the house signature at the close of every post.

Status: first draft, 27.10.2026. All copy is DEMO COPY, not for posting. Synthetic code-drawn plate only.

## Files

| File | What |
|---|---|
| `index.html` | the composition (HyperFrames 0.8.97 contract, one paused GSAP timeline, BM runtime) |
| `data.js` | `window.DATA`: every word, time, position, seed and the plate source. Swap this one file for a real build |
| `cue.json` | the Night Watch cue, aligned to the beats below |

## Inputs (`data.js`)

| Key | Type | Meaning |
|---|---|---|
| `duration` | number, s | 8. Must equal `data-duration` in `index.html` and `duration` in `cue.json` |
| `captions` | `[{text, start, end}]` | the closing caption of the piece being ended (BM.captions: chunks ≤ 4 words, pale-gold flash). `[]` = none |
| `question` | `{text, top, size, times[]}` | the final question. `times` = one beat per word (the rise starts .06 s before it). `*word*` = pale-gold emphasis |
| `plate` | `{type:'code'\|'photo', src, seed, glow, glowX, horizonY, density, swell, opacity[[t,v]…], push[from,to]}` | `code` = BM.seaPlate. `photo` + `src` = an image in the folder (**scratchpad builds only**). `opacity` keyframes drive the density drop |
| `grain` | `{seed, amount, opacity[[t,v]…]}` | BM.grain; its layer opacity falls with the plate |
| `line` | `{seed, x0, x1, y, at, dur, ease, width, head}` | the gold line: from `x0` to `x1` (beyond 1080), drawn from `at` over `dur`. `head` = radius of the cream point at its end |
| `mark` | `{show: bool, at, y}` | "THE BECOMING PROJECT" (BM.mark). `show: false` = no mark |

## Timing map (default data, measured from the rendered frames and the final mix)

| t (s) | Picture | Sound (cue) | Measured |
|---|---|---|---|
| 0.0 | already on: dim dawn sea, seam lit at the horizon (plate .9) | ticks at the old pace (every .5 s), sea | tick-band onsets at 0.5, 1.0, 1.5, 2.0, 2.5 |
| 0.05–2.3 | caption "The change is quiet." (word flash), out 2.14–2.3 | | all four words fully on 0.93 → 2.13 (1.2 s; floor for 4 words is 1.1 s) |
| 1.3–3.3 | density drops: plate .9 → .3, grain 1 → .3 (power1.inOut), the seam fades | | |
| 3.0 / 3.16 / 3.32 / 3.64 | "Who" / "are" / "you" / "becoming?" rise (Cormorant 500 italic, 92 px, cream, centred, top 880) | `land: 3.0`: E5 3.0, D5 3.32, A4 + soft low D 3.64 | words first visible at 2.967 / 3.133 / 3.30 / 3.60; note onsets 2.97 / 3.30 / 3.62 (STFT, ±40 ms). Each note lands within one frame of its word |
| 3.73–8.0 | question fully on (4.3 s) | ticks slow to silence after `land` | tick-band onsets 3.64, 4.14, 4.96, 6.01 (−16 dB), then none |
| 3.85–6.95 | gold line from x 70 at y 1060, `sine.in`: leaves slowly, at speed when it meets the edge | | head x: 77 @4.0, 310 @5.0, 842 @6.0, 1064 @6.33; the edge is reached at ~6.35 |
| 5.2–6.1 | mark fades in at y 1450 | | ≥95 % at 5.93 |
| 6.35–8.0 | **held open**: the line is cut by the frame, plate settling to .22, no fade to black | sting tail only; master fade 2.2 s | RMS −37 (6.5–7), −43 (7–7.5), −53 dBFS (7.5–8) |

Opening sting: `stingAt: null`. This piece is an ending: the light is already there at frame 0, and the house landing
sting is its only sting. Before the land, the score stays flat at −33 to −31 dBFS RMS. The sting rises about 21 dB
above that.

## Dimensions and rules

1080×1920, 30 fps, 8 s, H.264. All text sits in the safe zone (question x 130–900, y 880–1000; caption band y 1330–1490;
mark y 1450). The line starts at x 70, outside the text safe zone, as the brief specifies: it isn't text. One accent:
the gold (line, mark, the plate's fading dawn). The question is cream (the `lit` token).

## Dependencies

`tokens.css`, `fonts/`, `vendor/gsap.min.js` (GSAP 3.14.2), `lib/becoming-motion.js` (BM: seaPlate, grain, wob,
goldPath, drawOn, revealWords, captions, mark, onTime), all staged by `tools/build.sh`. Score: `lib/night-watch.js`
via `tools/night-watch-render.mjs`. HyperFrames 0.8.97, Chromium headless shell, ffmpeg.

## Render

```
source /tmp/claude-0/-home-user-expo/3a27d707-3f94-59fb-8f3d-2c397684c547/scratchpad/creative-system/env.sh
BECOMING_OUT=/tmp/claude-0/-home-user-expo/3a27d707-3f94-59fb-8f3d-2c397684c547/scratchpad/creative-system/families/08-quiet-ending \
  /home/user/expo/jarvis-studio/workspace/library/becoming/tools/build.sh \
  /home/user/expo/jarvis-studio/workspace/library/becoming/families/08-quiet-ending
```

Last run (27.10.2026): all ten gates PASS (lint, check (contrast 20/20), render, score, mix −14.0 LUFS, mux,
review-frames, spec-check 0 warnings, brand-lint, audio-qa −14 LUFS / −2.64 dBTP / sub-60 gap 54.2 dB). About 70 s on
this machine.

## Variants

- `question`: any question (keep it ≤ 6 words on one or two lines; retime `times`, and keep the first word on
  `cue.land`, the third on `land + .32` and the last on `land + .64`, so the sting carries the question).
- `mark: {show: false}`: ends on the question and the line alone.
- `captions: []`: starts straight on the dim plate (lower the first `plate.opacity` key).
- `plate.glow`: `'dawn'` (default; the last warm light leaves), `'none'` (darker, no seam), `'moon'` (the moon sits at
  `glowX + 170`, 360 px over the horizon: move `glowX` so it misses the question).
- `plate: {type: 'photo', src}`: his real last shot, **scratchpad only, never committed**.

## Do / don't

- Do keep the line running off the edge: `x1` well past 1080 and an ease with speed at the end (`sine.in`, `none`).
  A `.out` ease makes it come to rest inside the frame, which is a different, closed ending.
- Do keep ≥ 1.2 s after the line leaves the frame. That held, open frame is the point of the family.
- Don't fade to black at the end, and don't add a hit or turn: this family stays quiet.
- Don't put a statement or slogan where the question goes; it is an open question to the viewer, never "I".
- Don't change `cue.land` without moving `question.times` with it (and the reverse).

## Known limits

- **Tick order differs from the brief.** The brief has the tick slowing to silence *before* the question. Night Watch
  only slows ticks *after* `land`, and the landing sting must be on the question. So the ticks keep their pace through
  the visual density drop and slow from the question on. Matching the brief needs a cue field such as
  `tickSlowFrom`, which would mean changing the shared engine, and that is outside this family.
- `pad: false`. With the pad on, its 1.6 s attack made the score swell from −30.7 to −22 dBFS over the first 2 s,
  louder exactly while the picture thins out (measured in the first render). Without it, the "music" before the land
  is ticks and sea only. As a tail appended to a scored reel that's right; on its own, the first 3 s are sparse.
- The sting lands about 21 dB over the bed, because the master normalises a very quiet score to −14 LUFS. It reads as
  the one event of the piece, but it is not "quiet" in absolute terms.
- The demo starts mid-caption at frame 0 (it is a tail). On its own, the first frame looks like a cut-in.
- The question size is 92 px (not the hook's 96) so "Who are you becoming?" stays on one line inside x 80–940.
- Determinism was not re-proven for this family. It uses only the foundation's proven painters and transforms are set
  at build time, but no double render was diffed.
