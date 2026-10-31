# Universe implementation audit

**Date:** 2026-10-31, before the Infinite Universe vertical slice. Updates the audit in `docs/hybrid/hybrid-product-architecture.md` §2.

**Status words:**
- **WORKING:** built and tested.
- **PARTIAL:** some of it exists.
- **MISSING:** nothing exists.
- **BROKEN:** exists but fails.
- **UNVERIFIED:** built, but never run where it matters.

## Stack and entry points

| Item | Finding |
|---|---|
| Native app | Expo 54 and React Native 0.81, expo-router (`apps/mobile/app`): tabs Today, Debrief, Universe and You, plus a world screen, Evenings, Settings, Onboarding and Campaign |
| Web universe | Vanilla three.js r187 with esbuild (`experience/`). Entry `home.html` and `src/home.js`, scene in `src/home-scene.js`, Explore in `src/explore.js`. One self-contained build: `dist/dawnward-home.html`. |
| Server | Fastify 5, Postgres 16 and zod (`server/`). Auth by device token. Consent gate, in-memory rate limits. |
| Shared rules | `packages/core`: taxonomy, types, and the expedition catalog and engine (pure, used by both server and web) |
| UI library | None. Hand-built components with design tokens (4 px grid, Cormorant, Inter and IBM Plex Mono). |
| Animation | three.js camera arcs (interruptible, real-time), CSS transitions. No animation library. |
| React Three Fiber | **Not used, and not proposed.** The universe already runs on vanilla three.js with tests. Moving to R3F would add dependencies and a rewrite with no user benefit now. Revisit only if the web universe moves into the React Native app as React. |

## Features

| Feature | Status | Evidence |
|---|---|---|
| Reflection capture (web: on device, verified write; server: `/debrief`, retry-safe, safety first) | WORKING | `e2e-home.cjs` 97/97; integration 60/60 |
| Memories: galaxy of star buttons, filter, search, list, detail, delete | WORKING | e2e |
| Patterns with evidence; correct or set aside | WORKING | e2e plus integration |
| Five worlds (Mind, Body, Soul, Spirit and Future) on the 3D home; shared world template | WORKING (Spirit art is a placeholder) | e2e, screenshots |
| Personal Growth Galaxy (the 3D home) | WORKING | |
| Universe Atlas (several galaxies, select, zoom, overview, enter, back) | WORKING (web) | `e2e-universe.cjs`, six viewports |
| Breadcrumb or spatial back path | WORKING | `e2e-universe.cjs` |
| Solar systems inside worlds | PARTIAL: Soul · Communication in Explore only, not shown in worlds | Built in this slice |
| A Mind mission | WORKING: The Thought Labyrinth | `e2e-universe.cjs` |
| Mission engine: state, choices, rehearse, plan, reflect, completion, discoveries | WORKING | 38 unit, 11 integration, `e2e-expedition.cjs` 48/48 |
| Progression | WORKING as discoveries (owner decision: no XP or levels) | |
| Earth Realm dashboard | WORKING as Home, the Daily Compass | `docs/universe/README.md` |
| AI Discovery, Knowledge, Spiritual and Creative galaxies | MISSING. Shown in the Atlas as "not open yet"; not built in this slice. | |
| Quantum Gateway and Future Self Observatory | MISSING. Data exists (`future_selves`). Next slice. | |
| AI orchestration for missions | MISSING. Spec in `docs/hybrid/ai-orchestration-spec.md`. Missions are hand-written. | |
| Live model | UNVERIFIED. Tests use the deterministic stand-in. | |
| Real devices, VoiceOver and TalkBack | UNVERIFIED | |
| Speech in the preview window | BROKEN by the host: the preview grants no microphone. The page says so plainly. | |

## Compatibility and migration risks for this slice

- **Database:** no changes. The Mind mission is catalog content, and a new step type (`lens`) is validated in the shared engine. The server's answer schema gains one shape.
- **Existing data:** web data stays in its existing on-device keys (`dw-local-v1`, `dw-expeditions-v1`). Progress already recorded keeps working; discoveries are recalculated from the same events.
- **Navigation:**
  - **First visit:** the entrance opens onto the Atlas.
  - **Returning visitors:** they land in the Personal Growth Galaxy as today, so reflecting stays two taps away. The Atlas is one tap away from everywhere.

## Update, later the same day

The slice is built and tested, and Home and Universe are now separate. See `docs/universe/README.md` for the mobile root cause, before and after screenshots, and test results; see `docs/universe/academy-plan.md` for the learning plan.
