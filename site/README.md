# PHASE — realtime studio site

A single-file, dependency-free website built as an answer to the Active Theory
reference in `instagram.com/reel/DZ6RKjtxbvk` (@jerrythewebdev). Where the
reference cross-fades between flat textured planes, this renders one continuous
**raymarched signed-distance field** that morphs between five solid forms.

Open `index.html` in a browser. That is the whole build step.

## What's in it

| | |
|---|---|
| Dependencies | none — no three.js, no bundler, no webfonts, no images, no video |
| Size | one file, ~35 KB |
| Renderer | hand-written WebGL2 + GLSL ES 3.00 |
| Passes | raymarched SDF (fullscreen triangle) → additive particle swarm |

Every pixel is generated at runtime. Nothing on the page is a bitmap.

## The technique

**Morphing geometry.** Five SDF primitives — a displaced sphere, a tilted torus,
a gyroid lattice clipped to a sphere, an octahedron, a rounded box — blended by
`mix()` on a continuous `uMorph` value. Because the blend happens in *distance*
space rather than screen space, the geometry genuinely becomes the next shape;
there is no cross-fade.

**Material.** Thin-film interference driven by fresnel and surface normal, RGB
split into three refraction rays at different IORs for chromatic dispersion,
plus an fbm subsurface term so the core carries light where fresnel gives none.
Ambient occlusion is derived from raymarch step count.

**Transitions.** Selecting a work ramps `uShatter`, which injects fbm
displacement into the distance field and detonates the particle swarm outward.
It decays over ~0.7 s as the new form resolves.

**Particles.** ~9,000 `gl.POINTS` (3,500 on small screens). Each vertex hashes
its ID to a point on a sphere, then runs six steps of gradient descent onto the
isosurface *in the vertex shader* — so the swarm tracks the morphing geometry
without any CPU work or buffer uploads.

## Performance

Raymarching is fill-rate bound, so the canvas renders at 62–78% of CSS
resolution and upscales. A frame-time monitor adapts that scale between 0.5×
and 1.0× to hold frame rate — the live FPS readout in the header is the real
measured value.

Verified in headless Chromium on SwiftShader (pure software rasterization, the
worst realistic case): 20–30 FPS. Any real GPU has enormous headroom.

## Behaviour

- **Scroll / ↑ ↓ / ← → / click the index** — change work
- **Drag** — orbit
- **Filter field** — matches title, client, discipline, and tags; jumps to the first hit
- Auto-advances when idle; pauses once you interact

## Fallbacks

- `prefers-reduced-motion` — freezes rotation, morph noise, and the shatter; the form renders static
- No WebGL2 — the canvas is removed and an animated CSS gradient takes over; all content and navigation still work
- Responsive to 390 px, where the index becomes a horizontal scroller

## Content

The studio, the five projects, and their clients are **fictional placeholders**
written to demonstrate the layout. Replace the `WORKS` array and the `PHASE`
brand strings in `index.html` before this goes anywhere public.
