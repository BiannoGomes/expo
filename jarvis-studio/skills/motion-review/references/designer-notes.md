# Designer notes → observable variables

Bianno gives notes like a creative director. Translate each note into the variables below,
check them against the frames and the timeline, write a **one-line diagnosis**, then change
**only** the variables named. Start with the most likely cause and don't redesign.

| Note | Look at first | Then | Typical fix |
|---|---|---|---|
| "It doesn't feel premium" | Spacing (margins too tight?) · density (too many elements?) | Type tracking and leading · easing (linear or default ease?) · colour count | More space, fewer elements, a strong ease-out, one accent, slower hero moves |
| "It feels cheap / templated" | Default eases, everything moving, stock transitions | Centred-everything layouts, generic fonts, glow | Remove motion from half the elements; replace the transition with a cut or a brand motif |
| "The reveal takes too long" | Anticipation length · delay before the entrance | Scene duration · stagger total · information density | Cut the pre-roll, tighten the stagger, shorten the hold. Don't touch the look. |
| "It's too fast / I can't read it" | Hold time vs reading time (≈ 0.3 s/word + 0.4 s) | Entrance duration · text amount per frame | Split the line across two beats, or extend the hold. Never shrink the type. |
| "The start is weak" | Frame 0 (empty?), what happens by 1.5 s | Hook wording · first motion event | Put the strongest image or line on frame 0, and start the motion by 0.3 s |
| "It's boring" | Rhythm: are all durations equal? | Scale contrast · a missing surprise beat | Vary the durations, add one unexpected on-brand moment, cut dead holds |
| "It's too busy" | Simultaneous movers (more than 2 at once?) | Particles, parallax, texture | One mover at a time; delete decoration first |
| "It feels robotic" | Linear or uniform easing, identical stagger | No anticipation or settle | Strong ease-out on arrivals, varied stagger, a subtle settle |
| "It feels floaty / slow" | Ease tails too long, durations over 800 ms | Drift on elements that should be anchored | Shorter durations, a sharper curve, anchor the type |
| "Off-brand" | Run `brand-lint` · compare with `MOTION.md` fields 1–14 | Voice laws (em-dashes, accent count) | Fix the violation the lint names. Never "reinterpret the brand". |
| "The transition is jarring" | The cut sheet from `review-frames` around that cut | Motion direction continuity, audio beat alignment | Match the direction of travel, land the cut on the beat, or use a hard cut |
| "The sound is off" | Loudness (`spec-check`) · SFX vs VO balance | Music energy vs picture pacing | Duck the music under VO, remove SFX from text, allow silence |

## The one-hypothesis rule

Every revision states: **"Hypothesis: `<note>` is caused by `<variable>`. Changing
`<variable>` from X to Y."** One hypothesis per revision. If it doesn't fix the note,
revert it and try the next variable. Record the variable that did fix it in the retro,
because that's how the studio learns Bianno's taste.
