# 05 · THE HUMAN SIGNAL

**Gold line behaviour:** *a bridge between two lights that answers or fades.*

Two points of light sit far apart on the horizon of a dark sea plate: gold on the left, pale gold on the right. The
gold one speaks: a short line reaches out and becomes a waveform. The first time, nobody answers, so the line turns
passivity grey and sinks. The second time, the other light answers. Its line reaches back, the two meet halfway and
become one steady line, and both lights brighten. Then one Cormorant line tells the viewer what to do with it:
"Notice the small reach. / *Answer it.*"

There are no people and no faces: the two lights stand in for two people. Everything here is code-drawn and synthetic.

**Purposes served:** feel something true (1), make an idea easier (2): a "bid" for connection, shown rather than
explained.

**Status:** revision 1, 27.10.2026 (see "Revision 1" below). All demo copy is DEMO COPY, not for posting.

## Files

| File | What it is |
|---|---|
| `index.html` | The composition (HyperFrames contract: one root `data-composition-id="main"`, one paused timeline). Lights and waveforms are painted on one canvas from composition time (`BM.onTime`). |
| `data.js` | `window.DATA`: every value the piece uses (copy, timings, positions, light colours, plate, cue), plus the three variants. |
| `envelope.js` | Generated data, not copy: the score's measured loudness, one value per frame, for each variant. The waveform reads it. |
| `envelope.mjs` | Makes `envelope.js` and `cue.json` from `data.js` (`--work <dir>`), and checks that they are current (`--check`). |
| `cue.json` | The Night Watch cue of the default variant. It must equal `DATA.cue` (`node envelope.mjs --check`). |

## How the sound drives the picture

The waveform is not animated by hand. `envelope.mjs` renders two isolated layers of each variant's cue with
`tools/night-watch-render.mjs`:

- `bells`: only the opening sting A-E-D and the landing sting E-D-A.
- `heart`: only the heartbeat.

It then measures RMS per frame and maps it from −42 to 0 dB onto 0 to 1, with a 0.18 s release. A bid names the layer
it carries. At the light that speaks, the line's amplitude is that layer's loudness at that frame, normalised to the
bid's window and shaped by `wave.gamma`. Further along the line, the same envelope plays back from the moment the
front passed that point, so the signal rolls outwards from the light. The result is that the bell strike and the
ripple happen together by construction:

- The first bid carries the opening sting.
- The second bid carries the heartbeat, softened first (`wave.soften.heart`: a one-pole follower, attack 0.06 s,
  release 0.6 s) so each beat rolls out as a swell, not a spike.
- The answer carries the landing sting.

## Inputs (`data.js`)

| Field | Type | Meaning |
|---|---|---|
| `variant` | `'both' \| 'answered' \| 'missed'` | The brief's `outcome`. It can also be set with `window.SIGNAL_VARIANT` before `data.js` loads. |
| `duration` | s | Must equal `data-duration` in `index.html` and `cue.duration` |
| `plate` | `{src, seed, glow, horizonY, density, fadeIn:[at,dur], push:[from,to]}` | Code sea (`glow:'none'`). `src` is a real photo, for **scratchpad builds only** |
| `lights` | `{y, a:{x,color,ignite,igniteDur}, b:{x,color,appear,appearDur,alpha}, r, litR, halo, haloA, haloLitA, litMix, dimTo}` | Colours are token names (`gold`, `paleGold`, …) |
| `wave` | `{gamma:{bells,heart}, soften:{layer:{attack,release}}, lambda, phaseSpeed, amp, width, replyWidth, jitter, seed, step, headTaper, rootTaper}` | Waveform shape |
| `bids[]` | `{from, at, reach, dur, env, envLen, residual?, freezeAt?, ampScale?, missed, missAt, sinkDur, sinkY}` | Each bid. `reach` is the fraction of the gap; the front eases with power2.out over `dur`. `residual` (px) is the smallest ripple amplitude while the bid waits; `freezeAt` stops the line's motion on that frame (put it on the dead stop, turn − 0.42); `ampScale` scales the peak |
| `reply` | `{from, at, reach, dur, env, envLen}` or `null` | The answer. `reply.at` should equal `cue.land` |
| `connect` | `{at, settle, steadyAmp, steadyLambda, steadySpeed}` or `null` | When the fronts meet, plus the slow ripple of the joined line |
| `phrase` | `{text, top, at, stagger}` | `*word*` = pale-gold italic; `\n` = line break |
| `mark`, `fade` | `{show, at}`, `{at, dur}` | The end mark, and the dip to black |
| `cue` | Night Watch cue | Copied to `cue.json` by `envelope.mjs` |

## Duration, dimensions, timing map

1080×1920, 30 fps, H.264. The default variant (`both`) runs **11 s**. Text sits in the safe zone (the phrase box
spans x 80–940 with its top at y 640; the mark is at y 1450). The lights are on the horizon at y 1040, at x 196 and
x 884, radius 9 px (12 px when lit).

| t (s) | Picture | Sound (cue) |
|---|---|---|
| 0.05 | The gold light ignites and speaks at once: its line reaches right as a waveform. The sea fades up over 1.1 s | Opening sting A-E-D (`stingAt 0.05`) |
| 0.3–0.75 | The pale light appears (alpha .95) | Sea and pad |
| 0.05–1.65 | First bid: the front reaches 46 % of the gap; the ripple decays with the bells to a small residual that keeps moving | Bells ring out; heartbeat 1.0, 2.05 |
| 2.88 | No answer: the line freezes on the frame the score stops dead | Dead stop: the bed is gated 0.42 s before the silent turn (`turns [3.3]`, `hits:false`) |
| 3.3–4.6 | The frozen line greys, sinks 64 px and fades; the pale light dims to 62 % | Pad darkens (A#-F-A) |
| 4.1–5.6 | Second bid: the gold light reaches again, a soft swell on each heartbeat | Heartbeat 4.15, 4.39, 5.2, 5.44 |
| 5.6 | The answer: the pale light brightens and reaches back | Landing sting E-D-A (`land 5.6`) |
| 6.1–7.0 | The fronts meet halfway: one steady line; both lights brighten | Sting rings |
| 6.24–8.46 | "Notice the small reach. / *Answer it.*" word by word, 0.4 s apart (2.5 words/s) | The sting's A4 and soft low D land on the first word (5.6 + 0.64) |
| 8.9 | The mark THE BECOMING PROJECT | |
| 10.3–11 | Dip to black | Score fade 1.4 s |

## Measured on the render (revision 1, 27.10.2026, scratchpad build)

All figures are from the final MP4 `<scratchpad>/creative-system/families/05-human-signal/05-human-signal.mp4`
(scripts and raw data: `<scratchpad>/creative-system/families/05-human-signal/measure-r1/`). Audio: mono RMS in a
1/30 s window. Picture: the vertical spread of gold pixels (R > 110, R − B > 40) in the band y 920–1160, x 225–520.

- **The first bid stays alive, then freezes on the dead stop:**
  - Spread: 87 px at 0.3 s, 91 at 0.5, 85 at 1.0, 51 at 1.5, 27 at 2.0, then a residual 15–17 px from 2.4 to 2.87 s
    that keeps travelling (about 330–400 changed gold pixels per frame).
  - Changed gold pixels per frame: 359 at 2.87 s, 131 at 2.90 s (the last move into the frozen shape), then 12–40
    (grain and plate push only) through 3.3 s.
  - Audio in the same frames: −23.0 dB at 2.80, −24.4 at 2.83, −28.2 at 2.87, −30.7 at 2.90 s. Window RMS falls
    from −23.1 dB (2.40–2.80) to −32.5 dB (2.92–3.28). Stillness and silence start within one frame of each other.
- **The heartbeat bid is a swell, not a monitor trace:** its peak spread is 94 px, against 95 px for the bell bid
  (ratio 0.99, inside the 1.5× cap). At 5.4 and 5.6 s it is a smooth packet of two or three full sine cycles
  (λ 70 px), with no spike and flat line (checked by eye on `r1-check/fin_crops.png`).
- **The lights read at phone size:** in the 270×480 contact sheet (`r1-check/contact_final.png`), both lights are
  visible in every cell from 0.5 s. Brightest pixel of the pale light: rgb(229,193,152) at 1.0 s and
  rgb(233,195,152) at 2.0 s (pale gold). It dims on purpose after the miss: rgb(173,158,141) at 3.9 s.
- **Readability:**
  - "Notice the small reach." is at ≥ 98 % from 7.53 s. "*Answer it.*" is at ≥ 98 % from 8.37 s. Both stay there
    until 10.43 s, so the whole 6-word phrase is fully on screen for 2.07 s, against the rule's 1.7 s
    (0.8 + 0.3 × 3).
  - Pace: 6 words over 2.0 s, 0.4 s apart, which is 2.5 words/s.

## Render

```
source <scratchpad>/creative-system/env.sh
cd library/becoming/families/05-human-signal && node envelope.mjs --check     # cue.json and envelope.js current?
BECOMING_OUT=<scratchpad>/creative-system/families/05-human-signal \
  library/becoming/tools/build.sh library/becoming/families/05-human-signal
```

After any change to a cue in `data.js`, run `node envelope.mjs --work <dir outside the repo>`. It renders the layer
stems into that directory (about 12 s), then rewrites `envelope.js` and `cue.json`.

Gates on the default variant (revision 1 final build, 27.10.2026): all ten passed.

- lint: 0 errors, 0 warnings.
- check: contrast 12/12.
- render: h264 1080×1920 30/1, 330 frames (quality looks).
- score: 11 s, turns [3.3], stingAt 0.05, land 5.6.
- mix: −14.03 LUFS, −1.80 dBTP.
- mux: 11.0 s.
- review-frames.
- spec-check: 0 warnings.
- brand-lint: no violations.
- audio-qa: −14.03 LUFS, −1.49 dBTP, sub-60 gap 46.2 dB.

## Variants

| Variant | Duration | Story | Cue |
|---|---|---|---|
| `both` (hero) | 11 s | Missed, then answered | `turns [3.3]`, `land 5.6` |
| `answered` | 8 s | One bid, answered at 2.3; "Notice the small reach. / *Answer it.*" from 2.94 | `turns []`, `land 2.3` |
| `missed` | 8.6 s | One bid, missed; "Notice the reach / you *missed.*" from 4.6 | `turns [3.3]`, `land 4.6` (on the phrase) |

To build a variant:

1. Copy the folder to the scratchpad.
2. Set `variant` in `data.js`.
3. Write that variant's `cue` to `cue.json`.
4. Set `data-duration` in `index.html` to the variant's duration.

`answered` and `missed` were rendered this way as `--draft` builds on 27.10.2026 (before revision 1), and every gate
passed: `<scratchpad>/creative-system/families/05-human-signal/variant-*/out/`. They take revision 1's data
(bigger lights, the new phrase, the residual and freeze) but **have not been re-rendered since**. Light colours are a data change
(`lights.a.color`, `lights.b.color`, as token names).

Other phrases considered, all demo copy:

- "Love is a reach, / *answered.*" The first draft's line. Dropped in revision 1: it defines love and gives the
  viewer nothing to notice or do (quote-card territory).
- "Most reaches are small. / *Turn towards them.*" Close second; the first half reads as a claim about the world.
- "Turn towards the small reach." Rejected: clumsy.
- "Connection is built in small answers." Rejected: it reads like a research claim. "Turning towards bids" is
  Gottman's term, and this piece doesn't cite it on screen.

## Do / don't

- **Do** keep the two lights abstract, never figures. Keep the answered line one colour (it turns gold as it joins).
  Keep the missed line grey and sinking, never broken or exploding.
- **Do** regenerate `envelope.js` whenever a cue changes. `--check` fails if it is stale.
- **Don't** add ticks: `ticks:false` is the brief's "no tick race". Don't turn `hits` on: the miss is a silence,
  not a hit.
- **Don't** put a real photo in this folder. `plate.src` is for scratchpad builds only (house rule 8).
- **Don't** let the reply's ripple run under the phrase. `reply.envLen` 1.2 lets it settle by about 7 s.

## Known limits

- Night Watch has no per-note bell cue. The brief asks for "two bell tones that answer each other (A then E) on the
  bids", but the engine can't place single bells without editing `lib/night-watch.js`, which belongs to the
  foundation. This piece uses the house cue instead: the A-first opening sting is the call, and the E-first landing
  sting is the answer. The missed bid gets **no** bell. Its sound is the dead stop: a silent turn with `hits:false`.
  If single bells are wanted, add a `bells: [{note, t}]` cue field to the foundation.
- The `heart` layer is rendered without `land`, so the heartbeat does not fade after the landing. The bids that carry
  it end before `land` in every variant, so the window they use is the same. This was checked against the cue
  formula, not measured.
- The dead stop is a 9.4 dB drop, not true silence: the opening bells are still ringing out under it.
- Heartbeats at 1.0 s and 2.05 s sound with no visual event, because the first bid carries the bells. This is
  intended (the heartbeat sits underneath), but they are sound events without a picture beat.
- The frame is dark and sparse by design. Revision 1 made the lights 9–12 px and the wave 48 px, and they now read
  in a 270×480 contact sheet, but the top half of the frame is still empty until the phrase at 6.24 s. The piece
  depends on the waveform's motion and won't read as a still thumbnail.
- The dimmed pale light (3.3–5.6 s) reads as a muted, slightly grey gold. That is the intended "turned away"
  state, but at phone size it is close to the critic's "grey speck".
- The light halo is a faint radial (alpha ≤ .17). It is not a shadow glow, but a strict reading of "no glow" might
  object; it can be set to 0 in data.
- A variant needs `data-duration` edited by hand (build.sh reads the static attribute).

## Revision 1 (27.10.2026)

A strict critic said REVISE (no hard fails). What it found, and what changed:

1. **Copy was a quote card.** "Love is a reach, / *answered.*" defined love and taught nothing. Now: "Notice the
   small reach. / *Answer it.*" (second person, an action, 6 words at 2.5 words/s). The piece grew from 10.5 to
   11 s (mark 8.3 → 8.9, fade 9.8 → 10.3) so the phrase holds for 2.07 s at full strength (needs 1.7 s). The
   two-word italic emphasis is written `*Answer* *it.*`, because `revealWords` splits on spaces (the first render
   showed literal asterisks; caught by eye and fixed).
2. **The opening 6 s were a thin, tiny band.** Lights r 5.5 → 9 and litR 7.5 → 12 (halo 30 → 44), wave amp
   34 → 48, horizon and lights y 1180 → 1040, pale light alpha .78 → .95 and in by 0.75 s (was 1.25), dim to .62
   (was .5), phrase top 660 → 640. The ignite now scales with `r`.
3. **The miss was silent on a static frame, and the heartbeat looked like an ECG.** The first bid now keeps a
   residual 5 px amplitude (15–17 px spread) until `freezeAt` 2.88, then freezes on the dead stop (envLen
   2.6 → 3.4 so the envelope doesn't fade before it). The heart layer is softened (attack 0.06 s, release 0.6 s),
   gamma 1.3 → 2, λ 52 → 70. Its peak equals the bell bid's (0.99×).

Measured evidence is in "Measured on the render" above. All ten gates pass. Remaining weaknesses are in
"Known limits".
