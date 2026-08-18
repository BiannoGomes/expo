# Life OS

**The operating system for your Mind, Body, Soul and Future.**
A Personal Evolution Intelligence system: it builds a structured model of who
you are, understands who you're becoming, finds what's holding you back, and
gives you the clearest next move — every day.

Design source of truth: [`docs/design-direction.md`](docs/design-direction.md).

> UNDERSTAND → ENVISION → DIAGNOSE → DESIGN → ACT → EXPERIENCE → REFLECT →
> LEARN → ADAPT → BECOME

## Repository layout

```
docs/                 Product briefs, gap analysis, and the five MVP specs
packages/core/        Shared vocabulary: taxonomy, Personal Model types,
                      the intelligence-layer interface
server/               Fastify API + Postgres schema + Anthropic-backed
                      intelligence implementation
apps/mobile/          Expo app (iOS / Android / web): Today, Debrief, You
```

Read `docs/specs/README.md` first — the specs are the source of truth; the
code implements them.

## Getting started

Requirements: Node 20+, Postgres 15+.

```bash
npm install

# Database
createdb becoming
cp server/.env.example server/.env   # fill in DATABASE_URL + ANTHROPIC_API_KEY
npm run migrate

# API
npm run server                        # http://localhost:3000

# Create a dev user, put its id in EXPO_PUBLIC_DEV_USER_ID
curl -X POST localhost:3000/users -H 'content-type: application/json' \
  -d '{"email":"you@example.com","displayName":"You"}'

# App
npm run mobile                        # Expo dev server (press w for web)
```

## Architecture principles (from the specs)

- **Records are immutable; the model is derived.** Every belief the system
  holds cites its evidence, carries provenance and confidence, and can be
  corrected by the user. Corrections outrank inference, always.
- **AI reasons, code decides.** Confidence promotions, dates, permissions,
  deletion, and safety constraints are deterministic application logic.
- **Safety triage runs first** on every free-text input; the crisis response
  is hand-written, never generated.
- **The provider is swappable.** The app depends on the `Intelligence`
  interface in `packages/core`, not on any vendor SDK.
- **No engagement addiction.** Two user-scheduled touchpoints a day, no
  streaks, no guilt. Re-entry after absence costs one tap.

## Status

Pre-MVP, core loop implemented end to end: schema with immutability and
deletion propagation (spec 02), taxonomy (spec 01), seven-chapter
conversational onboarding with Opus synthesis into Future Self + bottleneck +
90-day campaign (spec 03 §5), daily plan with load guard, re-entry tiers and
confront gating (specs 03–04), evening debrief with safety-triage-first
pipeline, nightly integration job with deterministic confidence rules, decay
and model-summary rebuild, weekly deep pass with the campaign day-14
bottleneck revision (spec 01 §6), and the correction loop (inspect / dispute /
correct) surfaced in the app.

Verified: 15 unit tests, 14 integration tests covering the full loop against
a real Postgres (onboarding → synthesis → plan → debrief → nightly → weekly →
correction → re-entry → crisis paths), all workspaces typecheck, web export
builds. The eval harness (`npm run eval -w server`, spec 05 §5) checks safety
triage recall against a red-team fixture set and structural invariants on
plans and extractions — crisis recall below 100% is a launch blocker.

**Run without an API key:** `MOCK_INTELLIGENCE=1` swaps in the deterministic
mock intelligence, so the whole stack (server, jobs, app) runs locally with
just Postgres. The real intelligence layer needs `ANTHROPIC_API_KEY` and has
not yet been exercised against the live API — expect a prompt-tuning pass on
first real run, using the eval harness.

Not yet: auth (dev bootstrap only), voice debriefs, weekly user-facing review
surface, human rubric pass on intelligence quality. See
`docs/specs/05-cost-model-acceptance.md` §4 for what "MVP done" means.
