# Architecture proposal: Dawnward spatial interface

Status: proposal for approval. Nothing here is installed or merged into production code. Evidence: `technology-inventory.md`, `futuristic-repository-research.md`, `performance-benchmarks.md`, lab prototypes in `experience/lab/`.

## Principle
Keep the renderer the experience already has (three.js 0.187, vanilla, esbuild) and grow it through small, measured modules. The engine is deterministic (the same function renders the site and the film), accessible (0 axe violations across six states) and light (155 KB gzip). A React rewrite to use the pmndrs React ecosystem would cost the determinism work, roughly 1,000 lines of camera and story code and a new bundle budget, for effects the lab shows can be built directly in three.js at 4 to 6 KB gzip each.

Interface text that people read, write or decide on stays in accessible HTML (glass panels, dialogs, lists). In-world surfaces (Prototype A) are for orientation and delight, always mirrored by real controls.

## Proposed modules (only those with clear reuse)

| Component | Responsibility | Exists today as | Reuse |
|---|---|---|---|
| `MotionPreferences` | One source for reduced motion, quality tier and motion tokens; subscribers re-render on change | `REDUCED`, `quality` and `motion.tokens` spread across `main.js`, `tokens.js` | site, lab, films |
| `AdaptiveEffects` | Tier ladder (high, standard, low): pixel ratio, star counts, shader taps, blur, fog density; steps down from 60-frame medians, never up mid-session | `quality`/`applyTier` in `main.js`, `createRenderer` in `lab/src/common.js` | every scene |
| `WorldBillboard` | A planet from the app's art with the silhouette atmosphere shader and per-world look | `planetShader` in `main.js`, `planet()` in lab | hub, world transition, films' engine shots |
| `CinematicCamera` | Spring-driven progress along authored paths (story path, per-world approaches, spline transitions), interruptible from any state; pure function of (progress, time) so films stay deterministic | `cameraFor`, `focusPose`, travel blend; Prototype B's spline spring | hub, worlds, film |
| `WorldTransition` | Hub-to-world sequence: camera path + atmosphere tone + title timing + back/escape + reduced-motion cross-fade | Prototype B | four worlds |
| `SpatialPanel` | Accessible HTML glass panel (dialog semantics, focus in and back, inert when hidden) | world panel, moments dialog | worlds, constellation, settings |
| `HolographicCard` | In-world translucent card with crisp canvas typography, edge light, pointer sheen; always paired with an HTML control | Prototype A | Today steps preview, onboarding, film |
| `MemoryConstellation` | Stars by date and world from the `/constellation` contract; links only from explainable shared content; reject, remove with undo, switch off; list view | SVG prototype `src/constellation.js`, WebGL Prototype C | app web view, film |
| `AtmosphericBackdrop` | Nebula, star layers, fog tone per context | inline in `main.js` | every scene |

Not proposed: `OrbitalNavigator` as a separate component. Orbit is one behaviour of `CinematicCamera` (hub yaw on drag); splitting it adds an abstraction with one caller.

## Data and privacy boundary
- The constellation reads only the `/constellation` contract (id, date, domain, weight). Showing reflection text, links between moments, rejecting a link, removing one moment and a personalisation switch need new server routes and consent; until then, every surface that shows them says "Prototype · sample moments".
- Links must be derived from content the person wrote and must name it (Prototype C: "Shares your words: “water”"). No inferred psychological labels on links.

## Rendering budget (per frame, phone class device, to be confirmed on hardware)
| Item | Budget |
|---|---|
| Draw calls | under 40 (today about 20) |
| Full-screen transparent layers at once | 3 |
| Shader taps per pixel on large surfaces | 16 (atmosphere today) |
| Post-processing passes | 0 on low and standard; at most 1 selective glow on high, only if measured cheaper than shader glow |
| New JS per module | under 8 KB gzip |

## Rollout
1. Extract `MotionPreferences`, `AdaptiveEffects`, `WorldBillboard` from `main.js` with no behaviour change (QA must stay identical, film frames identical).
2. Promote Prototype B as `WorldTransition` for all four worlds, each with its own path (arc, low, drift, long lens).
3. Promote Prototype C as `MemoryConstellation` (WebGL) behind the prototype label, keeping the SVG/list path as the accessible and low-tier fallback.
4. Prototype A stays a lab piece until a real use is agreed (it is a delight layer, not a reading surface).
