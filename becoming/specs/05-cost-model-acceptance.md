# Spec 05 — Unit Cost Model & MVP Acceptance Criteria

The one-spreadsheet-and-one-page that decides whether the rest is viable.
Closes gap-analysis items D-13 (no cost model) and E-17 (unfalsifiable MVP
bar).

## 1. Pricing basis

Anthropic API list prices as of 2026-08 (first-party rates, USD per million
tokens). Re-verify before any pricing decision — these move.

| Model | Input | Output | Role here |
| --- | --- | --- | --- |
| Claude Opus 5 (`claude-opus-5`) | $5.00 | $25.00 | Deep reasoning |
| Claude Sonnet 5 (`claude-sonnet-5`) | $3.00 | $15.00 | Workhorse |
| Claude Haiku 4.5 (`claude-haiku-4-5`) | $1.00 | $5.00 | Triage/extraction |

Levers: **prompt caching** (cached input reads bill ~0.1×; writes ~1.25× —
the stable-prefix design in Spec 02 §5 exists to exploit this) and the
**Batch API** (50% off, async — nightly integration and weekly passes are
batch-shaped by construction).

## 2. Task → model tiering

Maps the intelligence-layer interface (Spec 02 §8) to tiers. The principle:
frontier reasoning only where judgment quality is the product; never for
plumbing.

| Task | Model | Cadence | Est. tokens (in / out) |
| --- | --- | --- | --- |
| Safety triage (Spec 04 §2) | Haiku 4.5 | Every free-text input | 2k / 0.1k |
| Debrief extraction | Sonnet 5 | Daily | 7k / 2k |
| Morning plan | Sonnet 5 | Daily | 6k (≈4k cacheable) / 1k |
| Nightly integration | Sonnet 5, batch | Daily | 5k / 1k |
| Weekly deep pass | Opus 5, batch | Weekly | 20k / 4k |
| Onboarding conversation | Sonnet 5 | One-time ×7 chapters | ~96k / 6k per chapter (heavily cached) |
| Onboarding synthesis: Future Self, gap, bottleneck, campaign | Opus 5 | One-time ×4 passes | 25k / 8k each |
| Campaign day-14 revision | Opus 5 | Per campaign | 25k / 6k |
| Future Self conversation | Opus 5 | User-initiated | 10k / 2k per exchange |

## 3. Cost per user

**Steady state, fully active user** (plan + debrief 20 days/month, weekly
deep pass):

| Line | Math | $/month |
| --- | --- | --- |
| Daily loop (triage + plan + extraction) | ~$0.09/day uncached ×20 | 1.80 |
| Nightly integration (batch) | ~$0.015 ×30 | 0.45 |
| Weekly deep pass (Opus, batch) | ~$0.10 ×4.3 | 0.43 |
| Future Self / ad-hoc conversations | budget ~6 exchanges | 0.45 |
| **Total, uncached list price** | | **≈ 3.15** |
| **With caching + batching realized** | input-heavy lines drop 40–70% | **≈ 2.00–2.50** |

**Onboarding, one-time:** ~7 conversational chapters (≈$2.70 uncached,
≈$1.30 with the growing-context prefix cached) + 4 Opus synthesis passes
(≈$1.30) ≈ **$2.50–4.00 per completed onboarding.**

**Read against pricing (Part 1 §26):** PRO at €15–25/month against ~$2.50
steady-state AI cost is a healthy ~85% gross margin on the AI line, with
~1.5 months of margin consumed by onboarding CAC-like cost. Viable — *if*
the FREE tier is bounded:

**[DECISION] FREE tier bounds:** no Opus passes at all (the weekly deep
pass, Future Self conversations, and campaign revision are PRO); daily loop
capped (plan + debrief on Sonnet, no follow-up questions); onboarding runs
once in a trimmed form (3 chapters + one combined synthesis pass on Sonnet,
≈$0.50). Ceiling ≈ $1.20/month/free user. The upgrade pitch is honest: PRO
buys depth of attention, not removal of artificial nagging.

**Guardrails:** per-user daily token budget enforced in the application
layer (degrade to shorter outputs, never silent failure); cost per user-day
tracked as a first-class ops metric from day one; any new AI feature ships
with a line in this table or it doesn't ship.

Not modeled here, must be before launch pricing is final: voice
transcription, infrastructure/storage, payment fees, support. AI is the
dominant variable cost, which is why it's specified first.

## 4. MVP acceptance criteria

Test cohort **[DECISION]**: user zero is Bianno (Part 1's "Version 0.1 = your
life" strategy, restored), then 10–20 hand-recruited users matching the
initial audience. Evaluation window: 21 days of daily-loop use after
onboarding. The MVP **passes** if all of:

1. **Onboarding completes.** ≥70% of starters finish all 7 chapters within
   14 days (self-paced compression per Spec 03 §5 counts).
2. **The diagnosis lands.** At the day-14 campaign revision, ≥60% rate the
   bottleneck diagnosis ≥4 on a 5-point "true of me, and not obvious" scale;
   ≤20% dispute it outright.
3. **The loop retains.** ≥50% of onboarded users still active (≥3 loop-days/
   week) at day 21 — with the Spec 03 §2 presence policy, i.e. without
   re-engagement pressure.
4. **The model learns.** ≥50% of debriefs yield ≥1 candidate assertion that
   survives nightly integration; each user accumulates ≥3 `probable`+
   assertions that did not come from onboarding — proof the system knows
   things week 3 that it didn't know day 7.
5. **Corrections build trust.** Users who dispute an assertion churn at no
   higher rate than users who don't (the correction loop converts errors
   into trust rather than exits).
6. **The core sentence is affirmed.** Day-21 structured interview asks the
   four clauses of Part 2 §68 separately — *understands me / sees where I'm
   going / knows what's holding me back / gives me the clearest next move*.
   ≥50% of still-active users affirm at least three.
7. **Unit cost holds.** Realized AI cost ≤ $5 per active user-month at MVP
   scale.

**Fail handling:** miss on 2 or 6 → the intelligence layer isn't good enough:
iterate prompts/retrieval/passes, do not add features. Miss on 1 or 3 → the
experience layer: fix onboarding pacing or daily-loop friction. Miss on 4 →
the memory design: revisit Spec 02 before anything else. Only when all seven
pass does Phase 2 (Part 2 §53) open.

## 5. Evaluation harness (minimum viable)

Closes gap B-9 just enough for the MVP: a frozen set of ~20 synthetic user
fixtures (Personal Model + reflection history) with golden outputs reviewed
by a human for the four judgment-critical tasks (plan, extraction, bottleneck,
campaign); every prompt or model change runs the fixtures and diffs; a rubric
(specific? evidence-cited? confidence-honest? load-respecting? safe?) scored
by an LLM judge with human spot-checks. Crude, but it converts "the vibes
changed" into a diff — and the safety triage additionally gets a hand-built
red-team fixture set (crisis phrasings, oblique disclosures, false alarms)
with required 100% recall on the crisis set before launch.
