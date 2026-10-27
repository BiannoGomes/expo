# hello · the end-to-end proof

An 8-second synthetic piece that runs the whole library once: the code-drawn sea, grain, the gold line, the hook,
the word-by-word captions, the end mark and the Night Watch score, through every gate of `tools/build.sh`.
All copy is demo copy. Nothing in it is a photograph.

```
index.html   the composition (BM only; reads data.json at load)
data.json    every value the piece uses: copy, word times, line geometry, plate, timings
cue.json     the Night Watch cue
```

## Build

```bash
source <scratchpad>/creative-system/env.sh          # or export the variables in ../../README.md yourself
BECOMING_OUT=/somewhere/outside/the/repo/hello  tools/build.sh templates/hello          # full quality
BECOMING_OUT=/somewhere/outside/the/repo/hello  tools/build.sh templates/hello --draft  # quick look
```

Run from `workspace/library/becoming/`. Without `BECOMING_OUT` the output goes to `templates/hello/renders/`
(gitignored). Then read `review/index.md` and every image it lists.

## Timeline (composition time, seconds)

| t | Picture | Sound (cue.json) |
|---|---|---|
| 0.0 | black | |
| 0.05 | the gold light ignites centre-left on the horizon (x 240, y 1180): a cream point, opacity 0→1 and r 3→6 over .25 s | opening sting A-E-D (`stingAt: 0.05`) |
| 0.3–2.6 | the point draws the jittered line (`BM.wob`, seed 7) along the horizon to x 860, power2.out; the sea plate fades up over the same 2.3 s and pushes 1.00→1.07 linear to the end | the tick starts at 0.9 |
| 0.8–3.2 | the hook "Become the man you would be *proud* to meet." rises word by word (`BM.revealWords`, .2725 s apart, Cormorant 500 96 px, top 600) | tick races |
| 3.6–5.4 | two caption lines ("Every frame here is drawn by code." / "Nothing in it is a photograph.") as four chunks of up to four words (`BM.captions`, pale-gold flash per word); the caption box fades at 5.4 | dead stop from 5.38 |
| 5.8 | the turn: the line jolts once (10 px up in .06 s, back in .45 s, no bounce) and continues past the right edge (to x 1150) over 1.1 s | the hit |
| 6.4 | the mark "THE BECOMING PROJECT" fades in over .9 s at y 1450 | landing sting E-D-A with the soft low D |
| 7.1–7.9 | fade to black (power1.in); frames from 7.9 are black | 1.4 s fade-out |

The point of light is the head of the line. It is painted on its own canvas (`#head`) from composition time
(`BM.onTime`), with the same ease as the stroke, so it sits on the stroke's end on every frame. The line layer and the
head canvas jolt together. An SVG `<circle>` moved by attributes made renders differ by a faint remnant, so the head
is a canvas (main README, "Determinism").

## What the proof showed (27.10.2026, this sandbox)

Every gate passed: lint, check, render, score, mix, mux, review-frames, spec-check, brand-lint and audio-qa. The result
is H.264 High 1080×1920 at 30/1, 240 frames, with AAC 48 kHz stereo at 256 kb/s, 8.000 s long. Audio: −14.0 LUFS,
true peak −1.5 to −1.7 dBTP after AAC, and the band below 60 Hz sits 42 dB under the 150 Hz–4 kHz band. Three builds
gave the same video-stream MD5, and all 240 frames matched. The audio stream is not bit-identical between builds,
because Chromium's offline audio render varies by a few LSB (see the main README). The evidence stays in the local
scratchpad, not in the repo.

## Swapping in a photo (scratchpad builds only)

`plate.src` in `data.json` (null here) replaces the code-drawn sea with an image file inside the composition folder,
for example `"assets/plate.png"`, sized 1188×2112 with the horizon at y 1276. It uses the same fade, the same push and
the same transform origin on the horizon. To use one of his photos, copy this folder into the scratchpad and put the
photo there. Never put a real photo in the repo (house rule 8). This path was tested with a synthetic ffmpeg-drawn
grid image only.
