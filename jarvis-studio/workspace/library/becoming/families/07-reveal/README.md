# 07 · The Reveal

Gold line behaviour: **drops in as the mark that changes the meaning.** In both modes the line falls from a waiting
point of light like a pen stroke, lands on the hit, then its tail lifts away and what stays is a single mark: an
apostrophe inside a word, or the underline under one word. It never explodes; it stays as the mark.

## Purpose

A reveal that turns on one small mark. The hero (`mode: 'word'`) is the vault's IMPOSSIBLE → I'M POSSIBLE ("The
apostrophe matters. The human being enters the sentence."), followed by one concrete thing to try: "Turn one
“I can’t” into “I’m learning”." The second mode (`mode: 'sentence'`) shows one sentence in
timed fragments, and the last fragment's key word reframes the first line, arriving exactly on the hit.

Serves purposes **3 (make the story compelling)** and **4 (make the identity recognisable)**: the waiting point, the
dead stop and the falling gold stroke are the house grammar in their most compact form. Use it as an opener or as the
turn of a reel whose idea fits in one reframe.

## Files

| File | What |
|---|---|
| `index.html` | the composition (HyperFrames 0.8.97 contract, one paused GSAP timeline, all canvases painted from composition time) |
| `data.js` | `window.DATA`: copy, timings, geometry, seeds, plate, measured glyph advances. `// DEMO COPY · not for posting` |
| `cue.json` | Night Watch cue for the default `word` mode |
| `cue.sentence.json` | Night Watch cue for `sentence` mode (copy it over `cue.json` in a build copy, see Variants) |
| `README.md` | this file |

## Inputs (`data.js`)

| Key | Type | Meaning |
|---|---|---|
| `mode` | `'word' \| 'sentence'` | picked by `window.REVEAL_MODE` (set before `data.js` loads); default `word` |
| `duration` | number, s | 11. Must equal `data-duration` and the cue's `duration` |
| `turn` | number, s | the hit: the falling line touches down. **Must equal `cue.json` `turns[0]`** |
| `land` | number, s | landing sting time, tied to a visual settle. **Must equal `cue.json` `land`** |
| `deadStop` | number, s | 0.42 (Night Watch's dead stop). Plate swell and grain freeze for this window so the picture stops with the score |
| `point` | `{y, ignite, igniteDur, color}` | the waiting point of light (the pen), y 400. It ignites on the opening sting (`cue.stingAt`) |
| `plate` | `{src, seed, glow, horizonY, glowX, fadeIn:[at,dur], push:[from,to], opacity}` | code sea (`BM.seaPlate`); the `sentence` mode carries its own (lower horizon so the moon clears the text). `src` = **scratchpad only** photo override |
| `word` | `{from, to, markChar, size, tracking, baseline, at, inDur, inY, stoneOpacity, part, relight, echo}` | word mode. `to` minus `markChar` and spaces must spell `from` (index.html throws otherwise). `part` = per-letter x tween (power3.inOut); `echo` = old word left behind (opacity ≤ .13) |
| `sentence` | `{size, lineHeight, top, fragments:[{text, at, stagger}], reframe:{fragment, word}, dimOthers}` | sentence mode. A fragment with `at: null` is timed so its reframing word starts on `turn` |
| `pen` | `{fall, fallEase, widthTop, widthTip, markWidth, run?, runEase?, underline?, x?, retract:{delay,dur,ease}, jitter, seed}` | the gold stroke, painted from composition time on the `#head` canvas (not SVG) so its width can vary: it tapers from `widthTop` (3 px) at the tail to `widthTip` (6 px) at the falling tip, then settles to `markWidth` as the tail lifts (word 8.5 px apostrophe, sentence 5.5 px underline). `fall` ends on `turn`; `run` = the underline run (sentence mode); `x` = margin x of the fall (sentence mode; null = x 120) |
| `line` | `{text, top, at, stagger}` or null | word mode's closing Cormorant line, word by word; `\n` breaks the line |
| `mark`, `fade`, `grain` | as in the foundation | end mark "THE BECOMING PROJECT"; fade to black |
| `metrics` | advance tables | Cinzel 500 caps and Cormorant 500, measured in this Chromium at 1000 px. The timeline is built before web fonts finish loading, so letter positions come from this table, not the DOM. **Add any character a new word needs** (index.html throws on a missing one) |

Derived times are written to `window.REVEAL_TIMES` (sting, stop, fall, turn, retract, settled, land, layout extents).

## Duration and dimensions

11 s · 1080×1920 · 30 fps · H.264 + AAC 48 kHz. All text inside x 80–940, y 250–1500 (word mode: the settled word spans about
x 130–925; checked in frames).

## Timing map · mode `word` (default data, measured from the Revision 1 render on 27.10.2026)

| t (s) | Picture | Sound (cue) | Measured |
|---|---|---|---|
| 0.05 | a cream point (the pen) ignites at y 400 above the I/M gap | opening sting A-E-D, `stingAt` 0.05 | point at x 190, y 398–401 from 0.067 s |
| 0.15–1.15 | dark moonlit sea fades up (horizon 1320; moon at about x 930, y 960, clear of all text) | sea, pad | |
| 0.55–1.45 | **IMPOSSIBLE** rises (Cinzel 104 px, stone at .84, baseline 880) | ticks from 1.0, racing into the turn | fully on 1.45–4.05 s |
| 3.58–4.00 | dead stop: plate and grain frozen | dead stop | |
| 3.62–4.00 | the pen falls (power2.in, 0.38 s), 425 px, into the gap between I and M; the stroke tapers 3 px (tail) → 6 px (tip) | silence | visible on 10 frames (3.70–4.00); tip y 421 (3.767) → 719 (3.967) → 823 on frame 120 (4.000); width 3 px at the tail, 6 px at the tip |
| **4.00** | the hit: the line touches down as the apostrophe | turn `[4.0]`, hit | audio onset 4.000 s (same frame as touchdown) |
| 4.04–4.79 | the tail lifts away; the stroke settles to the 8.5 px mark | | mark 8 px wide from 4.367 s |
| 4.05–5.15 | the letters part (one x tween per letter, power3.inOut); stone → lit cream; echo of IMPOSSIBLE at .12 held 4.0–4.4, gone by 4.55 | | ghost-only columns at 4.567, 4.833, 5.05 and 5.067 s: ≤ 2.1 luma above the clean end frame (rule: ≤ 3) |
| **5.05** | **I'M POSSIBLE** settled | landing sting E-D-A, `land` 5.05 | |
| 5.6–8.16 | "Turn one “I can’t” / into “I’m learning”." (Cormorant 500 italic 70 px, two lines from y 1010), 0.4 s/word = 2.5 words/s | tick slows to silence | fully on 8.16–10.3 s (2.1 s; rule: 0.8 + 0.3 × 4 = 2.0 s for 7 words) |
| 8.7 | THE BECOMING PROJECT (y 1450) | | |
| 10.3–11.0 | fade to black | score fade 1.4 s | |

## Timing map · mode `sentence` (variant render, measured)

| t (s) | Picture | Sound | Measured |
|---|---|---|---|
| 0.05 | point ignites at x 120, y 400 (left margin) | sting | |
| 0.8–2.2 | "Every limit you name" word by word (Cormorant 84 px, top 600) | ticks from 1.0 | fully on from 2.2 s to the fade (rule 1.1 s) |
| 2.7–3.3 | "is also" | | |
| 3.98–4.40 | dead stop; "a" rises at 3.94; the pen falls down the left margin from 4.1 | dead stop | −42.9 dB in the stop |
| **4.40** | the pen turns at the third line's baseline; **"direction."** starts rising (the reframing word) | turn `[4.4]`, hit | touchdown frame 132 (4.400); audio onset 4.411 |
| 4.40–4.95 | the stroke runs right under "a direction." | | |
| 4.7–5.9 | lines 1–2 dim to .72 | | |
| 5.01–5.71 | the tail lifts away; only the underline under "direction" stays (5.5 px stroke) | landing sting, `land` 5.71 | Revision 1: touchdown frame 132 (4.400), hit onset 4.400; settled underline y 862–866 (5 px), x 372–687 |
| 8.7 / 10.3 | mark / fade | | |

## Copy (DEMO COPY, not for posting)

- Word mode: IMPOSSIBLE → I'M POSSIBLE (the vault's idea; also a widely reposted wordplay, so on its own it is a quote
  card), then one concrete action. Three candidates written to house rules (no claims; 5–7 words):
  1. **"Turn one “I can’t” into “I’m learning”."** · chosen (7 words): a behaviour the viewer can try today, and its
     “I’m” is the same mark the pen just drew, so the trick becomes a habit.
  2. "Write one impossible down. Add “I’m”." · concrete, but it repeats the pun instead of moving past it.
  3. "Name one limit today. Take one step." · an action, but generic; nothing ties it to the mark.
- Sentence mode, three candidates written to house rules (interpretation, not claims):
  1. **"Every limit you name / is also / a direction."** · chosen: the reframe is a single concrete word, and it turns
     a complaint into a heading without promising anything.
  2. "What you call failing / is often / a first draft." · clear, but "first draft" is close to a stock phrase.
  3. "The thing you keep avoiding / is usually / the thing asking for you." · strongest feeling, but 11 words is too
     many for the fragment pace (≤ 2.6 words/s) inside 10 s, and the reframing word ("asking") lands weakly.

## Dependencies

The Becoming foundation (`tokens.css`, `fonts/`, `vendor/gsap.min.js` 3.14.2, `lib/becoming-motion.js`), staged
beside `index.html` by `tools/build.sh`. Night Watch via `tools/night-watch-render.mjs`. HyperFrames 0.8.97, Chromium
headless (SwiftShader). No WebGL, no network, no external assets.

## Render

```sh
source <scratchpad>/creative-system/env.sh
BECOMING_OUT=<scratchpad>/creative-system/families/07-reveal \
  jarvis-studio/workspace/library/becoming/tools/build.sh jarvis-studio/workspace/library/becoming/families/07-reveal
```

Sentence mode (a build copy outside the repo):

```sh
V=<scratchpad>/creative-system/families/07-reveal/variant-src/07-reveal-sentence; mkdir -p $V
cp index.html data.js $V/ && cp cue.sentence.json $V/cue.json
sed -i '1i window.REVEAL_MODE = "sentence";' $V/data.js
BECOMING_OUT=<scratchpad>/creative-system/families/07-reveal/variant-sentence tools/build.sh $V
```

Both builds passed all ten gates on 27.10.2026 (again after Revision 1) (`gates-final.txt` beside each MP4 in the scratchpad).

## Variants

- `mode: 'word'` with another pair: any `from`/`to` where `to` adds one mark (and spaces) to `from`, e.g. a hyphen or
  full stop, as long as the mark character's advance is in `metrics.cinzel500` and the settled word fits 860 px
  (it is clamped into the safe zone; if clamped, the mark no longer lands exactly in the gap it entered).
- `mode: 'sentence'` with 2–4 fragments; `reframe` names the fragment and word the line underlines.
- `line: null` drops word mode's closing line; `mark.show: false` drops the end mark.
- `plate.src` (scratchpad only) swaps the code sea for a real photo.

## Do / don't

- Do keep `turn`/`land` in `data.js` equal to the cue's `turns[0]`/`land`, and re-measure if you change `pen.fall`,
  `word.part` or `pen.run`.
- Do keep the pen's fall clear of text (word mode: it falls into the gap it opens; sentence mode: down the margin).
- Don't animate letter-spacing to part the letters (house rule); the parting is one x transform per letter.
- Don't scale the mark from zero, glow it, or add a second gold element on the same frame: the mark is the one accent.
- Don't leave the echo up while the letters move past it (it read as "I'MPOSSIBLE" with doubled B, L, E): hold it only
  while the letters have barely moved (4.0–4.4) and have it gone before they are halfway (4.55).
- Don't let the moon (`plate.glowX + 170`, `horizonY − 360`) sit in the word or line band; move the horizon or glowX.

## Known limits

- Letter positions come from a measured advance table without kerning; a new word must be checked in frames.
- The mark is a gold stroke, not the Cinzel apostrophe glyph: thinner and taller than the font's own. Intentional
  (the pen enters the word), but a typographer will see it.
- The sentence underline briefly runs under "a" before the tail lifts; it settles under the reframing word only.
- The top fifth is still empty apart from the waiting point (it now waits at y 400 and the word sits at y 807–885).
- IMPOSSIBLE → I'M POSSIBLE is a familiar line (attribution commonly given to Audrey Hepburn: UNVERIFIED, so never
  attribute it on screen or in a caption without a source); the closing action is what makes it teach.
- The stroke is a canvas paint, so it no longer uses `BM.goldPath`/`BM.drawOn`; it is drawn as 2 px round-capped
  segments each frame (cheap, deterministic).
- Tokens are PROPOSED (foundation status); the vault's tokens CSS wins when read.

## Revision 1 (27.10.2026)

A strict critic scored the first version REVISE (no hard fails; weakest: practical value and originality, both 5/10).

| Critic found | Changed | Proof (Revision 1 render) |
|---|---|---|
| The hero ended as a quote card: "Put yourself in the sentence." is a metaphor about the trick, not something to do | Closing line replaced with one concrete action, chosen from three candidates (see Copy): "Turn one “I can’t” / into “I’m learning”." Piece lengthened 10 → 11 s so 7 words are fully on screen ≥ 2.0 s | line fully on 8.16–10.3 s (2.1 s) |
| The echo of IMPOSSIBLE doubled under the moving letters (I'MPOSSIBLE, BBLLEE) and was still faint at the landing | Echo held at .12 only 4.0–4.4, then gone by 4.55 (before the letters are halfway) | ghost-only columns ≤ 2.1 luma above the clean end frame at 4.567, 4.833, 5.05, 5.067 s; a brightened crop strip shows no doubling |
| The pen point waited in ~900 px of empty dark; the fall was a 4 px hairline on 7 frames; the sentence underline was 3 px | Word baseline 1010 → 880, point y 300 → 400, fall 0.30 → 0.38 s (still power2.in, still ends on frame 120); stroke repainted on canvas with a 3 → 6 px taper; sentence underline 5.5 px stroke. Horizon 1180 → 1320 and glowX 700 → 760 so the moon clears the raised word | fall visible on 10 frames over 425 px; tail 3 px, tip 6 px; touchdown frame 120 = hit onset 4.000 s; sentence touchdown frame 132 = hit onset 4.400 s; underline 5 px (y 862–866) |
