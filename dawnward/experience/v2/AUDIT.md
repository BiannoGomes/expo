# Living Universe 2.0: Phase 0 audit

Date 2026-10-30. Read-only audit; nothing modified. Rollback point: commit `59a56c31` on `claude/becoming-product-brief-45v3ua` (Living Universe 1.0, its film, the Remotion proof).

## Reproduced test suite (`dawnward/experience/qa.mjs`)
| Check | Result now |
|---|---|
| axe-core at 5 states | 0 violations in all five |
| Film determinism (5 timestamps) | identical |
| First load | 1.41 MB, 17 requests, audio not loaded |
| Frame time, 390x844, 4x CPU throttle, software GL | 17 / 67 / 133 / 150 ms medians (light / hub / phone close / insight). Software rendering: upper bounds, not device numbers. |
| Reduced motion | one chapter per gesture |

## What is real and what is not
| Area | Status | Evidence |
|---|---|---|
| Evening debrief (talk or type) | Implemented | `apps/mobile/app/(tabs)/debrief.tsx`, `server/src/index.ts` POST /debrief, /transcribe (voice needs ElevenLabs key) |
| Today: three steps (train, build, experience) | Implemented; generation runs on a deterministic mock until an Anthropic key exists | `(tabs)/index.tsx`, `server/src/jobs/nightly.ts`, `intelligence/mock.ts` |
| Personal Model with reasons and dispute | Implemented | `(tabs)/you.tsx`, `routes/assertions.ts` (POST dispute), `model/voice.ts` |
| Four worlds | Implemented (2D, React Native Animated + SVG) | `(tabs)/universe.tsx`, `app/world/[world].tsx`, `lib/universe.tsx` |
| Constellation of moments | Implemented, read-only: one star per real record, weight from the strongest insight citing it; max 72; no text, no links | `routes/constellation.ts`, `lib/constellation.tsx` |
| Links between memories ("why are these connected") | Not implemented | no route or table |
| Correct or reject a connection | Not implemented | |
| Remove a single memory | Not implemented (only full account deletion) | `routes/account.ts` DELETE /account |
| Disable visualisation or personalisation | Not implemented as a setting | `app/settings.tsx` has no such toggle |
| Export of all data | Implemented | GET /export |
| Body world "self-reported wellbeing, recovery" | Not implemented as data; Body holds what debriefs mention | world copy in `world/[world].tsx` |
| Future "milestones" | Partly: aspirations (future self) and campaigns exist; no milestone object | `routes/account.ts` /future-self, `routes/campaign.ts` |

Consequence: the Memory Constellation in 2.0 can show real-shaped stars (date, world, weight), but connections, per-memory removal and the personalisation switch must be a clearly labelled prototype with synthetic data until the server supports them.

## Renderer capacity
- Web experience: three.js 0.187, one portal pass, sprite planets, no post-processing; about 20 draw calls. Room exists for: per-world shaders on 2 to 3 layers, an atmosphere rim shader, selective bloom only on the light and the kept star (a cheap additive pass), instanced constellation stars (thousands is cheap).
- Native app: Expo 54 / React Native 0.81 with Animated and react-native-svg only. No GL. A 3D universe in the app would mean adding expo-gl/three or Skia: an architecture change that needs device testing this container cannot do.
- Film: two pipelines exist (the engine film via Playwright, and Remotion 4.0.533). Higgsfield video shots composite best in Remotion.

## Tools
- Higgsfield: 357 credits (Ultra). Kling 4.0, 1080p, 5 s, image-to-video: 16.25 credits a shot. Gemini Omni Flash 1.1, 1080p, 5 s: 22.5. Seedance 2.5, 1080p, 5 s: 80 (480p draft 15). Keyframe stills (gpt_image_2_5) are cheap.
- "Fable": the Fable motion-design app (fable.app) is a hosted editor with no CLI here, so it cannot be driven from this environment. Claude Fable 5.1 is available as a model for design subagents. The motion system will be built in code (tokens shared by three.js, CSS and Remotion), which is exportable and testable.
- Devices: no real iPhone, Android or integrated-GPU desktop here. Performance will be measured in software GL plus a budget, and device testing is listed as an owner step.

## Dependency map
```
apps/mobile (Expo)  <-- the real product; screens captured into --> experience/assets/img
server (Fastify, Postgres)  --> /constellation, /assertions, /plan, /debrief
experience (three.js, esbuild)  --> dist/ (site), dist/dawnward-universe.html
   uses: src/tokens.js, src/main.js (engine), src/film.js (engine film), src/sound.js
experience film pipeline: render-film.mjs (Playwright) --> film/encode.sh --> film/out
marketing/remotion (Remotion 4.0.533) --> out/ (proof; flagship after approval)
marketing/fx (VO lines, SFX), marketing/launch-film/audio/suno (score)
Higgsfield (credits) --> new cinematic shots --> marketing/remotion/public/shots
```

## Risk register
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Generated planet shots drift in identity between shots | High | High | Lock each world with one approved keyframe still; image-to-video from it; short shots; composite in Remotion |
| Spectacle buries the product (previous reviews) | High | High | Every world shot hands off to a real UI moment within 3 s; product comprehension is a scored gate |
| Prototype features read as shipped | Medium | High | "Prototype, sample data" label on every constellation-connection surface; claims ledger |
| Mobile GPU cost of new shaders | Medium | High | Quality tiers (low/medium/high) chosen by a 2-second frame probe; budgets before effects |
| Untestable device performance | Certain | Medium | Report software numbers as upper bounds; owner device test list |
| Credits run out mid-shoot | Medium | Medium | 3-shot test first; budget cap per phase |
| Licence: Suno, Higgsfield output, Remotion | Medium | Medium | Ledger; owner confirms plan terms before paid media |
| Scope: 9 phases in one pass | High | Medium | Ship in three approved slices (below) |

## Proposed slices
1. **Universe 2.0 core (web):** per-world identity (shader rim light, atmosphere, silhouette, sound, camera behaviour), glass panels, orbital navigation with interruptible travel, quality tiers, motion tokens. Gate: QA suite plus new perf budget.
2. **Memory Constellation:** real-shaped stars (from the /constellation contract) plus a labelled prototype of connections, inspect why, reject, remove, and switch off, on synthetic data; accessible list view.
3. **Cinematic assets and films:** Higgsfield keyframes then shots (universe birth, four worlds, fly-throughs, dawn horizon), composited with real UI in Remotion into the 60 s, 30 s, three 15 s hooks, captioned and clean versions, stems, EDL and manifest.
