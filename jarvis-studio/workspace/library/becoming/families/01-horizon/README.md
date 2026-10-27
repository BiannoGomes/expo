# 01 · THE HORIZON

**Gold line behaviour: it ignites and becomes the horizon.** A point of gold light ignites in the dark, travels and
draws the horizon; the sea exists only where the line has passed. One phrase rises above it. Then the line hands
itself over to the world: it cools, thins and disappears into the plate's own lit horizon while the camera pushes in.

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
| `duration` | number (s) | 10. Must equal `data-duration` in `index.html` and `duration` in `cue.json` |
| `state` | `'still' \| 'trembling' \| 'jagged' \| 'gone'` | the vault's "The sea, four ways"; picks one entry of `states` |
| `states.<name>` | `{amp, step, tremor, tremorHz, swell, density, glow, seam}` | line jitter (`BM.wob` amp/step, px), live vertical tremor (px, Hz), plate water (`swell`, `density`, `glow` = `'dawn'\|'moon'\|'none'`), and how bright the plate's horizon stays after the hand-over (`seam`, 0–1; `gone` = 0: nothing remains) |
| `plate` | `{type: 'code'\|'photo', src, horizonY, seed, glowX}` | `code` = `BM.seaPlate`; `photo` = an image inside the composition folder, cover-fitted to the 1188×2112 overscan plate. `horizonY` = the **frame** y of the horizon after that fit; the line is drawn on it and the push origin sits on it |
| `grain` | `{seed, amount}` | `BM.grain` |
| `line` | `{seed, x0, xRight, xLeft, ignite, igniteDur, right:[start,dur], left:[start,dur], ease, width, widthEnd}` | ignition point and time; the head's travel right (past the edge); a quieter arm reaching left past the other edge; stroke width before/after the hand-over |
| `reveal` | `{up, down, grow, fadeIn, feather, soft, column, spill:{r, sy, alpha}}` | how each 4 px column of the plate opens up and down from the horizon once the line has passed it (heights, time to open, horizontal feather behind the heads, soft ends) and the light spilling from the head |
| `phrase` | `{text, top, times[]}` | the one line (`\n` = break, `*word*` = italic pale gold) and each word's start (s) |
| `handover` | `{at, dur, seamAlpha}` | gold → cream, 4 → 1.5 px, fade into the plate's horizon |
| `push` | `{at, dur, from, to, ease}` | camera push on the plate and the line together |
| `dip` | `{at, dur}` | dip to black |

## Duration, dimensions, timing map

10.0 s · 1080×1920 · 30 fps · H.264 + AAC 48 kHz. Text inside the safe zone (x 80–940, y 250–1500): the phrase sits at
y ≈ 720–930, the horizon at y 1180.

| t (s) | Picture | Sound (`cue.json`) | Measured |
|---|---|---|---|
| 0.00 | black | bed starts very low (−32 dB RMS before the sting) | |
| 0.05 | a cream point ignites at (330, 1180), r 3→6, gold light spills up and down from it | opening sting A-E-D, `stingAt: 0.05` | sting onset 0.05 s; first lit frame 0.067 s (frame 2) |
| 0.3–3.0 | the head travels right to x 1170 (power1.inOut, off screen at ≈ 2.6 s); from 0.5 a second arm reaches left to x −90; each column of the sea opens from the horizon once the line has passed (feathered 170 px behind the heads) | sea + pad | plate fully open by ≈ 4.5 s |
| 3.2–5.2 | "An edge, / or a *horizon*?" rises word by word (.22 s from y 14) at 3.2, 3.6, 4.5, 4.75, 5.0 | ticks from 4.0, every 0.5 s | "or" and "horizon?" first legible 0.067 s after the ticks at 4.5 / 5.0 |
| 5.8–7.5 | hand-over: stroke gold → cream, 4 → 1.5 px, fades (power2.in) while the plate's horizon seam brightens; push 1.00 → 1.04 (sine.inOut) | ticks continue, no turns | |
| 7.5–9.3 | hold: the phrase over the lit horizon | `fade: 1.4` starts at 8.6 | |
| 9.3–9.9 | dip to black (power1.in); 9.9–10 black | silent by 10.0 | −60 dB RMS at 9.9–10 |

Readability: 5 words, 3.2 → 5.22 s ≈ 2.5 words/s. The whole phrase is fully on screen from 5.22 s to the dip at
9.3 s (4.1 s; the rule asks 0.8 + 0.3 × 2 = 1.4 s). "An edge," alone holds 0.68 s before "or" joins it, as one
breath. Words never reflow: each sits in its final place from the start.

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
- **The reveal** is a mask built per frame from 4 px columns. Each column has a pass time (when a head first reached
  it, found by bisection on the eased head position once at build time). Its vertical opening grows with age
  (power2.out over `grow`), its alpha is feathered by distance to the nearer head. The plate is drawn, then
  `destination-in` with the mask, then the head's light (an additive tall ellipse) and, from 5.8 s, the plate's own
  horizon seam are added with `lighter`.
- **The line** is drawn as a polyline up to the head (cut by x, not by dash length, so a trembling line keeps its
  head on its end).

## Variants

Set in `data.js` (one file swap). Each was rendered as a scratchpad draft (see "Proof").

- `state: 'still'` (default): fine jitter, slow water, dawn light, a bright horizon left behind.
- `state: 'trembling'`: the line shakes 1.6 px at 6 Hz, quicker water, a slightly dimmer seam.
- `state: 'jagged'`: rough line (amp 7.5 px, step 24), rough water, moon light, a dim seam.
- `state: 'gone'`: no light in the sky (`glow: 'none'`); the line draws the horizon and then leaves nothing behind.
- `plate: {type: 'photo', src: 'assets/<file>', horizonY}`: a real photo takes the line (scratchpad builds only).

## Do / don't

- Do keep one phrase: a question or an invitation, at most ~6 words; check words/s and hold time from frames.
- Do put the phrase's word starts on the tick grid (tickFrom + k × 0.5 s) when you change copy or `tickFrom`.
- Do measure a photo's horizon after the cover fit and give that frame y as `horizonY`.
- Don't add a landing sting unless the phrase is the last thing that happens; here the hand-over follows it.
- Don't add turns or hits: this family is quiet. Don't make the spill brighter until it reads as a glow.
- Don't put his photos, video or voice in this folder (house rule 8). Photo builds live in the scratchpad.
- Don't use the word "Bianno" anywhere on frame; the copy carries no factual claim and needs no source.

## Known limits

- The plate is dark (the house scrim plus a dark sea): the lower third reads as near-black water with a faint glint
  path. That matches the dark-sea plates he liked, but on a bright phone in daylight it may read as empty.
- The bed (pad/sea) starts at t = 0, about −32 dB RMS, before the sting; Night Watch has no toggle to start it at
  `stingAt`.
- Ticks run evenly every 0.5 s from 4.0 to the end (no turns); only two of them coincide with words.
- `photo` waits for the image's `load` and repaints; it was tested with a synthetic ffmpeg-drawn grid only, never a
  real photo.
- The push uses `sine.inOut` (not the grammar's linear push), so it does not stop dead at 7.5 s.
- Jitter (`amp`) is per state, so the `still` line is still visibly hand-drawn at full resolution.

## Proof (27.10.2026, this sandbox)

PROOF_PLACEHOLDER
