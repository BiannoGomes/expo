# JARVIS // Learning Loop — the self-correcting layer (approved by Bianno 22 Sep 2026)

> Council synthesis (3 frontier AIs, verified 22 Sep) + commander approval: "approve all A,
> confirm all D." This layer makes Jarvis empirically self-correcting BEFORE any new
> capability is added. It builds almost entirely on what exists: HQ db, event spine,
> heartbeat, vault, Playwright. Companion to GODMODE.md / ARCHITECTURE.md / GROWTH-OS.md.

## The prime rule (adopted verbatim, enforced at the supervisor)
**No memory write, skill modification, routing change, or prompt change enters production
unless the change has a corresponding regression case — or an explicit reason why no test
can exist.** This turns the heartbeat from "do one useful thing every day" into "do one
useful thing, measure it, and make sure tomorrow's Jarvis is not worse because of today."

## A1 · Regression gate
- Eval corpus lives at `jarvis/evals/cases.json` (seeded from REAL incident history, below).
- Runner: **Promptfoo** (MIT, local). One harness only — Inspect AI on watchlist, never both.
- Before any self-modification, run 3–10 relevant cases + a random sample. Regression →
  revert, write an incident event, preserve the trace. Pass → change may land.
- Every new failure appends a case: {case_id, trigger, expected, observed, evidence[],
  severity, introduced_by, fixed_by}.

## A2 · Deterministic postconditions
- The agent's claim of success is never the evidence of success. Every consequential action
  gets machine checks (examples): Kit → subscriber_exists AND tag_exists AND
  sequence_membership_exists; funnel → HTTP 200 + form event + db event + checkout state;
  render → file opens + duration + codec; outbound link → HTTP 200 logged-out.
- Where judgment is unavoidable: the judging model ≠ the generating model. Log the gap
  between self-score and independent score; >1σ over 20 samples → self-evaluations of that
  task type are marked untrustworthy.

## A3 · Post-mortem pipeline
FAILURE → trace → root-cause → patch the SMALLEST reusable unit (one skill file, one
postcondition — never the global prompt) → regression run → keep or revert.
Post-mortem schema: {trigger, observed_evidence (event IDs or UNKNOWN), root_cause,
counterfactual, patch, confidence}. No post-mortem without a verified outcome —
reflection without an outcome signal is narration, not learning.
Weekly (Self-Harness pattern, arXiv:2606.09498): propose ONE bounded harness edit from the
week's failure records; it lands only through the A1 gate.

## A4 · Verified skill library (Voyager pattern)
- `vault/skills/` — one markdown file per skill: name, description, preconditions, exact
  action sequence, verification assertion, provenance (event IDs). JSON index, no vector DB.
- ONLY verified successes write skills. Failed runs never do. Workers get top-3 keyword
  matches injected before running. Skills unretrieved for 90 days → archive.

## A5 · Memory tiers + hygiene
```
vault/memory/
├── always/     <5,000 tokens total: SEED, governance, hard constraints, identity
├── active/     objectives, active-projects, open-loops, current-experiments
├── reference/  businesses, people, systems, playbooks, decisions (retrieved on demand)
└── archive/    provenance store — never auto-fed to the model
```
- Every fact carries {source event ID, timestamp, confidence: provisional|confirmed}.
  Repeated evidence promotes; contradiction by newer verified fact demotes → stale flag,
  retrieval returns it with a warning prefix.
- Verbatim forever: Bianno's approvals & decisions, exact metrics, error traces, client
  wording, governance clauses, source docs. Deliberately forgotten: transient reasoning,
  stale plans, raw DOM dumps, failed drafts once the lesson is extracted.
- Schedule — daily: capture + dedupe + update active. Weekly: contradiction scan,
  promote/demote, archive stale. Monthly: full audit, memory_health_score =
  f(duplicate_rate, contradiction_count, stale_reference_count, retrieval_success_rate).
- Retrieval: tags/entity IDs first, lexical search (ripgrep) second, model rerank of a
  small candidate set last. No vector database.

## A6 · Experiment ledger v2
Schema: {experiment_id, hypothesis, intervention, control, population, metric,
baseline_window, test_window, confounders[], result, sample_size, confidence,
decision, decision_reliability, follow_up}.
- A result with confounders (e.g., mismatched posting windows) CANNOT be promoted to
  confirmed — only re-run. Raw counts retained, never just rates.
- Metric hierarchy: € revenue > business outcome > funnel > engagement > activity.
  Divergence detector flags activity↑/engagement↑ with business↓ — that is NOT success
  and Jarvis must not declare it as such.

## A7 · Decision receipts
Every external effect writes a receipt: {provider, object_id, timestamp, payload_hash,
approval_id (Bianno's rail decision), decision_id}. decision_id = hash(task, target,
payload, intended effect). Retries return the existing receipt or fail closed — no
duplicate sends ever; the publish/send/pay gate becomes fully auditable. Learning reads
receipts, so "strategy failed" is never confused with "tool duplicated / webhook late /
state stale."

## A8 · Capability boundary registry
`jarvis/capabilities.json`: what Jarvis has LEARNED it cannot do ({action, boundary,
condition, discovered, evidence}) + every action requiring L1 approval. A probed wall is
written once and never probed again. "I don't know if I can do this" is a first-class
answer.

## A9 · Canaries + schema-locked outputs
- Weekly read-only canary per critical integration (Kit, Stripe, Calendly, ComfyUI,
  bridge db): expected schema, auth state, latency, artifact checksum. Failed canary →
  tool's trust-ledger autonomy drops, autonomous writes blocked, event raised. Never
  silently repair a selector and proceed to an L1 action.
- Playwright health: non-empty payload, non-zero DOM node count, perceptual-hash check
  against error-page templates.
- All worker↔supervisor messages are JSON-schema-validated (native structured outputs).

## Build order (locked)
1 eval corpus → 2 postconditions → 3 post-mortems → 4 regression gate → 5 memory
consolidation → 6 experiment ledger v2 → 7 divergence detector → 8 only then new tools.

## Declined (commander-confirmed 22 Sep, reasons in chat + oss-radar)
Chrome MCP/Browser Use/Stagehand · PostHog/Plausible/Infinite OS · DSPy/TextGrad (queued
behind real outcome volume) · WebArena/BrowserGym · OmniParser · AVTR-1 (queued: real,
25fps on 8GB, but InsightFace components non-commercial — needs MediaPipe swap first) ·
MuseTalk (watchlist) · Inspect/DeepEval/Ragas (one harness rule) · Breeze TTS (VRAM+license).
