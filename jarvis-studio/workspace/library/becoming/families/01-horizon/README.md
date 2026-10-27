# 01 · THE HORIZON

**Gold line behaviour: it ignites and becomes the horizon.** A point of gold light ignites in the dark, travels and
draws the horizon; the sea exists only where the line has passed. One phrase rises above it. Then the line hands
itself over to the world: it straightens, thins and cools until it *is* the plate's own lit horizon, while the camera
pushes in.

Purposes served (of the five): **4 · recognisable identity** (the gold line and the dark sea are the house look) and
**1 · feel something true** (a single quiet question, no claim).

All copy is demo copy (`// DEMO COPY · not for posting` in `data.js`). Nothing in it is a photograph; the plate is
code-drawn (`BM.seaPlate`), so it reads as illustration.

```
index.html   the composition (BM only; all values from data.js)
data.js      window.DATA: copy, word times, line geometry, reveal, state variants, plate source, timings
cue.json     the Night Watch cue
```

## Inputs (`data.js`, `window.DATA`)

| Key | Type | Meaning |
|---|---|---|
| `duration` | number (s) | 8.5. Must equal `data-duration` in `index.html` and `duration` in `cue.json` |
| `state` | `'still' \| 'trembling' \| 'jagged' \| 'gone'` | the vault's "The sea, four ways"; picks one entry of `states` |
| `states.<name>` | `{amp, step, tremor, tremorHz, swell, density, glow, seam, glowX?}` | line jitter (`BM.wob` amp/step, px), live vertical tremor (px, Hz), plate water (`swell`, `density`, `glow` = `'dawn'\|'moon'\|'none'`), and how bright the plate's horizon stays after the hand-over (`seam`, 0–1; `gone` = 0: nothing remains) |
| `plate` | `{type: 'code'\|'photo', src, horizonY, seed, glowX}` | `code` = `BM.seaPlate`; `photo` = an image inside the composition folder, cover-fitted to the 1188×2112 overscan plate. `horizonY` = the **frame** y of the horizon after that fit; the line is drawn on it and the push origin sits on it |
| `grain` | `{seed, amount}` | `BM.grain` |
| `line` | `{seed, x0, xRight, xLeft, ignite, igniteDur, right:[start,dur], left:[start,dur], ease, width, widthEnd}` | ignition point and time; the head's travel right (past the edge); a quieter arm reaching left past the other edge; stroke width before/after the hand-over |
| `reveal` | `{up, down, grow, growEase, taper, fadeIn, feather, lead, soft, column, rise:{up, down, at, dur, ease}, spill:{r, sy, alpha}}` | how the plate opens from the horizon in 4 px columns: a strip `up`/`down` px tall, opened over `grow` s from ignition and tapered to nothing over `taper` px towards each head; a signed horizontal `feather` across each head (on both arms, also before the left arm starts); `rise` then opens the rest of sky (`up`) and water (`down`) for every column at once; soft ends (`soft`); the light spilling from the head |
| `water` | `{alpha, depth}` | an additive teal → ocean wash below the horizon (masked like the plate), so the sea reads as water and not as black |
| `scrim` | `{at70, at100}` | this piece's scrim alphas at 70 % and 100 % (the tokens' `.bm-scrim` uses .7 and .94); same night colour |
| `phrase` | `{text, top, times[]}` | the one line (`\n` = break, `*word*` = italic pale gold) and each word's start (s) |
| `handover` | `{at, dur, seamAlpha, ease}` | over the whole window (`ease`, sine.inOut): jitter → 0 (the stroke flattens onto the seam's straight line), 4 → 1.5 px, gold → cream, stroke alpha 1 → 0 at the same rate the seam rises 0 → `seamAlpha` |
| `push` | `{at, dur, from, to, ease}` | camera push on the plate and the line together (linear, 5.2 → 8.5 s, 1.00 → 1.05) |
| `dip` | `{at, dur}` | dip to black |

## Duration, dimensions, timing map

8.5 s · 1080×1920 · 30 fps · H.264 + AAC 48 kHz. Text inside the safe zone (x 80–940, y 250–1500): the phrase sits at
y ≈ 720–930, the horizon at y 1180.

| t (s) | Picture | Sound (`cue.json`) |
|---|---|---|
| 0.00 | black | sea bed only, −36 dB RMS (0–0.04 s) |
| 0.05 | a cream point ignites at (330, 1180), r 3→6, light spills up and down from it | opening sting A-E-D, `stingAt: 0.05` |
| 0.3–3.1 | the head travels right to x 1170 (power1.inOut, off frame ≈ 2.6 s); from 0.5 a second arm reaches left to x −90. The sea opens as a strip about 300 px up and 260 px down the horizon that keeps pace with the heads, soft on both sides | sea + pad |
| 2.6–5.2 | with both heads off frame, the rest of the sky and water open together (flat top, sine.inOut) | |
| 3.15–5.22 | "An edge, / or a *horizon*?" rises word by word (.22 s from y 14) at 3.15, 3.45, 4.5, 4.75, 5.0 | ticks only on "or" (4.5) and "horizon?" (5.0); **landing sting E-D-A on "horizon?" at 5.0**, low D at 5.64; the ticks then slow to silence (5.5, 6.2, 7.17) |
| 5.2–8.5 | linear push 1.00 → 1.05 | |
| 5.8–7.5 | hand-over: the stroke straightens, thins and cools into the seam (sine.inOut, both about 50 % at 6.65) | the landing's tail |
| 7.8–8.4 | dip to black (power1.in); 8.4–8.5 black | `fade: 1.4` from 7.1 |

Readability (word times unchanged from the first build): 5 words over 3.15 → 5.22 s ≈ 2.4 words/s. "An edge," is
settled at 3.60 s and holds alone until "or" at 4.57 s (≈ 0.97 s; floor 0.8 s). The whole phrase is on screen from
5.22 s to the dip at 7.8 s (2.6 s; the rule asks 1.4 s).

## Dependencies

The library foundation only: `tokens.css`, `fonts/` (Cormorant Garamond 500 + 500 italic), `vendor/gsap.min.js`
(GSAP 3.14.2), `lib/becoming-motion.js` (`BM.seaPlate`, `BM.grain`, `BM.wob`, `BM.rng`, `BM.revealWords`,
`BM.onTime`, `BM.mix`, `BM.rgba`), staged by `tools/build.sh`. Night Watch via `tools/night-watch-render.mjs`.

## Render

```bash
source <scratchpad>/creative-system/env.sh
BECOMING_OUT=<outside the repo>/01-horizon \
  jarvis-studio/workspace/library/becoming/tools/build.sh jarvis-studio/workspace/library/becoming/families/01-horizon
```

Add `--draft` for a quick look. Then read `<out>/review/index.md` and every image it lists.

## How it is built (and why)

- **Everything that moves is a canvas painted from composition time** (`BM.onTime`): the world (plate + mask +
  light), the line and its head. No SVG element moves, no wall clock, seeded randomness only. The world and the line
  are both plate-sized canvases (1188×2112 at −54, −96) with the transform origin on the horizon, so the push keeps
  the line on the horizon. Their transform is `gsap.set` at build time (seek-history independence, main README).
- **The reveal** is a mask built per frame from 4 px columns. Each column has a signed distance to the nearer head
  (positive between the heads, negative ahead of them). Its alpha is that distance through a 110 px feather (`lead`
  places the head 60 % of the way up it), and its height is one strip for the whole line, opened over `grow` s and
  tapered to the heads over `taper` px, plus the global `rise`. (Revision 1 replaced per-column age, which made the
  oldest column, at the ignition point, the tallest: a cone.) The plate is drawn, the water wash is added, then
  `destination-in` with the mask, then the head's light (an additive ellipse) and, from 5.8 s, the plate's own
  horizon seam are added with `lighter`.
- **The line** is drawn as a polyline up to the head (cut by x, not by dash length, so a trembling line keeps its
  head on its end). During the hand-over every point's offset from the horizon (jitter and tremor) is scaled by
  1 − u, so the stroke ends exactly on the seam's straight geometry, at the seam's width and colour.

## Variants

Set in `data.js` (one file swap). Each was rendered as a scratchpad draft with `--draft` (see "Proof").

- `state: 'still'` (default): fine jitter, slow water, dawn light, a bright horizon left behind.
- `state: 'trembling'`: the line shakes 1.6 px at 6 Hz, quicker water, a slightly dimmer seam.
- `state: 'jagged'`: rough line (amp 7.5 px, step 24), rough water, moon light, a dim seam. Its state sets
  `glowX: 770`, because the moon sits at glowX + 170, 360 px above the horizon: at 640 it touched "horizon?".
- `state: 'gone'`: no light in the sky (`glow: 'none'`); the line draws the horizon and then leaves nothing behind.
- `plate: {type: 'photo', src: 'assets/<file>', horizonY}`: a real photo takes the line (scratchpad builds only).

## Do / don't

- Do keep one phrase: a question or an invitation, at most ~6 words; check words/s and hold time from frames.
- Do put the last two word starts on the tick grid (`tickFrom`, `tickFrom` + 0.5) and `land` on the last word when you
  change copy.
- Do measure a photo's horizon after the cover fit and give that frame y as `horizonY`.
- Keep the landing sting on the phrase's last word. Since revision 1 the phrase is the last thing read and the
  hand-over plays inside the landing's tail; if copy is added after the phrase, move `land` to the new last line.
- Don't add turns or hits: this family is quiet. Don't make the spill brighter until it reads as a glow.
- Don't put his photos, video or voice in this folder (house rule 8). Photo builds live in the scratchpad.
- Don't use the word "Bianno" anywhere on frame; the copy carries no factual claim and needs no source.

## Known limits

- **Practical value is still the weakest point** (the critic scored it 5): the demo line is a question, not a
  test the viewer can try, and nothing in it is specific to him. Revision 1 fixed craft and sound only. The copy is
  `data.js` and is meant to be replaced by one of his real lines.
- The sea bed starts at t = 0 (−36 dB RMS over 0–0.04 s, before the sting at 0.05). The critic asked for −50 dB or
  less. `sea: false` measured −60.6 dB but drops the sea texture from the whole piece, which the brief asks for.
  The real fix is a foundation change, outside this folder: a bed gate that opens at `stingAt` in `lib/night-watch.js`.
- The sting is 2.9 dB quieter in the master (0.06–1.0 s: −6.9 → −9.8 dB RMS), not the 6 dB the critic asked for.
  Night Watch has no sting-level field. The gap closed because the phrase window is louder (landing sting), not
  because the sting is softer.
- The ticks can't be thinned individually: the engine spaces them evenly. Starting at 4.5 and slowing to silence
  after the landing leaves only one off-word tick (5.5 s) at full grid spacing.
- The bottom fifth of the frame (y > 1600) stays near black under the house scrim, by design of the dark-sea plates.
- `photo` waits for the image's `load` and repaints. It was tested with a synthetic grid only (before revision 1),
  never with a real photo. The variants (`trembling`, `jagged`, `gone`, `photo`) were drafted before revision 1 and
  have not been re-rendered since.
- The audio-qa true-peak reading varies from build to build because of the shared AAC mux (see the foundation).
  Revision 1's two full builds read −1.62 and −1.65 dBTP.

## Proof (revision 1, 27.10.2026, this sandbox)

Final build (`tools/build.sh`, quality looks), all ten gates PASS:

```
PASS  lint          0 errors, 0 warnings
PASS  check         Lint 0 errors, 0 warnings · Runtime 0 errors, 0 warnings · Motion 0 errors, 0 warnings · Contrast 12/12 text checks pass WCAG AA
PASS  render        silent.mp4 h264,1080,1920,30/1,255 (quality looks)
PASS  score         score.wav 8.5 s · 48 kHz 2 ch 16-bit · sample peak -1.31 dBFS · turns [] · stingAt 0.05 · land 5
PASS  mix           mix.sh: OK mix.wav · -14.033 LUFS · -1.798 dBTP · 8.500 s · 48 kHz stereo 24-bit PCM (score-only path)
PASS  mux           01-horizon.mp4 8.500000 s · audio aac,48000,2 · video copied
PASS  review-frames 6 images + index.md in review/ (read them)
PASS  spec-check    reels preset: no FAIL, 0 warning(s)
PASS  brand-lint    composition + 0 copy strings from JSON: no house-rule or brand violations
PASS  audio-qa      lufs -14.05 LUFS · true_peak -1.65 dBTP · sub60_gap 57.1 dB
```

Video stream MD5: `785157d9b776af974a1853949cd45f71`. Renders, frames and the measuring scripts live in the
scratchpad (`creative-system/families/01-horizon/`: `rev1/`, `tools-local/`), never in the repo.

## Revision 1 (critic verdict REVISE, 27.10.2026)

The critic found no hard fails and three main problems. Each is fixed below, with measurements from the final MP4.
Luma is full-range 8-bit grey, so black is 6.5. The critic's YAVG figures are limited-range (black 20.5), roughly
16 + 0.86 × these values.

1. **The opening read as a spotlight cone, the water was nearly invisible, and the left side had a hard vertical edge.**
   *Changed:* the opening height no longer grows with each column's age. It is one 300 px up / 260 px down strip that
   opens over 1.0 s and tapers to the heads over 150 px. The rest of the sky and water open together from 2.6 to
   5.2 s. The feather is now signed, so it runs across both heads, including the left one before its arm starts.
   Added a water wash (teal → ocean, alpha .24), and the scrim's 70 % and 100 % stops go from .7/.94 to .5/.82.
   The spill is less tall (sy 3.4 → 2.0).
   *Measured:* longest hard vertical edge (smoothed, > 8 levels over 6 px) is 22 px at 1.0 s and 27 px at 1.5 s
   (test: ≤ 200 px). Water under the lit span (y 1200–1450) is 24.4 at 1.0 s and 34.1 at 1.5 s (≈ 37 and 45
   YAVG; test ≥ 28). Fully revealed at 5.5 s, the water band y 1250–1750 gains +14.8 over black (≈ +12.7 YAVG;
   it was +3.5) against the sky band's +27.7, so about half (test ≥ +8 and about half the sky).
2. **A 4.1 s static hold, and a crossfade between two different lines.** *Changed:* the stroke now morphs.
   Jitter → 0, 4 → 1.5 px and gold → cream over 5.8–7.5 s on sine.inOut. Its alpha falls at the same rate as the
   seam rises (both 50 % at 6.65). The piece is now 8.5 s with the dip at 7.8, and a linear push of
   1.00 → 1.05 runs from 5.2 s to the end.
   *Measured* (horizon crop, x 200–900): the stroke's gold (R − B at the peak row) is 111 at 5.5 s, 61 at 6.5,
   45 at 6.65, 24 at 7.0 and 16 at 7.5. Its FWHM goes from 5 px at 5.5 s to 3 px at 6.5 s. Row waviness (std of
   the brightest row) is 1.29 px at 5.5 s, 1.14 at 6.0, and 0.07 from 6.5. So by 6.5 s the original gold stroke is
   gone. With frames downscaled 8× to remove grain, the mean change against 0.5 s earlier is 0.77–1.12 levels at
   every 0.5 s step from 5.5 to 8.0 s, so something changes at least every 1.5 s.
3. **The sound was front-loaded, the ticks never resolved, and the bed sounded before the sting.** *Changed*
   (`cue.json`): `land: 5.0`, so the landing sting E-D-A falls on the last word ("horizon?") and the ticks slow to
   silence after it. `tickFrom` 4.0 → 4.5, so ticks start on "or". Duration is 8.5.
   *Measured* (10 ms RMS over windows of the final AAC): 0.06–1.0 s −9.8 dB (was −6.9), 3–7 s −14.6 dB (was
   −20.4). The gap between 0–1 s and 3–7 s is **4.6 dB** (was 13.2; test ≤ 6). High-band tick onsets fall at 4.5,
   5.0, 6.2 and 7.17 s, with **none after 7.5** (was 11, from 4.0 to 9.0). Integrated −14.05 LUFS.
   *Not reached:* RMS before the sting is −36.3 dB (test ≤ −50), and the sting itself is 2.9 dB quieter, not 6.
   Both need foundation changes (see Known limits).

---

### Earlier proof (first build, 10 s, superseded)

Final build (`tools/build.sh`, quality looks), all ten gates PASS:

```
PASS  lint          0 errors, 0 warnings
PASS  check         Lint 0 errors · Runtime 0 errors · Motion 0 errors · Contrast 14/14 text checks pass WCAG AA
PASS  render        silent.mp4 h264,1080,1920,30/1,300 (quality looks)
PASS  score         score.wav 10 s · 48 kHz 2 ch 16-bit · sample peak -1.31 dBFS · turns [] · stingAt 0.05 · land null
PASS  mix           -14.041 LUFS · -1.798 dBTP (score-only path)
PASS  mux           01-horizon.mp4 10.000000 s · audio aac,48000,2 · video copied
PASS  review-frames 6 images + index.md in review/
PASS  spec-check    reels preset: no FAIL, 0 warning(s)
PASS  brand-lint    no house-rule or brand violations
PASS  audio-qa      -14.06 LUFS · true peak -1.56 dBTP · sub60_gap 54.4 dB
```

Video stream MD5 of that build: `3ce57c92a9366673b497361e8325b83d`. Renders live in the scratchpad
(`creative-system/families/01-horizon/`), never in the repo.

Measurements from the final MP4 (frames decoded with ffmpeg, audio from the muxed AAC):
- sting onset between 0.04 and 0.06 s (RMS −35 → −9 dB); first lit frame = frame 2 (0.067 s).
- ticks (high-frequency envelope) at 4.00, 4.50, 5.00, 5.50, 6.00, 6.50, 7.00 s; "or" first visible 4.567 s,
  "horizon?" 5.10 s, so both land 2–3 frames after their tick, as the word rises.
- "An edge," settled at 3.60 s, alone until 4.57 s; full phrase settled 5.22 s, held to the dip at 9.3 s.
- dip: mean luma 21.4 (9.3 s) → 7.0 (9.9 s); audio −63 dB RMS over 9.9–10 s.

Variant drafts (`--draft`, each a copy of this folder with one `data.js` change; frames read at 2.0, 5.5 and 8.0 s):
`trembling` PASS (after one audio-qa true-peak FAIL, see Known limits), `jagged` PASS (re-rendered after moving the
moon), `gone` PASS, `photo` PASS (a synthetic ffmpeg-drawn grid plate with its horizon at frame y 1204; the line sat
on it).

Improvement pass (from the frames of the first render of this round):
1. The sea opened as a hard-sided box that lagged ~170 px behind the head, so the head ran over black with a dark notch
   behind it. Now the opening is eased `sine.inOut` over 2.2 s, the feather is 110 px and `lead` 0.55 keeps the column
   under the head part-open: the light now reaches the head and fans out behind it.
2. "An edge," held alone 0.68 s (under the 0.8 s floor). Word starts moved to 3.15 / 3.45: it now holds ≈ 0.9 s.
3. In `jagged`, the moon sat against "horizon?". The state now moves the light (`glowX: 770`).

