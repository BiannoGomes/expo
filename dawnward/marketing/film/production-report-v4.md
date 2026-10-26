# Dawnward film v4 · production report, critique and technical QA

Date: 2026-10-26. Master: `marketing/launch-film/dawnward-launch-film-v4-60s.mp4` (1080x1920, 30 fps, 60.000 s, 16.8 MB). Variants in `marketing/launch-film/variants/`.

## What changed, exactly

1. **New emotional architecture** (Concept 3, "What You Live Becomes Matter"): loud recognisable problem → scripted silence → the honest minute → a match-cut pair (typed word becomes a star) → the morning proof with the differentiator on screen → a 3.6 s suspension with an unresolved chord and a deliberate 350 ms hole → one through-the-glass camera move → the worlds → the payoff line → silent brand moment → honest end card.
2. **Real depth**: perspective rigs with layered parallax (nebula, three seeded star sheets and four planets at distinct z-depths), a grounded phone with light wrap and an elliptical shadow, a push-through-the-screen reveal instead of a flat zoom. No whoosh transitions anywhere; the transition families are hard cuts, one match cut, an occlusion push, a veil and sound bridges.
3. **Narration cut from 46 s to ~24 s** across ten shorter lines re-recorded in the founder's cloned voice; two scripted silences (6.8-12.4 and 52.0-56.4); no caption repeats a spoken line.
4. **New opening footage**: Seedance clip of a face-down phone on a nightstand, notification glow pulsing, dying to black on "You don't."
5. **Rebuilt score** (`compose-score2.py`): stereo, felt-piano and pad voicings, a two-note dawn motif (E rising to A) first heard alone at 10.8, completed at the resolve, and stamped as the byte-identical three-second sign-off ending every asset. Synthesized notification cluster and room tone. 25-input mix, peaks -1 dB (-0.9 dB after AAC).

## Phase 11 · the five reviewers (first complete cut)

**A, the audience**: the opening claim is about the viewer's actual phone and lands inside 2 s; "You don't." at 4.4 is the turn. The 5.6 s silence that follows is the biggest retention risk in a muted feed, which is exactly what the hook-variant test is for. The payoff line at 47.2 ("It remembers who you're becoming. Even on the days you forget.") is the emotionally true moment. Pass.

**B, the product**: a new viewer sees the evening question, a typed honest sentence, the listening state, three morning cards drawn from the user's words, the universe as the accumulation, one world's interior and the Personal Model. The mechanic (words → understanding → universe) is taught by the match-cut pair rather than explained. All screens are the shipped design; the demonstration data is the canon board content, documented. Pass.

**C, the director**: the reveal is earned (suspension, hole, landing at 34.9); the one big camera move is spent once. The hard cut at 43.3 from the Mind interior back to the wide sky is carried by the pad change and reads as intentional on the contact sheet. Weakest frames: 31-33 (the suspension relies on the vignette; a touch static) and the end card's small gold wordmark, which is mid-fade at 57. Neither blocks. Pass with notes.

**D, sound**: dialogue sits 1.5x over a -17.8 dB mean bed; cue placement was verified by construction against the frame times and levels by meter (the container has no speakers, so a human listen on phone, laptop and headphones is on the release checklist). The chime is shared across the match cut as designed; the landing combines sub, chord, shimmer and a soft boom at 34.9. Pass pending the owner's ears.

**E, the sceptical creative director**: what is generic? The nebula-flight brand shot is the most familiar image in the film; it earns its place as the only one and carries the silence. What looks expensive but contributes nothing? Nothing found; the depth work all serves the reveal. What would make it recognisable without the logo? The near-black and single gold, the serif voice, the mono labels and the sign-off motif. Weakest claim: none are unsupported; the end card promises nothing. Requested fixes before approval: the two applied during the build (mono caption legibility, pair-star size). Pass.

## Technical QA (automated and inspected)

| Check | Result |
| --- | --- |
| Frame count / fps / size | 1800 frames, 30 fps, 1080x1920 |
| Duration | 60.000 s exactly; variants 16.0 / 15.6 / 18.4 / 29.6 s |
| Determinism | anime.js seek-driven; per-frame video seeks wait for the painted frame (double rAF); repeated probe seeks matched |
| Black/dead frames | opening and 34.55-34.9 are intentionally near-black (scripted); no unintended black frames on the 20-tile sheet |
| Video decode | all four b-roll clips VP9 WebM; metadata verified (duration 6.042, width 1080; opening clip 720 source upscaled by cover fit, acceptable softness at night exposure) |
| Audio | stereo, -17.8 dB mean, -0.9 dB max after AAC, no clipping; limiter level-compensation disabled |
| Sync | all cues placed against the storyboard JSON times; VO v8 deliberately bridges the 45.8 cut |
| Console errors | none during probes |
| Text overflow | none on probe tiles |

## Acceptance criteria verdicts

- Story: tension inside 2 s (yes), voice and text carry distinct information (yes), arc coherent (yes), reveal earned (yes), CTA real (COMING SOON placeholder, by design; a clickable destination is an owner dependency).
- Visuals: real screens (yes), intentional camera (yes), depth coherent (yes), typography legible (yes), no artefacts found on sampled frames.
- Audio: intelligible, intentional dynamics, event-timed effects, no clipping, deliberate ending. Human listen pending.
- Technical: all pass.
- Commercial: audience identifiable, value understandable, CTA honest, variants ready for measurable tests, rights documented in `../launch-film/assets-licensing.md`.

## Blocked / owner decisions

1. ElevenLabs key has no permission scopes; regenerate with music, sound-effects and TTS scopes to swap in an external score later.
2. The end card needs a real destination before any paid placement (see `release-checklist.md`).
3. A 16:9 version is not delivered: every composition is built vertical (phone-native); a crop would amputate the phone scenes. If a 16:9 master is wanted it should be reframed, not cropped.
