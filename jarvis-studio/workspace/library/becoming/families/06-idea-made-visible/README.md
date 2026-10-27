# 06 · The Idea Made Visible

**Gold line behaviour:** *it travels a loop and closes it into a ring.*

The piece puts the vault's loop STATE → CHOICE → ACTION → EVIDENCE → IDENTITY (CMP §07) on a circle. The five Cinzel
words sit on a deep-ocean radial with a faint, seeded starfield. A gold point ignites on STATE and travels clockwise.
Each word lights as the line reaches it. Every arrival lands on a tick of the score's own watch tick, and always on
the bright "tick" of the watch's tick-tock, so only the off-beat "tock" sounds between two words. After
IDENTITY the ticks race while the line runs the last leg home. Twenty-eight degrees short of where it began, the score
stops dead and the line stops with it, its head held as a brighter node. On the hit, the line closes the ring, and the
ring becomes the eclipse ring: a dark disc with a dark-to-gold radial corona. One Cormorant line then names the lever
in the loop's own words, with the landing sting on its first word.

Everything is code-drawn and synthetic. There are no photos and no people.

**Purposes served:** make a difficult idea easier (2): a self-reinforcing loop is easier to see than to explain. Help
the viewer change something (5): the line points at the one lever, a single action, and says what it moves.

**Status:** revision 1, 27.10.2026. All copy is DEMO COPY, not for posting.

## Revision 1 (27.10.2026)

A strict critic scored the first draft REVISE (no hard fails). It found three problems. This is what changed and how
each change was checked against the new render.

1. **The line was a stock aphorism, not tied to the diagram.** "What you repeat / becomes who you are." is close to the
   familiar "we are what we repeatedly do". It named none of the five step words. **Change:** the line is now "Change
   one *action.* / Identity follows the *evidence.*" It has 7 words, names ACTION, EVIDENCE and IDENTITY from the ring,
   and points at the one step the viewer controls. **Check:** exact-phrase web searches for "identity follows the
   evidence" and "change one action" found no quote using either phrase (27.10.2026). The idea is close to James Clear's
   "every action ... is a vote" and "evidence of your identity" (https://jamesclear.com/identity-votes), so a post
   should credit that in the caption if it leans on it. Frames 9.6 s and 11.0 s show the line under the eclipse.
   It spans x 103–913 and y 1224–1379.
2. **Arrivals were not audible as arrivals.** The tick runs on its own 0.5 s grid, and two of the four arrivals fell on
   the quieter, darker "tock". **Change:** `reachTicks` is now `[null, 0, 2, 4, 6]`. Every arrival falls on the brighter
   3150 Hz "tick", and every tick up to IDENTITY is an arrival, so the pattern is tick (word), tock, tick (word).
   **Check, and what is still not met:** peaks in the 2.5 kHz high-passed band of the final MP4 are, for the arrivals,
   −14.0 (1.900 s), −14.3 (2.898 s), −13.9 (3.840 s) and −13.4 (4.648 s). For the tocks between them they are −15.1,
   −15.5, −13.9 and −13.8. Each arrival is 0 to 1.6 dB above its neighbours, **not the 6 dB the critic asked for.** A
   real accent needs an `accentTicks` cue field in `lib/night-watch.js`. That file is outside this family's folder, so
   this revision could not add it (see Known limits). The picture is in sync: each word's brightness jumps on the frame
   of its tick (1.900, 2.900, 3.833, 4.633).
3. **The diagram and the turn were too small for a phone.** **Change:** R 220 → 290, with the centre at (510, 800)
   instead of (520, 850). STATE now sits at 12 o'clock. The words are 50 px instead of 40, and all five are on arcs
   (`labels.mode: 'arc'`, new). The gap is 28° instead of 16°. The held head grows to a 7 px node during the dead stop
   (`nodes.stopR`, new). **Check (frame 6.3 s):** the gap between the line's two ends is 28.2°, a 141 px chord. The cap
   height in STATE is 34–35 px. All text at 11.0 s sits in x 103–913 and y 452–1379. The gap region holds unchanged from
   6.067 s to 6.467 s, then changes on the hit frame (6.500 s).

## Files

| File | What it is |
|---|---|
| `index.html` | The composition (HyperFrames contract: one root `data-composition-id="main"`, one paused timeline, registered last). The line, the nodes and the head are painted on one canvas from composition time (`BM.onTime`). The corona and the stars are painted on canvases too. The words are SVG `<text>` / `<textPath>`. |
| `data.js` | `window.DATA`: every value the piece uses (steps, geometry, timings, copy, cue), plus the variants. |
| `cue.json` | The Night Watch cue of the default variant. It must equal `DATA.cue` (`node plan.mjs --check`). |
| `plan.mjs` | Prints every variant's beat times, computed from `data.js` and its cue. `--check` verifies that `cue.json` equals the default cue, that every reach tick exists, that `land` is on the phrase's first word, and that the phrase meets the readability floor. |

## How the sound drives the picture

The score has no per-event tick accent: the watch tick runs every 0.5 s from `tickFrom` and races into each turn. Its
clicks alternate between a brighter "tick" (3150 Hz, velocity +0.06) on even indices and a darker "tock" (2350 Hz) on odd
ones, so arrivals are put on even indices. The picture follows the tick, not the other way round. `index.html` (and `plan.mjs`) recompute the tick schedule with the
same loop as `lib/night-watch.js`. `reachTicks[k]` names the tick on which step k lights. The head's travelled angle
is a monotone cubic (Fritsch–Carlson, so it never runs backwards) through those (time, angle) points. It starts from
rest, and it ends at `turn − 0.42` (the score's dead stop), `ring.gap` degrees short of the start. A changed cue
therefore moves the arrivals with it.

## Timing map (default variant `loop`, 12 s)

| t (s) | Picture | Sound (cue) |
|---|---|---|
| 0.30 | the gold point ignites on STATE (12 o'clock); STATE fades up lit; the radial and the stars fade up (to 1.30) | opening sting A-E-D (`stingAt: 0.3`) |
| 0.60–1.40 | the other words fade up dim (mist) | — |
| 0.60 | the head sets off clockwise from rest | — |
| 1.900 | CHOICE reached: the node flashes pale gold, the word flashes and settles to ink | tick 0 (`tickFrom: 1.9`) |
| 2.898 | ACTION reached | tick 2 |
| 3.840 | EVIDENCE reached | tick 4 |
| 4.648 | IDENTITY reached | tick 6 |
| 4.65–6.08 | the last leg, back towards STATE | the ticks race (ticks 7–12) |
| 6.08–6.50 | dead stop: the head holds 28° short of STATE as a brighter 7 px node; the gap is a 141 px chord | the bed stops dead |
| 6.50 | the line closes the ring (0.1 s, from one frame before); eclipse disc and corona grow (to 7.6) | hit (`turns: [6.5]`) |
| 6.90–9.52 | the phrase rises word by word, 2.5 words/s; fully on screen from 9.52 | landing sting E-D-A on the first word (`land: 6.9`), soft low D at 7.54 |
| 10.0 | the mark THE BECOMING PROJECT (y 1450) | ticks slow to silence |
| 11.6–12.0 | dip to black | 1.4 s fade |

**Measured from the revision 1 MP4** (30 fps frames and the decoded AAC; scripts and frames in the scratchpad
`families/06-idea-made-visible/r1/`):

| Event | Sound | Picture (first frame showing it) |
|---|---|---|
| CHOICE / ACTION / EVIDENCE / IDENTITY | ticks at 1.900 / 2.898 / 3.840 / 4.648 | the word brightens at 1.900 / 2.900 / 3.833 / 4.633 (all within 1 frame) |
| dead stop | bed gated from 6.08 | the gap region is unchanged from 6.067 to 6.467 |
| hit / ring closes | 6.50 | 6.500 (the gap turns gold) |

**Readability** (floor: 0.8 s plus 0.3 s per word beyond 3): the step words are single words, visible (dim) from
about 1.4 s and lit from their arrival to the end, so each is on screen for at least 6 s. The phrase has 7 words and
needs 2.0 s. It is fully up at 9.52 and the dip starts at 11.6, so it has 2.08 s. Its pace is 2.5 words/s (limit 2.6).
In the 9.6 s and 11.0 s frames both lines are fully on screen and the second line (the wider one) spans x 103–913.

## Inputs (`data.js`)

| Field | Type | Meaning |
|---|---|---|
| `variant` | `'loop' \| 'open' \| 'three'` | Can also be set with `window.LOOP_VARIANT` before `data.js` loads |
| `duration` | s | Must equal `data-duration` in `index.html` (12) and `cue.duration`. A variant with a different duration needs `data-duration` changed too |
| `steps` | string[3–6] | The loop words (Cinzel caps). Step 0 is the start, lit on the ignition |
| `close` | `'ring' \| 'open'` | `ring`: the line closes and becomes the eclipse. `open`: it passes its start and keeps widening outwards (a spiral), with no eclipse |
| `ring` | `{cx, cy, R, startAngle, gap, jitter, seed, width}` | The circle; `startAngle` is step 0's angle in degrees, clockwise from 3 o'clock; `gap` is how far short the head stops |
| `labels` | `{mode, size, weight, tracking, gap, capH, arcSpan, sideGap, sideDy, dim, lit, flash, fadeIn, flashDur, settleDur, lead}` | Word layout and colours (token names). `mode: 'arc'` (default): every word follows a concentric arc (`textPath`), upright facing outwards in the upper half and reading left to right under the ring in the lower half. `'mixed'`: words near the sides (\|sin θ\| < .5) sit level beside the node (fits only a small ring) |
| `nodes` | `{r, litR, flashR, dimAlpha, stopR}` | The node dots; `stopR` is the head's radius while it is held at the dead stop |
| `ignite`, `move` | `{at, dur}`, `{start}` | The point's ignition (= `cue.stingAt`), and when the head sets off |
| `reachTicks` | `(null \| int)[]` | For each step after the first: the index of the tick that step lands on |
| `closeDur`, `closeLead` | s | How long the closing takes, and how far before the hit it starts (1 frame) |
| `open` | `{extra, grow, dur}` | The open variant: extra degrees past the start, outward growth (px), and the duration |
| `corona` | `{dur, outer, disc, ringA}` | The eclipse: grow time, outer radius (× R), disc darkness, and gold alpha at the ring |
| `bg`, `stars`, `grain` | — | The radial fade-in; the seeded starfield (none inside 1.25 R); the film grain |
| `phrase` | `{text, top, at, stagger}` | `\n` is a line break. `*word*` is pale-gold italic, **one word per asterisk pair** (`*who* *you* *are.*`) |
| `mark`, `fade` | `{show, at}`, `{at, dur}` | The end mark, and the dip to black |
| `cue` | Night Watch cue | `turns[0]` = the closing; `land` = `phrase.at`; `stingAt` = `ignite.at` |

## Dimensions and dependencies

1080×1920, 30 fps, 12 s (`three`: 10.5 s). Text stays inside x 80–940, y 250–1500. Measured at 11.0 s: the step
words span x 163–856 and y 452–1138, the phrase spans x 103–913 and y 1224–1379, and the mark sits at 1450. The ring is
centred at (510, 800) with R 290, and the corona reaches 1.95 R. The piece depends on the library's `tokens.css`,
`fonts/` (Cinzel 500, Cormorant Garamond 400/500 italic, Inter 500), `vendor/gsap.min.js` (3.14.2) and
`lib/becoming-motion.js` (BM), all staged by `tools/build.sh`. The score is `lib/night-watch.js`. No WebGL.

## Render

```
source <scratchpad>/creative-system/env.sh
BECOMING_OUT=<scratchpad>/creative-system/families/06-idea-made-visible \
  jarvis-studio/workspace/library/becoming/tools/build.sh jarvis-studio/workspace/library/becoming/families/06-idea-made-visible
node jarvis-studio/workspace/library/becoming/families/06-idea-made-visible/plan.mjs --check
```

Result of revision 1 on 27.10.2026, all ten gates PASS:
- lint 0/0
- check: contrast 35/35 AA, layout 0 issues
- render: h264 1080×1920 30/1, 360 frames
- score
- mix: −14.02 LUFS, −1.80 dBTP
- mux
- review-frames
- spec-check: 0 warnings
- brand-lint: no violations
- audio-qa: −14.03 LUFS, −1.77 dBTP, sub-60 gap 43.8 dB

## Variants

- `loop` (hero): as above.
- `open`: `close: 'open'`, with the same cue. At the hit the line passes its start, outside it, and keeps widening for
  another 140° (to about 8.2 s). There is no eclipse. The first draft (R 220) was rendered from a scratchpad copy with
  only `variant` changed, and all ten gates passed. **Revision 1's geometry has not been rendered in `open`.** It needs
  its own phrase.
- `three`: ACTION → EVIDENCE → IDENTITY, 10.5 s, `turns [5.0]`, `land 5.4`. `plan.mjs` checks it (EVIDENCE on tick 2
  at 2.520, IDENTITY on tick 6 at 3.890, phrase held 2.03 s). It has **not been rendered**: it needs `data-duration="10.5"`
  in `index.html` and its cue copied to `cue.json`.

## Do / don't

- **Do** keep each step a single word. Keep 3–6 steps, and the loop in the order it is lived.
- **Do** move arrivals by changing `reachTicks` or the cue, never by hand-typing times: the picture follows the tick.
- **Do** run `plan.mjs --check` after any change to the cue, the phrase or the steps.
- **Don't** switch to `labels.mode: 'mixed'` with R 290: a level side word has only about 140 px between the node and
  x 80 / 940. With five steps, two words always sit within 18° of the sides, so on arcs they read along the ring (dial
  style).
- **Do** keep arrivals on even tick indices (the bright "tick").
- **Don't** wrap several words in one pair of asterisks: `BM.revealWords` marks single words, and the asterisks will
  render as text. The first build showed `*who you are.*` literally on frame.
- **Don't** make the corona brighter than `ringA` .34 or add a shadow: it must stay a radial gradient, not a glow.
- **Don't** state a fact about the world in the phrase. The loop is an interpretation, so keep it plain.

## Copy (DEMO COPY)

"Change one *action.* / Identity follows the *evidence.*" This is an interpretation of the loop, not a research claim.
The idea is close to James Clear's identity-votes argument (https://jamesclear.com/identity-votes), so a caption that
leans on it should credit him. Exact-phrase web searches found no existing quote using either phrase (27.10.2026).
Candidates considered:
- "Change one action. The evidence rewrites the identity." (the critic's example) Rejected: 8 words. "Rewrites" also
  overstates what one action does.
- "One new action is new evidence." Rejected: it stops before IDENTITY, so the loop never closes in the words.
- First draft: "What you repeat / becomes who you are." Rejected by the critic as a near-paraphrase of a stock quote.

## Known limits

- **No real tick accent per word (not fixed by revision 1).** Arrivals now fall only on the brighter "tick", and the
  only sound between two arrivals is one "tock". The measured difference is 0 to 1.6 dB, not the 6 dB the critic asked
  for. A true accent needs a cue field such as `accentTicks: [0, 2, 4, 6]` in `lib/night-watch.js` (about +6 dB and a
  brighter partial on the named ticks). That file belongs to the library, not to this family.
- **The last leg is slow.** IDENTITY is reached at 4.648 s, and the head covers the last 44° by 6.08 s, so it eases into
  the dead stop while the ticks race. This reads as straining towards the close, but the head doesn't speed up with the
  race. An accent field would let the arrivals spread out again.
- **Side words read along the ring.** CHOICE and IDENTITY sit within 18° of the sides, so on their arcs they run at
  about 72° (dial style). They are 50 px and read clearly in the frames, but they are less immediate than the level
  words at the top and bottom.
- In the `open` variant, the widening spiral may touch the words. It was checked only at R 220. Render it before use.
- The lower part of the frame (y > 1480) is empty by design (the Reels UI sits there).
- The tokens are PROPOSED (see the library README).
