# 06. Phased implementation roadmap

North star for the next milestone: **one complete, tested Mind world in the app**. It needs:
- genuinely useful reflection features built only from the person's own data;
- premium, reversible transitions;
- a constellation that explains itself;
- a seamless route back to the sky.

Body, Soul and Future follow, built from the same parts.

## Why the app, not the web experience (decision D4)
- The app is where people reflect and where their real data lives (`records`, `assertions`, `assertion_evidence`).
- The web experience is the story told to people who don't use Dawnward yet. It already has a complete Mind world for that job (0 axe violations, deterministic), working from labelled sample content.
- A "genuinely useful" Mind world must read real reflections, and only the app can.
- The web keeps receiving the shared tokens. Its open items stay in 04.

## Phase 0. Decisions (owner, before any code)

| # | Decision | Recommendation |
|---|---|---|
| D1 | Typefaces: Source Serif 4 and Source Sans 3 in the app, amending `design-direction.md` | Yes. One look across app, site and film. |
| D2 | Labels: sentence case 12.5 px instead of mono uppercase | Yes. |
| D3 | Danger to `#C47A73` (AA) | Yes. |
| D4 | Mind milestone lives in the app | Yes. |
| D5 | Installs: `react-native-reanimated`, `react-native-gesture-handler`, `@shopify/react-native-skia`, `expo-image`, the two `@expo-google-fonts` packages, plus Jest, `@testing-library/react-native` and Maestro (dev) | Yes, each pinned to the Expo SDK 54 compatible version. Licences in 02. |
| D6 | Device testing: one iPhone and one mid-range Android with an EAS development build. Needs your Expo and Apple access, entered by you, never pasted in chat. | Yes, otherwise every performance number stays a guess. |
| D7 | Travel duration: keep the doctrine's ~1.6 s feel as a reversible spring (≈1.4 s to settle). The world's data starts loading on the first frame. | Yes. |

## Phase 1. No lost inputs (reliability)
Scope: UX backlog P0 items 1 to 9, plus a test harness.

- **First task:** run `npx expo install --check` and resolve the `^57.x` Expo module ranges that sit beside `expo ~54` (see 02).
- **Error handling:** Debrief error state, onboarding text restore, recording kept until transcribed, stop the recorder on blur.
- **Network:** request timeouts, and a persisted mutation outbox for slot ticks and disputes.
- **Truthfulness:** no unlabelled sample stars, an offline first run that is honest, and an encrypted draft.
- **Tests:**
  - RNTL tests for each P0 flow, with the server mocked as down, slow and up.
  - The server's existing `node:test` suite stays green.

Exit criteria:
- Every P0 acceptance test in 03 passes in CI.
- A manual airplane-mode pass on one device loses nothing.

Rollback: revert the phase commits. No data migration is involved.

## Phase 2. One design system
Scope: 05 tokens package, D1 to D3, the shared components, UX backlog P1 items 14 to 20 and P2 items 21, 25 and 26.

Exit criteria:
- No inline hex values or font sizes outside the tokens file, checked by grep in CI.
- All tappables go through `Press`.
- Labels are 12 px or larger.
- Screen reader pass (VoiceOver and TalkBack) on Today, Debrief, Universe and You: every control is announced with a role.
- Web and app screenshots side by side read as one product.

Rollback: tokens are additive. Fonts and labels revert in one commit.

## Phase 3. The Mind world (the milestone)

**Reflection features.** Each comes from data the person gave. Nothing is inferred beyond what the server already infers today.

| Feature | What the person sees | Data | Needs |
|---|---|---|---|
| What I understand in Mind | Every active belief in Mind's domains (mental, career, creativity, wealth). Each shows "Why I think this", how sure ("A guess", "Probably true", "Well established") and "That's not right" with a correction. | `assertions` (exists) | the shared `BeliefCard` |
| Mind constellation | The person's moments in Mind's domains as stars. Two stars connect only when both are evidence for the same belief, and tapping the line names that belief. Tapping a star shows a short excerpt of their own words from that day. | `records`, `assertion_evidence` (exist) | New routes `GET /worlds/mind` and `GET /records/:id/excerpt`, own data only, with tests |
| Take a moment out | "Leave this out of what you understand", with undo for 5 s. Beliefs that rested only on it are re-checked. | records | New `POST /records/:id/exclude` plus a re-promotion check; product decision on wording |
| Still forming | Hypothesis-level beliefs are shown quietly as "Still forming", never as facts | `assertions.confidence` (exists) | none |
| The quiet move | Today's build or learn step, with its "because" | plan (exists) | none |
| List view | The whole constellation as an accessible list (date, your words, the belief it supports) | same | none |

**Transitions** (Reanimated, UI thread, all reversible):
- **Travel:** the sky dollies toward Mind from where it is, and a tap or back gesture reverses it mid-flight.
- **Arrival:** the panel arrives with a 420 ms rise.
- **A star is born:** the first time a new Mind moment appears, the doctrine's moment 4 plays.
- **The pullback:** 1.8 s out to the sky, with the universe's position kept, then layers fade in by depth.
- **Reduced motion:** a 200 ms crossfade or an instant cut for every one of these.

**Route back:**
- `BackToSky`, the iOS edge swipe and Android back all trigger the pullback.
- Universe scroll and selected world are restored.
- Deep links to `/world/mind` open with a short arrival, not a blank screen.

**Tests:**
- Server: route tests including privacy (no other user's records; a 404 for others' ids).
- App: RNTL for BeliefCard dispute and undo, the constellation list view, and the outbox.
- Maestro: open app, then Universe, then Mind, dispute a belief, undo, back to sky.
- Device: travel and pullback frame times, and Skia with 300 synthetic moments.
- Screen readers: full Mind flow.

**Exit criteria** (measured on the two devices):
- Travel p95 frame time is under 16.7 ms on the iPhone and under 25 ms on the Android.
- A tap during travel reverses the move within one frame.
- The constellation stays at 60 fps with 300 moments.
- axe-equivalent checks pass: every control has a role and label, and contrast is 4.5:1 or better.
- Every link names its belief. No sample data appears without a label.
- Adversarial review scores 8 or higher on all eight criteria.

## Phase 4. Review on device, then expand
- Internal TestFlight or EAS internal build for the owner. **Needs approval to send.**
- Then Body, Soul and Future reuse `WorldPanel`, `BeliefCard`, the constellation and the transitions. Each world gets its own approach path (arc, low, drift, long lens), as the web already defines.
- The web experience takes the shared tokens. If D-approved, the tech scout's Prototype B/C promotion and detect-gpu follow there.

## Effort and order (estimates, to be confirmed after Phase 0)

| Phase | Effort | Depends on |
|---|---|---|
| 1 | 3 to 4 days | D5 (test tools) |
| 2 | 3 to 4 days | D1 to D3, D5 (fonts) |
| 3 | 8 to 12 days | D4 to D7, Phase 1 and 2 |
| 4 | 1 to 2 days per world after Mind | Phase 3, device access |

## Not in scope until asked
- Publishing, store submission, waitlist and Instagram CTAs.
- Any paid generation (Higgsfield).
- Any new AI inference about the person.
