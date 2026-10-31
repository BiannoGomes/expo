# 03. Prioritized UX improvement backlog

Read-only audit, 2026-10-31, branch `claude/becoming-product-brief-45v3ua`. Nothing here has been changed.

**What was audited**
- The mobile app (`apps/mobile`): 10 routes and 7 lib modules, 4,131 lines.
- The web experience (`experience`): QA baseline, `v2/AUDIT.md`, `docs/`.
- The owner-approved doctrine in `docs/design-direction.md`.

Every finding cites a file and line. Each one is labelled **Observed** (read in code or measured here) or **To verify** (needs a device or screen reader, neither of which is available in this container).

**Priority**
- P0: input can be lost, or the app tells the person something untrue.
- P1: a doctrine or accessibility gap a person will hit.
- P2: friction or polish.

Effort: S (under half a day), M (1 to 2 days), L (3+ days).

## P0. No lost inputs, no untrue states

| # | Finding | Evidence | Fix | Effort | Acceptance test |
|---|---|---|---|---|---|
| 1 | **A failed debrief says goodnight.** When sending fails, the error appears inside the "Today's evolution" block, followed by "That's the day, witnessed. Sleep well." The text is kept, but the screen claims it landed. | Observed. `app/(tabs)/debrief.tsx:122`, `:251` | Separate an `error` state from `reply`. Show an inline retry under the field, and show the goodnight line only after a real reply. | S | With the server off: no goodnight line, text still in the field, Retry sends it. |
| 2 | **Onboarding loses the message it promises to keep.** The input clears before sending. On failure the copy says "nothing you wrote is lost. Try once more", but the person has to retype it. | Observed. `app/onboarding.tsx:148`, `:175` | Keep the text until the server confirms. On failure restore it to the field, or show Retry on the bubble. | S | With the server off: send, see the failure, the text is back in the field. |
| 3 | **Ticking a step can silently undo itself.** If `markSlot` fails, the comment says "the server catches up next sync", but no queue exists. The next pull-to-refresh or reopen overwrites the tick with server state. On the offline fallback plan, ticks are never sent at all. | Observed. `app/(tabs)/index.tsx:288-298` | Add a small persisted outbox (same pattern as `lib/draft.ts`). Mutations queue, replay on focus and on reconnect, and drop only on a 2xx response. | M | Airplane mode: tick, kill app, reopen online. The tick is on the server. |
| 4 | **A failed voice recording is gone.** If transcription fails, the audio file is dropped and the person hears "I couldn't hear that just now". | Observed. `app/(tabs)/debrief.tsx:151-166` | Keep the last recording URI until transcription succeeds, with "Try again" on it. | S | With transcription failing: Try again succeeds without re-recording. |
| 5 | **Recording keeps running after leaving the tab.** Tabs stay mounted, and nothing stops the recorder on blur or when the app goes to the background. | Observed (no blur or AppState handler in `debrief.tsx`). Device behaviour to verify. | On blur or background, stop and keep the clip, then offer it on return. | S | Start recording, switch tab, come back: the clip is offered and the mic is off. |
| 6 | **No request timeout.** `api()` has no AbortController, so on a bad network "Reflect" can spin for the platform default, which can be a minute or more. | Observed. `lib/api.ts:61-76` | Add a 15 s timeout (60 s for `/transcribe` and `/debrief`) mapped to the calm error copy. | S | With a throttled proxy, the error appears in at most 15 s. |
| 7 | **Sample stars can look like the person's own.** The weekly reveal's constellation starts from 26 generated PREVIEW stars and keeps them if the fetch fails, with no label. That breaks "never fakes knowing you". | Observed. `lib/constellation.tsx:99-104`, `:144` | Start empty. If offline, show no stars, or the existing star set with "Your sky will be here when you're back online". | S | With the server off, the reveal shows no unlabelled stars. |
| 8 | **Offline first run gets a plan.** When `/me` is unreachable the person is treated as onboarded, so a brand-new person offline is dealt the default plan. | Observed. `app/(tabs)/index.tsx:244` | Cache the last known `onboardingComplete`. With no cache, show the invitation with an offline note. | S | Fresh install, airplane mode: the invitation appears, not a plan. |
| 9 | **The draft is saved in plain text.** The debrief draft goes to the documents directory unencrypted. That is low risk, but this is a journal. | Observed. `lib/draft.ts:13` | Encrypt with a key held in `expo-secure-store` (already a dependency), or hold the draft in secure store with a size cap. | M | The file on disk is unreadable without the key. |

## P1. Doctrine, accessibility and the route back

| # | Finding | Evidence | Fix | Effort |
|---|---|---|---|---|
| 10 | **Travel cannot be cancelled.** The doctrine says "1600 ms dolly, cancelable at any time". The code ignores taps while travelling, and nothing reverses the move. | Observed. `app/(tabs)/universe.tsx:46`; `docs/design-direction.md:184` | Drive travel from one progress value. A tap or back gesture reverses it from where it is (as in web Prototype B). Start loading the world screen data at the first frame. | M |
| 11 | **The route back has no pullback.** Moment 5 (1800 ms dolly out, layers by depth) is not built. Returning from a world snaps the sky back via `zoom.setValue(0)`. | Observed. `universe.tsx:37`; doctrine `:186` | Animate the return from the world's position, honouring reduced motion (a quiet cut). | M |
| 12 | **"A star is born" is not built.** Moment 4 of the doctrine is absent from the app. | Observed (no implementation found) | Build it in the Mind world milestone, where the first insight lands. | M |
| 13 | **Two dispute behaviours.** In a world, "That's not right" sets the belief aside in one tap, with no undo and no "Say it in your words". In You it opens options. If the call fails in a world, the thanks disappears with no message. | Observed. `app/world/[world].tsx:164-176`; `app/(tabs)/you.tsx:84-160` | One shared `BeliefCard`: why, dispute options, correction, undo for 5 s, and a visible error on failure. | M |
| 14 | **Dispute colour fails AA.** Danger `#B4655F` on Surface `#12161D` measures 4.29:1 for 14 px text (AA needs 4.5:1). | Observed (computed) | Lift to `#C47A73` (5.51:1 on Surface, 5.19:1 on Raised). This needs a doctrine amendment. | S |
| 15 | **Buttons with no role.** 24 raw `Pressable`s, several without `accessibilityRole` or label, so screen readers don't announce them as buttons. Examples: dispute options in You, "Noted", "Settings", the campaign link. | Observed. `you.tsx:111`, `:125`, `:144`; `index.tsx` promotion and campaign link | Route all taps through `Press` (it sets role and state). Add a lint rule. | S |
| 16 | **The weekly reveal is not modal to assistive tech.** It is an absolute overlay with no `accessibilityViewIsModal` and no Android back handling, so content underneath stays reachable. | Observed. `index.tsx:533`; screen reader behaviour to verify | Make it a modal route (`presentation: "transparentModal"`), or set `accessibilityViewIsModal` and handle Android back. | S |
| 17 | **Labels below a readable size.** 9, 10 and 10.5 px mono uppercase labels appear on the universe and world screens. Uppercase mono tracking also reads as letter-by-letter on some screen readers. | Observed. `universe.tsx:93`; `world/[world].tsx:119` | Use a 12 px minimum and sentence case (see 05). | S |
| 18 | **Internal jargon on screen.** "SCALE 1 · THE INTIMATE SKY" and "SCALE 2 · MIND" are design-document words. | Observed. `universe.tsx:93`; `world/[world].tsx:119` | Remove them, or replace with the world's name. | S |
| 19 | **Tab bar height is fixed.** `height: 64` overrides the safe-area-aware height, so labels can sit on the home indicator. | Observed in code; effect to verify on device | Use the default height plus the inset, or add `useSafeAreaInsets().bottom`. | S |
| 20 | **The listening pulse ignores reduced motion.** | Observed. `debrief.tsx:47-75` | Show a steady gold dot when reduced motion is on. | S |

## P2. Friction, feedback and reuse

| # | Finding | Evidence | Fix | Effort |
|---|---|---|---|---|
| 21 | **Blank first paint.** Today renders `null` while loading, and the root waits on 8 font files before showing anything. | Observed. `index.tsx:321`; `_layout.tsx` `useFonts` | Keep the splash up until fonts load (`expo-splash-screen` is installed). Show the greeting and date at once, with quiet placeholders for the steps. | S |
| 22 | **No next step after the debrief.** After the reply there is nothing to do. | Observed | One quiet line: "Your morning will be ready at 7" (from touchpoint settings), or a link back to Today. | S |
| 23 | **The same plan is fetched three times.** Today, Universe and World each fetch `/plan/today` on focus. A tick on Today relies on a refetch to show up elsewhere. | Observed | Add a tiny shared store (React context plus the outbox from #3), one fetch, and optimistic updates everywhere. | M |
| 24 | **A bad world deep link shows a blank screen.** | Observed. `world/[world].tsx:85` | Redirect to Universe. | S |
| 25 | **Haptics on one action only.** Haptics fire only on step completion. Send, dispute and arrival at a world have none. | Observed (only `index.tsx` imports Haptics) | A small haptic vocabulary: light for confirm, soft on arrival, none on errors. | S |
| 26 | **Motion values are scattered.** 10 distinct durations and 24 distinct font sizes appear inline. `theme.type` covers 5. | Observed (counted) | Add motion and type tokens shared with the web (see 05). | M |
| 27 | **Date format hard-coded to en-GB.** | Observed. `index.tsx` `dateLine` | Use the device locale. | S |
| 28 | **No tests in the app.** Typecheck is the only gate, and the server has 3 test files. | Observed | Add Jest with React Native Testing Library for the P0 flows, and Maestro for one end-to-end path (an install needs approval). | M |

## Web experience (Living Universe site)
The QA baseline is still: 0 axe violations in 6 states, deterministic frames, reduced-motion verified. Open items carried forward:
- **Measurement gaps.** No physical-device frame times exist, only SwiftShader upper bounds.
- **Hub frame time.** The hub median is 67 ms on the throttled rig, against a 16.7 ms target on real hardware. This is unverified.
- **Film gaps.** Captions sit over the faint Personal Model header, and two climax narration lines are under 8 dB above the music.

These stay on the performance plan (04) and are not new UX work. The web site is the story. The app is where a person reflects, so the app gets the next milestone (see 06).
