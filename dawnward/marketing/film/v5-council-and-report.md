# Dawnward film v5 · council verdict and production report

Date: 2026-10-26. Master: `marketing/launch-film/dawnward-launch-film-v5-60s.mp4` (1080x1920, 30 fps, 60.000 s, -13.9 LUFS, -1.9 dB peak). Source: `film3.html`, `render-v5.mjs`, `make-audio5.sh`, `encode-v5.sh`.

## Inputs

- **Music**: the owner's Suno track "Emotional build" (`audio/suno/emotional-build.wav`, 59.88 s). Measured: tempo ~64 bpm, beat 0.9387 s, phase 0.10 s; first swell peak on the bar downbeat at 15.12 s; climax on the downbeat at 33.89 s; high sustain to ~45.5 s; fall to 54 s; last accent 54.54 s; fade by 59.9 s. Every cut in v5 is placed on this grid.
- **Narrator**: Higgsfield preset "Naomi" (ElevenLabs engine), not the owner's voice.

## Council verdict (five advisors, five anonymous peer reviews)

**Where the council agreed (all five independently)**
- The voice is a woman, 30s to 40s, warm low-mid register, soft British or neutral accent, close and unhurried: a friend at 11pm, never a meditation app and never a trailer narrator.
- Speak only in the quiet sections of the track (0-14 s and 47-57 s). The music carries the swell and the climax alone.
- Captions are the real script: most viewers watch muted. Text on screen from frame 0, no black frames, every spoken line also burned in.
- Product first, metaphor second. The real "What I understand about you" screen must appear before the first swell. The cosmos is earned, and appears once.
- Cut on the music.

**Where it clashed**: hold length (long 4-8 s holds vs cutting every two beats) and the app speaking as "I". Resolved for long holds and a third-person narrator; four of five reviewers named the fast-cut, first-person plan the weakest because it rebuilt v4's slideshow and riddle problems.

**Blind spots caught in peer review, all applied**
- Name the category in plain words early: "Dawnward is a journal you talk to."
- Answer "who reads this?": "Private. Never sold." (true per the store listing: reflections are never sold and never train anyone else's AI).
- Platform safe zones: all text in a top band; nothing important in the bottom 20% or the right rail.
- Mix to platform loudness (-14 LUFS); start voice lines just after beats so hits don't mask first syllables; keep the bed audible under the voice.
- Grade continuity between flat UI and photoreal clips: one film-grain and vignette pass over everything.

**Strongest advisor plan**: the Contrarian's (4 of 5 reviewers). v5 is built on it, with the Outsider's plain language, the First Principles test sentence ("Talk to it at night, wake up to three moves drawn from your own words") and the reviewers' fixes.

## Voice selection

Six finalists read the same hook line; measured on identical text:

| Voice | Pitch | Brightness | Line length |
| --- | --- | --- | --- |
| **Naomi (chosen)** | 155 Hz | 1186 (warm) | 3.3 s |
| Faye | 208 Hz | 1178 | 3.2 s |
| Tamsin | 208 Hz | 1337 | 3.6 s |
| Helena | 180 Hz | 1517 | 3.0 s |
| Nora | 155 Hz | 952 | 3.9 s, flattest melody |
| Maeve | 235 Hz | 1537 | 2.5 s, rushed |

Naomi is the closest match to the agreed archetype and sits below the piano's register. All six are in `../fx/vo5/voice-auditions_naomi-faye-tamsin-helena-nora-maeve.mp3` (that order) for the owner's ear; swapping the voice is one regeneration plus `make-audio5.sh` and `encode-v5.sh`.

## The cut

| Time | Picture | Voice / text |
| --- | --- | --- |
| 0.0-9.5 | Evening debrief, full screen, a confession already typing on frame 0: "Snapped at my sister again. Don't know why." Listening bars from 4.8 s. | "Ever go to bed not sure how your day really went?" · "Dawnward is a journal you talk to." · "It listens. Night after night." |
| 9.5-14.2 | Personal Model, panning to the evidence card, which glows: "You keep commitments you write down. Why I think this: I have seen this in your days 4 times now." | "And slowly, it understands you. And shows you why." |
| 14.2-15.1 | First light over the ocean, one beat. | none |
| 15.1-23.6 | Hard cut on the swell to Today; the three moves land on the beats; one is kept and plants a gold star. | "Every morning: three small steps, from your own words." (caption only) |
| 23.6-30.2 | The Universe tab in the phone; we travel into the screen. | "Your days, shown as a sky that grows with you." (caption only) |
| 30.2-31.8 | Arrival in the sky; the four worlds wait, dim. | none |
| 31.8-33.9 | A hand releases a gold light (the kept moment). | none |
| 33.9-37.7 | The climax: Mind, Body, Soul, Future bloom one per downbeat. | labels only |
| 37.7-45.2 | Dolly into the Mind world: "The world of clarity." | none |
| 45.2-54.5 | Nebula drift toward warm light. | "Private. Never sold." (text) · "No streaks. No scores. No guilt." · "Just you, understood." |
| 54.5-60.0 | Wordmark lands on the last accent; "Coming soon". | "Dawnward. Coming soon." |

## Technical QA

- 1800 frames, deterministic seeks, zero page errors.
- Black-frame scan: only the end card (intentional). A 1.4 s near-black gap at 30.3 s was caught and fixed by pre-lighting the worlds.
- Voice over music per line (400 ms windows): +10 to +14 dB on every line after a +5 dB lift on line 5.
- Loudness: -13.9 LUFS integrated, -1.9 dB peak, LRA 6.8 LU.

## Still with the owner

Listen on a phone speaker; pick a different voice from the audition reel if Naomi is not the one; name the real destination so "Coming soon" can become a link.
