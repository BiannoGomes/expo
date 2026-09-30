# Routing: deliverable → skill

Verified inventories as of 2026-09-30. Charlie Hills' repo was 4 days old then (SHA
`4cd156a`), and HyperFrames ships constantly (v0.8.97, SHA `5b79038`). If a named skill
isn't installed, say so and use the fallback. Never pretend a skill ran.

## 1. Pick by deliverable

| Deliverable | Primary | Why | Fallback |
|---|---|---|---|
| Brand system for a new brand | `brand-system` (this plugin), which wraps Charlie's `brand-intake` | Per-brand folders, the 30-field schema and HyperFrames tokens | Charlie's `brand-intake` alone |
| Turn a rough idea into a build brief | `studio` brief template + Charlie's `motion-brief-writer` for the build prompt | His skill writes a strong 4-state prompt; ours adds ship target, facts and storyboard | `templates/brief.md` |
| 30–45 s product launch (UnifyOps AI front desk) | Charlie's `launch-video` | 7-beat sheet, real screens, CTA hold ≥3 s | HyperFrames `product-launch-video` |
| Apple-style Mac UI launch film | Charlie's `apple-launch-film` + Emil's `apple-design` | Springs, notch widgets | HyperFrames `general-video` |
| 30–60 s documentary explainer | Charlie's `vox-explainer` | Facts-first, sources per shot | HyperFrames `faceless-explainer` |
| Explainer from text, no footage | HyperFrames `faceless-explainer` | Invents visuals per scene, with TTS and captions | Charlie's `vox-explainer` |
| Animated chart / stat | Charlie's `animated-chart` | "Never round, reformat or add a number" | HyperFrames `motion-graphics` |
| Milestone number reveal | Charlie's `milestone-reveal` | "No source, no clip" | HyperFrames `motion-graphics` |
| One premium UI or kinetic-type effect (16 recipes) | Charlie's `motion-effects` | A seekable 8 s loop | HyperFrames `motion-graphics` |
| Short kinetic-type reel, logo sting, lower-third, title card | HyperFrames `motion-graphics` | Short and motion-first, native renderer | Charlie's `motion-effects` |
| Cinematic 3D opener | Charlie's `title-sequence-3d` (Three.js) | Dolly through a lit scene | HyperFrames `general-video` + `hyperframes-keyframes` |
| Compare 3 AI models | Charlie's `model-showdown` | First-try fairness, stacked reel | none |
| Newsletter / book / offer promo (12–20 s) | Charlie's `newsletter-promo` | Hook → 3 proofs → end card | HyperFrames `general-video` |
| Looping cover GIF (inbox) | Charlie's `loop-cover` (ffmpeg, 20 fps) | Measured seam | HyperFrames `render --format gif` |
| Make an existing video a Reel/TikTok | Charlie's `reel-export` | Safe zone, bt709, ffprobe | `format-adapt` rules in `motion-review` |
| Longer multi-scene brand piece, sizzle, montage | HyperFrames `general-video` | Freeform, multi-scene | none |
| Beat-synced lyric / kinetic promo from a track | HyperFrames `music-to-video` | Music drives the pacing | none |
| Captions on a talking-head video | HyperFrames `embedded-captions` | 35 styles, runs locally | `auto-editor` SRT |
| Overlays on an existing talking-head video | HyperFrames `talking-head-recut` | Kinetic titles, lower-thirds, callouts | none |
| **Edit a real talking take** (the Creator Stack method) | **`edit-kit`** (this plugin) | Whisper word timings + names glossary, frames, beat sheet, word-boundary rough cut with remapped timings, word-synced captions, verified HyperFrames scaffold | HyperFrames `talking-head-recut` / `embedded-captions` |
| Becoming Project reel, carousel, cover, template | Bianno's **`becoming-video`** (the vault pipeline leads) | Its brief, gates and approval flow. Uses `edit-kit` + `motion-review` as tools. | – |
| Cut raw talking-head footage (no captions needed) | `auto-editor` (free) | Silence and dead-air cuts, NLE export | `video-use` (ElevenLabs key) |
| Long-form → shorts with speaker tracking | `clipify` | Crop follows the speaker | none |
| Figma design → motion | HyperFrames `figma` | Brand tokens, components | none |
| Pitch deck as an interactive HTML deck | HyperFrames `slideshow` (confirm first: output is a deck, not an MP4) | | `slide-deck-builder` |
| UnifyMind Instagram carousel (static) | Bianno's `content-wave` | The proven, published brand system | Canva connector |
| Social captions / hooks / post copy | Bianno's `social-content` → `content-humanizer` | His voice rules | none |
| Break down someone else's reel | Bianno's `video-teardown` | Frame-by-frame with a transcript | `review-frames` on a downloaded file |
| Static poster / art | `canvas-design` | | Canva connector |
| Vector animation for the web (Lottie) | `diffusionstudio/lottie` | | none |
| Motion in a React Native / Expo app | Emil's `animate-expo` | Reanimated, gestures, haptics | Emil's `animate` |

## 2. Craft layers (use during build and review, not as the engine)

| Need | Skill |
|---|---|
| Is this motion right? (review a diff or a composition) | Emil's `review-animations` (user-invoked, strict: "approval is earned") |
| Build web motion from scratch in the right decision order | Emil's `animate` |
| Physical, interruptible, Apple-grade feel | Emil's `apple-design` |
| Name the effect you're describing | Emil's `animation-vocabulary` |
| Where should something move, and where shouldn't it | Emil's `find-animation-opportunities` |
| Audit all motion in a codebase | Emil's `improve-animations` |
| Try 3 variants side by side | Emil's `prototype` (user-invoked) |
| HyperFrames motion rules, transitions, 7 runtime adapters | HyperFrames `hyperframes-animation` |
| Camera moves, punch-ins, Ken Burns, masks, SVG draw | HyperFrames `hyperframes-keyframes` |
| Palettes, typography, beat planning inside HyperFrames | HyperFrames `hyperframes-creative`, which reads our generated `frame.md` |
| Resolve music, SFX, image, voice or LUT into a local file | HyperFrames `media-use` (check licences against `medium-router.md` §2) |
| Mix audio: ducking, fades, EQ | HyperFrames `hyperframes-audio` |
| CLI loop: lint / check / preview / render | HyperFrames `hyperframes-cli` |
| Design critique of a static HTML frame | `impeccable` (optional; installs edit hooks) |

## 3. Collision rules

1. **Director first.** `studio` always runs before HyperFrames' `hyperframes` router, even
   though HyperFrames calls itself mandatory. Once the brief exists, load `hyperframes` for the build.
2. **Brand wins.** Where Charlie's skill, HyperFrames or Emil prescribes a value that
   contradicts the brand's `MOTION.md`, the brand wins. Where they contradict the house rules
   and the brand says nothing, the house rules win.
3. **Known contradictions in Charlie's pack** (as of `4cd156a`):
   - It bans "glow" globally, yet `title-sequence-3d` uses bloom and `loop-cover` offers a glow → **no glow** unless the brand allows it.
   - It bans typewriter text, yet `motion-effects` #02 and `launch-video` type into input boxes → typing is allowed **only inside a real product input box**.
   - `title-sequence-3d` contains review rules copy-pasted from vox ("every shot uses cards") → ignore them for 3D openers.
   - His export steps say `npx hyperframes render` on bare `window.seek()` pages. That **fails** on the current CLI, so use the bridge (`hyperframes-bridge.md`).
4. **HyperFrames' brand input** is `frame.md` → `design.md` → `DESIGN.md`. `activate-brand` writes
   `frame.md`, so HyperFrames and Charlie's skills read the same brand.
5. **Twin workflows.** When Charlie and HyperFrames both cover a deliverable, prefer Charlie
   for **fact-heavy or proof-heavy** pieces (his rules are stricter), and HyperFrames for
   **long, narrated, captioned or footage-based** pieces (its pipeline is deeper).
