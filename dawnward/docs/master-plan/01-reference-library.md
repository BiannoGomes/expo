# 01. Reference library

These are nine products studied for principles, never for code, assets or trade dress. Source links and quotes are in `appendix-research-notes.md`.

Evidence labels:
- **O**: the page was fetched and read on 2026-10-31.
- **S**: seen only in a search snippet.
- **A**: assumed.

**Already in Dawnward** marks a principle the app already follows, so the work there is keeping it.

## Linear
- **Exceptional:**
  - Actions respond locally at once and sync behind them. Linear's own page only names its sync-engine talk; the details come from secondary write-ups (S).
  - One command menu reaches everything: `Cmd/Ctrl+K`, two-key go-to shortcuts, `?` for help (O).
  - The 2024 redesign generates each theme from 3 inputs (base, accent, contrast) in LCH. Before, each theme was 98 hand-set variables (O).
- **Principle:** perceived speed is a design material. The person's input never waits on the network.
- **Dawnward, originally:**
  - Every write (a step ticked, a belief disputed, a debrief) lands in a local outbox first and shows as done; it syncs behind. This is backlog P0 #3.
  - The world accents come from one generated palette with three inputs: night, dawn accent and contrast.
  - On the web, a small `/` command list: "Begin debrief", "Go to Mind".
- **Where:** debrief, Today, Personal Model, web navigation.
- **Cost:** M for the outbox, S for the palette, S for the web commands.
- **Measure:**
  - Zero lost writes in an airplane-mode test.
  - Tap-to-visible-change under 100 ms on device.
  - A script checks every token pair for 4.5:1 contrast.

## Things 3
- **Exceptional:**
  - The Magic Plus button: drag it to where the new item belongs (O, MacStories).
  - Tasks open as a card in place while the list recedes, and close back into place (O).
  - Haptics on lift and drop (O).
  - Two Apple Design Awards (O, culturedcode.com).
- **Principle:** spatial continuity. Things open where they are and return where they were. Where you drop something decides what it becomes.
- **Dawnward, originally:**
  - A morning step expands in place to show its "because" and the evening it came from, then folds back.
  - The world screen's back gesture returns the sky to exactly where it was (the pullback, P1 #11).
- **Where:** Today steps, the route back from a world.
- **Cost:** M (Reanimated layout animation).
- **Measure:** In testing, people can say where a step went. No layout jump on the return, checked by frame review.

## Apple Journal
- **Exceptional:**
  - Journaling suggestions are created on the device, and the app sees only what the person chooses to share (O, Apple Newsroom and developer docs).
  - Entries are end-to-end encrypted. The app can be locked (O).
  - iOS 18 added writing **streaks** (O, MacRumors). Dawnward must not follow that part.
- **Principle:** the person picks what the app may see. A suggestion is an invitation, not surveillance.
- **Dawnward, originally:**
  - **Already in Dawnward:** "Why I think this" and "That's not right".
  - Next step: the Mind constellation shows the person's own words behind each belief, and lets them take a moment out ("Leave this out of what you understand", with undo).
  - Encrypt the local draft (P0 #9).
  - Optional app lock with `expo-local-authentication` (MIT, Expo 54 pin ~17.0.9).
- **Where:** Personal Model, Mind world, debrief, settings.
- **Cost:** S to M.
- **Measure:**
  - 100% of beliefs show a source.
  - A dispute is followed by continued use. Watch this in aggregate, privately, never shown as a number to the person.

## Headspace
- **Exceptional:**
  - Soft, ambiguous characters and metaphors for feelings (O, talk recap).
  - Onboarding was judged by **week-two** retention, not first-session views. The reworked flow raised week-two engagement by about 10% relative (O).
  - Ambient motion uses Lottie for small file size (O).
- **Principle:** lower the emotional threat with soft, consistent visuals. Judge onboarding by whether people come back, not by the first screen.
- **Dawnward, originally:**
  - World atmospheres as soft light, never characters.
  - The team's private success measure is "a second and third debrief within 14 days". It is never shown to the person, so it is not a streak.
- **Where:** onboarding, worlds, empty states.
- **Cost:** M.
- **Measure:** onboarding completion, and the share of people with 2 or more debriefs in the first 14 days (aggregate only).

## Duolingo (principles only)
- **Conflicts** (do not use): the streak, which Duolingo's own blog describes as built on loss aversion (O); buyable streak freezes; XP; leagues; hearts; badges; guilt reminders (A).
- **Usable:**
  - Instant feedback.
  - A character with idle life, driven by a state machine reacting to real signals; their characters' mouths follow the audio (O, Rive visemes).
  - Sound and haptics designed as one instrument (S).
- **Dawnward, originally:**
  - While listening, the gold dot responds to the person's voice level.
  - On a received reflection, one soft success haptic.
  - Reactions acknowledge, never grade.
- **Where:** debrief listening state, step completion.
- **Cost:** M.
- **Measure:** feedback under 100 ms. A QA check that finds no counters, streaks, scores or badges anywhere.

## Apple visionOS (Human Interface Guidelines)
- **Exceptional** (all O, HIG):
  - "Find the minimum level of immersion that suits" each moment.
  - "Use depth to communicate hierarchy."
  - "Avoid adding depth to text."
  - "Consider using fades when you need to relocate an object."
  - "Avoid letting people rotate a virtual world."
  - "Consider giving people a stationary frame of reference."
  - Interactive targets need 60 pt between centres.
- **Principle:** immersion is a dial. Comfort rules motion. Text stays flat and legible on a translucent surface.
- **Dawnward, originally:**
  - The sky is low immersion and a world is one step deeper.
  - Travel stays in the central field and is reversible.
  - The world panel is flat glass with flat text.
  - **Already in Dawnward:** worlds never rotate in the app.
  - The web hub's free yaw drag should be capped: under 30°/s, with a stable horizon.
- **Where:** Universe, worlds, web hub.
- **Cost:** M.
- **Measure:** an automated check that camera yaw stays under 30°/s; comfort ratings in testing; the reduced-motion path covered by tests.

## Moonlitt
- **Verified:** it exists. A moon-phase app by Flipping Hues; "Works offline, with no ads or tracking" (O, App Store). **2026 Apple Design Award winner for Interaction** (O, Apple Newsroom).
- **Principle:** a real natural cycle, shown beautifully, is a calm reason to return. Privacy stated plainly as a feature.
- **Dawnward, originally:** **Already in Dawnward.** The living sky follows the person's local time (`skyModeForNow`: predawn, still, dusk). Next steps:
  - Say what is true about privacy in onboarding, in one sentence.
  - Let the Mind world's light follow the same clock.
- **Cost:** S. **Measure:** people can tell morning from evening without reading.

## Tide Guide
- **Verified:** it exists, from Condor Digital. **2026 Apple Design Award winner for Visuals and Graphics**, and an Interaction finalist. Apple cites full-screen charts with custom animation and a "palette … designed to match the color of the sky throughout the day" (O).
- **Principle:** dense information made glanceable through one bold full-screen visual, in a palette tied to real light.
- **Dawnward, originally:** the Mind constellation is that one visual: full screen, no numbers, tap to see the words behind it. A later home-screen widget could show this morning's three steps.
- **Where:** Mind world, Personal Model, later a widget.
- **Cost:** M (widget M to L).
- **Measure:** people can explain what the constellation shows. No numeric score visible anywhere.

## Arc (The Browser Company)
- **Status:** Arc is sunsetting on 22 December 2026, and its mobile AI features stop on 23 November 2026 (O, arc.net). Use it as a reference only.
- **Exceptional:**
  - Spaces, each with its own colour identity (O, SlashGear).
  - Peek: preview without leaving the page (O).
  - Arc Search opens with the keyboard ready (O, Inverse interview).
  - Browse for Me always lists its sources (O).
- **Principle:** context has its own light. Preview before committing. The main input is ready on arrival. Generated statements link back to sources.
- **Dawnward, originally:**
  - Each world changes the light, not the layout.
  - Long-press a morning step to peek at the evening sentence it came from.
  - The debrief text field is focused on arrival. The microphone is never switched on automatically, for privacy.
  - **Already in Dawnward:** "Why I think this" plays the source-list role.
- **Where:** worlds, Today, debrief.
- **Cost:** S to M.
- **Measure:** time from opening the debrief to the first word; people can name the world from its colour alone.

## What this library changes in the plan
1. The outbox (Linear) and the route back (Things) move up to Phase 1 and Phase 3.
2. The Mind constellation is the single full-screen visual (Tide Guide), showing sources (Arc, Journal) with a reversible, comfort-safe camera (visionOS).
3. Nothing from the streak economies (Duolingo, Journal Insights) enters Dawnward.
