# Hybrid Growth Adventure: product architecture and audit

**Status: proposal for approval. Nothing here is built yet.**

Written 2026-10-31 for Bianno, from the Hybrid Growth Adventure directive and his own vision: a universe, two galaxies, the realm of now, and a jump to your future self.

## 1. The vision in one paragraph

Dawnward stays a private place to reflect. Around it grows a universe you can travel.

**At the top: the Universe, the Spirit layer.** "We are the universe experiencing itself". It's the place beyond space and time where everything connects. Here sit two galaxies:
- **Your Galaxy** is the realm of now: the four worlds, Mind, Body, Soul and Future, where your evenings become stars. It's what exists today.
- **The Expedition Galaxy** is where you go to practise. Each world has solar systems of short, carefully written missions: a conversation to rehearse, a decision to think through, a small real-world experiment.

Your **Future** world has one more door: **a step forward to your future self**. You visit the person you said you want to become, using your own words from onboarding (`future_selves`). You bring back one small action for this week.

The galaxy changes because of what you actually do, never because of time spent in the app.

## 2. Repository audit (read-only, 2026-10-31)

Status per area: WORKING (built and tested), PARTIAL, MISSING, BROKEN, UNVERIFIED (built, never run where it matters).

| Area | Status | Evidence |
|---|---|---|
| Reflection capture (`/debrief`, voice through `/transcribe`, `clientKey` retry safety) | WORKING | Integration tests in `server/test/integration/loop.test.ts`; 74 server tests pass |
| Memory model (immutable records, assertions with evidence, read-time exclusions, confidence) | WORKING | `server/src/model/*`, tests |
| Grounded AI (quote check, "Seen in N evenings", disputes and corrections) | WORKING | `provenance.ts`, `/assertions/:id/dispute`, tests |
| Safety triage before any processing, hand-written crisis text | WORKING | `safety/crisis.ts`, `triageSafety`, tests |
| Daily plan (three steps from last night's words) | WORKING | `/plan/:date`, tests |
| Campaigns: a goal with milestones (Future) | PARTIAL | Table and `GET /campaign` exist. No mission steps, check-ins or outcomes. |
| Future self (horizon year, a narrative per domain) | PARTIAL | `future_selves` table and `GET /future-self`. Read-only, with no experience built on it. |
| Galaxy view of evenings and beliefs (`/galaxy`) | WORKING | Used by the Galaxy Home and the app |
| Auth (device tokens), consent, rate limits (in-memory, single instance), export and delete | WORKING / PARTIAL | `guard.ts`. The limiter is single-instance only. |
| Expo app: Today, Debrief, Universe, You, a world screen, Evenings, Settings | WORKING in a web browser | Not tested on a device (D6) |
| Galaxy Home (web, three.js), four painted worlds, tabs, editor, Memories | WORKING in a browser | 97/97 end-to-end checks, axe 0. Not in the app. |
| Missions, expeditions, solar systems, quest player | MISSING | Nothing exists |
| Experiments with check-ins and outcomes | MISSING | `campaigns` is the nearest thing |
| A progression event ledger and discoveries | MISSING | |
| Game-layer preferences (on or off) | MISSING | |
| Real-device performance, VoiceOver and TalkBack | UNVERIFIED | Never run |
| The live AI model (vs the deterministic test double) | UNVERIFIED | Tests use the mock. `anthropic.ts` is 52% covered. |

**Reusable for the first slice:**
- records, so mission answers are your words, kept and excludable;
- `triageSafety`, run on every free-text answer;
- the evidence and confidence model;
- campaigns and milestones, a natural home for longer expeditions;
- `future_selves`, for the future-self step;
- the Galaxy Home renderer and art, and the tab shell.

## 3. Product rules this design keeps

- **Reflect is never more than two taps away.** Open, Reflect, write. The game never stands in front of it.
- **Explore is at most three taps to a mission.** Explore, a mission, Begin.
- **No punitive streaks**, no countdowns, no "you missed a day", no leaderboards, no comparison with anyone.
- **Nothing measures the person.** Progress means places discovered and things you did, never a score of who you are.
- **The AI proposes and you decide.** It never awards progress, invents completed actions or diagnoses.
- **Hard limits:** crisis words stop everything and show the hand-written support text.
- **The galaxy renderer reads state and never owns it.**

## 4. A conflict to settle: XP and levels (decision D-H1)

The directive proposes Explorer XP and levels. Your brand brief forbids "points, levels, leaderboards" anywhere, and calls their absence a core feature. Three options:

| Option | What people see | Fit with the brand |
|---|---|---|
| **A. Discoveries only (recommended)** | New stars, moons and landmarks appear in your galaxy when you complete missions and experiments. A plain journey log ("You finished The Bridge, part 1, on 3 November") explains each one. | Keeps the promise. Still rewarding: the universe itself is the reward. |
| B. XP as an opt-in layer, off by default | Option A, plus an Explorer level for those who switch it on in You. | A visible exception to "never, anywhere". |
| C. XP for everyone, as in the directive | XP, levels and a progress bar | Breaks the brand rule. Needs a new brief. |

Every option uses the same engine underneath: an append-only event ledger with deterministic, idempotent unlock rules. Choosing B or C later adds a display layer, not a rebuild.

## 5. Spirit (decision D-H2): answered

**Bianno chose a fifth world:** Spirit, separate from Soul. See `infinite-self-addendum.md`, which also renames the galaxies (Inner and Discovery) and adds the Earth Realm, the Quantum Gateway and the Future Self Observatory. The original question is below for the record.

### The original question

You named "mind, body, soul, spirit and future". Earlier you asked to keep Mind, Body, Soul and Future as the basis. My proposal: **Spirit is the Universe layer itself**, the space above both galaxies, "beyond space and time", where everything connects. That keeps four worlds and gives Spirit the highest place. The alternative is a fifth world with its own art and missions.

## 6. System architecture

```
Client (web Galaxy Home now; Expo app in phase 3)
  Universe / galaxy renderer (three.js; reads state only)
  Reflect editor · Quest player · Memories · You · text view
        │  HTTPS, device token
Server (Fastify, existing)
  Auth, consent, rate limits, validation (zod)
  Reflection service (existing /debrief, records)
  Expedition service (NEW): catalog (versioned, in code) · attempts · experiments
  Progression engine (NEW): append-only events → deterministic discoveries
  AI orchestrator (existing intelligence/*, extended): bounded, validated, with fallbacks
  Memory service (existing assertions, evidence, exclusions)
Postgres (existing; additive migration 0009)
```

## 7. Data model (additive, migration `0009_expeditions.sql`)

| Entity | Where it lives | Notes |
|---|---|---|
| World, SolarSystem, MissionTemplate, MissionStep | **Code**: `server/src/expeditions/catalog/*.ts`, validated by zod at startup | Versioned with the app. Content reviewed by people, not generated freely. |
| MissionAttempt | Table `mission_attempts` (user, mission_id, mission_version, status, step, started_at, updated_at, completed_at) | One open attempt per mission per user. Resumable. |
| Mission answers | Existing `records` (kind `mission_response`, payload: attempt, step, text or choice) | Immutable, excludable, exported and deleted with everything else |
| Experiment | Table `experiments` (user, attempt, action, when_text, check_in_on, status) | The small real-world action you chose |
| ExperimentReview | `records` (kind `experiment_review`) | Your words on what happened |
| Progress event | Table `progress_events` (user, kind, ref, unique (user, kind, ref)) | The ledger. A unique key makes retries harmless. |
| GalaxyDiscovery | Table `discoveries` (user, key, cause_event, discovered_at, unique (user, key)) | What appears in the galaxy, and why |
| MemoryInsight | Existing `assertions` and `assertion_evidence` | Unchanged |
| UserPreferences | Columns on `users`: `game_layer boolean default true`, `motion text` | The game can be switched off without losing anything |

## 8. The first vertical slice (to approve)

Galaxy Home → Explore → the Soul system "Communication" → **The Bridge** (part 1 of 3) → scenario → practice → choose a real action → reflect → complete → a new star discovered → Galaxy Home. A return visit records how the real conversation went.

**Proposed files:**

| File | What |
|---|---|
| `server/migrations/0009_expeditions.sql` | The four tables and two columns above; all `on delete cascade` from users |
| `server/src/expeditions/schema.ts` | zod schemas for templates, steps and answers |
| `server/src/expeditions/catalog/soul-communication.ts` | Three hand-written missions: The Bridge 1 (opening), 2 (listening back), 3 (repair) |
| `server/src/expeditions/engine.ts` | Pure state machine and unlock rules (no I/O) |
| `server/src/routes/expeditions.ts` | `GET /expeditions`, `GET /expeditions/:mission`, `POST /attempts`, `POST /attempts/:id/step`, `POST /attempts/:id/complete`, `GET /experiments`, `POST /experiments/:id/review`, `GET /discoveries` |
| `server/test/expeditions.test.ts` | Engine unit tests: transitions, idempotency, unlocks |
| `server/test/integration/loop.test.ts` | A new describe for the slice end to end, crisis triage on answers, export and delete coverage |
| `experience/src/explore.js`, `experience/src/quest.js` | The Explore view and the quest player (web) |
| `experience/home.html`, `experience/src/home.js` | A fifth tab, Explore; discoveries in the galaxy; Universe and Expedition Galaxy views |
| `docs/galactic/test/e2e-expedition.cjs` | Browser end-to-end test for the slice |

**Dependencies:** none new. Fastify, zod, pg and three.js are already in the project.

**Migration risk:** low. Additive only, no existing column changes, and cascades on user delete. Export (`/export`) and delete (`DELETE /account`) must include the new tables, and that is tested.

## 9. New art needed (decision D-H5; ChatGPT prompts ready to write)

1. The Universe (Spirit layer): two galaxies in one deep field.
2. The Expedition Galaxy: distinct from Your Galaxy.
3. The Communication solar system (Soul): a violet star with three small worlds, one per mission.
4. The future-self scene: the Future world at dawn, a figure seen from behind.
5. The discovery star: a single ignition, for the reward moment.

No text in any of them, the same style lock as before.
