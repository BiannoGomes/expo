# BECOMING

**Personal Evolution Intelligence.** A system that builds a structured model
of who you are, understands who you're becoming, finds what's holding you
back, and gives you the clearest next move — every day.

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
and model-summary rebuild, and the correction loop (inspect / dispute /
correct) surfaced in the app. 15 unit tests; all workspaces typecheck; the
app exports cleanly for web.

Not yet: auth (dev bootstrap only), voice debriefs, campaign day-14 revision
flow, weekly deep pass, eval harness fixtures. See
`docs/specs/05-cost-model-acceptance.md` §4 for what "MVP done" means.
