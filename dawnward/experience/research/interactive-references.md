# Dawnward Living Universe: Interactive and Creative-Engineering References

Research notes for the interactive web experience (the 3D phone the camera travels through into a personal universe with four worlds: Mind, Body, Soul, Future). This file extends the film reference library at `marketing/film/research/reference-library.md` and does not repeat anything in it (Apple, Nike, Calm, Google Pixel, Notion, BUCK, Ordinary Folk, ManvsMachine, Antibody and the audio tools are covered there).

Research date: 30 October 2026. Techniques are extracted, never assets or code.

How to read the status lines:

- **Verified**: the page was fetched during this research and the stated facts come from it.
- **Partially verified**: some facts were fetched, others come from search results or secondary pages, as stated.
- **Unreviewed**: the page could not be fetched; anything said about it comes from the named secondary source only.
- No live site was watched or played in a browser. "Execution" means what gallery captions, listing metadata, page HTML and page text show. Nothing here is a frame-level or feel-level review.

Current build, for context (read from `experience/src/main.js` and `sound.js`): vanilla three.js 0.187 (the current npm release), bundled with esbuild, no React. `WebGLRenderer` with `antialias: true` and `powerPreference: "high-performance"`, pixel ratio capped at `min(devicePixelRatio, 1.75)`, ACES tone mapping, `FogExp2` on the universe scene, additive sprite glows with `depthWrite: false`, a custom wheel and touch virtual scroll, a reduced-motion flag read once at load, and a Web Audio score that is off until the visitor taps a toggle. There is no `visibilitychange` handling and no WebGL context-loss handling yet. Several recommendations below are framed against this baseline.

---

## 1. Interactive galleries

### 1.1 Awwwards (https://www.awwwards.com)

Reachability: reachable through the fetch tool (site listings and individual site pages loaded). Direct command-line requests timed out, so treat it as bot-sensitive. Useful entry points: the Three.js tag listing at https://www.awwwards.com/websites/three-js/ and each site's page at `/sites/{slug}`.

#### 1.1a Igloo Inc, by abeto and Bureaux

- URL: https://www.igloo.inc/ (listing: https://www.awwwards.com/sites/igloo-inc)
- Status: partially verified. The Awwwards site page (fetched) lists Site of the Day on 23 July 2024 with a 7.92 score, credits abeto and Bureaux, and lists the categories Web and Interactive, Animation, Infinite Scroll, Transitions, 3D. Search results quoting Awwwards' 2024 annual-awards pages state it won Site of the Year 2024 and Developer Site of the Year 2024, and quote a juror describing "an immersive 3d experience with an easy to navigate, scroll interaction"; the annual-awards page itself returned 404 when fetched, so those two awards are unreviewed at source. abeto's Awwwards profile (fetched) shows two SOTY counters, which is consistent. The live page HTML (fetched) is an empty body plus a single JavaScript module: everything is rendered client-side.
- Technique: scroll is the only input. One scroll value drives a continuous real-time camera through a sequence of 3D scenes, with transitions inside the 3D world rather than page changes, and the scroll loops.
- How it improves Dawnward: it is the strongest recent proof that "one thumb gesture moves a camera through a world" is enough interaction for a premium experience. It validates Dawnward's core move (scroll carries the camera from the phone into the universe) and argues against adding other controls on the main path.
- Implementation requirements: a single normalised progress value (0 to 1) as the source of truth; a camera timeline keyed to that value (see 2.1, spline rig); scene sections kept loaded but hidden rather than mounted and unmounted; all heavy assets loaded before the first scroll so the journey never stalls.
- Performance (rough): this class of site is GPU-heavy and desktop-first in ambition. Dawnward should take the input model, not the rendering budget; the four-world universe should run in a fraction of this scene complexity.
- Do not copy: the icy crypto aesthetic, HUD-style technical typography, the infinite loop (Dawnward's journey needs a resolved arrival, not a loop), any of its 3D assets.

#### 1.1b Messenger, by abeto

- URL: https://messenger.abeto.co (listing: https://www.awwwards.com/sites/messenger)
- Status: verified at listing and HTML level. The Awwwards page lists Site of the Day on 10 November 2025 (7.92) and a Developer Award (8.21), with the tags Storytelling, 3D, WebGL, WebSockets, Three.js. The live HTML (fetched) carries the description "It's a small planet, but someone's gotta make the deliveries.", a `webgl` entry script and an `App3D` module chunk. Gameplay and visuals unreviewed.
- Technique: a whole world built as one tiny planet. A small radius means the horizon is always close, the whole world reads at a glance, and the camera can orbit or approach without ever needing a large scene.
- How it improves Dawnward: the four worlds can each be a small, legible planet that the camera approaches, instead of a vast landscape. Small planets keep each world readable on a phone screen, keep geometry and texture budgets low, and make "arriving at a world" a clear, bounded moment.
- Implementation requirements: one low-poly sphere per world with a single material; a per-world tint and fresnel rim (see 2.1, atmosphere); a camera framing per world defined as a point on the spline rig; world detail delivered as DOM text over the canvas, not as 3D text.
- Performance (rough): four small planets with one material each add roughly four to eight draw calls including rims; cheap.
- Do not copy: the illustrated toon style, the bright palette, game mechanics, multiplayer, characters.

#### 1.1c The Leap For Mankind, by Aurelien Vigne

- URL: https://leap-for-mankind.com/ (listing: https://www.awwwards.com/sites/the-leap-for-mankind)
- Status: verified at listing and HTML level. The Awwwards page lists Site of the Day on 3 July 2022 (7.45), a Developer Award of 7.55 with sub-scores (Accessibility 7.40, WPO 7.60, Responsive Design 7.80, Animations 7.80), and the stack WebGL, GSAP, Three.js, GLSL, Vue.js, Blender. The live HTML describes "a creative interactive audio-visual experience" of the Apollo missions, with a near-black theme colour (#0e0e0f). Chapter structure and sound design unreviewed.
- Technique: a space narrative told in chapters where sound is a co-equal channel, built on three.js plus GSAP with Blender-authored assets.
- How it improves Dawnward: the closest topical analogue (space, near-black canvas, audio-visual, story in chapters). It confirms that three.js plus GSAP is a proven stack for exactly this format, and that a scored, chaptered journey can earn a developer award at modest accessibility scores, which is a bar Dawnward should beat, not match.
- Implementation requirements: chapter boundaries as named points on the progress timeline (GSAP labels, see 2.3); sound cues tied to chapter entry, not to raw scroll position; Blender as the authoring tool for the phone and any hero geometry, exported as compressed glTF.
- Performance (rough): unknown for this site. For Dawnward, the lesson is architectural, not a budget.
- Do not copy: Apollo or NASA imagery, mission-control typography, its game-over interactions, the historical documentary register.

Also seen on Awwwards, not chosen as a main reference: "3D planet exploration" by Hendri Soerianto of Made By Yuma (https://www.awwwards.com/inspiration/3d-orbit-control-made-by-yuma), tagged three.js, drag, orbit. Its drag-to-orbit control is the free-camera pattern Dawnward is deliberately avoiding on the main path.

### 1.2 Hover States (https://www.hoverstat.es)

Reachability: verified, HTTP 200. Hover States features small interaction moments rather than whole sites, which suits Dawnward's need for restraint. The captions quoted below are the gallery's own.

#### 1.2a Anorak Film

- URL: https://anorakfilm.com/ (feature: https://www.hoverstat.es/features/anorak-film/, featured 23 November 2025)
- Status: verified at caption and page-text level. Caption: "A very cinematic site that begins as a simple text-based landing page, then drifts into a dreamlike text fade/bleed effect using variable fonts, before snapping into a highly active experience full of sharp, responsive transitions." The fetched page text confirms a text-first opening in which short poetic lines are interleaved with the roster of director names. The effect itself was not watched.
- Technique: the site opens as pure type and lets the type dissolve (fade and bleed through variable-font axes) into the experience, rather than opening on a loader or a hero image.
- How it improves Dawnward: the moment before the phone appears can be one Cormorant line on near-black that softens and bleeds into first light, which is the film library's "one ivory word on near-black" principle made interactive. It also replaces a loading screen with something meaningful while assets load.
- Implementation requirements: a DOM text layer above the canvas; the bleed done with opacity, a small blur filter and letter-spacing on the static Cormorant files Dawnward already ships, or a variable Cormorant cut if one is sourced and its licence checked (the bundled files are static weights). Under reduced motion, a plain opacity fade.
- Performance (rough): CSS filter blur on one large text block is cheap if it runs only during the opening and is removed afterwards; animating blur on many elements at once is not cheap on phones.
- Do not copy: the second half ("snapping into a highly active experience"), the director roster structure, its copy.

#### 1.2b Typographic Objects (typohypergraphicobject)

- URL: https://www.typohypergraphicobject.page/ (feature: https://www.hoverstat.es/features/typohypergraphic-object/, featured 28 November 2025)
- Status: verified at caption and page-text level. Caption: "A quietly confident piece of storytelling for Typographic Objects, featuring lovely type-out pacing with subtle saturation and hue-rotated image load-in that feels very much like the layered print process." The fetched page is a book site (written and published by James Langdon) whose text is set word by word.
- Technique: words arrive at reading pace, one after another, so the page reads like a voice speaking.
- How it improves Dawnward: Dawnward's voice is a caring person. Lines that arrive at speaking pace (not all at once, not letter by letter) make the captions over the universe feel spoken. It is the typographic equivalent of the film's guided-voice reference.
- Implementation requirements: split captions into words (not characters), keep the full sentence in the accessible name of the container so screen readers read it once, and drive the reveal from the chapter timeline. Reduced motion shows the whole sentence at once.
- Performance (rough): negligible with tens of words; avoid splitting long passages into hundreds of animated spans.
- Do not copy: the ASCII art, the hue-rotated image load-in (colour shifting breaks the near-black, ivory and gold palette), its text.

#### 1.2c Serena Congiu

- URL: https://www.serenacongiu.com/ (feature: https://www.hoverstat.es/features/serena-congiu/, featured 18 May 2026)
- Status: verified at caption level; the live HTML was fetched (navigation and video elements present) but the scroll effect was not watched. Caption: "A calm and soft portfolio for Milan-based makeup artist Serena Congiu, featuring a tactile scale scroll and simple navigation that blends into the background on the project view."
- Technique: the chrome recedes when content is in focus, and scroll is expressed as gentle scale rather than vertical travel.
- How it improves Dawnward: inside a world, the interface (sound toggle, back control, chapter marks) should fade toward the background so the world and the words hold attention; it returns when the visitor moves again.
- Implementation requirements: chrome opacity tied to an idle timer and to focus state; controls stay keyboard reachable and visible on focus even when faded (never below a usable contrast when focused).
- Performance (rough): negligible.
- Do not copy: the fashion-editorial grid, autoplaying video content, the scale-scroll as a sustained device (scaling large objects is a vestibular trigger; see section 3).

### 1.3 Godly (https://godly.website), now Recent (https://recent.design)

Reachability: godly.website returns 301 to `http://recent.design/?ref=godly`. A third-party listing describes the gallery as "Recent (previously Godly)", and at least one Recent entry links out with `?ref=godly`, so Recent is treated here as Godly's successor. The rebrand was not confirmed from an official announcement. Recent's website section is at https://recent.design/websites; each entry shows a caption, category, style tags and the live link.

#### 1.3a Shopify Editions Spring '26

- URL: https://www.shopify.com/editions/spring2026 (entry: https://recent.design/i/r4jmjhc-shopify-editions-spring-26)
- Status: verified at caption and HTML level. Recent caption: "An immersive Shopify Editions showcase with cinematic visuals, dark scenes, abstract 3D imagery, and feature-led product storytelling." The fetched HTML preloads a `three.core` chunk and a `react-three-fiber` chunk, loads a Lenis smooth-scroll manager, and contains a `@media (prefers-reduced-motion: reduce)` rule. The extracted page text also shows the hero headline split into single-letter elements. The scenes were not watched.
- Technique: dark, scene-by-scene 3D product storytelling where each feature gets its own scene, built with React Three Fiber and smooth scroll, with reduced motion respected.
- How it improves Dawnward: production evidence at a very large brand that a dark 3D scroll story can be feature-led. Dawnward's four worlds are its four "features", and each can be a scene with one idea. It also shows that a reduced-motion path is now normal practice at this level.
- Implementation requirements: one scene state per world; a smooth-scroll layer is optional (Lenis is MIT, version 1.3.27 on npm), and is only worth adding if native scroll feels rough after testing; reduced-motion handling in both CSS and the render loop.
- Performance (rough): unknown for this page. React plus R3F adds runtime weight that Dawnward does not need (see 2.2).
- Do not copy: the content volume, Shopify's loud display type, and per-letter headline splitting (it fragments text for assistive technology unless the full string is exposed separately).

#### 1.3b Nothing to Watch

- URL: https://nothing-to-watch.port80.ch/ (entry: https://recent.design/i/6wmr7uw-nothing-to-watch)
- Status: verified at caption and meta level. Recent caption: "A movie discovery app that presents a spinning 3D sphere of film posters, surfacing random titles with ratings, genres, and synopses to cure decision paralysis." The live page meta describes exploring "tens of thousands of films" in "a unique force-directed voronoi diagram interface", rendered on a canvas. Interaction not tried.
- Technique: a large collection presented as one spatial object the visitor turns, rather than as a list.
- How it improves Dawnward: supports an overview state where the visitor's whole universe is one object they can see at once (four worlds in one frame) before choosing where to go. It is the "map" moment between the travel sequence and the world visits.
- Implementation requirements: an overview camera framing on the spline; world selection by tap and by keyboard (each world mirrored by a real button in the DOM for accessibility); no physics simulation needed for four items.
- Performance (rough): cheap for four worlds; force-directed layouts only matter at thousands of items.
- Do not copy: the randomiser, the dense poster mosaic, the discovery-app framing.

#### 1.3c Halden App Website (category baseline, not a model)

- URL: https://recent.design/i/1u0n947-halden-app-website (posted by Michael Andreuzza; source is an X post)
- Status: entry verified; the live site is unreviewed (no live URL is given in the entry). Recent caption: "Landing page for Halden, a calm iOS app combining daily planning, habit tracking and focus sessions, shown scrolling through feature sections with an iPhone mockup." Tagged Minimal, Light, Consumer, Scroll Animation.
- Technique: the standard calm-app pattern: a flat phone mockup that scrolls through feature sections.
- How it improves Dawnward: as a differentiation reference. This is what an adjacent calm, habit and planning product looks like on the web today. Dawnward's phone is not a mockup that sits beside feature copy; the camera goes through it. If a Dawnward section starts to look like this, it has fallen back to the category default.
- Implementation requirements: none; use it as a check during reviews.
- Performance: not applicable.
- Do not copy: anything. Specifically avoid the light theme, the phone-beside-copy layout and feature-list sections.

### 1.4 Siteinspire (https://www.siteinspire.com)

Reachability: reachable through the fetch tool; direct requests returned HTTP 429 (rate limited). Listing pages show only names, dates and links, and Siteinspire's tagging rarely identifies WebGL or scroll-driven 3D, so it was the lowest-yield gallery for this brief. Useful URL patterns: `/website/{id}-{slug}`, `/websites/category/{slug}`, and combined filters such as https://siteinspire.com/websites?categories=184 (Use of Animation). It is better used for calm editorial and wellbeing sites than for 3D.

#### 1.4a Breathpod

- URL: https://www.breathpod.com/ (listing: https://www.siteinspire.com/website/12808-breathpod, listed 28 November 2024)
- Status: verified at listing and page level. Categories: Health and Fitness, Music, Mobile and Web Applications. The fetched page is a breathwork and music app site built on Squarespace; it opens with a one-line plain-language statement of the problem the app solves, then app-store links, and contains a `prefers-reduced-motion` rule.
- Technique: a wellbeing app that leads with one sentence naming the visitor's state in their own words, before any feature.
- How it improves Dawnward: the first caption of the universe should do the same job in Dawnward's voice: name the gap gently, then let the experience answer it. It is a copy-structure reference for the opening beat, not a visual one.
- Implementation requirements: one opening line, written in Dawnward's voice, as real DOM text (indexable and readable by screen readers).
- Performance: not applicable.
- Do not copy: the template look, star ratings, the free-trial banner, its copy.

#### 1.4b Oath Biome

- URL: https://www.oathbiome.com/ (listing: https://www.siteinspire.com/website/13653-oath-biome, listed 7 October 2026, credited to Landscape)
- Status: listing verified; live site unreviewed (it served a bot-verification page). Categories: Editorial, Minimal, Environment and Sustainability, Tech Start-ups.
- Technique (from categories only): editorial minimalism for a science-led product.
- How it improves Dawnward: a candidate reference for the non-WebGL pages around the experience (privacy, about, fallback story) that need to feel as calm as the universe without 3D. Review it in a real browser before relying on it.
- Implementation requirements: none until reviewed.
- Performance: not applicable.
- Do not copy: nothing known yet.

---

## 2. Engineering references

Package versions and licences below were read from the npm registry on 30 October 2026.

| Package | Version | Licence |
|---|---|---|
| three | 0.187.0 | MIT |
| @react-three/fiber | 9.8.2 | MIT |
| @react-three/drei | 10.7.9 | MIT |
| @react-three/postprocessing | 3.2.2 | MIT |
| postprocessing (pmndrs) | 6.39.5 | Zlib |
| gsap | 3.15.0 | GSAP Standard "no charge" licence (not an open-source licence) |
| animejs | 4.5.0 | MIT |
| motion | 14.9.0 | MIT |
| lenis | 1.3.27 | MIT |

### 2.1 three.js (https://threejs.org)

Reachability: verified, HTTP 200. The example list was read from https://threejs.org/examples/files.json and example sources were fetched directly. Note that there is no longer a `webgl_fog` example; fog appears inside other examples and in WebGPU-only examples.

#### Points with additive blending: `webgl_points_sprites`

- URL: https://threejs.org/examples/#webgl_points_sprites
- Status: verified from source. 10,000 points split across several `PointsMaterial`s using a sprite texture, `AdditiveBlending`, `depthTest: false`, `transparent: true`, with `FogExp2(0x000000, 0.0008)`.
- Technique: many stars as one `Points` object per layer (one draw call per layer), a soft round sprite as the point texture, additive blending so overlapping stars brighten rather than occlude.
- How it improves Dawnward: the current starfield already uses this family. The one change worth making: the example disables depth testing, which lets stars draw over planets. Dawnward should keep `depthWrite: false` (so stars do not occlude each other) but leave `depthTest: true`, so planets and the phone correctly hide stars behind them.
- Implementation requirements: two or three star layers at different distances for parallax; size attenuation on; fog applied so distant layers sink into the void colour.
- Performance (rough): one draw call per layer. Cost is fill rate: large, overlapping additive sprites on a high pixel-ratio phone are the expensive part, not the point count. Keep point sizes small and the layer count low.
- Do not copy: `depthTest: false`, the uncapped `setPixelRatio(window.devicePixelRatio)` used in every example, the snowflake sprites.

#### Per-point attributes: `webgl_buffergeometry_custom_attributes_particles`

- URL: https://threejs.org/examples/#webgl_buffergeometry_custom_attributes_particles
- Status: verified from source. 100,000 particles with custom per-vertex attributes, `AdditiveBlending`, `depthTest: false`.
- Technique: per-star size and colour stored as buffer attributes and read in a small custom shader, so each star can twinkle on its own phase while the whole field stays one draw call.
- How it improves Dawnward: lets the four world tints and the scarce gold appear only in a few stars (for example, the "kept" stars), without extra objects.
- Implementation requirements: a `ShaderMaterial` with a time uniform; twinkle computed in the shader from a per-point phase attribute. Do not rewrite the buffers every frame. Under reduced motion, set twinkle amplitude to zero.
- Performance (rough): cheap per frame if only a uniform changes; rewriting a 100,000-entry buffer every frame is the trap.
- Do not copy: the random rainbow colours, the particle counts (Dawnward needs thousands, not a hundred thousand).

#### Sprites and billboard depth: `webgl_sprites`

- URL: https://threejs.org/examples/#webgl_sprites
- Status: verified from source. Uses `SpriteMaterial` with `fog: true` and linear `Fog(0x000000, 1500, 2100)`.
- Technique: `Sprite` objects always face the camera and take part in fog and depth, so a glow can sit at a real depth in the scene.
- How it improves Dawnward: the right tool for the few hero glows (each world's atmosphere halo, the gold "kept star"), which is what the current build does. Each `Sprite` is its own draw call, so they should stay few; anything numerous belongs in `Points`.
- Implementation requirements: pre-blurred radial textures (baked once, small, for example 128 or 256 px); `fog: true` so halos fade with distance.
- Performance (rough): one draw call each; fill-rate cost scales with on-screen size, so a halo that fills the screen at close approach is the costliest moment of the journey and should be faded down as the camera nears it.
- Do not copy: the example's image sprites.

#### Fog

- Docs: https://threejs.org/docs/#api/en/scenes/Fog and https://threejs.org/docs/#api/en/scenes/FogExp2
- Status: the API is verified through its use in the fetched examples (`Fog` in `webgl_sprites`, `FogExp2` in `webgl_points_sprites` and `webgpu_particles_soft`). The WebGPU-only examples (`webgpu_fog_height`, `webgpu_custom_fog`, `webgpu_custom_fog_scattering`) were listed but not used.
- Technique: exponential fog toward a single colour gives depth for almost no cost.
- How it improves Dawnward: depth without post-processing. The fog colour must equal the clear colour, or the fogged distance will show as a band; the current build uses `0x04060a`, which matches the `void` token, so it is correct. If the clear colour ever moves to the brand near-black #0B0E12, the fog colour must move with it.
- Implementation requirements: one `FogExp2` per scene; animate density per chapter if needed (thicker at the threshold of the phone, thinner in open space).
- Performance (rough): close to free; it is a few instructions in shaders that already run.
- Do not copy: the WebGPU height-fog and scattering examples for now; they need the WebGPU renderer.

#### Bloom cost: `webgl_postprocessing_unreal_bloom` and `webgl_postprocessing_unreal_bloom_selective`

- URLs: https://threejs.org/examples/#webgl_postprocessing_unreal_bloom , https://threejs.org/examples/#webgl_postprocessing_unreal_bloom_selective , pass source: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/UnrealBloomPass.js
- Status: verified from source. `UnrealBloomPass` renders a bright pass at half resolution, then five mip levels (`nMips = 5`), each with a horizontal and a vertical blur into half-float render targets, then a composite. The selective example renders the scene twice (once with non-blooming objects darkened, once normally) and mixes the results, using a layer to mark blooming objects.
- Technique: real bloom from bright pixels, or selective bloom from tagged objects.
- How it improves Dawnward: mostly as a reason not to use it. Full bloom adds the scene render to a target plus roughly a dozen extra full-screen-style draws per frame (at shrinking sizes); selective bloom also doubles the scene's draw calls. Dawnward's glows are deliberate, few and known in advance, so pre-blurred sprite halos and fresnel rims (below) give the same look at a fraction of the cost.
- Implementation requirements if bloom is ever needed (for example, on desktop only): use the pmndrs `postprocessing` library, whose `EffectPass` merges several effects into one pass (verified in its README, https://github.com/pmndrs/postprocessing); run it at reduced resolution; disable `antialias`, `stencil` and `depth` on the renderer as that README recommends; and use `HalfFloatType` buffers to avoid banding in dark gradients, which matters for a near-black palette.
- Performance (rough, unmeasured estimate): on a mid-range phone at pixel ratio 1.5 to 1.75, expect a few milliseconds per frame for bloom, which is a large share of a 16.7 ms frame. Measure before adopting.
- Do not copy: bloom as a default look. Glow everywhere would fight the "scarce gold" rule.

#### Camera rig without OrbitControls: `webgl_geometry_extrude_splines`

- URL: https://threejs.org/examples/#webgl_geometry_extrude_splines
- Status: verified from source. The example adds a dedicated `splineCamera` that travels along a curve, with a camera helper to visualise it. Every other example listed in this section uses `OrbitControls` only as demo scaffolding.
- Technique: the camera's position is a point on a curve at parameter t, and its look direction comes from a second curve or a target offset. t is the only animated value.
- How it improves Dawnward: this is the right rig for "travel into the phone, out into the universe, to each world". Author one `CatmullRomCurve3` for camera position and one for the look-at target, map scroll progress to t with damping, and the whole journey becomes data that can be tuned without touching code paths. It also guarantees no visitor can get the camera lost, which a free orbit cannot.
- Implementation requirements: two curves (position and target) authored in code or exported from Blender as point lists; arc-length parameterisation (`getPointAt`, not `getPoint`) so speed is even; damping on t (the current build already damps a `target` value); named t values for each chapter and world.
- Performance (rough): negligible; a few vector evaluations per frame. Reuse vectors; do not allocate per frame.
- Do not copy: the tube geometry, the wide 84 degree field of view.

#### Atmosphere rim: `webgpu_tsl_earth`

- URL: https://threejs.org/examples/#webgpu_tsl_earth
- Status: verified from source. The atmosphere is a second sphere scaled to 1.04, rendered `BackSide` and transparent, with alpha from a fresnel term (view direction against surface normal) remapped and raised to a power; day and twilight colours are mixed by sun orientation.
- Technique: a fresnel rim fakes atmospheric scattering at the planet's limb in a single pass with no ray marching.
- How it improves Dawnward: gives each world a soft halo in its own tint, lit from one direction, so the planets feel lit rather than flat, at one extra draw call each. It is the cheap substitute for the ray-marched atmospheres in 2.6.
- Implementation requirements: this example uses the WebGPU renderer and TSL nodes; for the current WebGL build, rewrite the same idea as a small `ShaderMaterial` (written from scratch; three.js is MIT, so even copying would be permitted, but the WebGL version is short enough to write directly).
- Performance (rough): one extra sphere draw per world, cheap at the planet sizes Dawnward uses.
- Do not copy: the Earth textures, the blue and orange colours.

#### Related, WebGPU only: `webgpu_tsl_galaxy`, `webgpu_particles_soft`

- URLs: https://threejs.org/examples/#webgpu_tsl_galaxy , https://threejs.org/examples/#webgpu_particles_soft
- Status: verified from source. The galaxy computes spiral positions in TSL with additive blending and `depthWrite: false`; the soft-particles example uses `FogExp2` and `depthWrite: false` smoke.
- How it improves Dawnward: reference maths for a slow spiral of dust around the universe's centre, portable to a WebGL vertex shader.
- Do not copy: the renderer choice for now (see "Decisions").

#### Renderer facts relevant to fallbacks

- Status: verified from three.js source on GitHub.
- `WebGLRenderer` defaults: `powerPreference: 'default'`, `failIfMajorPerformanceCaveat: false`, `antialias: false`; it registers its own `webglcontextlost` listener internally.
- `examples/jsm/capabilities/WebGL.js` exposes `WebGL.isWebGL2Available()` for a pre-flight check.
- `WebGPURenderer` "falls back to a WebGL 2 backend" when WebGPU is unavailable, and accepts `forceWebGL: true`.

### 2.2 React Three Fiber docs (https://r3f.docs.pmnd.rs)

- Status: verified. Pages fetched: https://r3f.docs.pmnd.rs/api/canvas , https://r3f.docs.pmnd.rs/advanced/scaling-performance , https://r3f.docs.pmnd.rs/advanced/pitfalls , plus drei's https://drei.docs.pmnd.rs/controls/scroll-controls
- What the docs say: `Canvas` defaults to `dpr: [1, 2]` and `frameloop: "always"`. The scaling guide recommends `frameloop="demand"` with `invalidate()` to stop rendering when nothing changes ("the main cause of battery drain" is continuous rendering); `PerformanceMonitor` to raise or lower pixel ratio from measured frame rate (its example maps a factor to roughly 0.5 to 2); movement regression (`performance` defaults `current: 1, min: 0.1, max: 1, debounce: 200`, with `regress()` called while the camera moves); and a draw-call budget stated as "well under 1000, ideally a few hundred", with instancing for repeats. The pitfalls page says: never set React state inside the frame loop, toggle `visible` instead of mounting and unmounting (mounting recompiles buffers and materials), and never allocate new objects (such as vectors) every frame. drei's `ScrollControls` exposes `pages`, `damping` (0.2 s default) and `useScroll()` with `offset`, `range`, `curve` and `visible` helpers.
- Technique: adaptive quality (lower pixel ratio while moving or when frames drop, restore when settled), render-on-demand when idle, and range helpers that turn one scroll offset into per-chapter 0 to 1 values.
- How it improves Dawnward: every one of these patterns applies to the vanilla build without adopting React. The `range` and `curve` helpers are exactly the right shape for chapter fades (a world's caption fades in and out across its slice of the journey).
- Implementation requirements: port the ideas, not the library. A frame-time monitor that steps pixel ratio between 1.0 and the cap; a "settled" check that skips rendering when the camera and all fades are at rest; per-chapter `range(start, length)` helpers in plain functions; world scenes always mounted with `visible` toggled.
- Performance (rough): adopting R3F would add React and its reconciler to a bundle that has neither today, for no capability Dawnward lacks. The patterns themselves cost nothing.
- Do not copy: the React architecture into this build; drei's `ScrollControls` overlay (it creates its own scroll container in front of the canvas, which competes with native page scroll and assistive technology).

### 2.3 GSAP and ScrollTrigger (https://gsap.com)

- Status: verified. Pages fetched: https://gsap.com/pricing/ , https://gsap.com/standard-license/ , https://gsap.com/docs/v3/Plugins/ScrollTrigger/ , https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- Licensing (current): GSAP is "100% free for all users, thanks to Webflow's support", including the formerly paid plugins (SplitText, MorphSVG) and ScrollTrigger. The footer reads "GSAP - A Webflow Product". The npm licence field is the GSAP Standard "no charge" licence, which is not an open-source licence. Commercial use is permitted. The prohibited uses centre on products that compete "with Webflow's visual animation building capabilities" (no-code animation builders); reverse engineering to build a competing product and removing notices are also prohibited; Webflow owns the IP, may update the licence, and if a revision is not accepted, the versions licensed before it may still be used. Dawnward is not an animation builder, so it is clear of the restriction. Pin the version and keep a copy of the licence text with the project.
- What the docs say: `scrub: true` ties the timeline directly to scroll; a number sets seconds of "catch-up" smoothing. `pin` holds an element; the docs warn not to animate the pinned element itself (animate a child, such as the canvas wrapper). `invalidateOnRefresh` re-reads start values on resize. `ScrollTrigger.normalizeScroll()` moves scrolling onto the JavaScript thread so visuals stay in sync and, per the docs, keeps the mobile address bar from showing and hiding on most devices. Refresh runs automatically after resize with a 200 ms pause. `snap` accepts `"labels"` and `"labelsDirectional"`. `gsap.matchMedia()` runs a setup only while a media query matches and reverts its animations and ScrollTriggers when it stops matching; the docs' named-condition example uses `reduceMotion: "(prefers-reduced-motion: reduce)"`.
- Technique: native document scroll (a tall page) feeding one scrubbed timeline, with chapter labels and optional snapping to each world.
- How it improves Dawnward: the current build intercepts wheel and touch and maintains its own virtual scroll. Native scroll gives keyboard scrolling (space, page down, arrow keys), iOS momentum, scrollbar dragging, find-in-page and screen-reader compatibility for free, and ScrollTrigger turns it into a smooth progress value with labelled chapters. `gsap.matchMedia()` gives a clean reduced-motion switch that tears down and rebuilds the motion setup when the OS setting changes mid-visit.
- Implementation requirements: a spacer element sized to the journey length; a fixed canvas; one master timeline from 0 to 1 with labels per chapter and world; `scrub` around 0.6 to 1.0 seconds (tune by feel); the render loop reads the timeline's progress and does not run its own scroll physics; `snap: "labelsDirectional"` only if testing shows visitors overshoot worlds.
- Performance (rough): ScrollTrigger itself is light. `normalizeScroll` trades native scrolling for JavaScript scrolling and can feel different on iOS; test before enabling.
- Do not copy: horizontal pinned "scroll hijack" sections, SplitText per-character effects on body copy, the showcase-demo styling on gsap.com.

### 2.4 Anime.js (https://animejs.com)

- Status: verified. Pages fetched: https://animejs.com/ and https://animejs.com/documentation/events/onscroll
- What the site says: modular v4 API (Timer, Animation, Timeline, Animatable, Draggable, Scope, SVG, Stagger, Spring, plus a WAAPI module of about 3.5 KB), "24.50 KB" total with per-module sizes, and "only importing the parts you need". `onScroll()` returns a `ScrollObserver` that links a timer, animation or timeline to scroll, with thresholds, sync modes ("Playback progress", "Smooth scroll", "Eased scroll"), and `onEnter`, `onLeave` and `onUpdate` callbacks. The site states no licence; npm lists MIT (version 4.5.0).
- Technique: lightweight timeline plus scroll observer for DOM captions.
- How it improves Dawnward: a smaller, fully open-source alternative to GSAP if the licence or size matters more than ScrollTrigger's maturity (snapping, pinning, refresh handling).
- Implementation requirements: same single-progress architecture as 2.3.
- Performance (rough): small; import only Timeline and the scroll module.
- Do not copy: running both GSAP and Anime.js. Pick one.

### 2.5 Motion (https://motion.dev)

- Status: verified. Pages fetched: https://motion.dev/ and https://motion.dev/docs/scroll
- What the site says: "Free and open source. Previously Framer Motion", for React, Vue and JavaScript; npm lists MIT (version 14.9.0). Motion+ is a separate offering ("components, examples and a complete editing toolkit"); its price is not on the homepage. `scroll()` is listed at 3.8 KB, runs animations on the browser's `ScrollTimeline` "where supported" (described as hardware-accelerated), and can call a function with `progress` from 0 to 1 plus an `info` object with per-axis `velocity`. `offset` defaults to `["start start", "end end"]`. The scroll page does not mention reduced motion.
- Technique: the smallest route from native scroll to a progress number.
- How it improves Dawnward: if the only thing needed from a library is "page scroll progress, smoothly", `scroll((p) => { journey.target = p })` is the lightest option and is MIT.
- Implementation requirements: Dawnward's own damping on the received value; reduced-motion handling written separately.
- Performance (rough): very small.
- Do not copy: Motion+ components (paid, and not needed).

### 2.6 Shadertoy (https://www.shadertoy.com)

- Status: unreviewed. Every Shadertoy URL, including the terms page, returned HTTP 403 to automated requests. Licence and shader facts below come from secondary sources and are marked.
- Licence: secondary sources (shader ports on godotshaders.com, a GitHub collection of Shadertoy ports, and per-shader headers) consistently state that Shadertoy content defaults to Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported unless the author states otherwise in the shader. Non-commercial terms rule out using default-licensed code in Dawnward, which is commercial. Rule for this project: read for technique only, write every shader from scratch, never paste.

#### 2.6a Star Nest (Shadertoy ID XlfGRj), by Pablo Roman Andrioli

- URL: https://www.shadertoy.com/view/XlfGRj (unreviewed); mirrored listing read at https://arcade3.readthedocs.io/en/latest/tutorials/shader_toy_glow/star_nest.html (verified)
- Status: partially verified through the mirror, whose header reads "Star Nest by Pablo Roman Andrioli", "This content is under the MIT License." and names the Shadertoy source. That header was not checked on Shadertoy itself. Tuning constants in the mirror include 17 fractal iterations and 20 volume steps.
- Technique: a volumetric starfield. Along each view ray the shader samples a 3D folding fractal (the "kaliset") at successive depths and accumulates brightness, with distance fading and a "dark matter" term, which produces drifting, layered depth that a flat star texture cannot.
- How it improves Dawnward: a reference for the deepest background layer: the feeling of depth behind the near stars, in near-black with the faintest warmth.
- Implementation requirements: do not run it full-screen per frame on phones. 20 steps times 17 iterations is roughly 340 fractal iterations per pixel per frame. Instead, render a Dawnward-original version once at load into a small texture (or a low-resolution cube or equirectangular map) and use it as a static or very slowly drifting backdrop; or skip it and rely on layered `Points`.
- Performance (rough): prohibitive live at phone resolution; near free if baked once.
- Do not copy: the code, the saturated colour output, the full-screen live ray march.

#### 2.6b Atmospheric scattering (Shadertoy ID wlBXWK), by Dimev

- URL: https://www.shadertoy.com/view/wlBXWK (unreviewed); companion repository https://github.com/Dimev/atmosphere-shader (verified, MIT licence)
- Status: partially verified through the repository README, which calls it "a (somewhat simple) atmospheric scattering implementation" for research and explanation, and lists planned improvements: a Chapman-function approximation of optical depth (to make the atmosphere fully analytical, avoiding costly functions), a better integrator, planet shadows and multiple scattering. Step counts are not given.
- Technique: march a ray through a spherical atmosphere, integrating how much light scatters toward the viewer; the analytical (Chapman) approximation replaces the inner light-direction march.
- How it improves Dawnward: explains why the fresnel rim in 2.1 looks right: real scattering is strongest where the view ray grazes the planet's limb. For Dawnward the fresnel rim is the mobile-safe stand-in; a ray-marched atmosphere is only worth considering for one hero planet on desktop.
- Implementation requirements: if ever used, write it from scratch with very few steps, at reduced resolution, on one object.
- Performance (rough): ray marching per pixel over four planets is too costly for phones; one fresnel rim per planet is cheap.
- Do not copy: the code (even with an MIT repository, the Shadertoy page's own licence was not verified), the Earth-blue palette.

#### 2.6c Cheap soft glow (technique, documented outside Shadertoy)

- URL: https://arcade3.readthedocs.io/en/latest/tutorials/shader_toy_glow/index.html (verified)
- Technique: glow intensity equals a scale divided by the distance from the glow centre (with aspect correction), raised to an exponent that controls falloff (above 1 falls off faster, below 1 slower), multiplied by a colour, then softly tone-mapped so bright cores do not clip.
- How it improves Dawnward: this is the function behind every soft halo in the universe. Use it to generate the glow sprite textures once (the current build already uses pre-made glow textures), or run it in a fragment shader on a small quad when the falloff needs to animate (for example, a world's halo breathing slightly while focused).
- Implementation requirements: draw on a quad sized to the visible glow, never a full-screen pass per glow; additive blending; under reduced motion, no breathing.
- Performance (rough): one quad and a few instructions per covered pixel; cost scales with quad size.
- Do not copy: nothing to copy; it is a formula.

---

## 3. Mobile WebGL performance and accessibility

### 3.1 Pixel ratio caps

- Sources (verified): MDN WebGL best practices, https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices ; R3F Canvas defaults (above).
- MDN: rendering into a smaller back buffer and upscaling is "a common (and easy) way to trade off quality for speed"; naive `canvas.width = width * devicePixelRatio` causes moire with non-integer ratios; `ResizeObserver` with `device-pixel-content-box` reports exact device pixels; budget memory per pixel using `devicePixelRatio` and re-measure on target devices. R3F defaults to a `[1, 2]` range.
- What it means for Dawnward (arithmetic, not measured): a phone with a 393 by 852 CSS viewport at native ratio 3 renders about 3.0 million pixels per frame; at the current cap of 1.75, about 1.03 million; at 1.5, about 0.75 million; at 1.0, about 0.33 million. Additive glows and fog are fill-rate work, so cost tracks these numbers closely. Recommendation: cap at 1.5 on coarse-pointer (touch) devices and 2 on desktop, step down to 1.0 while frame time stays high or while the camera is moving fast, and step back up when settled. Keep 1 for the film-capture path.
- Antialiasing: MSAA cost is not quantified by MDN. With a 1.5 ratio and mostly soft sprites, test `antialias: false` on phones; the phone model's edges are the only place it may show.

### 3.2 Draw-call budget

- Sources (verified): R3F scaling guide ("well under 1000, ideally a few hundred"); MDN ("If you have 1000 sprites to paint, try to do it as a single drawArrays() or drawElements() call"; texture atlases help batching).
- House budget for Dawnward (a recommendation, not a sourced figure): under 100 draw calls in the heaviest frame on phones. Star layers as `Points` (one call each), worlds as one mesh plus one rim each, hero glows as a handful of sprites, the phone as few meshes as its materials allow. Monitor with `renderer.info.render.calls` in a debug overlay.

### 3.3 Frame loop, idle and visibility

- Render on demand: skip `renderer.render` when the camera, fades and twinkle are all at rest (the R3F `frameloop="demand"` idea). Under reduced motion with twinkle off, the universe is static between interactions and should draw zero frames.
- Pause on `visibilitychange` when `document.hidden`: browsers throttle animation frames in background tabs, but the audio graph and any timers continue; suspend the audio context and stop the loop explicitly. The current build has no visibility handling.
- Never allocate vectors or arrays in the loop (R3F pitfalls page); reuse module-level objects.

### 3.4 Reduced motion

- Sources (verified): MDN `prefers-reduced-motion`, https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion ; WCAG 2.2 Understanding 2.3.3, https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html ; WCAG 2.2 Understanding 2.2.2, https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- MDN: the setting is on iOS (Accessibility, Motion), Android 9 and later (Remove animations), macOS and Windows; "scaling or panning large objects can be vestibular motion triggers". WCAG 2.3.3 (Level AAA): motion animation triggered by interaction can be disabled unless essential; its understanding page names parallax as often non-essential and lists `prefers-reduced-motion` in CSS (C39) and JavaScript (SCR40) as sufficient techniques. WCAG 2.2.2 (Level A): moving content that starts automatically, lasts more than five seconds and sits alongside other content needs a way to pause, stop or hide it.
- What it means for Dawnward: a camera flying into a phone and out into space is exactly "scaling or panning large objects". The reduced path should replace travel with crossfades between fixed framings (phone, threshold, universe overview, each world), switch off pointer parallax, drift and twinkle, and keep all text and every world reachable. Also offer an in-page motion toggle, because many people who would benefit never change the OS setting. Read the media query live (a `change` listener or `gsap.matchMedia()`), not once at load as the current build does.

### 3.5 WebGL fallback

- Sources (verified): three.js source (`WebGL.isWebGL2Available()`, `failIfMajorPerformanceCaveat`, internal `webglcontextlost` listener); MDN best practices (context loss is one of the only errors a well-formed page should see).
- Pattern: (1) pre-flight `WebGL.isWebGL2Available()`; (2) create the renderer with `failIfMajorPerformanceCaveat: true` so software-rendered contexts fail fast; (3) on either failure, add the `no-webgl` class (the current build already does this on constructor failure) and show a static poster of the universe with the full story as plain, readable HTML; (4) listen for `webglcontextlost` (call `preventDefault()` to allow restoration) and `webglcontextrestored`, showing the poster while the context is gone and rebuilding GPU resources on restore. The fallback story is also the best page for search engines and screen readers, so it should exist regardless.

### 3.6 Audio autoplay policy (Web Audio)

- Sources (verified): Chrome autoplay policy, https://developer.chrome.com/blog/autoplay ; WebKit iOS media policies, https://webkit.org/blog/6784/new-video-policies-for-ios/ ; for the iOS silent switch, WebKit Bugzilla discussion found through search (https://bugs.webkit.org/show_bug.cgi?id=264473 and https://bugs.webkit.org/show_bug.cgi?id=251532) and https://adactio.com/tags/webaudio (partially verified: read through search summaries, not fetched directly).
- Chrome: since Chrome 71 the policy covers Web Audio. An `AudioContext` created before a user gesture starts "suspended" and needs `resume()` after the gesture; it also resumes if `start()` is called on an attached node after a gesture. Check `ctx.state`. Chrome recommends a play button or on/off switch and suggests relying on `click`.
- WebKit (iOS): playback must start from a handler for `touchend`, `click`, `doubleclick` or `keydown`; only silent or muted media may autoplay; `playsinline` keeps video inline on iPhone.
- iOS silent switch: by default Web Audio follows the ringer switch, so a phone on silent plays nothing. Setting `navigator.audioSession.type = "playback"` (Safari only, available from iOS 17 per a WebKit comment; the API is an Editor's Draft) makes it play. Feature-detect with `"audioSession" in navigator`.
- Pattern for Dawnward: sound off by default with a visible toggle (as now). In the tap handler, create the context if needed, set the audio session type, and call `ctx.resume()` synchronously before any `await` (the current `toggle()` awaits `ensure()` first, which pushes `resume()` past the first microtask; keep the call inside the gesture's own call stack to be safe on Safari). Fade the gain in (already done). Suspend on `visibilitychange` and resume only if the visitor had sound on. Treat any state other than `running` as "sound off" in the toggle's label.

---

## 4. Decisions this supports

- **Engine:** stay on vanilla three.js 0.187 with `WebGLRenderer` and esbuild. Do not adopt React Three Fiber; port its performance patterns (adaptive pixel ratio, regression while moving, render on demand, `visible` toggling, no per-frame allocation). Do not move to `WebGPURenderer` for this release.
- **Scroll input:** move from the custom wheel and touch handler to native document scroll feeding one progress value. Use GSAP ScrollTrigger (free, licence compatible, pin the version and archive the licence) for scrubbed progress, chapter labels and optional snapping to worlds; Motion's `scroll()` is the lighter MIT fallback if snapping is not needed. Use one library only.
- **Camera:** a spline rig (`CatmullRomCurve3` for position and for target, sampled with `getPointAt`), driven by damped progress. No `OrbitControls`, no free orbit on the main path.
- **Pixel ratio:** cap at 1.5 on touch devices and 2 on desktop, step down to 1.0 under sustained load or fast camera motion, restore when settled. Test `antialias: false` on phones.
- **Glow and post-processing:** no bloom pass. Glows are pre-blurred sprite halos (few) and fresnel rims on each world (one extra draw each). Revisit bloom only for desktop, through pmndrs `postprocessing` at reduced resolution with half-float buffers.
- **Stars:** `Points` layers with additive blending, `depthWrite: false`, `depthTest: true`, per-point phase attribute for twinkle in the shader, fog matched to the clear colour.
- **Deep background:** if a volumetric nebula layer is wanted, write an original shader and bake it once to a small texture at load; never ray-march full-screen per frame on phones.
- **Draw-call budget:** under 100 per frame on phones, monitored with `renderer.info`.
- **Reduced motion:** crossfades between fixed framings instead of travel, no parallax, drift or twinkle, all content reachable; an in-page motion toggle; media query read live.
- **Fallback:** `isWebGL2Available()` plus `failIfMajorPerformanceCaveat: true` plus context-loss handling, all leading to a static poster and the full story in HTML.
- **Audio unlock:** sound off by default; in the tap handler set `navigator.audioSession.type = "playback"` when available and call `resume()` synchronously; suspend when the page is hidden.
- **Shadertoy:** technique only. Every shader is written from scratch; no code is pasted from Shadertoy or its ports.
- **Visual differentiation check:** if any section starts to resemble the calm-app baseline (flat phone mockup beside feature copy, light theme), it has drifted to the category default (see 1.3c).
- **Typography in motion:** captions arrive word by word at reading pace with the full sentence exposed to assistive technology; no per-letter splitting.
