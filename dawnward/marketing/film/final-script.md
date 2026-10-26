# Dawnward film v4 · Phase 3 script

## Five opening hooks, tested against the audience problem

1. **"Your phone knows everything about your day. You don't."** Tested: names the viewer's actual device and actual blind spot; creates a question (then who does?) that the product answers; works as a sound-off caption. Risk: mildly accusatory; mitigated by the warm second person and the pause between sentences. **Strongest.**
2. "How was your day?" ... "You always say fine." Tested: instantly recognisable; conversational. Weaker: the insight is social, not personal, and "fine" aims the film at smalltalk rather than direction.
3. "Say the true thing." over a blinking caret. Tested: intimate and product-true, but it opens inside the app before the viewer has a reason to care.
4. "You've restarted yourself more times than you can count." Tested: recognisable for serial restarters, but it is a claim about the viewer that will miss as often as it lands, and it flirts with guilt, which the brand forbids.
5. "Somewhere in your week there was one moment that mattered. Did you catch it?" Tested: poetic and on-mechanic (moments become stars), but two abstractions before any image; weaker first two seconds.

Hook 1 selected. Hook 5's idea survives inside the film (scene of the star birth). Hooks are retained as the basis of the Phase 12 variant tests.

## Three script versions

**A · Emotional and intimate** (C1-weighted): hook 1 → silence → debrief carries 30 s → universe appears only in the last 15 s as the accumulated sky → payoff line → end. Strength: feeling. Weakness: the universe, the product's most distinctive asset, is a coda rather than an argument; breadth untaught.

**B · Visually ambitious** (C2-weighted): hook 1 → one continuous move from glass to galaxy, screens as waypoints, minimal voice. Strength: spectacle and completion. Weakness: comprehension; highest craft risk in a 2.5D pipeline; genericity risk.

**C · Product-led and immediately understandable** (the selected Concept 3 architecture): paired cause-and-effect moments teach the mechanic; one through-the-glass move spent on the reveal; silence used twice deliberately. Strength: all three layers (human, product, mythology) in one spine. Weakness: most cuts to craft precisely.

**Selected: C**, by the Phase 2 scoring criteria (relevance, comprehension, distinctiveness, conversion clarity).

## The final script

Nine voice lines, two deliberate silences, every caption layering new information rather than echoing the voice. Timings are the design targets; the build adjusts a few hundred milliseconds per cue to the recorded line lengths and music events, and the storyboard JSON is the binding record.

| Time | Shot | Picture | Voice (founder) | On-screen text | Sound |
| --- | --- | --- | --- | --- | --- |
| 0.0-2.6 | 01 The device | A dark bedroom, a phone face down, its edges pulsing with notification glow (new generated clip; no readable UI). | 1.0 "Your phone knows everything about your day." | none | Notification clusters stacking, accelerating; no music |
| 2.6-6.8 | 02 The blind spot | Same shot, tighter; the glow stops; black. | 4.4 "You don't." | after the line, small mono: WHERE IS IT ALL GOING? | The clusters cut dead at 4.2; room tone only |
| 6.8-12.4 | 03 The question | Black, then one serif line typing itself, no phone yet. | silence | "What actually happened today?" then small mono: NOT THE SCHEDULE. THE DAY. | Room tone; the first piano motif note at 10.8 |
| 12.4-21.6 | 04 The honest minute | The real debrief screen rises in perspective (grounded shadow, light wrap); the sentence types: "Today I sent the chapter. Scared, but I did it."; the listening bars breathe once. | 13.6 "Dawnward asks one real question each evening." (beat) 17.4 "And listens." | none (the UI is the text) | Music enters properly under "listens"; caret ticks, soft EQ breath |
| 21.6-24.4 | 05 First pair: word to star | Match cut: the final typed word's glow lifts off the glass and condenses to one gold star on black. | silence | small mono beside the star: KEPT · OCT 24 | One chime, shared by word and star; music holds |
| 24.4-31.0 | 06 The morning proof | The real Today screen in perspective; three cards cascade; one is kept; its gold edge draws and seeds a corner star. | 25.2 "Each morning, three quiet moves, drawn from your own words." | NO STREAKS. NO SCORES. (mono, arrives after the cards) | Card ticks on the cascade; motif develops |
| 31.0-34.6 | 07 The suspension | The phone pulls back into darkness; everything slows; the screen's light stays on the viewer's side of the glass. | 31.6 "And slowly, something you've never had." | none | Music suspends on an unresolved chord; near silence under it; a low breath |
| 34.6-38.2 | 08 Through the glass | The one big move: the camera pushes through the screen; the phone frame blurs past; a parallax starfield opens in depth; the four worlds resolve at different distances. | 36.2 "A picture of your life you can travel." | none | The chord resolves as a soft full-range landing at 34.9; shimmer; space opens in the mix (stereo widens) |
| 38.2-45.8 | 09 The worlds | Dolly to Mind, the real world screen; cut on the music to the wide cosmos; each world's label arrives with its planet. | 42.6 "Watch your worlds change, as you do." | MIND · BODY · SOUL · FUTURE (mono, one per planet, never spoken) | A tick on the panel; the motif carried by warmer voicing |
| 45.8-52.0 | 10 The payoff | The hand releases a star into the night (existing clip, shortened); a veil falls; the real Personal Model screen rises through it. | 47.2 "It remembers who you're becoming. Even on the days you forget." | none | Music thins to the intimate voicing; one breath swell |
| 52.0-56.4 | 11 The brand | Nebula flight toward warm light; the wordmark in Cormorant. | silence | Dawnward | The motif resolves to the major; no effects |
| 56.4-60.0 | 12 The invitation | End card: "Become who you are becoming." with small gold mono DAWNWARD above; fade by 59.3. | 57.0 "Dawnward." | COMING SOON (honest placeholder; the real destination is an owner dependency, flagged) | Final chime at 57.4; music ends on a held soft tenth, released, silence by 59.4 |

## The voice lines in order (for recording)

1. "Your phone knows everything about your day."
2. "You don't."
3. "Dawnward asks one real question each evening."
4. "And listens."
5. "Each morning, three quiet moves, drawn from your own words."
6. "And slowly, something you've never had."
7. "A picture of your life you can travel."
8. "Watch your worlds change, as you do."
9. "It remembers who you're becoming. Even on the days you forget."
10. "Dawnward."

## What this script fixes from v3

- Narration occupies roughly 24 of 60 seconds instead of 46; two scripted silences (6.8-12.4, 52.0-56.4).
- No caption repeats a spoken line anywhere; captions carry the differentiators (NO STREAKS. NO SCORES.) and the labels the voice never says.
- The reveal is resisted: an unresolved chord and 3.6 s of slowing darkness before the one through-the-glass move.
- The opening is a specific, recognisable claim about the viewer's actual phone within the first 2 seconds.
- The end card stops pretending: COMING SOON until a real destination exists.
- Every cosmic image is caused by a shown interface event, so the film teaches the mechanic without explaining it.
