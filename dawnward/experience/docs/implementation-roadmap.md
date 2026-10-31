# Implementation roadmap

Decision inputs: `technology-inventory.md`, `futuristic-repository-research.md`, `architecture-proposal.md`, `performance-benchmarks.md`. Nothing below is installed or merged without the owner's approval.

## The five highest-value technologies for Dawnward (ranked)
1. **Spring-driven camera paths in the existing three.js rig** (Prototype B; no dependency). The biggest felt upgrade: every world entered its own way, reversible at any instant, deterministic for the films. 4.7 KB gzip, 2 to 5 draw calls.
2. **WebGL living constellation with explainable links** (Prototype C; three's bundled `Line2`, no dependency). The feature that turns the universe into meaning; links name the words they rest on; reject, remove and undo are first-class.
3. **detect-gpu, self-hosted** (MIT, 5.0.70). Picks the starting quality tier from the GPU before the first frame instead of after 60 slow ones. Must be configured to load its benchmark data from our own host, never the default CDN (privacy).
4. **three.js bundled `EffectComposer` + `UnrealBloomPass` + `SMAAPass`, high tier only** (no new dependency). Test whether a selective bloom pass beats today's shader glow on the light, the kept star and the atmosphere rims; keep it only if it measures cheaper or clearly better.
5. **three-custom-shader-material, vanilla entry** (MIT, 6.4.0, no dependencies). A small way to extend the phone's physical material (glass glare, edge light) without rewriting it; prototype only if a concrete effect needs it.

## Adopt first (in this order)
1. **WorldTransition from Prototype B**, generalised to all four worlds with their identities (arc, low, drift, long lens). Gate: QA suite unchanged, film frames identical, p95 in travel no worse than today's close-ups on the same rig, reduced-motion cross-fade verified.
2. **MemoryConstellation in WebGL from Prototype C**, behind the "Prototype · sample moments" label, keeping the SVG/list view as the accessible and low-tier path. Gate: axe 0, keyboard and screen-reader parity with the list, interaction under 50 ms on the rig with 100 synthetic moments.
3. **detect-gpu (self-hosted data)** feeding `AdaptiveEffects`. Gate: no third-party requests in the network log; starting tier matches the measured median within one step on the rig. Needs approval to install.

## Prototype next (time-boxed, behind the high tier)
- Bundled bloom/SMAA passes (item 4).
- three-custom-shader-material on the phone material (item 5). Needs approval to install.
- Prototype A (holographic cards) as a delight layer for the Today preview and onboarding, always mirrored by HTML controls; not a reading surface.

## Defer (monitor)
- `@pmndrs/klipp` 0.16 (experimental; our rig is already correct and deterministic). Re-check at 1.0.
- `postprocessing` (pmndrs, vanilla): its peer range excludes three 0.187 today; do not force-install.
- three.js `WebGPURenderer` + TSL: re-evaluate when a shader needs a rewrite anyway; mobile WebGPU coverage still varies.
- `@pmndrs/uikit` (vanilla) and `troika-three-text`: in-world UI and text, only if a surface must live in 3D; DOM stays the accessible default.

## Reject (for this stack)
React Three Fiber, drei, react-postprocessing, react-three-rapier, react-ogl (all need React 19 and a rewrite of a working, deterministic engine; React 18 is pinned for the films), shader-lab (React 19 plus WebGPU, three peer excludes r187), Theatre.js (dormant since April 2024, AGPL editor, duplicates our timelines), maath (superseded), meshline (three's `Line2` covers it, as Prototype C shows), gltfjsx (no models; outputs React), xr (no use case), ogl (second renderer), camera-controls (duplicates the rig).

## Sequencing and effort (estimates, to be confirmed)
| Step | Work | Depends on |
|---|---|---|
| 1 | Extract MotionPreferences, AdaptiveEffects, WorldBillboard from `main.js` (no behaviour change) | none |
| 2 | WorldTransition for four worlds | 1 |
| 3 | MemoryConstellation (WebGL) + list fallback | 1 |
| 4 | detect-gpu self-hosted | approval to install |
| 5 | Device test pass (iPhone, Android mid-range, integrated GPU desktop, screen readers) | hardware access |
| 6 | Bloom/SMAA and CSM spikes on the high tier | 5 |
| 7 | Server routes and consent for real links, per-moment removal and a personalisation switch | product decision |
