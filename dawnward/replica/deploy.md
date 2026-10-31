# Deploy preflight (replica-deploy): stopped at the gate

**Nothing was deployed, published, submitted or bought.** The owner's rule is that any deploy, publish, send or payment needs approval, and replica-deploy agrees: nothing goes live without the user's go.

## Preflight results (2026-10-31)

| Check | Result | Blocks launch? |
|---|---|---|
| Server tests | 23 unit and 33 integration pass | no |
| Type checks | server and app clean | no |
| Parity with the five apps (`parity.md`) | 57.8 (was 43.8). Must-haves 7 of 10. | **yes**: the skill rules any missing must-have "not shippable". The missing three are F4 lost words, memory in the debrief reply, and a follow-up inside the debrief. |
| Brand sweep | clean in product code; 36 hits in one internal research file | yes, until that file is confirmed never to be published |
| Store listing lint | 0 errors, 0 warnings | no |
| Open S1 bugs | none | no |
| Open S2 bugs | none (B1 fixed) | no |
| Privacy policy and terms list every processor | not checked in this pass | **yes** |
| Account deletion works on web and native | web was broken by B1, now fixed and tested; native not tested on a device | **yes**: needs device testing (D6) |
| Real-device performance, VoiceOver and TalkBack | not run | **yes** |

## Verdict

**Not ready to ship.** The next steps, all needing the owner:

1. Approve D5 (test tools), then build F4, so words are never lost.
2. Set up device testing (D6), entering Expo and Apple access yourself, never by pasting it in chat.
3. Decide pricing (`launch/pricing.md`).
4. Check `site/privacy.html` against the processors actually used.
5. Then, and only with your go: an EAS internal build to TestFlight for you alone.
