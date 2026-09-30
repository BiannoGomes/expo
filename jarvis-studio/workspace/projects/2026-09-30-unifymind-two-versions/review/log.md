# Review log · Two versions of you

One hypothesis per revision (constitution §16). Frames: `review/v<N>/`.

## v1 · first render
HyperFrames lint 0/0 · check passed (layout 0 issues, contrast 23/23 AA).
Top three problems, from `review/v1` (frames re-sampled after fixing the review-frames timing bug):
1. **Frame 0 is empty apart from the wordmark.** It's a weak thumbnail and breaks "no empty opening frame".
2. **The hard cut at 6.3 s lands on empty frames.** 6.33–6.47 s shows only a faint "BOOK 1", so the cut isn't on content.
3. **The separation beat is away from the focal point.** The bar stretches at y 358 while the eye is at y 612–960, and 2.9–3.05 s is empty. It risks reading as a progress bar.

## v2 · hypothesis: the opening is weak because frame 0 makes no statement
Change: line 1 "There are two" is visible from frame 0; lines 2–3 rise from 0.10 s (was 0.15 s, all lines).
Result: ✔ frame 0 now reads "There are two", and the full hook is legible by 0.5 s (`review/v2/01-hook.jpg`). Kept.

## v3 · hypothesis: the cut lands on empty frames because the CTA starts arriving after the cut
Change: the CTA's rise starts at 6.20/6.24 s inside a container held at opacity 0; the container switches on at exactly 6.30 s, the same frame scene 2 cuts out.
Result: ✔ the cut frame (6.333 s) now lands on the CTA already arriving, with no empty frames (`review/v3/03-cut-01-at-6.30s.jpg`). Kept.

## v4 · hypothesis: the separation reads as a progress bar because it happens 250 px above the focal point
Change: the header bar stays static (it's part of the wordmark lockup). The same gold rule now draws itself at y 1000 under the hook (2.40–2.75 s), the hook exits upward (2.55 s), and the rule passes through and leaves, its left end chasing the right (2.80–3.15 s). Scene 2 rises at 2.95 s (was 3.05 s), so the rule carries the gap.
Result: ✔ the rule draws under "of you." (2.43–2.63 s), the hook lifts away, and the rule passes and leaves (2.83–3.03 s). It reads as one move at the focal point. Kept.

## QA on v4
- check-facts ✔ (2/2 approved, 2 bound) · brand-lint ✔ (2 warnings: `scaleX: 0` on the rule is a deliberate draw-on) · activate-brand --check ✔ · HyperFrames lint 0/0
- spec-check (universal) ✔, with warnings: no audio stream → the final gets a silent AAC track · holds of 1.97 s (hook reading time), 1.57 s (payoff after the gold lands) and 3.30 s (CTA end-hold, needed to be actionable). All three are intentional and listed in the storyboard.
- Safe zone ✔: all text inside the strict rect (x 65–940, y 269–1248).

## motion-critic on v4 (fresh eyes): SHIP AFTER FIXES
1. Undeclared dead holds: the hook holds 0.67 s for 1.97 s, and the payoff 4.73 s for 1.57 s. v2 made the hook land 0.75 s earlier, but the rest of the timeline never moved to match.
2. The rule's pass-through exit still reads as a loader, and it pulls the eye rightward just as scene 2 starts at x 96.
3. "BOOK 1" is the dimmest, smallest text on screen (32 px grey, 0.24 em tracking), yet it's the product.
Also noted: two gold rules on screen at once (Bianno's call) · CTA leading 1.18 vs the CONFIRMED 1.28 · the format is close to the stock faceless-motivation template, and the rule is the only ownable device.

## v5 · hypothesis: the hook and payoff drag because the timeline wasn't pulled forward after v2
Change: every event from 2.40 s moves 500 ms earlier (rule 1.90, hook exit 2.05, scene 2 2.45, gold 4.00). The CTA moves 600 ms earlier (pre-roll 5.60/5.64, cut 5.70).
Result: ✔ spec-check now reports only the declared CTA end-hold (6.10 s for 3.90 s). Both dead holds are gone. Kept.

## v6 · hypothesis: the rule reads as a loader because of its pass-through exit
Change: the pass-through is deleted. The rule draws 1.70–2.05 s, finishing as the hook exit begins, and is the last target of the hook's staggered exit (it lifts away with "of you."). Scene 2 rises at 2.40 s.
Result: ✔ the rule underlines the hook (1.73–2.07 s), then lifts away with it (2.13–2.37 s) as one move, with no loader read. A one-frame empty gap at 2.400 s was closed by starting scene 2 at 2.34 s: every 30 fps frame from 2.20 to 2.57 s now carries content (`review/v6/gap-check.jpg`). Kept.

## v7 · hypothesis: the CTA under-names the product because "BOOK 1" is styled as metadata
Change: `.meta` goes from 32 px grey #787E8A with 0.24 em tracking to 40 px bone #EEE9DC with 0.08 em (MOTION.md field 6), margin 36 px. Gold stays only on the action.
Brand compliance (not a design hypothesis): CTA leading 1.18 → 1.28, the CONFIRMED body leading (field 7).
Result: ✔ "BOOK 1" now reads as the product, the action stays the one gold phrase, and it's inside the strict safe zone (`review/v7/06-safe-universal-scene-03.png`). Kept.

## FINAL · renders/final.mp4 (delivery quality + silent AAC track)
QA gate: HyperFrames lint 0/0 + check passed (layout 0 issues/9 samples, contrast 23/23 AA) · check-facts ✔ 2/2 bound · brand-lint ✔ (1 warning: the deliberate rule draw-on) · activate-brand --check ✔ · spec-check `reels` ✔ and `universal` ✔ (0 fails; holds 4.20 s for 1.50 s at the threshold, and the CTA end-hold 6.10 s for 3.90 s, both declared) · safe zone ✔.
Critic: the v4 verdict was SHIP AFTER FIXES. All 3 fixes are applied (v5–v7) and verified in frames. **A second critic pass was not run.**
Still needs Bianno: watch the MP4 (sound off is the real test: it's silent) · approve or replace the draft copy · decide on two gold rules on screen at once (1.73–2.37 s).
