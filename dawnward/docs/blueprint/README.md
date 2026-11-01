# Dawnward: immersive engine plan (answer to the ChatGPT blueprint)

**Status:** 2026-11-01. Plan only; nothing in it is built yet. Waiting for Bianno's approval, as the blueprint asks.

## A. What already exists (checked in the code, not assumed)
| Blueprint asks for | Dawnward today |
|---|---|
| Real-time 3D galaxy, five selectable worlds, camera focus | Yes: vanilla three.js r187 (`experience/src/home-scene.js`). Tap a planet and the camera flies to it |
| World selection opens a real route, with Back | Yes: `#/world/<w>/<tab>`, browser history works, tested |
| Interactive 3D worlds | Yes: 14 real-time worlds (`creative-scene.js`) |
| Portal and cinematic transitions | Yes: the Quantum Gateway passage and the Infinite Door |
| Soul → The Bridge → mission → reflection → saved → Journey | Mostly: each part works and is tested. The joins between them need the polish described in F |
| Lightweight fallback | Yes: a text view, words-only worlds when WebGL is missing, and reduced motion everywhere |
| WebXR | A prototype exists (`galaxy-xr.js`, the Memory Galaxy in a headset). Not tested on a real headset |
| Playwright testing | 11 browser suites plus server tests, all passing |
| Specialist skills | Already in `.claude/skills/`: `dawnward-3d-environments` (spatial engine), `dawnward-visual-qa`, `qa-release` (release gate), `design-reference` (21st.dev and GetLayers), `interaction-engineering`, `spatial-universe`, `impeccable` |
| Mobile app | Expo 54 / React Native 0.81 (`apps/mobile`), separate from the web experience |

## B. Reference research plan
- **Sources:** igloo.inc (a real three.js site, often cited for scroll-driven 3D), Awwwards, Codrops, the official three.js and WebXR examples.
- **For each reference, record:**
  - what happens on tap, drag, scroll, Back and keyboard, and with reduced motion;
  - whether it's CSS, video, WebGL or WebGPU;
  - its licence.
- **Never copy** code or assets.
- **Missing skill:** `dawnward-reference-intelligence` is the only skill from the blueprint that doesn't exist. Its job is partly covered by `design-reference`, `product-benchmark` and `github-reuse-audit`. I'd add it as the blueprint wrote it.

## C. Technology stack: a recommendation
- **Keep vanilla three.js for the web.** React Three Fiber needs React. The web app isn't a React app, so switching would rewrite a working engine for no gain to the user.
- **R3F fits the Expo app later,** if the galaxy moves into the native app.
- **21st.dev components are React and Tailwind,** so they'd be used as design references here, not dropped in.

## D. What to reuse
| Area | Reuse |
|---|---|
| Galaxy and camera | `home-scene.js` (its `focusWorld` and `onSettle`) |
| World engine | `creative-scene.js` (`buildWorld`, the builders, the fixed camera) |
| Passage | The Gateway passage |
| Bottom sheet | `sheetdlg` |
| Expeditions | The player in `explore.js` |
| Progress | Discoveries (stars and moons) |
| Tests | The existing Playwright suites |

## E. Three visual directions
1. **Lightweight cinematic 2D:** art layers, parallax, CSS transitions. The fastest, and runs on any phone.
2. **Hybrid (recommended):** real 3D for the galaxy, the worlds and portals; HTML for reading, writing and choices. This is what Dawnward already is, so it means refining it, not starting over.
3. **Full 3D/XR:** everything inside one 3D scene. The most immersive, but the hardest to make readable and accessible on a phone.

## F. One vertical slice: Universe → Soul → The Bridge → Journey, made seamless
1. **Universe:** tap Soul, and the camera glides to the planet, which shows its name.
2. **Soul:** the world opens with The Bridge as its one primary action.
3. **The Bridge:** one decision at a time (the redesign's next phase).
4. **Reflect at the end:** the new compact editor.
5. **Save:** the chapter becomes a moon around Soul.
6. **Return:** the galaxy shows the new moon lit, so the change is visible in the universe itself.
7. **Journey:** shows it at the top.
8. **Throughout:** every Back step is predictable, and every step is tested.

## G. Risks
- **Unknown phone speed:** nothing has been measured on a real phone yet. The 3D scenes may need a lighter mode.
- **VR untested:** there's no real headset to test on, so nothing about VR can be promised.
- **Third-party plugins:** installing them (21st.dev) adds outside code, so it needs approval.
- **Scope:** "Make everything impressive" is the trap the blueprint warns about. One slice first.

## H. Acceptance criteria for the slice
- **Navigation:** every tap leads somewhere real; Back always goes to the previous step; no dead buttons.
- **Persistence:** what's saved survives a reload, and appears in Journey and as a lit moon.
- **Readability:** no sideways scroll at 320 to 430 px, the main action visible without scrolling, axe clean.
- **Motion:** reduced motion gives cuts instead of flights.
- **Speed:** frame time measured, and reported as measured.

## I. Order of work, once approved
1. Add the `dawnward-reference-intelligence` skill and study igloo.inc and the three.js examples.
2. Build the slice in F, one step at a time, with tests.
3. Apply the redesign system to Universe, Learn, Expeditions and Journey along that path.
4. Ask Bianno to try it on a phone; measure speed.
5. Only then: a VR test on a real headset.
