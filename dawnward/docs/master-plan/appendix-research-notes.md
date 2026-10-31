# Appendix: research notes (source evidence for 01 and 02)

Date: 2026-10-31. Read-only research. Nothing installed, nothing written to the repo.

Labels:
- **O** = OBSERVED. I fetched the page (or the npm registry, raw GitHub or Apple JSON) and read it in this session.
- **S** = seen only as a search-result snippet. The page itself was not fetched.
- **A** = ASSUMED. From prior knowledge or inference, not verified this session.

Dawnward baseline, read from the repo (O):
- `experience/package.json`: `three ^0.187.0`.
- `apps/mobile/package.json`: `expo ~54.0.8`, `react-native 0.81.4`, `react 19.1.0`, `expo-haptics ~15.0.7`.
- Not yet installed: reanimated, gesture-handler and skia.

---

## Key findings (read first)

1. **`postprocessing` does not support three 0.187 yet (O).** The latest release, 6.39.5 (2026-09-09), declares `three: ">= 0.168.0 < 0.187.0"`. Each 6.39.x release raised that ceiling about one three release behind. Options:
   - wait for 6.39.6 or later;
   - use three's own `examples/jsm/postprocessing` (`EffectComposer`, `UnrealBloomPass`) for now;
   - use the 7.0 beta (not recommended).
2. **Pin the React Native libraries to the Expo SDK 54 lines, not npm `latest` (O).**
   - `react-native-reanimated` 4.7.1 requires RN 0.86–0.88.
   - Expo SDK 54's `bundledNativeModules.json` (expo@54.0.38) pins:
     - `react-native-reanimated ~4.1.1`
     - `react-native-worklets 0.5.1`
     - `react-native-gesture-handler ~2.28.0`
     - `@shopify/react-native-skia 2.2.12`
     - `expo-haptics ~15.0.8`
   - Install with `npx expo install`, never a bare `npm i`.
3. **React Bits is not MIT (O).** Its licence is "MIT + Commons Clause License Condition v1.0". Commercial use inside an app is allowed. Redistributing or porting the components themselves is not. It is not OSI-open-source.
4. **GSAP is free but not open source (O).** It uses the "Standard 'No Charge' GSAP License" (effective 2025-04-30). There is a Prohibited Use clause about no-code visual animation builders that compete with Webflow. It is safe for Dawnward's use case. It is still not a "verified permissive licence" in the OSI sense.
5. **`maath` has effectively moved (O).**
   - The `pmndrs/maath` GitHub repo now publishes as npm `math` (0.1.0, 2026-09-11, MIT).
   - The `maath` npm package was last released 2024-07-07 (0.10.8), yet still gets about 6.4M downloads a week.
6. **Arc is being shut down (O).** arc.net says "Arc is sunsetting on December 22, 2026". Browse for Me is disabled on iOS and Android from November 23, 2026. Use Arc as a design reference only. Its pages will disappear soon.
7. **Moonlitt and Tide Guide are real and both won 2026 Apple Design Awards (O).**
   - Moonlitt won for Interaction.
   - Tide Guide won for Visuals and Graphics and was also an Interaction finalist.
8. **Apple Journal now has streaks (O).** iOS 18 added streaks in Insights and in widgets. Borrow Journal's privacy and suggestion model, not its Insights view.
9. **I could not reach getlayers.io (O).** DNS is blocked by this session's network allowlist. I only have a third-party description (O, moge.ai) and no licence text. Treat it as unverified until someone allows the host or reads its terms.
10. **`detect-gpu` has moved (O).**
    - The current package is `@pmndrs/detect-gpu` 6.0.28 (2026-10-25). The unscoped `detect-gpu` 5.0.70 dates from 2025-02.
    - By default it fetches benchmark data from unpkg, a third-party request that matters for a privacy-first product. Self-host it with `benchmarksURL`.
    - Its benchmark data source (gfxbench) stopped updating in December 2025.

Side note (O, not part of the brief): `apps/mobile/package.json` mixes `^57.x` versions of several Expo modules with `expo ~54`. Examples are `expo-font`, `expo-file-system`, `expo-secure-store` and `expo-sharing`. SDK 54 bundles `expo-font ~14.0.12`, `expo-file-system ~19.0.24` and so on. This may be deliberate, since the repo is an Expo fork with local workspace packages. Worth checking with `npx expo install --check`.

---

## Part 1. Reference library

### 1.1 Linear

**What makes it exceptional**

The 2024 redesign (O, [Part II write-up, 2024-03-28](https://linear.app/now/how-we-redesigned-the-linear-ui); [changelog 2024-03-20](https://linear.app/changelog/2024-03-20-new-linear-ui)):
- Themes are generated in **LCH instead of HSL**. Light and dark themes each went from 98 variables to **3 inputs: base, accent, contrast**. The contrast input also gives high-contrast themes for accessibility.
- Blue "chrome" was reduced for a neutral look.
- Inter Display is used for headings, with Inter for body text.
- The redesign kept the product's structure intact. It "should not completely disassemble the product to its atomic parts".
- Rollout went through a feature flag, then a private beta by workspace percentage, then general availability.
- Part I is titled "A design reset" (S).

Keyboard-first (O, [Navigating Linear](https://linear.app/enablement/guides/navigating-linear)):
- `Cmd/Ctrl+K` opens the command menu, to "open pages or run actions without leaving your keyboard".
- Two-key go-to shortcuts, such as `G` then `I`.
- `?` lists all shortcuts.
- `/` opens search.

Sync engine and optimistic UI:
- Linear's own page only frames the talk "Scaling the Linear Sync Engine" (O, [Tuomas Artman, 2023-06-29](https://linear.app/now/scaling-the-linear-sync-engine)). It gives no technical detail.
- Local-first data, optimistic writes and an in-memory store with a transaction queue are described only in secondary sources (S, [performance.dev](https://performance.dev/how-is-linear-so-fast-a-technical-breakdown), [reverse-engineering gist](https://gist.github.com/tanvirraj/b8807d0e58ed401731d853d782c567b7)).

**Underlying principle**

Perceived speed is a design material:
- Every action responds locally, instantly.
- One command surface reaches everything.
- Color is generated from a few perceptual parameters, not hand-tuned per screen.

**How Dawnward could do this originally**

- Write the debrief locally first. Save each sentence to on-device storage as it is typed or transcribed. The server or sync is never on the input's critical path.
- Generate Dawnward's dark palette from 3 OKLCH/LCH inputs: night base, dawn accent and contrast. Each world (Mind, Body, Soul, Future) shifts only the accent hue.
- On the web, add a small command palette (`/` or `Cmd+K`) with actions such as "Begin debrief", "Go to Soul" and "Open Personal Model". It uses Dawnward's own copy and visuals.

**Where it applies:** evening debrief (local-first), navigation (command palette and shortcuts on the web Universe), theming.

**Cost:** S for the palette generator; M for local-first writes with background sync; S for the web command palette.

**How to measure:**
- Input-to-paint under 50 ms (p95) when saving a sentence.
- Zero lost entries offline.
- Contrast of every token pair at least 4.5:1, checked by an automated script.
- Share of web sessions that use the palette or shortcuts.

### 1.2 Things 3 (Cultured Code)

**What makes it exceptional**

The Magic Plus button (O, [MacStories review, 2017](https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/)):
- Drag it to the exact spot where the new item should go: a list position, a project, or a day in Upcoming.
- The review calls it "one of the most clever methods of task entry I've seen".

Other praised interactions (O, same review):
- Tapping a task opens it as a card while the list recedes.
- Long-press lifts a task so it can be dragged.
- "This Evening" splits Today into day and evening sections on one screen.
- Taptic feedback on drag and pull-to-search makes "every interaction with the app feel that much more real".

Animations (O, [culturedcode.com/things](https://culturedcode.com/things/)):
- The site quotes Wired: "Lovely, unfolding animations" that keep your place in a long list.
- It says Things has won two Apple Design Awards.
- Things 3 won in 2017 (S, [MacRumors 2017 winners](https://www.macrumors.com/2017/06/07/2017-apple-design-award-winners-announced/)). The first award was in 2009 (S, AppleWorld Today).

**Underlying principle**

- Spatial continuity: things open where they are and close back into place.
- Direct manipulation over forms: where you drop something decides what it becomes.
- Haptics confirm physical-feeling actions.

**How Dawnward could do this originally**

- Each morning step expands in place from its card. The card shares an element with its detail view, so it never jumps to a new screen.
- A drag gesture to "carry" a step to tonight or to a world: drop it on Mind, Body, Soul or Future to tag it. Use a light haptic at pickup and a soft haptic on drop.
- Keep an explicit "Tonight" or "This evening" section next to the morning steps, the same day/evening split as Things.

**Where it applies:** morning steps, evening debrief entry point, tagging a step to a world.

**Cost:** M. Needs Reanimated layout animations, a Gesture Handler pan gesture and expo-haptics.

**How to measure:**
- Tagging completes in one gesture (time-on-task under 2 s).
- Fewer than 5% "undo" actions after a drag.
- Usability sessions: users can describe where a step went (spatial continuity check).

### 1.3 Apple Journal

**What makes it exceptional** (O, [Apple Newsroom, 2023-12-11](https://www.apple.com/newsroom/2023/12/apple-launches-journal-app-a-new-app-for-reflecting-on-everyday-moments/))

Suggestions and privacy:
- "Journaling suggestions are created on device, and users can choose which suggested moments are shared with the Journal app."
- Entries are end-to-end encrypted in iCloud.
- The app can be locked with Face ID or Touch ID.
- There are daily reflection prompts on gratitude, kindness and purpose.

The JournalingSuggestions API (O, [Apple developer docs](https://developer.apple.com/documentation/journalingsuggestions)):
- A system picker shows suggestions.
- Your app "can't access the details for a suggestion until after a person chooses to share them".
- So no extra authorization prompt is needed.

iOS 18 additions (O, [MacRumors 2024-06-10](https://www.macrumors.com/2024/06/10/ios-18-brings-new-insights-to-journal-app/)):
- An Insights view with **writing streaks**.
- Streak widgets.
- State of Mind logging.
- Automatic audio transcription.

**Underlying principle**

- The user explicitly picks what the app may see.
- Suggestions work like an invitation, not surveillance.
- Voice is a first-class input.

**How Dawnward could do this originally**

- Every inference in the Personal Model carries "Why I think this", listing the exact phrases it came from. Each phrase can be removed.
- Treat "That's not right" as Dawnward's version of the share-only-what-you-pick rule.
- Use the iOS JournalingSuggestions picker only if Dawnward ships a native module (A, needs a native entitlement).
- **Do not** copy Insights or streaks.

**Where it applies:** Personal Model, evening debrief (voice-to-text), onboarding (privacy promise), app lock.

**Cost:**
- S: copy and design for the provenance chips.
- M: app lock with `expo-local-authentication` (A).
- L: native JournalingSuggestions bridge (A).

**How to measure:**
- Percentage of model statements with at least one visible source phrase (target 100%).
- "That's not right" usage followed by retained use. Corrections should build trust, not cause churn.
- Privacy comprehension check in onboarding testing.

### 1.4 Headspace

**What makes it exceptional**

The "Design for Change" talk, by Vicki Tan and Christine Cha (O, [Raw Studio recap, 2021-05-10](https://raw.studio/blog/how-headspace-designs-for-mindfulness/)):

Illustration:
- Characters are relatable and deliberately ambiguous, with no sharp edges.
- Emotions are shown through metaphor, such as steam and lightning for anger.
- The aim is presence "inside of your reality", not escape.

Onboarding findings:
- Analytics showed **38% drop-off** between starting and finishing onboarding.
- Users who got past week 2 were **5x more likely to convert**, so week-two retention became the north-star metric.
- Changes that improved first-session views did **not** move week-two retention.
- The final flow was: welcome → experience level and session length → goals → reminder time → recap.
- Result: about **+10% relative** week-two engagement.

Motion (O, [LottieFiles case study by Brian Lee, Headspace](https://lottiefiles.com/case-studies/headspace)):
- Lottie is used for in-app UI, browser accents and ambient meditation backgrounds.
- It was chosen for "extremely small file sizes" and because it is resolution-independent.

**Underlying principle**

- A soft, consistent visual language lowers emotional threat.
- Measure onboarding by the second week, not the first screen.
- Ambient motion is lightweight and vector-based.

**How Dawnward could do this originally**

- An original abstract motif set: soft light shapes per world, not characters.
- Use metaphor for states, such as fog for an unclear mind.
- Onboarding of 4–5 steps:
  - what you'd like to notice;
  - preferred evening time;
  - talk or type;
  - the privacy promise;
  - a recap.
- Make Dawnward's equivalent of Headspace's week-two metric "returned for a 2nd and 3rd debrief within 14 days". Never show it to the user as a streak.

**Where it applies:** onboarding, Universe/worlds (ambient motion), empty states.

**Cost:** M for the onboarding rewrite and instrumentation; M–L for an original illustration and motion set.

**How to measure:**
- Onboarding completion rate.
- Percentage of users with 2 or more debriefs in their first 14 days.
- Both are measured privately and in aggregate. No per-user streak UI.

### 1.5 Duolingo (principles only; many mechanics are forbidden)

**What makes it exceptional**

Characters (O, [Duolingo blog, 2022-11-10](https://blog.duolingo.com/world-character-visemes)):
- Characters are Rive state machines with 20+ mouth shapes (visemes) per character.
- Idle states (nods, blinks, eyebrows) keep them alive.
- After each challenge they react with a right or wrong final state.
- Animation is driven at runtime from audio timing, which needs "far less data than a video".

Streak research (O, [Duolingo blog, 2022-01-31](https://blog.duolingo.com/how-duolingo-streak-builds-habit)):
- The streak is explicitly built on **loss aversion**.
- Streak Freeze raised daily active learners by +0.38%.
- A post-lesson extension animation raised 7-day retention by +1.7%.

Haptics as an instrument layered under the sound design (S, LinkedIn post by a Duolingo sound and haptics team member). Not fetched.

**Conflicts with Dawnward's rules (do not use)**

| Mechanic | Source | Why it conflicts |
|---|---|---|
| Daily streak counter | O (blog) | Explicitly a streak, built on loss aversion |
| Streak Freeze / repair, buyable with gems | O (blog; gems: S, Lenny's summary) | Streak plus pay-to-protect guilt |
| Milestone celebration tied to streak day | O (blog) | A streak reward |
| XP, leagues, leaderboards | A | Scores and rankings |
| Hearts/lives lost on mistakes | A | A punishment mechanic |
| Guilt-tone reminder notifications ("Duo is sad") | A | Guilt mechanic |
| Badges and achievements | A | Badges are forbidden |

**Usable principles**

- **Immediate feedback:** every action gets a response within a frame.
- **Character with idle life:** use a non-human "presence", for example the dawn light that breathes while listening.
- **State-machine animation** driven by real signals such as voice amplitude.
- **Sound and haptics designed as one instrument.**
- **Reactions acknowledge, never grade:** "Heard." rather than "Correct!"

**How Dawnward could do this**

- While the user speaks in the debrief, the light reacts to microphone amplitude.
- On save: a soft settle animation, a single `notificationAsync(Success)` or a light impact, and a quiet tone.
- Nothing counts days.

**Where it applies:** evening debrief (listening state), morning step completion, Universe ambient presence.

**Cost:** M. Amplitude-driven shader or Skia motion plus a sound and haptic pass.

**How to measure:**
- Feedback latency under 100 ms.
- User-reported "felt heard" in research.
- Audit: zero counters, streaks, scores or badges in the UI (part of the QA checklist).

### 1.6 Apple visionOS (HIG)

**What makes it exceptional**

All quotes below are O, from Apple HIG JSON fetched this session:

[Designing for visionOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-visionos):
- "For each key moment in your app, find the minimum level of immersion that suits it best — don't assume that every moment needs to be fully immersive."
- Display content within the field of view, relative to the head.
- Comfort is "paramount".

[Spatial layout](https://developer.apple.com/design/human-interface-guidelines/spatial-layout):
- "Center important content within the field of view."
- "Avoid anchoring content to the wearer's head."
- "Use depth to communicate hierarchy."
- "In general, avoid adding depth to text."
- "People need to refocus their eyes to perceive each difference in depth … too often or quickly can be tiring."

[Motion, visionOS section](https://developer.apple.com/design/human-interface-guidelines/motion):
- Avoid motion at the edges of the field of view.
- Increase translucency or lower contrast for large moving objects.
- "Consider using fades when you need to relocate an object."
- "In general, avoid letting people rotate a virtual world."
- "Consider giving people a stationary frame of reference."

[Materials](https://developer.apple.com/design/human-interface-guidelines/materials):
- visionOS windows use a system "glass" material.
- "visionOS doesn't have a distinct Dark Mode setting."
- Vibrancy keeps foreground content legible.

[Eyes](https://developer.apple.com/design/human-interface-guidelines/eyes):
- Hover feedback on gaze.
- "visionOS doesn't provide direct information about where people are looking before they tap" (privacy).
- Interactive targets need at least 16 pt margins or centers 60 pt apart.

[Immersive experiences](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences):
- "Design smooth, predictable transitions when changing immersion."

**Underlying principle**

- Immersion is a dial, not a switch.
- Comfort rules motion: no peripheral motion, no world rotation, keep a stable frame.
- Depth only where it adds hierarchy.
- Text stays flat and legible on a translucent surface.

**How Dawnward could do this originally (in three.js)**

- The Universe opens at low immersion: a calm framed view. Entering a world raises immersion gradually, with a fade and dolly. Never auto-rotate the whole scene.
- Keep a stable horizon or vignette as the reference frame.
- Put UI text on flat panels made of a custom frosted plane. Do not reproduce Apple's glass assets.
- Use a single depth step for hierarchy.
- Keep world-switch motion in the central field. Move by fade-relocate, not long flights.
- Hit targets at least 44 px with 60 px center spacing.

**Where it applies:** Universe/worlds, navigation between worlds, reduced-motion mode.

**Cost:** M. Camera rules, fade transitions and a frosted panel shader.

**How to measure:**
- No camera roll or yaw animation over 30°/s, checked by an automated assert.
- Motion-sickness and comfort ratings in testing.
- `prefers-reduced-motion` path covered by tests.
- Frame time p95 under 16.7 ms on a mid-tier GPU.

### 1.7 Moonlitt (verified: exists)

**What it is** (O, [App Store](https://apps.apple.com/app/moonlitt-moon-phase-tracker/id6444718902))

- A moon phase tracker by Flipping Hues Srls (Italy).
- Free with in-app purchases. Requires iOS 26.
- Features: AR moon path, moon compass, lunar calendar, 3D scenes (reworked in v2.10), widgets, Live Activities, Watch and Vision Pro.
- The listing says "Works offline, with no ads or tracking".
- Rated 4.7 from 977 ratings.
- Editors' Choice.

**What makes it exceptional**

- **2026 Apple Design Award winner, Interaction** (O, [Apple Newsroom 2026-06-02](https://www.apple.com/newsroom/2026/06/apple-reveals-winners-of-the-2026-apple-design-awards/)). Apple praises its "easy onboarding and best-in-class Liquid Glass integration".
- Its sister app Sunlitt was a 2024 Apple Design Award finalist and is SwiftUI-built (O, [developer.apple.com/design/awards](https://developer.apple.com/design/awards/)).

**Underlying principle**

- A real natural cycle, shown beautifully, works as a calm, non-gamified reason to return.
- Offline and no tracking are stated as features.

**How Dawnward could do this originally**

- Tie the Universe's light to the user's local time: dusk tones in the evening debrief, dawn tones for morning steps. This is a day-cycle state, not a counter.
- State "works offline, no tracking" plainly where it is true.

**Where it applies:** Universe/worlds, onboarding (privacy statement), morning and evening framing.

**Cost:** S–M. A time-of-day uniform driving the palette and light.

**How to measure:**
- Users can tell morning mode from evening mode without reading labels.
- Privacy statement comprehension.

### 1.8 Tide Guide (verified: exists)

**What it is** (O, [App Store](https://apps.apple.com/us/app/tide-guide-charts-tables/id1406371071))

- By Condor Digital.
- Full-screen tide and weather charts, lunar and solunar data, widgets, Live Activities and Watch complications.
- Pro subscription for widgets and detailed charts.
- Rated 4.7 from about 10K ratings.
- The privacy label lists usage and diagnostics not linked to identity.

**What makes it exceptional**

**2026 Apple Design Award winner, Visuals and Graphics**, and Interaction finalist (O, [Apple Newsroom](https://www.apple.com/newsroom/2026/06/apple-reveals-winners-of-the-2026-apple-design-awards/)). Apple cites:
- "full-screen charts … filled with custom animations";
- Liquid Glass integration;
- an "aquatic theme";
- a "palette … designed to match the color of the sky throughout the day" (O, [developer.apple.com/design/awards](https://developer.apple.com/design/awards/)).

**Underlying principle**

- Dense data made glanceable through one bold full-screen visual.
- The palette tied to real-world light.
- Widgets save a step.

**How Dawnward could do this originally**

- A Personal Model "tide" view: an original full-screen soft curve of themes in your own words over recent weeks. No numbers, no scores. Tapping it reveals the phrases behind it.
- Palette shifts with the time of day (shared with Moonlitt's lesson).
- Later, a widget showing this morning's three steps.

**Where it applies:** Personal Model, morning steps (widget), Universe palette.

**Cost:** M for the chart (Skia on mobile, SVG or canvas on the web); M–L for a widget (native target, A).

**How to measure:**
- Users can explain what the curve shows.
- No numeric score visible (QA audit).
- Widget adds measured as the share of steps opened from the widget.

### 1.9 Arc and Arc Search (The Browser Company)

**What makes it exceptional**

Arc (O, [SlashGear, 2024-08-06](https://www.slashgear.com/1634601/best-arc-browser-features/)):
- **Spaces** each have a name, a profile and their own color scheme. The visuals change when you switch, which separates contexts.
- **Peek** opens links in an overlay instead of a new tab.
- **Little Arc** opens a link in a small throwaway window.
- **Boosts** restyle websites.
- **Command Bar** opens with `Cmd+T` and searches tabs, history and bookmarks (S, secondary guides).

Arc Search (O, [Inverse interview, 2024-01-29](https://www.inverse.com/tech/arc-search-ios-app-interview-lead-designer-engineer)):
- **Browse for Me** searches, reads pages and writes a custom answer page in short chunks, with a "Dive Deeper" source list.
- The keyboard appears immediately when the app opens.
- A deliberately lean UI.
- A fluted-glass texture was tried and then dropped.

Status (O, [arc.net](https://arc.net/)):
- "Arc is sunsetting on December 22, 2026."
- AI features are disabled on mobile from November 23, 2026.
- Atlassian agreed to acquire The Browser Company for $610M in September 2025 (S, [TidBITS](https://tidbits.com/2025/09/04/atlassian-acquires-the-browser-company-for-610-million/)).

**Underlying principle**

- Context gets its own color identity.
- Preview without commitment (Peek).
- The primary input is ready immediately.
- Generated answers always link back to sources.

**How Dawnward could do this originally**

- Each world is a "space" with its own accent and atmosphere, generated from the same 3-input palette system as the Linear idea. Switching worlds changes the light, not the layout.
- **Peek a step:** long-press a morning step to preview the debrief sentence it came from in an overlay, without navigating.
- **Evening opens ready:** the mic or text field is focused on arrival, one tap to speak.
- "Why I think this" works like Browse for Me's source list: every synthesized statement links to its source sentences.

**Where it applies:** Universe/worlds, morning steps (peek), evening debrief (instant input), Personal Model.

**Cost:** S for focused input on arrival; S–M for the peek overlay; S for per-world accents.

**How to measure:**
- Time from app open to first word captured.
- Peek use versus full navigation.
- Users correctly name the world they are in from color alone.

### Summary matrix

| App | Main lesson for Dawnward | Surface | Cost |
|---|---|---|---|
| Linear | Local-first instant writes; 3-input perceptual palette; command palette | Debrief, theming, web navigation | S–M |
| Things 3 | Expand-in-place; drag to place; haptic confirmation | Morning steps | M |
| Apple Journal | On-device suggestions; user picks what's shared; voice input (skip streaks) | Personal Model, debrief | S–L |
| Headspace | Soft metaphor visuals; measure the 2nd week, not the 1st screen | Onboarding, worlds | M |
| Duolingo | Immediate feedback, living character, unified sound and haptics (no streaks, XP, hearts) | Debrief, steps | M |
| visionOS HIG | Immersion as a dial; comfort-safe motion; flat text on translucent panels | Universe | M |
| Moonlitt | Real natural cycle as a calm return reason; offline, no tracking | Universe, onboarding | S–M |
| Tide Guide | One full-screen glanceable visual; sky-matched palette | Personal Model, widget | M |
| Arc | Per-context color identity; peek; instant input; sourced answers | Worlds, steps, Model | S–M |

---

## Part 2. Source verification

| Source | What it is (verified) | Licence (exact) | Integration | Vanilla JS + three.js | React Native / Expo |
|---|---|---|---|---|---|
| **github.com** | Code host. Licence is per repository (O: each repo below has its own LICENSE) | Per repo. Record repo, licence and commit SHA (repo `CLAUDE.md` rule, O) | git clone / npm | Depends on repo | Depends on repo |
| **21st.dev** | "A community catalog of UI built by design engineers": React components, templates, shadcn themes, shaders. "Anyone can publish to the registry". 2 free copies a day, paid membership for more (O, [21st.dev](https://21st.dev/)) | **Mixed, per author.** [Terms](https://21st.dev/terms) (O): content is "the sole and exclusive property of their respective authors and 21st Labs Inc."; open-source derivatives must "keep their licence". Demos and previews are owned by 21st Labs. No blanket licence is granted. CLI `@21st-dev/cli` 1.18.0 is MIT (O, npm) | shadcn-registry format through the shadcn CLI; `npx @21st-dev/cli@latest init --client …`; "copy prompt" (O) | No. React plus Tailwind (O: works "anywhere React runs") | No (O: not mentioned; React DOM and Tailwind) |
| **getlayers.io** | **Not reachable from this session** (DNS blocked by the network allowlist, O). Third-party listing (O, [moge.ai](https://moge.ai/product/getlayers)): a library of landing templates, sections, three.js scenes, video backgrounds and prompts for AI coding tools, with an MCP integration. "Full Stack access includes downloadable source files" on "eligible plans". So it is a **paid asset and component source, not just an inspiration gallery**. Not to be confused with **layers.to** (design inspiration community, S) or layers.design (mockups, S) | **Unknown.** The listing mentions only "eligible licensed layers" for client work. No licence text was seen. Treat as proprietary, no reuse until terms are read | Copy prompt, download source (paid), MCP (per listing) | Possibly: it advertises three.js scenes (unverified) | Unknown (A: unlikely) |
| **ui.shadcn.com** | "This is not a component library. It is how you build your component library." Copies component source into your project through a CLI and registry (O, [docs](https://ui.shadcn.com/docs)) | **MIT** (O, [LICENSE.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md)); npm `shadcn` 4.23.0, MIT, 2026-10-27, about 16.7M downloads a week (O) | `npx shadcn@latest init` / `add`; registry JSON (O, [installation](https://ui.shadcn.com/docs/installation)) | No. React frameworks only (O: Next, Vite, TanStack Start, React Router, Astro, Laravel). Radix/Base UI and Tailwind dependencies (A) | No (O: not mentioned) |
| **motion.dev** (was framer.com/motion, Framer Motion) | "Free and open source. Previously Framer Motion." For React, Vue and JavaScript (O, [motion.dev](https://motion.dev/)). Paid **Motion+** tier: components, examples, Motion Studio (O). framer.com/motion now points to motion.dev (A: redirect not fetched) | **MIT** (O, [LICENSE.md](https://raw.githubusercontent.com/motiondivision/motion/main/LICENSE.md); npm `motion` 14.9.0, MIT, 2026-10-30). `framer-motion` 14.9.0 is the same repo, MIT (O). Motion+ content is under separate paid terms (A) | npm `motion`. Vanilla: `import { animate } from "motion"` (hybrid, 22 kb) or `"motion/mini"` (3.2 kb) (O, [docs/animate](https://motion.dev/docs/animate)) | **Yes.** `animate()` takes DOM elements or selectors, so no React is needed (O). For three.js objects use motion values or plain `animate(0,1,{onUpdate})` (A) | **No** (O: not mentioned). Use Reanimated |
| **gsap.com** | Framework-agnostic JS animation library (O, [GSAP README](https://raw.githubusercontent.com/greensock/GSAP/master/README.md)). **Webflow acquired GreenSock in October 2024** (S, [Webflow blog](https://webflow.com/blog/webflow-acquires-gsap), Axios 2024-10-15). **Made 100% free on 2025-04-30 with v3.13, including former Club plugins** (SplitText, MorphSVG and others) (O, [licensing FAQ](https://gsap.com/licensing/), README) | **"Standard 'No Charge' GSAP License"** (O, [standard-license](https://gsap.com/standard-license/), effective 2025-04-30, modified 2025-05-30). **Restriction:** no use in "tools that allow users to build visual animations without code" that "competes with Webflow's visual animation building capabilities"; no reverse engineering for competing products; keep notices. Not OSI open source. npm `gsap` 3.15.0 (2026-04-13), licence field "Standard 'no charge' license" (O) | npm `gsap`, or CDN | **Yes**, works on any JS object, including three.js properties (A, standard usage) | Not officially (A). Use Reanimated |
| **threejs.org** | "JavaScript 3D Library". Site shows **r187** (O, [threejs.org](https://threejs.org/)) | **MIT** (O, [LICENSE](https://raw.githubusercontent.com/mrdoob/three.js/dev/LICENSE), "Copyright © 2010-2026 three.js authors"). npm `three` 0.187.0, released 2026-10-30, about 31.7M downloads a week (O) | npm `three`; addons from `three/addons/…` (A) | **Native** | Possible through expo-gl / R3F native, but heavy (A). For the app constellation, prefer Skia |
| **reactbits.dev** | Animated React components and backgrounds that "install as source you own" (O, [reactbits.dev](https://reactbits.dev/)). **Four flavours: JS or TS, CSS or Tailwind**, picked by suffix such as `SplitText-TS-TW`, `-JS-CSS` (O, [README](https://raw.githubusercontent.com/DavidHDev/react-bits/main/README.md)) | **"MIT + Commons Clause License Condition v1.0"** (O, [LICENSE.md](https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md)). Commercial use in an app is allowed. **You may not "sell, sublicense, or redistribute the components themselves … or as a ported version."** Exports from its tools follow the same rule. Some effects adapt Paper Shaders (Apache-2.0) and Shaders.com (MIT) (O) | `npx shadcn@latest add @react-bits/<Name>-TS-TW` or `npx jsrepo@latest add https://reactbits.dev/r/<Name>-TS-TW` (O) | No. React DOM. Some backgrounds use OGL or three under the hood (A). Porting to vanilla counts as a "ported version": allowed inside Dawnward, not redistributable (O, licence text) | No (O: not mentioned) |

**Verdict for Dawnward**
- **Safe to use as code:**
  - three.js (MIT)
  - motion vanilla `animate` (MIT)
  - shadcn (MIT), but it only fits a React web surface, and the Universe is vanilla
- **Usable with care:**
  - GSAP: free, proprietary licence, fine for an app; prefer motion for an OSI-licensed stack.
  - React Bits: Commons Clause, keep it inside the product and attribute it.
  - 21st.dev: check each component's own licence and author credit, and record it.
- **Inspiration only until verified:** getlayers.io.

---

## Part 3. Vetted component shortlist

All data below was read from registry.npmjs.org, api.npmjs.org (weekly downloads, 2026-10-23 to 10-29), bundlephobia API and raw GitHub LICENSE files on 2026-10-31 (O), unless marked otherwise.

"Expo 54 pin" means the version in `expo@54.0.38/bundledNativeModules.json` (O).

| # | Package | Repo | Licence (verified) | Latest (date) | Version for Dawnward | Weekly DL | Size | Maintenance | Fit / risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `react-native-reanimated` (+ `react-native-worklets`) | [software-mansion/react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) | MIT (LICENSE O) | 4.7.1 (2026-10-02), peer RN 0.86–0.88 | **~4.1.x** (Expo pin ~4.1.1; 4.1.7 latest patch, 2026-03-20, peer RN 0.78–0.82, worklets 0.5–0.8) with **worklets 0.5.1**. RN 0.81 is supported by 4.0–4.3 (O, [compat table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility)) | 13.0M | Native | Very active | Core spring and layout animation for steps and debrief. Risk: New Architecture only. Do not take `latest` |
| 2 | `react-native-gesture-handler` | [software-mansion/react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler) | MIT (O) | 3.4.0 (2026-10-16) | **~2.28.0** (Expo pin). 3.x is a new major; wait for an SDK upgrade | 12.7M | Native | Very active | Drag-to-world, peek long-press, swipe. Low risk on the pinned version |
| 3 | `expo-haptics` | [expo/expo](https://github.com/expo/expo/tree/main/packages/expo-haptics) | MIT (npm O) | 58.0.7 (2026-10-16) | **~15.0.8** (Expo pin; repo has ~15.0.7) | 7.0M | 96 KB unpacked | Expo-maintained | Already a dependency. APIs: `impactAsync`, `notificationAsync`, `selectionAsync`, `performAndroidHapticsAsync`. Does nothing in iOS Low Power Mode, with Taptic disabled, while the camera is active or during dictation; web uses the Vibration API (O, [docs](https://docs.expo.dev/versions/latest/sdk/haptics/)). Haptics must stay optional |
| 4 | `@shopify/react-native-skia` | [Shopify/react-native-skia](https://github.com/Shopify/react-native-skia) | MIT (LICENSE.md O) | 2.14.0 (2026-10-01), peer reanimated ≥4, worklets ≥0.7 | **2.2.12** (Expo pin; peer RN ≥0.78, reanimated ≥3.19.1) | 2.2M | About 10 MB unpacked, native binary (A: adds several MB to the app) | Very active (Shopify plus William Candillon) | Best fit for the app's Personal Model constellation and the "tide" curve: GPU canvas, shaders, Reanimated-driven. Risk: binary size. Test on a low-end Android device |
| 5 | `motion` (vanilla `animate`) | [motiondivision/motion](https://github.com/motiondivision/motion) | MIT (O) | 14.9.0 (2026-10-30) | 14.x; import from `motion/mini` for DOM-only use | 33.9M | Mini 3.2 kb, hybrid 22 kb (O, docs); full package 59 kB gz (bundlephobia O, tree-shaken in practice) | Very active | Web Universe UI chrome: panels, captions, focus rings, springs, without React. Low risk |
| 6 | `three-mesh-bvh` | [gkjohnson/three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) | MIT (O) | 0.9.17 (2026-10-28), peer three ≥0.159 | 0.9.17 | 6.6M | 28.6 kB gz (O) | Very active | Fast raycasting for picking stars and points in dense worlds. Pure vanilla. Only needed if raycasting shows up in profiling |
| 7 | `camera-controls` | [yomotsu/camera-controls](https://github.com/yomotsu/camera-controls) | MIT (O) | 3.1.2 (2025-11-17), peer three ≥0.126.1 | 3.1.2 | 5.9M | 10.3 kB gz (O) | Stable; last release about 11 months ago | Smooth damped camera (`smoothTime`, fit-to-box) for world transitions. Vanilla via `CameraControls.install({ THREE })`, subset install possible (O, README). Turn off free rotation to follow the HIG "avoid rotating the world" rule |
| 8 | `postprocessing` (pmndrs) | [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) | **Zlib** (LICENSE.md O; permissive) | 6.39.5 (2026-09-09), **peer three `>=0.168 <0.187`** | **Blocked** until a release allows 0.187 | 1.6M | 112.6 kB gz (O) | Active, releases track three about 1 revision behind | Bloom and vignette for dawn light. **Currently incompatible with three 0.187.** Use three's built-in `EffectComposer` for now. Also heavy for the performance budget |
| 9 | `@pmndrs/detect-gpu` | [pmndrs/detect-gpu](https://github.com/pmndrs/detect-gpu) | MIT (LICENSE O) | 6.0.28 (2026-10-25). Old unscoped `detect-gpu` is 5.0.70 (2025-02-23) | 6.0.28 | 25K (scoped); unscoped 5.7M | 3.7 kB gz (O) | Active code. **Benchmark data frozen** (gfxbench stopped December 2025, O) | Picks tier 0–3 for quality settings and a static fallback at tier 0. **Privacy:** fetches benchmarks from unpkg by default. Self-host with `benchmarksURL` (O, [README](https://github.com/pmndrs/detect-gpu)). Combine with a live FPS governor, because new GPUs won't be in the data |
| 10 | `focus-trap` | [focus-trap/focus-trap](https://github.com/focus-trap/focus-trap) | MIT (O) | 8.2.4 (2026-10-26) | 8.2.4 | 9.8M | 6.6 kB gz (O) | Active | Keyboard focus containment for web dialogs and panels (`createFocusTrap`, `escapeDeactivates`) (O, README). Or use native `<dialog>` with `inert` and skip the dependency (A) |
| 11 | `math` (successor to `maath`, pmndrs) | [pmndrs/maath → npm `math`](https://github.com/pmndrs/maath) | MIT (LICENSE O; npm `math` MIT O) | `math` 0.1.0 (2026-09-11); `maath` 0.10.8 (2024-07-07) | Prefer a ~20-line in-house `damp()`; or `maath` 0.10.8 (stable, 10.4 kB gz) | `math` 10K; `maath` 6.4M | `maath` 10.4 kB gz (O) | `maath` dormant; `math` is new (0.1) | Frame-rate-independent damping and springs for vanilla three. **Risk:** package transition. Low value versus writing it in-house |
| 12 | `moti` | [nandorojo/moti](https://github.com/nandorojo/moti) | MIT (LICENSE O) | 0.30.0 (2025-01-29) | **Not recommended** | 394K | 5.6 kB gz (O) | **Stale.** No release in 21 months. Open React 19 issue #383 (S, [issue listing](https://issues.ecosyste.ms/hosts/GitHub/repositories/nandorojo%2Fmoti/issues)). Docs say it is built on Reanimated 3 (S) | Use Reanimated 4 directly. Dawnward already runs React 19 and Reanimated 4 would be required |

**Not recommended:**
- `gsap`: proprietary no-charge licence, not a "verified permissive licence" under this brief's rule. Usable, but not shortlisted.
- React Bits: Commons Clause.
- 21st.dev and getlayers.io components: licence unverified per item.

**Recommended minimal set:**
- Mobile: 1, 2, 3 and 4, pinned with `npx expo install`.
- Web Universe: 5, 7, 9 (self-hosted data) and 10.
- Hold: 8 until it supports three 0.187.
- Optional: 6 and 11.
- Before importing any code, record the repo URL, licence and commit SHA, as `CLAUDE.md` requires.

---

## Gaps and things not verified

- **Arc help-center pages** (resources.arc.net) returned 403. Arc features come from SlashGear (O), the Inverse interview (O) and secondary snippets (S).
- **Headspace:** no official design-system page found (`headspace.com/design` returned 404). Facts come from the talk recap (O) and the LottieFiles case study (O).
- **Duolingo:** hearts, XP, leagues and guilt notifications are marked A. The haptics-as-instrument claim is S (LinkedIn, not fetched).
- **getlayers.io:** blocked by the network allowlist, and the Tavily extract quota was exceeded. Licence unknown.
- **GitHub API** stars and last-commit data were unavailable (gh access not enabled for these repos). Maintenance signals come from npm release dates.
