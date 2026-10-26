# Dawnward film v4 · Phase 4 storyboard (technical)

Companion to `final-script.md` (narrative) and `storyboard.json` (machine-readable, binding). 1080x1920, 30 fps, 60.0 s. Renderer: deterministic anime.js timeline in `marketing/launch-film/film2.html`, frames by Playwright, assembly by ffmpeg.

## The depth system (applies to every shot)

- A root `perspective: 1400px` container. Every scene is a stack of layers at explicit `translateZ` depths; the camera is a single transformed rig div per scene, so parallax is real, not simulated per-element.
- The phone is a 3D object: subtle `rotateX/rotateY` drift (±3-4°), an elliptical grounding shadow whose blur and offset track the phone's height, and a light wrap: a soft screen-colored gradient bleeding onto the frame edges.
- Gold stays scarce: the star pair moments, the kept-task edge, the wordmark, the end chime star. Nothing else.
- Transition families used: hard cut (into 05, into 09 wide), match cut (04→05 word-to-star), occlusion push (08 through the glass), veil (10), dissolve (02→03 black), sound bridge (chime carries 04→05; chord carries 07→08). No whooshes anywhere in v4.

## Shots

| # | Time | Camera | Layers (back→front) | Transition out | Fallback |
| --- | --- | --- | --- | --- | --- |
| 01 | 0.0-2.6 | locked, slow 1.00→1.03 push | new clip `broll/phone-night.webm` | hard tighten (scale step) | if clip fails review: near-black room gradient + practical phone glow built in CSS |
| 02 | 2.6-6.8 | locked | same clip, tighter crop; glow dies at 4.2 via black overlay | dissolve to black | same |
| 03 | 6.8-12.4 | locked | black; serif type layer; mono sub-label | hold | none needed |
| 04 | 12.4-21.6 | rig orbit 2° over 9 s | starfield far (z -600, 4% drift) · debrief phone (z 0, enters translateY 90→0 rotateX 6→2°) · shadow · light wrap | match cut on the word glow | reduce orbit to 0 if seams show |
| 05 | 21.6-24.4 | locked | black · one gold star (scale 0.5→1.15→1, glow) · mono label | hard cut | reuse v3 star-birth preset |
| 06 | 24.4-31.0 | rig drift opposite 04 | starfield far · Today phone (z 0) with live card cascade + kept edge + corner star · shadow · wrap | pull to dark | v3 scene 3 assets |
| 07 | 31.0-34.6 | slow pull back (z +320) | phone shrinking into dark; vignette closes 20% | occlusion push begins | straight dissolve |
| 08 | 34.6-38.2 | push through: rig z +320→-900 over 3.6 s ease-in-out | phone frame (z 0, blurs 0→26px as it passes) · screen content scaling · then: nebula (z -1400) · star layers (z -1000/-600/-300, three densities) · Future (z -1100) · Body (z -700) · Soul (z -500) · Mind (z -350) | continuous into 09 | v3 2D zoom as last resort, flagged in QA |
| 09 | 38.2-45.8 | dolly to Mind (z -350→-80, x toward planet) then hard cut to wide | same stack + Mind world panel (real screen) rises 420 ms | hard cut on music event at 41.9 | v3 travel |
| 10 | 45.8-52.0 | locked | `broll/hand-star.webm` (6 s, starts at 45.8) · veil at 49.0 · Personal Model phone rises (z 0) | veil | v3 scene 6 |
| 11 | 52.0-56.4 | locked, clip's own motion | `broll/nebula-flight.webm` · wordmark layer | dissolve | v3 scene 7 |
| 12 | 56.4-60.0 | locked | black · end card stack | fade to black 59.3 | none needed |

## UI states shown (all real)

- Debrief: prompt "What happened?", typed reflection, listening bars, REFLECT button (canon board of the shipped screen).
- Today: three slot cards + commitment card, kept state with gold edge and corner star (canon board).
- Universe, Mind world, Personal Model: live captures of the shipped app.
- Labels only ever name shipped things: Mind, Body, Soul, Future, the debrief, the model.

## Asset dependencies

| Asset | Status |
| --- | --- |
| `broll/phone-night.webm` | **to generate** (Seedance, no readable UI in frame) |
| 10 VO lines | **to record** (cloned founder voice; v3 lines unusable, script changed) |
| score v2 (motif, suspension, landing, resolve) | **to compose** against locked cue times |
| star layers x3 | build as CSS/SVG star sheets (deterministic, seeded) |
| everything else | exists, verified in Phase 0 audit |

## Performance risks

Layered 3D transforms with blur during shot 08 is the heaviest frame; the renderer screenshots statically so runtime fps is irrelevant, but blur+transform must still rasterize identically per seek: verify with repeated-seek image diff at 36.0 s.
