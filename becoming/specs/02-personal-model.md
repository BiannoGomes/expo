# Spec 02 — Personal Model & Memory Architecture

The hardest build item. Defines what the system knows about a user, how it
came to know it, how sure it is, how knowledge gets written and retrieved, and
how the user corrects it. Closes gap-analysis items B-6 (memory undesigned)
and B-7 (no provenance/confidence), and A-3 (no correction loop).

## 1. Two layers: records and model

- **Records** are immutable events: onboarding answers, reflections, campaign
  actions, uploaded items. Append-only, never rewritten by the AI.
- **The Personal Model** is derived interpretation: values, traits, patterns,
  capabilities, beliefs, bottleneck hypotheses. Every model entry is an
  *inference over records* and must cite them.

The AI may freely rewrite the model; it may never rewrite records. Deleting a
record forces re-derivation of every model entry that cited it (§7).

## 2. The core object: `Assertion`

Everything the system believes about a user is stored as an assertion —
uniform shape, so provenance, confidence, correction, and deletion work the
same way everywhere.

```
Assertion {
  id: uuid
  user_id: uuid
  kind: value | trait | pattern | belief | fear | preference |
        capability_level | relationship_fact | bottleneck | goal_intent |
        biographical_fact
  statement: text            // one sentence, plain language, user-visible
  domain_ids: [slug]         // Spec 01 taxonomy, ≥1
  facet_ids: [slug]

  // Provenance — REQUIRED
  source: stated | observed | inferred | corrected
  evidence_refs: [record_id] // ≥1 for observed/inferred; the citations
  method: text               // for inferred: which pass produced it

  // Confidence — REQUIRED
  confidence: hypothesis | probable | established
  confidence_basis: text     // one sentence: why this level

  // Lifecycle
  status: active | disputed | retracted | superseded
  superseded_by: assertion_id?
  created_at, last_confirmed_at: timestamp
  taxonomy_version: semver
}
```

**Provenance semantics.** `stated`: the user said it (still not ground truth
— people misreport — but never challenged without observed evidence).
`observed`: directly present in records (completions, debrief contents).
`inferred`: a reasoning pass concluded it from multiple records. `corrected`:
the user edited or disputed it; corrections outrank everything and are never
silently overridden by later inference.

**Confidence ladder.** `hypothesis` (single source or one weak pattern —
internal only, or clearly framed as a guess: "I might be wrong, but…") →
`probable` (≥2 independent sources, no contradicting record — may be shown
with hedged framing and visible evidence) → `established` (repeatedly
confirmed over ≥14 days or user-confirmed — may be stated plainly).
Promotion/demotion rules are deterministic code, not model judgment: the
reasoning pass proposes, the application layer checks source counts and
recency before persisting a promotion. **UI rule:** presentation hedging is
driven mechanically by this field — this is how "do not present inference as
fact" (Part 2 §68) is enforced rather than hoped for.

**Decay.** `pattern`/`bottleneck`/`capability_level` assertions not
reconfirmed by any new record within 90 days demote one confidence level and
surface for reconfirmation ("Earlier this year X was true — still right?").
`biographical_fact` and `value` don't auto-decay; values are revisited at
quarterly reviews instead.

## 3. Records (write-side entities)

`OnboardingResponse`, `Reflection` (raw text/audio transcript + structured
extraction, Spec 03 §3), `ActionEvent` (daily items completed/skipped/
deferred), `CampaignEvent` (milestones, revisions), `Evidence` (a claim of
real-world proof: description + optional media + facets), `UserEdit` (every
correction, verbatim). All immutable, all timestamped, all deletable by the
user (§7).

## 4. The write path

Deterministic pipeline; the model reasons, code persists.

1. **Capture** — a record is stored verbatim. Nothing else happens inline
   except safety triage (Spec 04 §2), which runs on every free-text/audio
   input before any other processing.
2. **Extraction** (per reflection, near-real-time, cheap model) — structured
   pull of achievements, emotions, decisions, facet tags, candidate
   assertions. Output is validated against a schema; failures retry once,
   then park the record as `unprocessed` (never silently dropped).
3. **Integration** (nightly batch, stronger model) — candidate assertions are
   merged into the model: match against existing assertions → confirm
   (bump `last_confirmed_at`), contradict (see below), or create new
   `hypothesis`-level assertions. Emits at most 3 changes per night that are
   user-notable; the rest is silent bookkeeping.
4. **Deep passes** (weekly + campaign checkpoints, strongest model) — pattern
   detection across weeks, bottleneck re-testing (Spec 01 §6), gap-analysis
   refresh. The only passes allowed to propose `probable`+ promotions.

**Contradiction handling:** a new record contradicting an active assertion
never overwrites it. The assertion moves to `disputed`, both sides are kept,
and resolution happens either by accumulating evidence (deep pass) or by
asking the user directly — asking is preferred when the assertion is
user-visible. Contradictions between two *stated* items (said X in onboarding,
said not-X in week 3) are exactly the raw material of the
Truth-Mode/Contradiction feature — stored, not smoothed over.

## 5. The read path (retrieval policy)

No "dump everything in the prompt." Each AI task has a **retrieval recipe** —
deterministic queries, assembled in a fixed order for prompt-cache stability
(stable system prompt → stable model summary → volatile recent context).

| Task | Gets |
| --- | --- |
| Morning plan | Model summary (§5.1) + active campaign state + last 3 debrief extractions + yesterday's plan outcome |
| Debrief extraction | Taxonomy facets + today's plan + the transcript (not the full model — extraction must not be biased into confirming existing beliefs) |
| Nightly integration | Candidate assertions + the specific assertions they match (by facet) |
| Weekly deep pass | Full model summary + 7 days of extractions + campaign state |
| Campaign generation | Full model summary + Future Self + gap output + bottleneck hypotheses with evidence |
| Future Self conversation | Future Self narrative + values + relevant fears + the current question's facet slice |

**§5.1 Model summary** — a maintained artifact (~1.5–3k tokens): identity
snapshot, values, active assertions at `probable`+ with confidence markers,
active campaign, current bottleneck hypothesis, coverage gaps ("unknown:
wealth"). Regenerated by the nightly pass only when assertions changed;
otherwise byte-stable, so it caches. Assertions at `hypothesis` level are
excluded — the summary is what the system is *allowed to act on*.

## 6. The correction loop (trustworthiness surface)

- **Inspect:** every user-visible claim ("your bottleneck is focus-dilution")
  renders with "why I think this" — the citations from `evidence_refs`,
  human-readable.
- **Dispute:** one tap — "that's not right" → status `disputed`, immediate
  removal from the model summary, optional free-text correction captured as a
  `UserEdit` record and a `corrected` assertion.
- **Edit:** values, biographical facts, and goals are directly editable; the
  edit supersedes (`superseded_by`), never deletes, the old assertion.
- **Guarantee:** a `corrected` assertion can only be changed by another user
  correction. The nightly pass may attach new evidence and *ask*, never
  revert.

## 7. Deletion propagation

User deletes a record → the record is hard-deleted; every assertion citing it
loses that ref; assertions left with zero refs are hard-deleted; assertions
left below their confidence threshold demote; affected summaries regenerate on
next nightly pass. Account deletion drops everything including derived
artifacts and any vendor-side data within the retention window (Spec 04 §5).
This propagation is the reason §1 requires citations everywhere.

## 8. Storage **[DECISION]**

Postgres. Records and assertions as tables; graph edges (assertion ↔ record,
assertion ↔ assertion, entity relationships) as an edges table — the
IdentityGraph is a *pattern over relational storage*, not a graph database.
Revisit only if traversal queries actually hurt. Embeddings (pgvector) over
records and assertion statements for retrieval recipes that need semantic
lookup (Future Self conversations, "what experiences made me courageous").
The intelligence layer is called through an internal typed interface
(`extract_reflection`, `integrate_candidates`, `generate_plan`,
`generate_campaign`, `deep_review`) so the AI provider stays swappable
(Part 2 §56/§68); model choice per task is in Spec 05 §2.
