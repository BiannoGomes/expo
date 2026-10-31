# Dawnward master plan: read-only audit, 2026-10-31

Status: **for owner approval. No product code, dependency, deployment or publication has changed.** The only additions are the documents in this folder.

## The answer in five lines
1. Dawnward's copy, honesty and concept are strong. Its weakest point is reliability: four paths can lose what a person wrote or said, and one tells them goodnight when the server never heard them.
2. The app and the site/film look like two products. The colours match, but the type doesn't: Cormorant, Albert Sans and mono uppercase in the app; Source Serif and Source Sans on the site and in the film.
3. Two of the five owner-approved motion moments are not built in the app ("a star is born", "the pullback"). The one that is built, travel, can't be cancelled, though the doctrine says it must be.
4. The next milestone should be a complete Mind world **in the app**. Its constellation links two moments only when both are evidence for the same belief. That is real, explainable data the server already stores.
5. The order: no lost inputs → one design system → Mind world → device review → the other three worlds.

## Documents
| # | File | What it gives you |
|---|---|---|
| 01 | `01-reference-library.md` | Nine references: what makes each exceptional, the principle, an original Dawnward recreation, cost and measure |
| 02 | `02-component-shortlist.md` | Open-source candidates with verified licences, plus what 21st.dev, GetLayers, shadcn, Motion, GSAP, three.js and React Bits really are and how they could be used |
| 03 | `03-ux-backlog.md` | 28 findings with file:line evidence: 9 P0, 11 P1, 8 P2 |
| 04 | `04-performance-plan.md` | Baseline, budgets, nine ordered changes, how each is measured |
| 05 | `05-visual-system.md` | One token source for app, site and film; three proposed doctrine changes |
| 06 | `06-roadmap.md` | Phase 0 decisions, then four phases with exit criteria and rollback |

## Adversarial review of the app as it is today (1 to 10)
Scored against the evidence in 03 and 04. Device behaviour is unmeasured, which caps responsiveness and accessibility.

| Criterion | Score | Why | Repair (roadmap phase) |
|---|---|---|---|
| Ease of use | 7 | The three tabs are clear and the copy is calm. But Today is blank while loading, there's no next step after the debrief, internal words like "SCALE 1" appear on screen, and dispute works two different ways. | 03 #13, #18, #21, #22 (Phases 1 and 2) |
| Responsiveness | 5 | Travel to a world is a fixed 1.6 s that ignores input. There are no request timeouts, so a spinner can hang for a minute. There are no device measurements at all. | Reversible spring with data loading at the first frame; timeouts; device baseline (Phases 1 and 3, D6) |
| Visual coherence | 6 | Colours are exact across surfaces, but there are two type systems, 24 font sizes, 10 inline durations and an off-token background. | Tokens package, D1 to D3 (Phase 2) |
| Motion | 6 | Press physics, dealt cards and the panel rise are well made. Travel can't be interrupted, the pullback and "a star is born" are missing, and ambient loops never pause. | Phase 3 transitions; 04 #3 |
| Emotional relevance | 7 | "Why I think this", "Your word wins" and honest offline copy are rare and right. A failed send that says "Sleep well", and unlabelled sample stars, break that trust. | 03 #1, #7 (Phase 1) |
| Accessibility | 6 | Reduced motion is honoured almost everywhere. But some buttons have no role, labels run 9 to 10 px, Danger fails AA at 4.29:1, and the reveal overlay is not modal. The web experience separately scores 9 (0 axe violations in 6 states). | 03 #14 to #20 (Phase 2) |
| Reliability | 4 | Four lost-input paths, a sync comment with no sync behind it, no timeouts and no app tests. | Phase 1 in full |
| Differentiation | 8 | An explainable personal model you can dispute, wrapped in a universe of your own days. No streaks, scores or guilt. Nothing in the reference set does this. | Hold it there: links must always name their belief (Phase 3) |

Target after Phase 3: 8 or above on every row, re-scored by an independent reviewer on device.

## Approval needed
The decisions D1 to D7 are listed in `06-roadmap.md`, Phase 0. Nothing starts until you approve. You can approve Phase 1 alone: it needs only D5 for the test tools, and it fixes the four ways a person's words can be lost.
