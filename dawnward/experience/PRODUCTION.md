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
| Film audio | `sh film/make-audio.sh` (effects stem, mix + stems, -14 LUFS) |
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

The experience starts in near darkness. One warm point appears and answers the pointer. It becomes the glow of a phone screen: the real evening debrief, and a confession typing itself: "Snapped at my sister again. Don't know why." Morning: the real Today screen, where that confession has become one small step, "Call your sister. Just to talk.", which lifts off the glass and keeps a seed of light. The screen becomes a window and the camera travels through it into the universe the app builds. The four worlds bloom as they are named. Soul, where "the people who matter live", holds the same step. Then, on the climax of the score, the phone returns inside the sky with what the app has come to understand: "You get sharp with the people closest when you're running on empty", with its reason in the server's own words ("I have seen this in your days 3 times now") and the real "That's not right" control, which sets the insight aside exactly as the app does. All of it is labelled as demonstration content. The end: Dawnward, become who you are becoming, @bianno.becoming, and the one real next step.

One thread runs through every screen (confession, step, world, insight), so the strongest moment is being understood, not the planets.

## 4. Story time, chapters and rest points

Story time `s` runs 0 to 5; the same functions drive scroll and film.

| s | Chapter | Picture | Interactive caption | Rest |
|---|---|---|---|---|
| 0 to 0.86 | First light | Darkness, the light forms, gold dust answers the pointer | It begins with one honest moment. | 0.55 |
| 0.86 to 1.4 | Evening debrief | Phone emerges; reading push onto the real debrief; the confession types | Each evening, Dawnward asks one real question. You talk. It listens. | 1.2 |
| 1.4 to 1.85 | Morning plan | Real Today screen; the sister step lifts 12 mm and keeps a seed of light | Each morning, three small steps, drawn from your own words. | 1.62 |
| 1.85 to 2.6 | Through the glass | Screen becomes a portal (render target); the frame thins away; camera passes through | Nothing you live honestly is lost. | 2.4 |
| 2.6 to 3.4 | Your worlds | Deep stars, the kept star, the four worlds; click one to visit | Your days become four worlds. Mind, body, soul and future. (top of the screen on desktop) | 3.0 |
| 3.4 to 4.6 | What it understands | Phone returns in the sky; push onto the Personal Model insight | Slowly, it understands you, and shows you why. When it's wrong, you tell it. Private. Never sold. | 4.3 |
| 4.6 to 5.0 | Follow the build | Universe dims; wordmark, line, handle, CTA | | 5.0 |

Screen truth: corrections drawn in code on the shipped captures (`buildScreens()`): the tab bar reads Today / Debrief / Universe as shipped, the greeting has no name, the third Today step and the Personal Model card carry the story's thread. All personal content is labelled "Demonstration content".

## 5. Interaction map

| Input | Effect |
|---|---|
| Scroll wheel / swipe / trackpad | Moves story time through a critically damped spring (omega 7, top speed 1.8 story units a second), so travel eases in and out; settles to the nearest rest point 0.9 s after input stops (never before the first input). Pinch zoom stays available. Real time is kept down to 10 fps. |
| Arrow keys, PageUp/PageDown, Space | Previous / next rest point. Space on a focused control activates that control instead. |
| Chapter nav (7 dots; labels on desktop) | Jump to a chapter; real buttons with `aria-current`, 30 px targets on phones. A jump of more than one chapter cuts with a 200 ms cross-fade instead of flying through. Hidden while a world is open. |
| Pointer move | Light halo, dust parallax, phone tilt (±5°), camera look offset in the universe. |
| Click the light / the debrief | Next chapter. |
| Click the lifted step (1.45 < s < 1.9) | Go through the glass. |
| Click a world or its label (2.75 < s < 3.6) | Focus: camera travels (half-life 0.55 s), sound answers, the world dialog opens in the app's order: its copy, "What I understand so far" with the belief and its reason, a working "That's not right" that answers with the app's own reply, then today's move and its reason. Focus moves to the dialog title; Esc or "Back to your sky" returns focus to the world's label. |
| Sound chip | Starts muted; first tap unlocks audio inside the gesture. |
| Text version chip / skip link (visible on focus) | The entire story as accessible HTML. Everything behind it becomes inert and stops rendering; Esc closes it and returns focus. |
| Screen readers | Captions are announced once they have stayed for 600 ms, from a separate live region, so scrubbing never floods. Hidden panels and end card are inert. |
| No WebGL / lost context | Text version shown automatically. |
| prefers-reduced-motion | No travel: one gesture or key steps one chapter with a 200 ms cross-fade; no orbit, breath, twinkle or parallax; live-updated. |

## 6. Motion language

| Family | Used for | Values (src/tokens.js) | Reduced motion |
|---|---|---|---|
| Breath | The light, world halos | 6.4 s period, 6% depth, sine | Static |
| Orbit | Camera at rest, world drift | 48 s camera period, 0.35 radius; worlds 90 s | None |
| Emergence | Phone from the light, worlds blooming, panel rise | 1.4 s ease-out quart, scale from 0.86 | 200 ms fade |
| Gravity | Scroll response, focus travel, the reading push | half-life 0.32 s / 0.55 s | Instant (cross-fade step) |
| Revelation | The portal, the return | 2.6 s ease-in-out cubic | Cross-fade |

Camera continuity: the gaze leaves the glass smoothly (look target eased from the phone to the sky), the post-glass segment starts at the push's speed, the portrait offset eases out before the crossing, and the sky is drawn directly the moment the camera is behind the glass.

## 7. Film storyboard (60 s, 1080x1920, cut to the score)

| Time | Story | Picture | Narration (= captions, on a plate at y 270) |
|---|---|---|---|
| 0 to 1.4 | s 0.74 to 1.0 | The phone forming out of the light, pushing in | "Ever go to bed not sure how your day really went?" (0.5) |
| 1.4 to 4.4 | to 1.18 | Debrief, readable: the confession types (keys tick) | "Dawnward is a journal you talk to." (4.1) |
| 4.8 to 7.8 | to 1.56 | Morning arrives; push onto the sister step; it lifts | "Every morning, three small steps. Drawn from your own words." (6.75) |
| 7.8 to 14.0 | to 1.78 | The step keeps a seed of light | "No streaks. No scores. No guilt." (11.25) |
| 14.0 to 15.12 | to 2.25 | Through the glass, landing on the swell | |
| 15.4 to 18.1 | | The sky opens, worlds waiting dim | "Nothing you live honestly is lost." |
| 18.4 to 25.4 | to 3.0 | Each world blooms on its spoken name (21.65, 22.77, 23.68, 24.75, measured from the narration), a chime each; labels never overlap | "Your days become four worlds. Mind, body, soul, and future." |
| 25.3 to 32.7 | | Visit Soul: world above, panel below; today's move is the sister call | "The people who matter live in Soul." (27.3) |
| 31.0 to 33.89 | to 3.9 | The phone returns, arriving on the climax | |
| 33.6 to 44 | to 4.32 | Push until the insight card fills 80% of the width; the rest veiled | "Slowly, it understands you. And shows you why." / "And when it's wrong, you can tell it." (38.6; the control answers at 40.1 and the card is set aside at your word, as in the app) / "Private. Never sold." (42.2) |
| 44 to 51.7 | to 4.9 | Pull back; the phone leaves; the universe dims | "Just you, understood." (45.2) |
| 51.73 | 5.0 | End card on a downbeat: wordmark and line; the handle, CTA and status arrive on the accent (54.54) | "Dawnward. Coming soon." (52.3) |

Cuts (`film/encode.sh`, 120 ms audio fades at each joint; every cut holds the CTA for at least 2 s): 30 s (0.4 to 15.35, 33.5 to 41.4, 51.6 to 57.6); hooks: honest minute (0.4 to 3.95, 6.65 to 15.35, 53.9 to 57.5; 15.8 s), four worlds (18.3 to 30.4, 54 to 57.5; 15.6 s), understood (33.5 to 44.6, 53.9 to 57.5; 14.7 s). Posters at 3, 8.5, 16.6, 27.5, 37.5, 41.6, 55.5 s.

Mix: score bed lifted 8 dB under the opening and 4 dB to 29 s (eased under the longest lines), and through the quiet before the end card; sidechain ratio 6 under the voice; every line 6 to 16 dB over the music (measured per line, the lowest on the climax); dialogue limited to -1.5 dBFS; effects stem audible but under the music (world chimes about level with it); master -14 LUFS, -1.2 dBTP. Stems: dialogue, music, effects.

## 8. Performance budget

| Budget | Target | Engine |
|---|---|---|
| Initial transfer (site) | under 1.6 MB before audio | about 1.4 MB (JS 575 KB minified, images about 1 MB WebP, fonts 80 KB WOFF2 subsets) |
| Audio | on demand only | 0.84 MB, fetched only when sound is enabled |
| Draw calls | under 100 on phones | about 20 (one portal pass extra during the glass transition; the portal target is full size only around the crossing) |
| Pixel ratio | phones 1.5, desktop 2, film 1 | as specified |
| Post-processing | none | glow is shader and sprite based |
| Hidden tab | zero GPU | render loop and audio pause |
