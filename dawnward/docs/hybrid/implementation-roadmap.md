# Implementation roadmap

## Owner's build order (2026-10-31), which this roadmap now follows

1. Universe Atlas: clickable galaxies, routes, responsive navigation, camera.
2. Personal Growth (Inner) Galaxy: five worlds with real content and entry and exit. **Done:** five worlds, Spirit with placeholder art.
3. One playable activity: mission state, choices, feedback, reflection, saving and progress. **Done:** Soul · Communication, three missions. Progress shows as discoveries (owner decision), not XP.
4. Quantum Gateway into a working Future Self Observatory.
5. Earth Realm: daily actions, progress, reflections, completed journeys.
6. Other galaxies (AI, Knowledge, Spiritual Exploration, Creative). The scope notes in `infinite-self-addendum.md` still apply.
7. Polish and validate: mobile, sound, accessibility, consistency, real devices.

**Next:** step 1, the Universe Atlas.

Effort is given in focused build sessions, not weeks. Every phase ends at a gate: tests pass and Bianno approves. Nothing is deployed without approval.

| Phase | What | Exit gate | Needs from Bianno |
|---|---|---|---|
| **0. Decide** (now) | Read these documents | D-H1 (XP), D-H2 (Spirit), D-H3 (web first or app first) and D-H4 (go) answered | The decisions |
| **1. Engine and content** | Migration 0009, the zod schemas, the catalog (three Bridge missions written in full), the engine, routes, unit and integration tests | Server tests green; idempotency, auth isolation, export, delete, crisis and pause all tested | A review of the three missions' wording |
| **2. First playable (web)** | Explore tab, quest player, discoveries in the galaxy, journey log, text view, the slice's end-to-end test | Slice end to end on phone and desktop sizes; axe 0; nothing overlaps; save before advance | A play-through |
| **3. The universe** | Universe view, Expedition Galaxy, the descent entrance, transitions, rendering levels | Navigation timings measured; every place in text view | New art (5 images) |
| **4. Experiments and the future self** | Check-ins, outcomes, landmarks, the future-self step using `future_selves` | Journey C tested end to end | |
| **5. AI navigator** | `understandGoal`, `recommendMissions`, `adaptScenario`, fallbacks, live-model checks | Schema validity, zero invented ids, citations, injection tests | Approval for live-model test spend |
| **6. Into the app** | Bring Home, Explore and the quest player into Expo (web view or native) | Device tests (D6), VoiceOver and TalkBack | Device access |
| **7. Other worlds** | Mind (Lenses), Body (Experiments), Future (Crossroads): one system each | Each with three missions, tested | Wording reviews |
| **8. Beta** | The validation study (`beta-validation-plan.md`) | The study's go or no-go criteria | Participants, consent text |

**Rollback:** every phase is additive. Turning off "Show the game layer", or not shipping the Explore tab, returns the app to today's behaviour with no data loss.
