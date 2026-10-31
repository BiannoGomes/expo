# Futuristic repository research

Researched 2026-10-31 for the Dawnward Living Universe. No code was changed and nothing was installed.

**Stack it is judged against.** Vanilla three.js **0.187.0** (WebGLRenderer, WebGL 2), esbuild 0.25, no React; `dist/app.js` 597 KB minified / 155 KB gzip. Four custom `ShaderMaterial`s (light, star `Points`, phone screen with portal sample, planet atmosphere), a HalfFloat portal render target, a hand-written camera rig with a critically damped scroll spring, CSS/DOM overlays and an SVG constellation. **No post-processing pass.** The app is Expo 54 / RN 0.81 with no GL. The films use Remotion 4.0.533 with React **18.3.1**. Priorities: correctness > privacy > accessibility > responsiveness > spectacle. Mobile web performance matters most. The measured bottleneck is fill rate at close range: 117/217 ms median/p90 for the phone close-up in software GL (from `docs/technology-inventory.md`).

**Method and limits.** Versions, licenses, peers, dependencies, sizes and publish dates come from the npm registry (commands listed under Sources). Stars, open issues and license files come from the GitHub pages. Commit dates come from GitHub `/commits` pages where I opened them. GitHub release pages show dates without a year, so I took dated releases from npm `time[version]` (UTC). The `gh` API and plain `curl` to github.com were blocked in this session (HTTP 403), so some last-commit dates are listed as "not checked". Nothing here is guessed. Fields I could not verify say so.

**Recommendation key.** ADOPT: add now, within budget. PROTOTYPE: time-boxed spike behind a quality tier, then measure. MONITOR: re-check later. REJECT: wrong fit for this stack.

---

## Summary table

| # | Package (repo) | Latest (npm, date) | License | Needs React? | three peer | Verdict |
|---|---|---|---|---|---|---|
| 1 | `@react-three/uikit` / `@pmndrs/uikit` (pmndrs/uikit) | 1.0.78, 2026-10-27 | MIT (LICENSE file) | No (vanilla `@pmndrs/uikit`) | >=0.162 | MONITOR |
| 2 | `@react-three/fiber` (pmndrs/react-three-fiber) | 9.8.2, 2026-10-14 | MIT | Yes, React >=19 <19.4 | >=0.156 | REJECT |
| 3 | `@react-three/drei` (pmndrs/drei) | 10.7.9, 2026-09-25 | MIT | Yes, React ^19 + R3F ^9 | >=0.159 | REJECT |
| 4 | `@react-three/xr` / `@pmndrs/xr` (pmndrs/xr) | 6.6.32, 2026-10-13 | MIT (LICENSE file) | No (vanilla `@pmndrs/xr`) | * | REJECT |
| 5 | `@pmndrs/klipp` (pmndrs/klipp) | 0.16.0, 2026-10-23 | MIT | No (React optional) | >=0.156 (optional) | MONITOR |
| 6 | `@theatre/core`, `@theatre/studio` (theatre-js/theatre) | 0.7.2, 2024-05-19 | Apache-2.0 / AGPL-3.0-only | No | none declared | REJECT |
| 7 | `maath` (pmndrs/maath, now shows pmndrs/math) | 0.10.8, 2024-07-07 | MIT | No | >=0.134 | REJECT (`math`: MONITOR) |
| 8 | `@basementstudio/shader-lab` (basementstudio/shader-lab) | 3.1.0, 2026-10-13 | Apache-2.0 (GitHub); no npm license field | Yes, React ^19 | ^0.185.0 | REJECT |
| 9 | `postprocessing` (pmndrs/postprocessing) | 6.39.5, 2026-09-09 | Zlib | No | **>=0.168 <0.187** | MONITOR |
| 10 | `@react-three/postprocessing` (pmndrs/react-postprocessing) | 3.2.2, 2026-10-21 | MIT | Yes, React ^19 + R3F >=9.7 | >=0.156 | REJECT |
| 11 | `three-custom-shader-material` (FarazzShaikh/THREE-CustomShaderMaterial) | 6.4.0, 2025-10-12 | MIT | No (`/vanilla` entry) | >=0.159 | PROTOTYPE |
| 12 | `gltfjsx` (pmndrs/gltfjsx) | 6.5.3, 2024-11-04 | MIT | Output is R3F JSX | bundles three 0.159.0 | REJECT |
| 13 | `@react-three/rapier` (pmndrs/react-three-rapier) | 2.2.0, 2025-11-03 | MIT (GitHub); no npm license field | Yes, React ^19 + R3F ^9.0.4 | >=0.159 | REJECT |
| 14 | `meshline` (pmndrs/meshline) | 3.3.1, 2024-06-03 | MIT | No | >=0.137 | REJECT |
| 15 | `react-ogl` (pmndrs/react-ogl) | 0.15.1, 2025-07-11 | MIT | Yes, React ^19 | n/a (ogl >=1) | REJECT |
| 16 | `ogl` (oframe/ogl) | 1.0.11, 2025-01-27 | Unlicense | No | n/a (separate engine) | REJECT |
| A1 | three.js `WebGPURenderer` + TSL (in `three` 0.187.0) | 0.187.0, 2026-10-30 | MIT | No | n/a | MONITOR |
| A2 | three.js bundled addons: `EffectComposer`, `OutputPass`, `UnrealBloomPass`, `SMAAPass`, `Line2` (in `three` 0.187.0) | 0.187.0, 2026-10-30 | MIT | No | version-locked | PROTOTYPE |
| A3 | `detect-gpu` (pmndrs/detect-gpu) | 5.0.70, 2025-02-23 | MIT | No | none | ADOPT (self-hosted data only) |
| A4 | `troika-three-text` (protectwise/troika) | 0.52.5, 2026-07-24 | MIT | No | >=0.125 | MONITOR |
| A5 | `camera-controls` (yomotsu/camera-controls) | 3.1.2, 2025-11-17 | MIT | No | >=0.126.1 | REJECT |

---

## Records

### 1. pmndrs/uikit (`@react-three/uikit`, vanilla `@pmndrs/uikit`)
1. **URL:** https://github.com/pmndrs/uikit · vanilla guide https://pmndrs.github.io/uikit/docs/getting-started/vanilla
2. **Version and maintenance:** `@react-three/uikit` and `@pmndrs/uikit` are both 1.0.78, published 2026-10-27. Latest commit 2026-10-27 (commits page). 3.3k stars, 37 open issues, 9 open PRs. Actively maintained.
3. **License:** npm says "SEE LICENSE IN LICENSE". The LICENSE file is MIT text (Copyright 2024 Bela Bohlender, 2023 Coconut Capital). Keep the copyright and permission notice in copies. The README says the default kit is "based on Shadcn" and the horizon kit "based on RLDS". I did not check those kits' licenses.
4. **React / three:** `@react-three/uikit` peers are react >=18 and @react-three/fiber >=8. **`@pmndrs/uikit` peers only three >=0.162 and works without React.** The vanilla guide shows a per-frame `root.update(delta)`, `renderer.localClippingEnabled = true` and a custom transparent sort. Interactivity needs `@pmndrs/pointer-events`.
5. **Dependencies (vanilla):** `yoga-layout` ^3.2.1, `@pmndrs/msdfonts` (7.5 MB unpacked), `@zappar/msdf-generator`, `zod` ^4, `@preact/signals-core`, `@pmndrs/uikit-pub-sub`. `@pmndrs/uikit-default` is 4.7 MB unpacked.
6. **Mobile risk:** A flexbox layout engine (yoga) plus MSDF font atlases on top of a 155 KB gzip bundle. More transparent layers in a scene whose bottleneck is already transparent fill rate. Clipping planes on every UI material.
7. **Visual benefit:** Panels that live in 3D space (depth, parallax, lighting) instead of flat overlays, such as a world card that sits beside a planet.
8. **Complexity:** Medium-high. New layout and event system, font pipeline, and rebuilding focus and keyboard handling.
9. **Duplication:** Duplicates the CSS/DOM overlays. That is a step backwards: text drawn into WebGL is not in the accessibility tree, and the vanilla guide has no accessibility guidance. Dawnward's axe-clean dialogs, focus return and live regions depend on the DOM.
10. **MONITOR.** The vanilla path is real and well maintained, but it trades DOM accessibility for spectacle, which inverts Dawnward's priorities.

### 2. pmndrs/react-three-fiber (`@react-three/fiber`)
1. **URL:** https://github.com/pmndrs/react-three-fiber · releases https://github.com/pmndrs/react-three-fiber/releases
2. **Version and maintenance:** 9.8.2 (latest), published 2026-10-14. 10.0.0-alpha.6 "Going WebGPU First" (GitHub pre-release dated 17 Oct). 33.4k stars, 14 open issues, 13 open PRs. Very active.
3. **License:** MIT. Keep the notice.
4. **React / three:** Peers are react >=19 <19.4 and react-dom >=19 <19.4, three >=0.156, plus expo/expo-gl/react-native >=0.78 for native. The README table maps 8.x to React 18 and 9.x to React 19. It cannot work without React: it *is* a React renderer. v10 alpha makes WebGPURenderer the default and moves TSL hooks to `@react-three/tsl`.
5. **Dependencies:** zustand, its-fine, scheduler, suspend-react, react-use-measure, use-sync-external-store, buffer, base64-js, @babel/runtime. 2.4 MB unpacked.
6. **Mobile risk:** Adds React and React DOM plus a reconciler to a page that has no React today. Re-render discipline becomes a new class of jank.
7. **Visual benefit:** None by itself. Its value is the ecosystem (drei, postprocessing bindings).
8. **Complexity:** Very high. It means rewriting `main.js` (1,010 lines) into components and re-validating the deterministic `frame(st)` film path.
9. **Duplication:** Replaces the whole engine architecture. Version friction: Remotion is on React 18.3.1, so R3F 9 could not share React with the films. The RN app has no GL.
10. **REJECT.** A full rewrite with no visual gain, and its React 19 peer conflicts with the React 18 film stack.

### 3. pmndrs/drei (`@react-three/drei`)
1. **URL:** https://github.com/pmndrs/drei
2. **Version and maintenance:** 10.7.9, published 2026-09-25. 10.1k stars, 88 open issues. Active.
3. **License:** MIT.
4. **React / three:** Peers are react ^19, react-dom ^19, @react-three/fiber ^9.0.0, three >=0.159. It does not work without R3F, and the README does not mention a vanilla build.
5. **Dependencies:** 21 runtime dependencies, including `three-stdlib`, `troika-three-text`, `camera-controls`, `three-mesh-bvh`, `meshline`, `maath`, `detect-gpu`, `hls.js`, `@mediapipe/tasks-vision`, `stats-gl`, `@use-gesture/react`, `@monogrid/gainmap-js`. 1.75 MB unpacked.
6. **Mobile risk:** Inherits R3F's cost. A large dependency surface, though it tree-shakes.
7. **Visual benefit:** Indirect. Its useful parts are mostly vanilla libraries it wraps (troika text, camera-controls, detect-gpu, meshline). Those are evaluated separately below.
8. **Complexity:** Requires R3F, so very high.
9. **Duplication:** Its camera, text, star and sparkle helpers overlap the existing rig and star shader.
10. **REJECT.** It is a React wrapper. Where a wrapped library helps, use the vanilla original (see `detect-gpu`).

### 4. pmndrs/xr (`@react-three/xr`, vanilla `@pmndrs/xr`)
1. **URL:** https://github.com/pmndrs/xr
2. **Version and maintenance:** 6.6.32, published 2026-10-13 for both `@react-three/xr` and `@pmndrs/xr`. 2.6k stars, 40 open issues, 20 open PRs. Active.
3. **License:** npm says "SEE LICENSE IN LICENSE". The LICENSE file is MIT text (Copyright 2024 Bela Bohlender, 2023 Coconut Capital).
4. **React / three:** `@react-three/xr` peers are react >=18 and R3F >=8. `@pmndrs/xr` peers only three `*`, so vanilla use is possible. The GitHub README documents only the React path.
5. **Dependencies (vanilla):** `iwer` (WebXR emulator), `@iwer/devui`, `@iwer/sem`, `zustand` ^4, `meshline`, `@pmndrs/pointer-events`.
6. **Mobile risk:** Immersive sessions are not a phone-browser target for this story, and the emulator dependencies add weight.
7. **Visual benefit:** None for the current product: no headset use case exists.
8. **Complexity:** High. Stereo rendering would double the already-limiting fill cost, and the scroll-driven rig would need rework.
9. **Duplication:** Its pointer events would compete with the existing DOM input model.
10. **REJECT.** Dawnward has no XR use case, and stereo rendering would make the fill-rate bottleneck worse.

### 5. pmndrs/klipp (`@pmndrs/klipp`). Verified: it exists.
1. **URL:** https://github.com/pmndrs/klipp · README https://github.com/pmndrs/klipp/blob/main/README.md
2. **Version and maintenance:** 0.16.0, published 2026-10-23 (registry modified 2026-10-29). 69 stars, 1 open issue. The README says "Early-stage, experimental - the API may change." GitHub showed no release entries, and I did not check the last commit.
3. **License:** MIT.
4. **React / three:** All peers are **optional**: react >=19.2.0, @react-three/fiber ^9.7.0, three >=0.156.0, camera-controls ^3.1.2. Entry points are `.` (core, renderer-agnostic), `./three` (classes ending in `Three`), `./react`, `./dom` (debug overlays) and `./three/camera-controls`. It works without React.
5. **Dependencies:** One runtime dependency, `math` pinned to a **canary pre-release** (`0.0.0-canary-20261019-82387b5d`). That package is pmndrs/math, whose stable 0.1.0 was published 2026-09-11. 484 KB unpacked.
6. **Mobile risk:** Low CPU cost by nature (camera math). The risk is API churn and a pinned canary dependency.
7. **Visual benefit:** Cinemachine-style virtual cameras with priority blending, follow/aim bodies, a group-framing extension, and noise/impulse shake. This could make world-to-world travel and framing more authored.
8. **Complexity:** Medium. `cameraFor(s, t)` is a pure function of story time that drives both the site and the deterministic film. Klipp's blending and damping state would need to stay deterministic under `window.SEEK`. The README does not mention reduced-motion support.
9. **Duplication:** Yes. It duplicates the hand-written rig (piecewise path, `focusPose`, interruptible travel, critically damped spring), which already works and is film-deterministic.
10. **MONITOR.** It is the most relevant new camera library, but it is experimental and depends on a canary build. Re-check at a stable 1.0. Do not replace a correct, deterministic rig for it.

### 6. theatre-js/theatre (`@theatre/core`, `@theatre/studio`)
1. **URL:** https://github.com/theatre-js/theatre · commits https://github.com/theatre-js/theatre/commits/main
2. **Version and maintenance:** 0.7.2, published 2024-05-19 for core, studio and r3f. **Last public commit 2024-04-11** ("Add the 1.0 notice"). The README says 1.0 development moved to a private repo. 12.8k stars, 119 issues, 22 PRs. The public repo has been dormant for over two years.
3. **License:** `@theatre/core` is Apache-2.0: keep the license and NOTICE, and state changes. **`@theatre/studio` is AGPL-3.0-only.** The README says studio is used only at design time and is not shipped. Shipping it by accident would bring AGPL obligations.
4. **React / three:** Core has no peers and works without React. `@theatre/r3f` 0.7.2 peers on R3F ^8.13.6.
5. **Dependencies:** `@theatre/dataverse` 0.7.2. Core is 903 KB unpacked, studio 22.3 MB.
6. **Mobile risk:** Core is moderate in size. The bigger risk is maintenance.
7. **Visual benefit:** Keyframed, visually authored camera and property timelines.
8. **Complexity:** Medium. Sequence playback would need wiring to story time `s`.
9. **Duplication:** Yes. Dawnward already has a single deterministic timeline (`frame(st)` with `s` from 0 to 5), shared motion tokens, and Remotion for films.
10. **REJECT.** The public code has been dormant since April 2024, the editor is AGPL, and it duplicates the existing deterministic timeline.

### 7. pmndrs/maath (`maath`)
1. **URL:** https://github.com/pmndrs/maath. Opening it displayed the **pmndrs/math** repository ("The playful web's math engine"). The npm `maath` entry has no repository field.
2. **Version and maintenance:** `maath` 0.10.8 was published 2024-07-07 (registry modified 2026-08-17). The successor package **`math`** 0.1.0 (MIT, repo `pmndrs/math`) was published 2026-09-11, with canary builds through 2026-10-26. pmndrs/math has 1.3k stars, 8 open issues and 5 PRs.
3. **License:** MIT, for both.
4. **React / three:** `maath` peers on three >=0.134 and @types/three. No React.
5. **Dependencies:** None declared for `maath`. `math` 0.1.0 is 2.0 MB unpacked, covering vector/matrix, time (easing, springs), random, noise, color and IK.
6. **Mobile risk:** Negligible if tree-shaken.
7. **Visual benefit:** Small. It offers damping helpers, seeded random point distributions and noise.
8. **Complexity:** Low.
9. **Duplication:** Yes. Dawnward already has a critically damped spring, easing tokens and its own star distribution.
10. **REJECT `maath`** (superseded by `math`). **MONITOR `math`** in case a stable release offers something Dawnward lacks, such as seeded noise.

### 8. basementstudio/shader-lab (`@basementstudio/shader-lab`). Verified: it exists.
1. **URL:** https://github.com/basementstudio/shader-lab
2. **Version and maintenance:** 3.1.0, published 2026-10-13. 716 stars, 1 open issue. I did not check the last commit.
3. **License:** GitHub shows Apache-2.0. The npm package has **no license field**, which needs confirming before any use.
4. **React / three:** Peers are react ^19.0.0, react-dom ^19.0.0, three **^0.185.0**. A caret on a 0.x version means 0.185.x only, so this **excludes three 0.187**. The README describes a "portable React runtime" that **requires WebGPU** and builds effects as TSL node graphs.
5. **Dependencies:** `typescript` is declared as a runtime dependency, which is unusual. 1.3 MB unpacked.
6. **Mobile risk:** High. WebGPU-only runtime, so there is no path on browsers without WebGPU, and it adds React.
7. **Visual benefit:** Stacked, animated shader compositions authored in an editor. These are exported as a canvas texture or used as postprocessing.
8. **Complexity:** High. It needs React, WebGPURenderer and a pinned older three.
9. **Duplication:** It overlaps the hand-written GLSL nebula, light and atmosphere shaders.
10. **REJECT.** It needs React 19 and WebGPU, its three peer excludes r187, and the npm license field is missing. The editor might still be useful for exploring looks, which would then be re-implemented by hand.

### 9. pmndrs/postprocessing (`postprocessing`)
1. **URL:** https://github.com/pmndrs/postprocessing · releases https://github.com/pmndrs/postprocessing/releases
2. **Version and maintenance:** 6.39.5 (latest), published 2026-09-09. v7 is in pre-release: `beta` tag 7.0.0-beta.16 (published 2026-02-19), `alpha` tag 7.0.0-alpha.4. 2.9k stars, 29 open issues. Maintained, and each release pins a three range.
3. **License:** Zlib. Its README says the code it is based on is MIT (mrdoob and three.js contributors). Zlib does not require attribution in the product, but the notice must stay with source distributions. Confirm against the LICENSE file before shipping.
4. **React / three:** No React. **Peer three ">= 0.168.0 < 0.187.0". The 6.39.5 release notes say the same, so the current release excludes Dawnward's 0.187.0.** The v7 beta peer is ">= 0.179.0 < 0.184.0", which also excludes it.
5. **Dependencies:** None. 2.77 MB unpacked (tree-shakeable).
6. **Mobile risk:** Every full-screen pass costs fill rate, which is Dawnward's measured bottleneck. `EffectPass` merges effects into one pass and uses a single fullscreen triangle, which keeps the cost low. Its README notes that HalfFloat buffers cost efficiency.
7. **Visual benefit:** Real, for this scene: selective bloom on stars and the light, SMAA, chromatic or vignette grading, and tone mapping in one merged pass.
8. **Complexity:** Medium. The two-scene render with `autoClear` off and the portal render target must be preserved. Tone mapping would move from in-shader ACES to a `ToneMappingEffect`.
9. **Duplication:** Partly. Glow is currently additive sprites and shader math, by design.
10. **MONITOR.** It is the best postprocessing library for vanilla three, but it is unusable on r187 until a release widens the peer range. Do not force-install against the peer range, because correctness comes first. Use three's bundled passes (A2) to test whether bloom is worth its fill cost.

### 10. pmndrs/react-postprocessing (`@react-three/postprocessing`)
1. **URL:** https://github.com/pmndrs/react-postprocessing
2. **Version and maintenance:** 3.2.2, published 2026-10-21. 1.5k stars, 11 open issues. Active.
3. **License:** MIT.
4. **React / three:** Peers are react ^19.0.0, @react-three/fiber >=9.7.0, postprocessing ^6.36.0, three >=0.156. It does not work without React.
5. **Dependencies:** `n8ao`, `maath`.
6. **Mobile risk:** Inherits R3F and postprocessing.
7. **Visual benefit:** The same as #9.
8. **Complexity:** It requires R3F, so very high.
9. **Duplication:** It is a wrapper around #9.
10. **REJECT.** It is a React binding for a library that Dawnward would use directly.

### 11. THREE-CustomShaderMaterial (`three-custom-shader-material`). Owner verified.
1. **URL:** https://github.com/FarazzShaikh/THREE-CustomShaderMaterial. **The prompt's `pmndrs/three-custom-shader-material` returns HTTP 404.** The npm repository field points to FarazzShaikh.
2. **Version and maintenance:** 6.4.0, published 2025-10-12 (bump mapping removed in v6.4.0, per the README). 1.4k stars, 1 open PR. GitHub did not show an issue count, and I did not check the last commit.
3. **License:** MIT (Copyright 2024 Faraz Shaikh).
4. **React / three:** Peers are three >=0.159, plus react >=18 and @react-three/fiber >=8 marked **optional**. Use the vanilla entry `three-custom-shader-material/vanilla` with a `baseMaterial`, for example `MeshPhysicalMaterial`. The README does not mention WebGPU or TSL, so treat it as WebGL/GLSL only.
5. **Dependencies:** None. 145 KB unpacked.
6. **Mobile risk:** Low by itself. Cost equals the base material plus the injected GLSL. Extending `MeshPhysicalMaterial` keeps the clearcoat cost Dawnward already pays.
7. **Visual benefit:** Lets custom GLSL patch the PBR titanium phone without losing its lighting and PMREM reflections. Examples: a portal-tinted rim, a world colour bleeding onto the bezel, a dissolve during the push through the glass.
8. **Complexity:** Low-medium. One material swap on the phone body, and the existing uniforms are reused.
9. **Duplication:** Partly. Dawnward writes full `ShaderMaterial`s already. CSM only adds value where PBR lighting must be kept, which is the phone.
10. **PROTOTYPE.** It is small, MIT, has no dependencies and works with r187's peer range. Add it only if a specific phone-material effect earns its place.

### 12. pmndrs/gltfjsx (`gltfjsx`)
1. **URL:** https://github.com/pmndrs/gltfjsx
2. **Version and maintenance:** 6.5.3, published 2024-11-04. **Last commit 2024-11-04.** 5.9k stars, 88 open issues, 21 open PRs. Slowing.
3. **License:** MIT.
4. **React / three:** A CLI whose output is R3F JSX components using drei hooks. It declares `three` 0.159.0 as a fixed dependency.
5. **Dependencies:** glTF-Transform 4.1.0 (core/extensions/functions), draco3dgltf, meshoptimizer, prettier and others. 1.15 MB unpacked (build-time only).
6. **Mobile risk:** None at runtime. Its `--transform` step (Draco, WebP, 1024 px textures, dedupe, prune) helps mobile, according to its README.
7. **Visual benefit:** None today. Dawnward has no glTF assets (the phone is `RoundedBoxGeometry`).
8. **Complexity:** Not applicable without React.
9. **Duplication:** None. It solves a problem Dawnward does not have.
10. **REJECT.** It outputs React components and Dawnward has no models. If models arrive, use glTF-Transform directly.

### 13. pmndrs/react-three-rapier (`@react-three/rapier`)
1. **URL:** https://github.com/pmndrs/react-three-rapier
2. **Version and maintenance:** 2.2.0, published 2025-11-03 (registry modified 2026-08-07). 1.5k stars, 38 issues shown.
3. **License:** GitHub shows MIT. **The npm package has no license field.** The engine, `@dimforge/rapier3d-compat`, is Apache-2.0.
4. **React / three:** Peers are react ^19, @react-three/fiber ^9.0.4, three >=0.159.0. React is required. Its README says React 18 users need v1 with R3F v8.
5. **Dependencies:** `@dimforge/rapier3d-compat` 0.19.2 (8.2 MB unpacked, WASM), `three-stdlib`, `suspend-react`.
6. **Mobile risk:** A large WASM payload and a fixed-step simulation on the CPU.
7. **Visual benefit:** None. The scene has no physical simulation, and drift and orbit are authored.
8. **Complexity:** High.
9. **Duplication:** It conflicts with the deterministic, authored motion, because physics stepping must not desynchronise the film path.
10. **REJECT.** Dawnward has no physics need, and it would add a multi-MB WASM payload plus React.

### 14. pmndrs/meshline (`meshline`)
1. **URL:** https://github.com/pmndrs/meshline
2. **Version and maintenance:** 3.3.1, published 2024-06-03. **Last commit 2024-06-03.** 383 stars, 5 open issues. Quiet. It is a fork of spite/THREE.MeshLine.
3. **License:** MIT.
4. **React / three:** Peer three >=0.137. Works vanilla through `MeshLineGeometry`, `MeshLineMaterial` (needs `resolution`) and `raycast`.
5. **Dependencies:** None. 51 KB unpacked.
6. **Mobile risk:** Low. Triangle-strip lines.
7. **Visual benefit:** Thick, tapered or dashed 3D lines, for example constellation threads drawn between stars in the universe.
8. **Complexity:** Low.
9. **Duplication:** Yes, twice over. The constellation is SVG, which is accessible and crisp, and three r187 already ships `Line2`/`LineMaterial` fat lines (`examples/jsm/lines/`, confirmed in `node_modules/three`).
10. **REJECT.** Use the bundled `Line2` if 3D threads are ever wanted, so no new dependency is needed.

### 15. pmndrs/react-ogl (`react-ogl`)
1. **URL:** https://github.com/pmndrs/react-ogl
2. **Version and maintenance:** 0.15.1, published 2025-07-11. 221 stars, 1 open issue. Low activity, and I did not check the last commit.
3. **License:** MIT.
4. **React:** Peers are react ^19.0, react-dom ^19.0, ogl >=1, plus react-native >=0.78 and expo-gl >=11.4 (native). React is required.
5. **Dependencies:** react-reconciler 0.31, zustand, its-fine, scheduler and others.
6. **Mobile risk:** React plus a reconciler.
7. **Visual benefit:** None beyond ogl itself.
8. **Complexity:** Very high. It means an engine change *and* React.
9. **Duplication:** It replaces the entire engine.
10. **REJECT.** It needs React 19 and a different engine.

### 16. oframe/ogl (`ogl`)
1. **URL:** https://github.com/oframe/ogl
2. **Version and maintenance:** 1.0.11, published 2025-01-27. **Last commit 2025-04-13.** 4.7k stars, 19 open issues, 8 open PRs.
3. **License:** Unlicense (public domain), so no attribution is required.
4. **React / three:** Not three.js. It is a separate minimal WebGL library with no dependencies.
5. **Dependencies:** None. Its README claims about 29 KB minzipped in total (core 8, math 6, extras 15).
6. **Mobile risk:** It is light, which is its main appeal. three.js is most of Dawnward's 155 KB gzip.
7. **Visual benefit:** None directly. The GLSL shaders would port, but nothing new appears on screen.
8. **Complexity:** Very high. Dawnward uses `MeshPhysicalMaterial` with clearcoat, `RoomEnvironment` PMREM and `RoundedBoxGeometry`. I did not verify whether ogl has equivalents, so assume they would need rewriting.
9. **Duplication:** It is a replacement engine.
10. **REJECT.** The possible bundle saving does not justify a rewrite that puts correctness and the film path at risk.

---

## Newer alternatives (with sources)

### A1. three.js `WebGPURenderer` + TSL (already inside `three` 0.187.0)
1. **URL:** https://github.com/mrdoob/three.js/releases · https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language · source `node_modules/three/src/renderers/webgpu/WebGPURenderer.js`
2. **Version and maintenance:** r187 was released 2026-10-30 (npm `three` 0.187.0). The r187 notes cover WebGPURenderer work, including parallel pipeline compilation in `compileAsync()` and `ProxyNodeMaterial`. three.js publishes a release roughly monthly.
3. **License:** MIT, the same as today.
4. **React / three:** No React. The source header says it "tries to use a WebGPU backend if the browser supports WebGPU. If not, `WebGPURenderer` falls backs to a WebGL 2 backend." The TSL wiki says TSL compiles node graphs to WGSL (WebGPU) or GLSL (WebGL2) and does postprocessing with `pass()` and `RenderPipeline`.
5. **Dependencies:** None new. Import `three/webgpu` and `three/tsl`.
6. **Mobile risk:** Unmeasured. Pipeline compile hitches and two backends double the QA matrix.
7. **Visual benefit:** Node-based postprocessing (bloom, MRT) and compute for particles in the future.
8. **Complexity:** **High.** In r187's `StandardNodeLibrary.js`, classic materials such as `MeshPhysicalMaterial` and `PointsMaterial` are auto-converted to node materials, but **`ShaderMaterial` is not in that mapping**. All four custom GLSL shaders (light, stars, phone screen, atmosphere) would need porting to TSL. The portal render target and in-shader ACES would also need reworking.
9. **Duplication:** It would replace the existing WebGL renderer path rather than add to it.
10. **MONITOR.** This is where the ecosystem is heading: R3F v10 alpha is "WebGPU first", and shader-lab is WebGPU-only. But it means rewriting four working shaders for no guaranteed mobile gain today. Re-evaluate when a shader needs rewriting anyway.

### A2. three.js bundled addons: `EffectComposer` + `RenderPass` + `UnrealBloomPass` + `SMAAPass` + `OutputPass`, and `Line2`
1. **URL:** shipped in `three` 0.187.0 under `examples/jsm/postprocessing/` and `examples/jsm/lines/` (confirmed in `dawnward/experience/node_modules/three`). Release notes: https://github.com/mrdoob/three.js/releases
2. **Version and maintenance:** Version-locked to the installed three, so they can never fall outside the peer range.
3. **License:** MIT, already covered by three's notice.
4. **React / three:** Vanilla, and exactly r187.
5. **Dependencies:** None new. Only the imported passes are bundled.
6. **Mobile risk:** Each pass is full-screen fill. Unlike pmndrs `EffectPass`, these passes are not merged. Bloom must run only on the high tier, at reduced resolution, and be skipped under reduced motion if it pulses.
7. **Visual benefit:** Bloom on the light's core, the kept star and dense star layers. SMAA for the phone's edges. These are the glow upgrades most visible on a phone.
8. **Complexity:** Medium. The composer must respect the two-scene, `autoClear`-off sequence and the portal target, and ACES would move to `OutputPass` or stay in-shader without being applied twice.
9. **Duplication:** Partly. The additive sprites already fake glow. The spike must show a visible gain over them.
10. **PROTOTYPE.** No dependency risk, so this is the cheapest way to prove or disprove postprocessing for Dawnward before pmndrs `postprocessing` supports r187.

### A3. pmndrs/detect-gpu (`detect-gpu`)
1. **URL:** https://github.com/pmndrs/detect-gpu
2. **Version and maintenance:** 5.0.70, published 2025-02-23. 1.2k stars, 13 open issues, 4 open PRs. The README says the gfxbench.com data source stopped updating in December 2025, but the current data remains accurate for existing GPUs. New GPUs fall back to non-benchmark classification.
3. **License:** MIT.
4. **React / three:** No React and no three peer. A drei dependency, used here directly.
5. **Dependencies:** `webgl-constants`. 979 KB unpacked, most of it benchmark data that is fetched on demand. Measure the bundled code size before merging.
6. **Mobile risk:** Low. **Privacy:** by default it fetches benchmark data from `https://unpkg.com/@pmndrs/detect-gpu@{version}/dist/benchmarks`, which is a third-party request. Use `benchmarksURL` with self-hosted `benchmarks.tar.gz` so nothing leaves Dawnward's origin. The result includes the GPU name string, so never log or transmit it.
7. **Visual benefit:** Indirect but large. `getGPUTier()` returns tier 0 to 3 (blocklisted or under 15 fps, 15+, 30+, 60+). Weak phones start on the low tier instead of janking until the frame-time step-down catches them, and strong phones get the high tier at once.
8. **Complexity:** Low. Seed the existing quality tiers with it and keep the frame-time step-down as the safety net.
9. **Duplication:** It complements the runtime step-down rather than replacing it. Tier 0 ("blocklisted") can route straight to the text version, matching the existing no-WebGL fallback.
10. **ADOPT, with self-hosted benchmarks only.** It directly serves responsiveness on mobile, which is the priority, and self-hosting keeps it private.

### A4. troika-three-text (`troika-three-text`)
1. **URL:** https://github.com/protectwise/troika
2. **Version and maintenance:** 0.52.5, published 2026-07-24. Monorepo with 2.0k stars and 70 open issues.
3. **License:** MIT.
4. **React / three:** Vanilla. Peer three >=0.125.
5. **Dependencies:** `bidi-js`, `troika-three-utils`, `troika-worker-utils`, `webgl-sdf-generator`. 843 KB unpacked.
6. **Mobile risk:** SDF generation runs in a worker. Each label adds a transparent quad.
7. **Visual benefit:** Crisp in-world labels that sit in depth (a world's name orbiting its planet).
8. **Complexity:** Low-medium.
9. **Duplication:** It duplicates DOM labels. In-canvas text is not in the accessibility tree, so the DOM text would have to remain anyway.
10. **MONITOR.** It is a lighter vanilla option than uikit for decorative depth text, but only as an `aria-hidden` echo of DOM text.

### A5. camera-controls (`camera-controls`)
1. **URL:** npm `camera-controls` (repo `yomotsu/camera-controls`, from the npm repository field). I did not open the GitHub page.
2. **Version and maintenance:** 3.1.2, published 2025-11-17.
3. **License:** MIT.
4. **React / three:** Vanilla. Peer three >=0.126.1. It is the optional orbit body for klipp.
5. **Dependencies:** None. 376 KB unpacked.
6. **Mobile risk:** Low.
7. **Visual benefit:** Smooth user orbit and dolly with transitions.
8. **Complexity:** Medium. It would fight the scroll spring and the authored path.
9. **Duplication:** Yes. It duplicates the hub yaw-on-drag and orbit drift.
10. **REJECT.** It duplicates the existing rig.

(Also checked: `three-mesh-ui` 6.5.4, last published 2023-03-24. **REJECT**, because it is stale.)

---

## Ranking: the five highest-value technologies for Dawnward

Ranked by value under Dawnward's priority order (correctness > privacy > accessibility > responsiveness > spectacle) and its measured bottleneck (fill rate on mobile).

| Rank | Technology | Why it ranks here |
|---|---|---|
| 1 | **detect-gpu** (self-hosted benchmarks) | It improves mobile responsiveness from the first frame, at low cost. It adds nothing on screen, needs no React and no shader changes, and self-hosting keeps it private. |
| 2 | **three.js r187 bundled postprocessing** (Bloom + SMAA + OutputPass, high tier only) | It is the biggest visible gain for the star field, the light and the phone edges, with no new dependency and no version risk. Fill cost is the open question, which a spike answers. |
| 3 | **three-custom-shader-material** (vanilla) | A small, dependency-free, MIT way to make the phone's PBR titanium react to the portal and worlds without losing its lighting. |
| 4 | **pmndrs `postprocessing`** | It is better than bundled passes (merged `EffectPass`, single triangle), but its peer range is currently below 0.187.0, so it waits. |
| 5 | **three.js WebGPURenderer + TSL** | It is the long-term rendering path, but all four `ShaderMaterial`s would need TSL ports, so the cost is high now. |

### Adopt first (in this order)
1. **detect-gpu: ADOPT.** Seed the existing quality tiers from `getGPUTier()`, using `benchmarksURL` pointed at Dawnward's own origin and never sending the GPU string anywhere. Keep the frame-time step-down as the safety net, and send tier 0 to the text version.
2. **three.js bundled postprocessing: adopt as a gated spike.** Bloom at half resolution plus SMAA, on the high tier only, and off when reduced motion is set. Ship it only if the p90 phone close-up frame does not regress and a side-by-side shows a visible gain over the additive sprites.
3. **three-custom-shader-material: adopt as a gated spike.** One effect on the phone body (a portal or world-tint rim). Ship it only if it costs less than about 1 ms on the low tier, and drop it otherwise.

### Defer (MONITOR)
- **pmndrs `postprocessing`.** Re-check when a release's peer range includes 0.187.0, then migrate from the bundled passes to a merged `EffectPass`.
- **three.js WebGPURenderer + TSL.** Revisit when a shader is being rewritten anyway, or when device data shows a WebGPU gain on target phones.
- **`@pmndrs/klipp`.** Revisit at a stable release without the canary `math` dependency, and only if the hand-written rig becomes a maintenance burden.
- **`@pmndrs/uikit` (vanilla), `troika-three-text`, `math`.** Only for decorative `aria-hidden` depth elements, never for real UI.

### Reject
- **React-bound:** `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `@react-three/rapier`, `react-ogl`, `@basementstudio/shader-lab`. All need React 19 in a site with no React. The film stack is on React 18.3.1, and shader-lab also needs WebGPU and three 0.185.x.
- **No use case:** `@react-three/xr`/`@pmndrs/xr` (no XR), `gltfjsx` (no glTF, React output), rapier (no physics, multi-MB WASM).
- **Dormant or duplicate:** Theatre.js (public repo dormant since April 2024, AGPL studio, duplicates the story timeline), `maath` (superseded by `math`), `meshline` (three's `Line2` is bundled, and the SVG constellation is the accessible version), `camera-controls` and `three-mesh-ui`.
- **Engine swap:** `ogl`. A smaller core is not worth rewriting a correct engine and the deterministic film path.

---

## Sources

### Pages opened (WebFetch)
- https://github.com/pmndrs/uikit
- https://github.com/pmndrs/uikit/commits/main
- https://raw.githubusercontent.com/pmndrs/uikit/main/LICENSE
- https://pmndrs.github.io/uikit/docs/getting-started/vanilla
- https://github.com/pmndrs/react-three-fiber
- https://github.com/pmndrs/react-three-fiber/releases
- https://github.com/pmndrs/drei
- https://github.com/pmndrs/xr
- https://raw.githubusercontent.com/pmndrs/xr/main/LICENSE
- https://github.com/pmndrs/klipp
- https://github.com/pmndrs/klipp/blob/main/README.md
- https://github.com/theatre-js/theatre
- https://github.com/theatre-js/theatre/commits/main
- https://github.com/pmndrs/maath (displayed pmndrs/math)
- https://github.com/basementstudio/shader-lab
- https://github.com/pmndrs/postprocessing
- https://github.com/pmndrs/postprocessing/releases
- https://github.com/pmndrs/react-postprocessing
- https://github.com/pmndrs/three-custom-shader-material (HTTP 404)
- https://github.com/FarazzShaikh/THREE-CustomShaderMaterial
- https://github.com/pmndrs/gltfjsx
- https://github.com/pmndrs/gltfjsx/commits/master
- https://github.com/pmndrs/react-three-rapier
- https://github.com/pmndrs/meshline
- https://github.com/pmndrs/meshline/commits/master
- https://github.com/pmndrs/react-ogl
- https://github.com/oframe/ogl
- https://github.com/oframe/ogl/commits/master
- https://github.com/mrdoob/three.js/releases
- https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language
- https://github.com/protectwise/troika
- https://github.com/pmndrs/detect-gpu
- https://threejs.org/manual/en/webgpurenderer (HTTP 404, not used)

### Local primary source (installed three 0.187.0, read only)
- `dawnward/experience/node_modules/three/src/renderers/webgpu/WebGPURenderer.js`: header comment on the WebGPU to WebGL 2 fallback
- `dawnward/experience/node_modules/three/src/renderers/webgpu/nodes/StandardNodeLibrary.js` and `src/renderers/common/nodes/NodeLibrary.js`: the material-to-node mapping, with no `ShaderMaterial` entry
- `dawnward/experience/node_modules/three/examples/jsm/postprocessing/` and `examples/jsm/lines/`: directory listing of the bundled addons
- `dawnward/experience/docs/technology-inventory.md` and `dawnward/experience/package.json`: stack facts

### npm commands run (read-only)
```
npm view <pkg> version license peerDependencies dependencies time.modified dist.unpackedSize --json
  for: @react-three/uikit @react-three/fiber @react-three/drei @react-three/xr @theatre/core @theatre/studio
       maath postprocessing @react-three/postprocessing three-custom-shader-material gltfjsx
       @react-three/rapier meshline react-ogl ogl three
npm view <pkg> version; npm view <pkg> "time[<version>]"; npm view <pkg> license; npm view <pkg> repository.url
  for the above plus: @pmndrs/uikit @pmndrs/xr @dimforge/rapier3d-compat @pmndrs/pointer-events
npm view @pmndrs/uikit peerDependencies dependencies --json
npm view @pmndrs/xr peerDependencies dependencies --json
npm view <pkg> version license peerDependencies dependencies time.modified dist.unpackedSize repository.url --json
  for: @pmndrs/klipp @basementstudio/shader-lab @pmndrs/uikit-default troika-three-text three-mesh-ui
npm view @pmndrs/klipp peerDependenciesMeta exports --json
npm view math version time.modified repository.url description --json
npm view math version license peerDependencies dependencies dist.unpackedSize "time[0.1.0]" --json
npm view math time --json
npm view maath repository --json; npm view maath deprecated
npm view postprocessing versions --json; npm view postprocessing dist-tags --json
npm view postprocessing@7.0.0-beta.16 peerDependencies --json; npm view postprocessing "time[7.0.0-beta.16]"
npm view three-custom-shader-material repository homepage --json; npm view three-custom-shader-material peerDependenciesMeta --json
npm view meshline repository homepage --json; npm view maath repository homepage --json
npm view @react-three/rapier license --json; npm view @react-three/uikit peerDependenciesMeta --json
npm view @dimforge/rapier3d-compat@0.19.2 dist.unpackedSize license --json
npm view @pmndrs/msdfonts dist.unpackedSize --json; npm view yoga-layout version dist.unpackedSize --json
npm view camera-controls version license peerDependencies dependencies dist.unpackedSize repository.url --json
npm view @react-three/tsl version license peerDependencies --json; npm view @react-three/fiber dist-tags --json
npm view @theatre/r3f version license peerDependencies --json
npm view detect-gpu version license peerDependencies dependencies dist.unpackedSize repository.url --json
```

### Attempted and blocked
- `gh api repos/<owner>/<repo>`: HTTP 403 (GitHub access not enabled for this session)
- `curl https://github.com/<repo>/commits.atom` and redirect checks: HTTP 403 through the proxy
