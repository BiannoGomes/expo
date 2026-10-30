# Dawnward · The Living Universe

One engine, two products: an interactive cinematic experience and a 60-second film rendered from the same code. Source: `dawnward/experience/`.

## Commands

| Task | Command (from `dawnward/experience/`) |
|---|---|
| Install | `npm install` |
| Build (site + single file) | `npm run build` → `dist/index.html` and `dist/dawnward-universe.html` |
| Develop | `npm run dev` (rebuilds on save), then serve `dist/`: `python3 -m http.server 8770 -d dist` and open `http://127.0.0.1:8770` |
| Visual probe | `node probe.mjs desktop 0.55 1.6 3.0 3.0:mind 4.0 5.0` (also `mobile`, or `film <seconds...>`) |
| Film frames | `node render-film.mjs` (1800 frames, server on :8770) |
| Film audio | `sh film/make-audio.sh` (mix + stems, -14 LUFS) |
| Film encode and cuts | `sh film/encode.sh` |
| QA | `node qa.mjs` (axe accessibility, load weight, frame timing, determinism) |

Deployment preparation: `dist/` is a static site (any static host); `dist/dawnward-universe.html` is fully self-contained. **Nothing is deployed or published without Bianno's approval.**

## 1. Audit (verified 2026-10-30)

| Item | State |
|---|---|
| Real screens | Debrief, Today, Personal Model, Universe and Mind-world captures in `marketing/launch-film/assets` (canon boards for Debrief/Today/You, live captures for Universe/Mind). Recompressed to WebP. |
| World copy | Verbatim from `apps/mobile/app/world/[world].tsx`; world metas from `lib/universe.tsx`. |
| Tokens | Mirror `apps/mobile/lib/theme.ts`; single source in `src/tokens.js`. |
| Planet art | The app's alpha-baked planets (`apps/mobile/assets/universe`). |
| Score | Owner's Suno track "Emotional build" (beat 0.9387 s, swell 15.12 s, climax 33.89 s, accent 54.54 s, measured). |
| Voice | Higgsfield preset "Naomi" lines from the v5 council (`marketing/fx/vo5`). |
| Renderer | Playwright + Chromium 1243 (SwiftShader WebGL), FFmpeg 6.1. Verified. |
| CTA | No store listing or waitlist exists. The only verified next step is the Instagram account @bianno.becoming (connected in Blotato). |
| Not available | ElevenLabs direct API (key has no scopes); real GPU devices (container renders in software). |

## 2. Three concepts

1. **The Living Universe (selected).** A point of light becomes a phone, the phone becomes a window, the window becomes your universe, and the universe returns to a single human sentence. Strength: one continuous physical idea that is literally the product (honest moments accumulate into a picture of you). Risk: 3D cost on phones; mitigated by sprites, no post-processing, DPR caps.
2. **The Observatory.** A static, beautiful planetarium page where each world is a scroll section. Strength: cheap, fast, accessible. Weakness: a gallery, not an experience; no causality between using the app and the universe.
3. **The Night Window.** A first-person bedroom at night; the phone on the nightstand; the room dissolves into stars as you talk. Strength: intimate. Weakness: needs photoreal room footage the engine cannot render deterministically; product shown less.

Critique: concept 2 fails "not a conventional landing page"; concept 3 fails "grounded in the actual product" and determinism. Concept 1 is the only one where every effect carries meaning: the light is a kept moment, the portal is reflection turning into understanding, the worlds are the app's real worlds.

## 3. Treatment

The experience starts in near darkness. One warm point appears and answers the pointer. It becomes the glow of a phone screen: the real evening debrief, a confession typing itself. Morning: the real Today screen; the kept card lifts off the glass and seeds a star. The screen becomes a window: the camera travels through the phone into the universe the app builds. Four worlds wait; the visitor chooses one and the real world screen opens. Then the phone returns, inside the sky, at human scale: "What I understand about you", labelled as demonstration content. The end: Dawnward, become who you are becoming, and the one real next step.

## 4. Story time, chapters and rest points

Story time `s` runs 0 to 5; the same functions drive scroll and film.

| s | Chapter | Picture | Interactive caption | Rest |
|---|---|---|---|---|
| 0 to 0.6 | First light | Darkness, the light forms, gold dust answers the pointer | It begins with one honest moment. | 0.55 |
| 0.6 to 1.4 | The honest minute | Phone emerges from the light; real debrief, confession types | Each evening, Dawnward asks one real question. You talk. It listens. | |
| 1.4 to 1.85 | Morning | Real Today screen; kept card lifts 12 mm; its seed glows | Each morning, three small steps, drawn from your own words. | 1.6 |
| 1.85 to 2.3 | Through the glass | Screen becomes a portal (render target); camera passes through | Nothing you live honestly is lost. | 2.3 |
| 2.3 to 3.0 | Your worlds | Deep stars, the kept star, worlds bloom in sequence | It becomes your universe. Four worlds that change as you do. | 3.0 |
| 3.0 to 4.0 | What it understands | Phone returns inside the sky with the Personal Model | And slowly, it understands you. And shows you why. | 4.0 |
| 4.0 to 5.0 | Become | Universe dims; wordmark, line, CTA | | 5.0 |

## 5. Interaction map

| Input | Effect |
|---|---|
| Scroll wheel / swipe / trackpad | Moves story time; Gravity damping (half-life 0.32 s); settles to the nearest rest point 0.9 s after input stops (never before the first input). |
| Arrow keys, PageUp/PageDown, Space | Previous / next rest point. |
| Chapter nav (dots; labels on desktop) | Jump to a chapter; real buttons, keyboard reachable. |
| Pointer move | Light halo, dust parallax, phone tilt (±5°), camera look offset in the universe. |
| Click the light (s < 0.9) | Begin (go to the phone). |
| Click the phone (1.2 < s < 1.9) | Go through the glass. |
| Click a world or its label (2.75 < s < 3.6) | Focus: camera travels (half-life 0.55 s), sound answers, real world panel opens. Esc or "Back to your sky" returns. |
| Sound chip | Starts muted; first tap unlocks audio inside the gesture. |
| Text version chip / skip link | The entire story as accessible HTML with real screen images and alt text. |
| No WebGL / lost context | Text version shown automatically. |
| prefers-reduced-motion | Damping becomes instant (no camera travel, no glides); live-updated. |

## 6. Motion language

| Family | Used for | Values (src/tokens.js) | Reduced motion |
|---|---|---|---|
| Breath | The light, world halos | 6.4 s period, 6% depth, sine | Static |
| Orbit | Camera at rest, world drift | 48 s camera period, 0.35 radius; worlds 90 s | None |
| Emergence | Phone from the light, worlds blooming, panel rise | 1.4 s ease-out quart, scale from 0.86 | 300 ms fade |
| Gravity | Scroll response, focus travel | half-life 0.32 s / 0.55 s | Instant |
| Revelation | The portal, the return | 2.6 s ease-in-out cubic | Cross-fade |

## 7. Film storyboard (60 s, 1080x1920, cut to the score)

| Time | Story | Picture | Narration and captions |
|---|---|---|---|
| 0 to 5.7 | s 0 to 0.86 | The light forms in darkness | "Ever go to bed not sure how your day really went?" |
| 5.7 to 9.4 | to 1.34 | Phone emerges; debrief types the confession | "Dawnward is a journal you talk to." / "It listens. Night after night." |
| 9.4 to 14.2 | to 1.80 | Today; the kept card lifts; its seed glows | "No streaks. No scores. No guilt." |
| 14.2 to 15.12 | to 2.25 | Through the glass, landing on the swell | |
| 15.12 to 22.6 | to 2.62 | Deep sky, the kept star | "Nothing you live honestly is lost." (text) |
| 21.7 to 30.1 | | Mind blooms; visit Mind, real world panel | |
| 30.1 to 33.9 | to 3.0 | Gathering | |
| 33.89 | | Climax: Body, Soul, Future bloom on successive downbeats | labels |
| 37.6 to 44.2 | | Visit Future: an aspiration, never a prediction | |
| 45.2 to 53.4 | to 4.25 | The phone returns in the sky: What I understand about you (demonstration content) | "And slowly, it understands you. And shows you why." / "Just you, understood." |
| 54.54 | 5.0 | End card on the last accent | "Dawnward. Coming soon." |

## 8. Performance budget

| Budget | Target | Engine |
|---|---|---|
| Initial transfer (site) | under 1.6 MB before audio | about 1.4 MB (JS 575 KB minified, images about 1 MB WebP, fonts 80 KB WOFF2 subsets) |
| Audio | on demand only | 0.84 MB, fetched only when sound is enabled |
| Draw calls | under 100 on phones | about 20 (one portal pass extra during the glass transition) |
| Pixel ratio | phones 1.5, desktop 2, film 1 | as specified |
| Post-processing | none | glow is shader and sprite based |
| Hidden tab | zero GPU | render loop and audio pause |
