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
