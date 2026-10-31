# Immersive Intelligence Engine: audit, architecture, prototypes and quality gates

Date: 2026-10-31.

This answers the "Immersive Intelligence Engine" directive (missions 1 to 8). The rule throughout: the universe is a presentation layer. Reflections, beliefs and their evidence live in the server, and every view, from a plain list to a headset, renders the same data.

## Status at a glance

- **Built and tested in a browser:**
  - **Prototype A:** enter Mind, keep one thought, watch it become a star, and go back.
  - **Prototype B:** a Memory Galaxy with explained links, a list mode, correction and leave out.
  - **Prototype C:** the same galaxy in 3D, with a WebXR entry point.
  - Pausing personalization.
- **Not tested:**
  - a real phone or headset;
  - VoiceOver or TalkBack;
  - the real AI model (tests use the deterministic test double);
  - thermal or memory behaviour.
- **No new packages.** D5 is still pending. Prototype C uses the WebXR support already inside three.js 0.187.
- **Nothing was deployed or published.**

## Mission 1. Audit delta (since `docs/master-plan/`, the same day)

| Area | Now | Gap |
|---|---|---|
| Memory and personalization | Personal Model with cited evidence; quotes checked word for word on steps and questions; Your evenings; leave out and bring back; **pause personalization (new)** | No conversational memory inside the debrief; no "ask your evenings" |
| 3D and animation | Web: vanilla three.js r187, a deterministic camera rig, 0 axe violations. App: RN `Animated` plus react-native-svg. **New:** an SVG galaxy in the app and a three.js plus WebXR galaxy page | Travel isn't reversible (D7); the app has no GPU canvas (Skia needs D5) |
| Performance | Web baseline in `experience/review/QA-REPORT.md` (SwiftShader only). The galaxy page bundle is 543 KB, mostly three.js. | No device numbers (D6) |
| Accessibility | The galaxy has a full list mode, 44 pt hit targets on every star, and live-region announcements; step cards are checkboxes | Minor: the Universe planets drift slightly, with no pause control (see "Failed tests") |
| Privacy | Read-time exclusion; export includes left-out evenings; deletion cascades; pause adds an automatic leave-out | Prototype C passes the session token in a URL fragment (see risks) |

## Mission 2. Experience architecture: one state, three presentations

```
server (Postgres): records ─ assertions ─ assertion_evidence ─ record_exclusions
                         │
                 GET /galaxy?world=  ← the only contract the views share
        ┌────────────────┼─────────────────────────┐
  1. Accessible list     2. Spatial (phone)          3. Immersive (desktop / WebXR)
  app list mode, and     app MemoryGalaxy (SVG)      experience/galaxy.html (three.js)
  the list beside C      inside each world           VR offered only where supported
```

**What the galaxy feed returns:**
- `stars`: real reflections only, oldest first, as whole-word excerpts. Left-out evenings never appear.
- `themes`: active beliefs resting on at least one shown evening. Each carries:
  - `why`, worded from what's on screen, such as "Seen in 7 of your evenings, across 4 days.";
  - `forming` when there's only one evening or the belief is still a guess.
- `links`: two evenings of the same theme in date order. Each link carries its `themeId`, so a line on screen is always explained by a belief.

**Progressive enhancement:** without WebGL, the 3D page is its list. Without WebXR, the VR button says so. Without motion (Reduce Motion), the star appears without the birth animation and the 3D view doesn't drift. None of it needs audio.

## Mission 3. The four worlds

| World | Life areas (server `WORLD_DOMAINS`, matching `apps/mobile/lib/universe.tsx`) | What it shows |
|---|---|---|
| Mind | mental, career, creativity, wealth | Thoughts kept here, plus beliefs in these areas |
| Body | physical, adventure | The same, for routines and energy. No Health data until there's a consent design (F8). |
| Soul | meaning, emotional, character, relationships | The same |
| Future | legacy, environment, plus the Future Self card | The same; aspirations stay labelled "never a prediction" |

A thought kept inside a world is placed in that world straight away, because the person chose to put it there. It can show in other worlds too once it's understood.

## Mission 4. Memory Galaxy controls

| Requirement | How |
|---|---|
| Inspect memories | Tap a star, or use its list row: the date, the person's own words, and what it supports |
| Explore the timeline | Oldest on the left; "Read in full" opens Your evenings with search |
| Review connections | Tap a belief: its confidence in words, its why, and every evening behind it |
| Correct interpretations | "That's not right" on the belief |
| Delete information | Leave the evening out (reversible, with undo), or delete the account in Settings |
| Disable personalization | Settings, "Learn from my evenings". While off, new evenings are kept but left out, and mornings stop drawing on what was learned. |
| Never state interpretations as fact | Beliefs show "A guess", "Probably true" or "Well established", or "Still forming" |

## Mission 5. Transformation loop: designed, not built

**REFLECT → UNDERSTAND → CHOOSE → ACT → REVIEW**

1. **Reflect:** the evening debrief, or one thought in a world (built).
2. **Understand:** a belief in the galaxy with its evenings (built).
3. **Choose:** "Try something for a week" on a belief. The person writes or picks one small experiment.
4. **Act:** the experiment appears as a morning step. Its `because` is the belief, and its quote is the evening it came from.
5. **Review:** after 7 days, the evening question asks what changed and cites the evenings from that week. The answer is stored in the person's own words, never as a score.

**Data:**

```sql
experiments(id, user_id, assertion_id, action, starts_on, ends_on,
            status in (active, done, dropped), review_record_id)
```

**What to measure:** the share of experiments that reach a review, and whether the review says something changed. Never time spent in the app, and never streaks.

**Why it isn't built:** the directive says not to expand before the prototypes are validated on devices.

## Mission 6. Toolchain, verified

| Tool | Status here | Used? |
|---|---|---|
| Claude Code | Available | Yes: architecture, code, tests |
| Fable | No CLI or app in this environment (`CLAUDE.md`) | No |
| Higgsfield | Available with credits | No. Generated video can't stand in for working UI, and credits cost money (needs approval). |
| GetLayers | Unreachable from this network; licence unknown | No |
| 21st.dev | No blanket licence; each component needs its own check | No |
| React Three Fiber, Drei, UIKit, XR, Theatre.js, maath | Not installed. They need D5. Licences must be read from each repo before any install. | No |
| `postprocessing` | Blocked: its peer range excludes three 0.187 (see `docs/master-plan/02`) | No |
| three.js WebGPU | Not benchmarked. Measure on devices before assuming it's faster. | No |

**The recommendation stands:**
- Keep vanilla three.js on the web, where it already has a working engine with 0 axe violations.
- Keep SVG, and later Skia, in the app.
- Consider React Three Fiber only for a new desktop or XR surface, after a benchmark and D5.

## Mission 7. Prototypes: criteria and results

The criteria were written together with the build, not in advance, so treat these as first gates. Results come from `test/e2e-galaxy.cjs` (`test/results-2026-10-31.json`), run in headless Chromium against the web builds with the test AI.

### A. Enter Mind and record a reflection

| Criterion | Result |
|---|---|
| Mind reachable from the Universe | Pass (1.9 s including travel; web build, test AI) |
| One thought becomes a star in Mind | Pass. "Kept. It's a star now." appears 0.44 to 0.49 s after Keep with the test AI. **The real model adds safety triage and extraction time, which isn't measured.** |
| The new star is selected and labelled "A new star" | Pass |
| A crisis keeps the words and shows the crisis reply | Built, not covered by the browser test (the server crisis path is covered) |
| Reduce Motion: same path, no animation required | Pass |
| Route back to the sky | Pass |
| Failure keeps the thought | Built ("That didn't reach me. Your thought is still here."); not in this run |

### B. Memory Galaxy

| Criterion | Result |
|---|---|
| Every star is a real evening | Pass: 11 star buttons match 11 API stars |
| Every line is explained | Pass: 6 lines, each from a theme. The belief panel lists all 7 evenings behind it. |
| Interpretations shown as uncertain | Pass: "Still forming" |
| Correction offered | Pass: "That's not right" |
| Leave out from the galaxy, then undo | Pass: one star removed, then restored |
| List mode shows the same content | Pass: 12 rows (1 belief and 11 evenings) |

### C. The same data in WebXR

| Criterion | Result |
|---|---|
| Sample data is labelled as invented | Pass |
| Real data matches the API exactly | Pass: 11 of 11 evenings, 1 of 1 belief |
| The token is removed from the address bar on load | Pass |
| Selecting from the list or the canvas updates the panel and the 3D highlight | Pass (list); canvas raycast built |
| No WebXR: honest fallback | Pass: "VR NOT SUPPORTED" |
| An immersive session in a headset | **Not tested.** There's no headset here. Quest and Vision Pro both need a real-device pass. |
| Phone width has no sideways scroll | Pass |
| Frame time | Median 16.7 ms and p95 16.7 ms, but **only because headless Chromium caps at 60 fps on SwiftShader. Not a device number.** |

## Mission 8. Quality gates

| Gate | Measured here | Still needed |
|---|---|---|
| Startup and interaction latency | Web build with the test AI: enter world 1.9 s; keep to star under 0.5 s | Real model, real phones (D6) |
| Frame-time consistency | Headless only (capped) | Two devices; set budgets from those baselines |
| Memory and thermal | Not measured | Device profiling |
| Accessibility | List mode, labels, 44 pt targets, live regions; contrast checked on the new screens in the earlier round | VoiceOver and TalkBack |
| Motion comfort | Yaw capped at ±0.45 rad with a fixed star field; no drift under Reduce Motion | Comfort ratings in a headset |
| Navigation predictability | Route back tested | Edge-swipe and Android back on devices |
| Data integrity | 40 server integration tests, including galaxy parity, exclusion and pause | – |
| AI factual grounding | Quotes checked word for word; links only from cited evidence | Evaluate with the real model |
| User control and privacy | Leave out, undo, pause, dispute, export, delete | Review the privacy policy against the processors used |
| Task completion and comprehension | Not measured | Moderated sessions with five people |

## Failed tests and findings

1. **Drifting planets: low risk, test-only failure.**
   - The Universe planets drift 6 px over 16 s (`lib/universe.tsx`, `Drift`), about 0.4 px a second.
   - That's enough to fail the browser tool's strict stillness check, so the test forces the click.
   - It's too small to get in the way of a finger, including for people with tremor.
   - Strictly, WCAG 2.2.2 asks for a way to pause motion lasting more than 5 s. Reduce Motion already stops it.
   - **Optional fix:** stop the drift while a finger is down.
2. **React #419** on the first load of the web build. It was already there before this work and is still open.
3. **The "why" contradicted the evidence.** It said "I noticed this in one of your days" above seven listed evenings. **Fixed:** it's now counted from what's shown.
4. **Grammar:** "1 things they support". **Fixed.**
5. **Prototype C passes the token in the URL fragment.** It's read once and removed straight away. **Before any release:** replace it with a short-lived, one-time code from the app.
6. **`build.mjs --watch`** rebuilds the main experience but not the galaxy page.
7. **Test data repeats.** Repeated runs in the demo database left duplicate evenings ("fixed the bike" three times). It's demo data only, but it shows the galaxy has no duplicate grouping.

## The 12 experiences: honest status

| # | Experience | Status |
|---|---|---|
| 01 | Living universe | Exists: app Universe and the web experience |
| 02 | Memory galaxy | **Prototype built** (B, C) |
| 03 | AI reflection companion | Partial: replies and steps cite real words; no memory inside the debrief |
| 04 | Future self simulator | Partial: the Future Self narrative; no path simulation |
| 05 | Spatial glass interfaces | Partial: web glass UI; app panels |
| 06 | Daily dawn ritual | Exists: morning steps and the question. Its 60 to 90 s length isn't measured. |
| 07 | Living patterns | **Built**: explainable themes with their evenings |
| 08 | Adaptive soundscapes | Web experience only; the app has no sound by design (visual system) |
| 09 | Life timeline | Partial: the galaxy is ordered by time, plus Your evenings |
| 10 | Mixed-reality mode | **Prototype C**; untested in a headset |
| 11 | Transformation loop | Designed (Mission 5), not built |
| 12 | Evolving personal universe | Partial: stars come only from real evenings |

## Files

**Server:**
- `server/src/routes/galaxy.ts`
- `server/migrations/0007_personalization.sql`
- the `/debrief` `world` field, and the pause logic in `server/src/index.ts`
- `/me` personalization in `server/src/routes/account.ts`

**App:**
- `apps/mobile/lib/galaxy.tsx`
- `apps/mobile/app/world/[world].tsx` (capture and galaxy)
- `apps/mobile/app/settings.tsx` (Learn from my evenings)
- `apps/mobile/lib/api.ts`

**Web:**
- `experience/galaxy.html`
- `experience/src/galaxy-xr.js`
- `experience/build.mjs`

**Tests:**
- `server/test/integration/loop.test.ts`: galaxy, pause, and "one thought inside a world"
- `server/test/provenance.test.ts`: excerpt and why
- `docs/immersive/test/`: browser test, results and screenshots

## Next decision

Before expanding to all twelve experiences, validate these three prototypes:
1. **Device testing (D6):** one iPhone, one mid-range Android, and a Quest or Vision Pro if available.
2. **Five moderated sessions:**
   - Can people say what a line in the galaxy means?
   - Do they find the correction?
   - Would they leave an evening out?
3. **Then build the transformation loop (Mission 5),** the piece that turns understanding into action.
