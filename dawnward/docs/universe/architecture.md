# Dawnward: bringing the universe to life

**Status:** web preview, 2026-10-31. Nothing deployed.

This answers the "Bring the universe to life" directive's first delivery:
- audit;
- design system extraction;
- architecture;
- route map;
- component plan;
- world registry;
- asset manifest;
- acceptance criteria.

It also covers what this pass built toward the three milestones.

**Reference:** `design/references/dawnward-universe-reference.png`, the 16-screen board. The earlier home mock is `design/references/dawnward-home-concept-early.png`.

## 1. Audit: what exists, what was reused, what's missing

| Area | Finding |
|---|---|
| Stack | Vanilla three.js r187 with esbuild (`experience/`), Fastify, Postgres and zod (`server/`), shared rules in `packages/core`, an Expo app in `apps/mobile`. React Three Fiber isn't used: the 3D layer is already vanilla three.js with tests, and moving would be a rewrite with no user benefit. Revisit only if this experience moves into the React Native app as React. |
| State | `state` in `src/home.js` (place, world, tabs, view). Reflections on the device (`dw-local-v1`) or through the API. Expedition progress in `dw-expeditions-v1` or in `mission_attempts`, `progress_events`, `discoveries`, `enrollments`. |
| Auth | Device token in the URL fragment, used only for its own origin (tested). |
| AI | Spec in `docs/hybrid/ai-orchestration-spec.md`. Missions are hand-written; a live model isn't connected. |
| Tests | Six browser suites with real pages and screenshots, plus server unit and integration tests (section 8). |
| Mobile defect | Fixed: the Atlas measures its own container, with a portrait composition. See `docs/universe/README.md`. |

**Reused rather than replaced:**
- the expedition engine;
- the Atlas;
- the 3D Personal Growth galaxy;
- the quest player;
- the Compass;
- Journey.

**Missing before this pass, now built:**
- addresses and Back navigation;
- a world registry;
- the world screen's four sections;
- solar systems drawn from saved progress;
- previews for unopened galaxies;
- "Your evolution" counts.

## 2. Design system, extracted from the board

| Board screen | Composition and camera | Controls | What the product does now |
|---|---|---|---|
| 01 The Universe | Figure before a galaxy, low camera, gold title | One "Begin" | The arrival film (first visit only, skippable). After that, people open on Home, where their current expedition is waiting. |
| 02 Galaxy selection | A vertical list of galaxies with depth | Tap a galaxy | The Atlas map, with a List view for every destination. Unopened galaxies are previews, labelled as such. |
| 03 Personal Growth | Spiral core, worlds in orbit | Enter | The 3D galaxy: five worlds, readable names, the planet is the button |
| 04 Solar system | One planet up close, systems as planets in a list | Choose a system | Each world's Expeditions section: the system as a sun, chapters as moons. Completed ones lit from saved data, the next one ringed, planned ones dim. |
| 05 Planet world | Painted environment, tabs over it, a primary action, a progress bar | Overview, Missions, Insights, Tools | Overview, Expeditions, Library and Progress over the world's painting. "Begin reflection" plus "Next in Mind". |
| 06 Interactive mission | A scene, a dilemma, four choices | Choose and see what happens | The quest player: choice (what tends to happen and why), lens, sort, pause, the Decision Lab |
| 07 Quantum Jump | Figure of light, a gateway | Begin | A preview in the Atlas only. Next slice (section 9). |
| 08 Return to Earth | A city at dusk, five "integrate and act" rows | Today, Journal, Habits, People, Projects | Home: the Compass, the five worlds, next steps, a moment to reflect, real actions |
| A Universe map | Zoom levels listed | Universe, Galaxies, Systems, Worlds, Earth | The breadcrumb and the route map (section 4) |
| B–E Other galaxies | Each with its own list of realms | n/a | Previews with each galaxy's own purpose, from Bianno's table. None presented as working. |
| F Daily Compass | Earth at the centre, worlds around it | n/a | The Compass card (rules in `docs/universe/README.md` §3) |
| G Progress universe | Counts and a graph over time | n/a | Journey › Milestones: "Your evolution" counts, all from saved data. No graph yet: there's not enough real history to draw one honestly. |
| H Immersive mode | Full-bleed scene, a play button | n/a | The 3D galaxy and world paintings are the immersive layer. A separate mode isn't built, by design: it would duplicate features. |

**Tokens kept:**
- **Colour:** dark space (`--void`), gold accent (`--gold`, `--gold-ink`), and one colour per world (`--mind`, `--body`, `--soul`, `--spirit`, `--future`).
- **Type:** Cormorant for display, Inter for text, IBM Plex Mono for small meta.
- **Spacing:** a 4 px grid.
- **Touch:** targets of at least 44 px.

Functional text is never painted into images or 3D textures.

## 3. Architecture

```
            ┌──────────────────────── packages/core (shared, pure) ────────────────────────┐
            │ catalog: worlds' systems, missions (steps: intro lesson pause choice lens    │
            │          sort lab rehearse reflect plan close), worksheets, planned chapters │
            │ engine:  begin, validate, answer, complete, discoveries (deterministic)      │
            └───────────────▲───────────────────────────────────────────▲──────────────────┘
                            │                                           │
  experience/ (web)         │                                           │   server/ (API)
  ┌─────────────────────────┴──────────────┐            ┌───────────────┴──────────────────────┐
  │ registry.js   worlds and galaxies (data)│            │ /expeditions  /attempts/*  /enrollments │
  │ home.js       places, routes, Compass,  │  remote    │ /experiments  /export  /debrief         │
  │               world sections, Journey   │◀──store───▶│ safety triage before anything is kept   │
  │ explore.js    Learn, quest player,      │  or local  │ Postgres: mission_attempts, records,    │
  │               worksheets, following     │  store     │ progress_events, discoveries, enrollments│
  │ home-scene.js the 3D galaxy (three.js)  │            └──────────────────────────────────────────┘
  └─────────────────────────────────────────┘
```

**Layers:**
- **Cinematic:** `home-scene.js` draws the galaxy, planets, discovery stars and the camera.
- **World environments:** the approved paintings, as close-ups.
- **Application:** accessible HTML on top.
- **Intelligence:** proposed only (`docs/hybrid/ai-orchestration-spec.md`).

Each layer works without the one above it: the text view works with no 3D, and every place has a list version.

## 4. Route map

| Address | Place | Back goes to |
|---|---|---|
| `#/home` | Home: the Daily Compass (Earth) | out of the app |
| `#/universe` | The Universe Atlas | the previous place |
| `#/universe/growth` | Personal Growth: the five worlds | the previous place |
| `#/world/<mind\|body\|soul\|spirit\|future>[/overview\|expeditions\|library\|progress]` | A world, on a section | the previous place (changing section doesn't add a step) |
| `#/learn` | Learn: expeditions, the quest player | the previous place |
| `#/journey`, `#/journey/milestones` | Journey: memories, or milestones and evolution | the previous place |
| `#/you` | You: data, privacy, display | the previous place |

- **Unknown addresses** open Home.
- **A link with an address** skips the arrival film.
- **Every place keeps its in-app way back too:** the back button, breadcrumbs, Escape and the tabs. Nobody depends on the browser's Back.

Tested in `e2e-world.cjs`.

## 5. Component plan: the directive's names, and where each one lives

| Component | Lives in | State |
|---|---|---|
| UniverseAtlas | `home.js` `openAtlas`, `selectGalaxy`; `#atlas` | Built |
| GalaxyScene, GalaxySelector | Atlas map and list; the 3D galaxy in `home-scene.js` | Built |
| SolarSystemScene | `home.js` `solarSystem(sys)` (SVG, labelled in words) | Built this pass |
| PlanetScene, WorldSanctuary | `home.js` `goWorld`, `worldIntro` (four sections) | Built this pass |
| MissionPlayer | `explore.js` `play`, `show` | Built |
| EarthDashboard, DailyCompass | `home.js` `openEarth`, `compassPick`, `compassCard` | Built |
| ProgressConstellation | Discovery stars in the 3D galaxy, lit moons in solar systems, Journey's Milestones and evolution | Built |
| QuantumGateway, FutureSelfObservatory | Atlas preview only | Next slice |
| Camera transition controller | `home-scene.js` `go`, `stepCamera`, `focusWorld` (real-time, interruptible). Arrival is guaranteed by a snap-completes rule plus a 1.6 s safeguard. | Built |

## 6. World registry (`experience/src/registry.js`)

**Each world defines:**
- id and name;
- description (and its question, line and starting prompt);
- visual assets (planet, close-up, and whether the art is a placeholder);
- theme token;
- route;
- experiences: reflection, its systems from the catalog, its mechanic, and planned systems;
- progression: discoveries from saved data only;
- accessibility fallback: the text view.

**Each galaxy defines:**
- id and name;
- its purpose;
- open or preview;
- what's planned;
- map position, for both landscape and portrait.

Adding a world starts here. After that, it needs only reviewed content in `packages/core` and approved art.

## 7. Asset manifest

| Asset | File | Status |
|---|---|---|
| Mind, Body, Soul, Future planets | `assets/img/worlds/planet-*-640.webp` | Bianno's art |
| Spirit planet and close-up | `planet-spirit-640.webp`, `closeup-spirit.webp` | **Placeholder**, made from the crystal image |
| World close-ups | `closeup-*.webp` | Bianno's art |
| Galaxy core | `galaxy-core(-1024).webp` | Bianno's art |
| Unopened galaxies | the galaxy core, hue-shifted | **Placeholder** |
| Earth (Atlas) | CSS sphere | **Placeholder** |
| Quantum Gateway (Atlas) | CSS ring | **Placeholder** |
| Skies, moons, crystal | `sky-*`, `moon-1..4`, `crystal` | Bianno's art |

Sources and licences: `experience/assets/img/worlds/SOURCE.md`.

## 8. Acceptance criteria and evidence

| Milestone | Criterion | Evidence |
|---|---|---|
| 1. A working Universe Atlas | Fills the phone; 0 overlaps and nothing off screen from 320 × 568 to 1440 × 900 | `e2e-universe.cjs`: six viewports |
| 1 | Explore, select, enter, without losing orientation: breadcrumbs, an address for each step, Back | `e2e-universe.cjs`, `e2e-world.cjs` |
| 1 | Previews are never presented as working | `e2e-world.cjs`: "AI Creation is labelled a preview" |
| 2. A complete Mind expedition | Enter Mind, complete a chapter, save a reflection, open its worksheet, return to Earth | `e2e-chapters.cjs` (110 checks) |
| 2 | Progress persists: reload, the account API, export | `e2e-universe.cjs` reload; integration tests |
| 2 | Content is real and reviewed | **Not met yet:** chapters 1–4 are drafts awaiting Bianno and a qualified reviewer. They say "Draft" in the app. |
| 3. The living response | Completing a chapter lights its moon and orbit and rings the next. Nothing lights without saved progress. | `e2e-world.cjs`: before and after Chapter 1 |
| 3 | The Compass suggests the next activity and says why | `e2e-chapters.cjs` |
| All | axe (WCAG 2.2 AA rules) clean on every new screen; reduced motion; keyboard | All suites |

**Discoveries:** awarded only after completion is saved. There's no XP, by Bianno's decision.

## 9. Performance

Measured on a software GPU (SwiftShader), not a phone:

| Address | Requests | Page weight (decoded) | First paint | Ready |
|---|---|---|---|---|
| `#/home` | 22 | 1,775 KB | 368 ms | 790 ms |
| `#/universe` | 17 | 1,504 KB | 76 ms | 472 ms |
| `#/universe/growth` | 17 | 1,504 KB | 60 ms | 406 ms |
| `#/world/mind/expeditions` | 19 | 1,679 KB | 64 ms | 421 ms |

**Script:** `home.js` is 693 KB minified (184 KB gzipped). Most of it is three.js and its glow effects.

**Next performance step:** load the 3D scene only when Personal Growth first opens. Home, Learn and Journey don't need it, so most visits would load far less.

**Built this pass:** the 3D galaxy stops redrawing while Home, Learn, Journey or You cover it.

**Already present:**
- an adaptive governor: if frames are slow, it drops glow, pixel ratio and half the dust;
- the text view as a fallback with no 3D at all.

## 10. Next slices, in order

1. Bianno's review of chapters 1–4. Then Chapters 5–7.
2. Load the 3D scene on demand (section 9).
3. Quantum Gateway → Future Self Observatory (Mirror, Crossroads, First Step), using the existing `future_selves` data. A metaphor, never a prediction.
4. Emotional Awareness: the next Mind system, written and reviewed.
5. A bounded AI guide for practice, once reviewed content exists for it to adapt.
6. Real-device checks: frame times, VoiceOver and TalkBack.
