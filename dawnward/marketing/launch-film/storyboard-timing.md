# Dawnward launch film, 60 s · storyboard and timing sheet (v3)

1080x1920, 30 fps, 1800 frames. Deterministic timeline in `film.html` (anime.js, `window.SEEK(ms)`); frames rendered by `render60.mjs`, mix by `make-audio3.sh` (composed score + founder narration + FX pack), mux by `encode.sh`.

| Time | Scene | Picture | Narration (founder voice) | On-screen words | Sound |
| --- | --- | --- | --- | --- | --- |
| 0.0–4.3 | I · The interruption | Near-black. A gold spark ignites at 0.35 s and breathes. | 0.7 "You don't need another routine. You need a direction." | The same two lines, word by word | Near-silence; sub drone fading in |
| 4.1–10.7 | II · First light | Cinematic b-roll: slow dolly over a dark ocean at first light (`broll/ocean-dawn`). | 5.2 "Meet Dawnward. It learns you, from your own words." | "Meet Dawnward." → "It learns you, from your own words." | Drone holds low; whoosh into III at 10.8 |
| 10.9–23.3 | III · The morning | The phone rises from darkness, gold rim light, the Today screen animating live: cards cascade in, one task is kept and seeds a star at its corner. | 13.2 "Each morning, a few quiet moves that matter." | "A few quiet moves that matter." | Bloom envelope; star-chime at 17.8; whoosh into IV at 23.35 |
| 23.4–30.9 | IV · The evening | The debrief screen live: typed words appear with a gold caret, the listening state breathes its EQ bars. | 23.9 "Each evening, you talk. It listens." · 28.0 "And what you live, becomes a star." | "You talk. It listens." → "What you live becomes a star." | Interface cues; whoosh into V at 30.75 |
| 30.9–42.9 | V · The universe reveal | The real Universe tab in the phone → the phone recedes and the cosmos takes the frame → travel toward Mind → arrival in the real Mind world interface. | 31.6 "Your life becomes a universe. Body. Mind. Soul. Future." · 38.6 "Travel your worlds. Watch them grow, as you do." | "Your life becomes a universe." → "Watch your worlds grow, as you do." | Riser pair 31.3 → soft boom 34.7 → shimmer 35.3; tick 41.4 |
| 43.1–50.6 | VI · The emotional payoff | B-roll: a hand releases one gold point of light into the night (`broll/hand-star`); a dark veil falls at 46.0 and the Personal Model screen rises through it. | 44.0 "It already holds the picture of who you're becoming." | "The picture of who you're becoming." | Low breath swell at 43.1 |
| 50.9–55.6 | VII · The brand moment | B-roll: drifting through slate-blue nebula toward warm light (`broll/nebula-flight`); the wordmark arrives over it. | — | Dawnward | Breath swell 50.9; soft resolve |
| 55.9–60.0 | VIII · The invitation | End card: DAWNWARD · "Become who you are becoming." · placeholder CTA; fade to black at 59.3. | 56.4 "Dawnward. Become who you are becoming." | "The sky is being prepared" | Star-chime 56.9; score resolves to silence |

## Voice

All nine narration lines are the founder's own cloned voice (Higgsfield reference element "Bianno Voice", ElevenLabs engine), generated for this film; sources in `../fx/vo/`.

## Screen provenance

- **Universe tab and Mind world**: live captures from the running application (web export of the shipped code, real navigation).
- **Today, Debrief, Personal Model**: demonstration renders from the design-canon boards that mirror the implemented screens one to one (the running app in this environment could not reach its API from the browser origin, so its live captures showed fallback states with placeholder mock copy). All content on these screens is demonstration data, not a real user's.
- **Cinematic b-roll**: three 6 s clips generated with Seedance 2.5 on the owner's Higgsfield account (9:16, 1080p, silent); masters in `../fx/broll/*.mp4`, VP9 transcodes in `broll/*.webm` for the render browser.
- Celestial artwork: the app's own bundled assets (`apps/mobile/assets/universe`).

## CTA placeholder

"The sky is being prepared" is a deliberate placeholder: no store listing, price, date or download claim exists yet. Replace with the approved destination line before publishing.
