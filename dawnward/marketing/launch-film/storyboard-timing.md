# Dawnward launch film, 60 s · storyboard and timing sheet

1080x1920, 30 fps, 1800 frames. Deterministic timeline in `film.html` (anime.js, `window.SEEK(ms)`); frames rendered by `render60.mjs`, score by `make-audio.sh`, mux by `encode.sh`.

| Time | Scene | Picture | Words | Sound |
| --- | --- | --- | --- | --- |
| 0.0–4.3 | I · The interruption | Near-black. A gold spark ignites at 0.35 s and breathes. | "You don't need another routine." (0.9) → "You need a direction." (2.8) | Near-silence; sub drone fading in; note A4 at 0.9, C#5 at 2.85 |
| 4.1–10.7 | II · The human problem | The nebula sky, slow 1.1→1 settle; the far galaxy drifting in parallax. | "It's easy to keep moving." (4.9) → "Harder to know where you're going." (7.6) | Drone holds low |
| 10.9–20 | III · First contact | The phone rises from darkness (1.5 s, ease-out quart), gold rim light, showing the real Today screen; slow Ken Burns. | "Make space to understand yourself." (13.4, above the phone) | Bloom: envelope opens over 4 s from 11 s; note E5 at 11.45 |
| 20–30.7 | IV · The daily experience | Today → crossfade to the evening debrief (23.6) with its listening state; gentle device rotation. | "Notice what matters." (20.4) → "Reflect on what you've lived." (24.6) → "Choose your next direction." (27.9) | Interface cue at 23.65; note D5 at 20.45 |
| 30.9–42.9 | V · The universe reveal | The real Universe tab in the phone (31) → the phone recedes and the cosmos takes the frame (34.6) → travel toward Mind (38.2, 3.4 s ease-in-out cubic) → arrival in the real Mind world interface (41.3). | "Your life isn't a list of tasks." (31.9) → "It's a universe still unfolding." (36.4) | The widest moment: pink-noise swell peaking 33.8; note C#5 at 31.95; interface cue at 41.4 |
| 43.1–50.6 | VI · The emotional payoff | The Personal Model screen, slow 7.4 s breath toward the gold Future Self card. | "Understand where you are." (44.2) → "Choose who you're becoming." (47.6) | Pace drops; drone only |
| 50.9–55.6 | VII · The brand moment | The quiet sky; one gold anchor light; the wordmark arrives at 52.4. | Dawnward | Soft resolve swell 52.3; note E5 at 52.6 |
| 55.9–60 | VIII · The invitation | End card: DAWNWARD · "Become who you are becoming." · placeholder CTA; fade to black at 59.3. | "The sky is being prepared" | Note A5 at 56.85; drone resolves to silence by 59.4 |

## Screen provenance

- **Universe tab and Mind world**: live captures from the running application (web export of the shipped code, real navigation).
- **Today, Debrief, Personal Model**: demonstration renders from the design-canon boards that mirror the implemented screens one to one (the running app in this environment could not reach its API from the browser origin, so its live captures showed fallback states with placeholder mock copy). All content on these screens is demonstration data, not a real user's.
- Celestial artwork: the app's own bundled assets (`apps/mobile/assets/universe`).

## CTA placeholder

"The sky is being prepared" is a deliberate placeholder: no store listing, price, date or download claim exists yet. Replace with the approved destination line before publishing.
