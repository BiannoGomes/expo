# Technology inventory

Audited 2026-10-31 from the repository (commit `081e7071`). Scope: the Living Universe web experience (`dawnward/experience`), the Remotion film project (`dawnward/marketing/remotion`) and, for context, the mobile app (`dawnward/apps/mobile`).

Status key: INSTALLED (present and used) · PARTIALLY IMPLEMENTED (present, incomplete) · MISSING · INCOMPATIBLE (cannot be used with this stack without a rewrite) · UNNECESSARY (would duplicate what exists without a measurable gain).

## Stack facts

| Item | Value | Evidence |
|---|---|---|
| Renderer | three.js **0.187.0**, WebGL 2, vanilla (no React, no framework) | `experience/package.json`, `node_modules/three/package.json` |
| Bundler | esbuild 0.25.11, one IIFE plus a single-file build with inlined assets | `build.mjs` |
| JS bundle | `dist/app.js` 597 KB minified, **155 KB gzip** (three.js is most of it) | measured |
| First load (390x844, sound off) | 1.46 MB, 18 requests, audio not fetched | `qa-results.json` |
| React | none in the web experience; React 18.3.1 only in the Remotion film project; React Native 0.81 in the app (no GL) | package files |
| Engine size | `src/main.js` 1,010 lines, `constellation.js` 174, `film.js` 108, `sound.js` 67, `tokens.js` 113 | `wc -l` |

## Rendering architecture
- Two scenes: `phoneScene` (the phone: RoundedBoxGeometry, MeshPhysicalMaterial titanium, RoomEnvironment PMREM) and `uniScene` (nebula plane, three star `Points` layers, world billboards, kept star). `autoClear` off; depth cleared between scenes.
- Portal: the universe renders into a linear HalfFloat render target, sampled in screen space by the phone's screen shader (ACES applied in-shader to match the direct render). The target is full size only around the crossing.
- Story time `s` (0 to 5) is a pure function input; the same `frame(st)` renders the site and the deterministic film (`?film=1`, `window.SEEK`).
- No post-processing pass. Glow is additive sprites and shader math.

## Shaders (4 custom `ShaderMaterial`s)
| Shader | Purpose | Cost |
|---|---|---|
| Light | Moment-one point of light: core, halo, diffraction spikes, breath | 1 quad, full-screen when close; hidden when unlit |
| Stars (`starPoints`) | Twinkling points with per-point phase and size | 4,120 points total in 3 layers (+900 dust) |
| Phone screen | UI canvas texture, portal sample with ACES, glass glare, SDF corner mask | 1 quad |
| Planet atmosphere (2.0) | App planet art + silhouette-hugging halo (8 taps) + limb glow (8 taps), tinted per world, quality-gated | 4 billboards, 16 taps per pixel |

## Camera system
- `cameraFor(s, t)`: one continuous piecewise path (phone approach, the push through the glass, hub, the return), continuous in position, look target and velocity across segments.
- Reading push (`pushFor`) toward regions of the phone screen; world focus via `focusPose` with per-world approach (arc, low, drift, long lens with FOV change); interruptible world-to-world travel; hub yaw on drag; orbit drift at rest.
- Scroll: critically damped spring (omega 7, max speed 1.8 story units/s), rest-point gravity, multi-chapter jumps cross-fade.

## Motion components and tokens
- Five motion families and shared tokens (`motion.tokens`: durations, curves, depth, opacity, stagger) used by CSS, the engine and Remotion (`marketing/remotion/src/theme.ts`).
- Remotion: `Phone`, `Veil`, typed-text, word cards, end card, captions, timeline-driven edit (`src/film/`).

## Accessibility and fallbacks
- axe-core: 0 violations in 6 states (start, world open, constellation open, insight, end, text version).
- Text version (full story as HTML), skip link, inert hidden UI, dialog semantics with focus in and back, dwell-based live region, keyboard: arrows for chapters and worlds, Esc everywhere.
- Reduced motion: no travel, one chapter per gesture with a 200 ms cross-fade, no orbit, breath, twinkle or parallax.
- No-WebGL and lost-context fallback to the text version; tab-hidden and text-version pauses; quality tiers (high to medium to low, stepping down on slow frames).

## Measured bottlenecks (software GL, container; upper bounds, not device numbers)
| State | Median / p90 frame (390x844, CPU 4x throttle) |
|---|---|
| First light | 17 / 17 ms |
| Hub (four worlds) | 67 / 100 ms |
| Phone close-up (morning) | 117 / 217 ms |
| Phone close-up (insight) | 133 / 167 ms |
Likely costs: fill rate of overlapping transparent layers at close range (phone body, bezel, screen, veil), MeshPhysicalMaterial with clearcoat, the canvas-texture uploads when the screen changes. No physical-device data exists yet.

## Classification of candidate technologies
| Technology | Status | Note |
|---|---|---|
| three.js core (WebGLRenderer, ShaderMaterial, Points, RenderTarget) | INSTALLED | the whole engine |
| three.js addons in use (RoundedBoxGeometry, RoomEnvironment) | INSTALLED | |
| three.js `EffectComposer` / `UnrealBloomPass` (addons) | MISSING (deliberately) | glow is shader based; a bloom pass would be a full-screen cost on phones |
| pmndrs/postprocessing (vanilla) | MISSING | candidate for a quality-gated selective bloom only if it beats the shader glow in a measured test |
| React Three Fiber, drei, uikit, xr, react-postprocessing, react-three-rapier | INCOMPATIBLE without a rewrite | they need React; the engine is vanilla. Adoption = rewriting 1,000 lines plus the deterministic film mode |
| Spatial UI panels | PARTIALLY IMPLEMENTED | DOM glass panels over the canvas (accessible, crisp text). No in-world panels |
| Cinematic camera | INSTALLED (custom) | continuous path, per-world approaches, interruptible travel |
| Timeline sequencing (Theatre.js style) | PARTIALLY IMPLEMENTED | `film.js` key tables and the Remotion `timeline.ts` cover the films; no visual timeline editor |
| Interpolation helpers (maath style damping) | INSTALLED (custom) | spring, smoothstep, exponential damping in `main.js` |
| Custom material extension (CSM style) | UNNECESSARY now | the four ShaderMaterials are small; CSM helps only if lit PBR materials need patching |
| glTF models (gltfjsx) | MISSING | no 3D models are used; the phone is procedural |
| Physics (Rapier) | UNNECESSARY | no physical interaction in the product story |
| Thick lines (meshline) | MISSING | constellation links are SVG in the prototype; WebGL lines are 1 px |
| Instanced constellation in WebGL | MISSING | SVG prototype exists (`src/constellation.js`) |
| WebXR | MISSING | no use case in the brief; not a priority for a phone-first product |
| OGL / react-ogl | UNNECESSARY | a second renderer would duplicate three.js |
| WebGPU (three.js WebGPURenderer, TSL) | MISSING | present inside three 0.187 but not used; mobile WebGPU support varies |
| Remotion (films) | INSTALLED | 4.0.533, pinned |
| Fable (motion app), GetLayers, 21st.dev | not available here | verified absent; see `dawnward/CLAUDE.md` |
