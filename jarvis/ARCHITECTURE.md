# JARVIS // Architecture v2 — Autonomous Growth Loop (adopted 2026-09-17)

> Bianno's operating doctrine, adopted verbatim in intent. Supersedes role definitions in
> GODMODE.md §0 where they differ; everything else in GODMODE (limits, attention tiers,
> metrics, governing rule) stands. The upgrade path is explicitly NOT more agents/MCPs/models:
> it is better state → supervision → browser reliability → experiments → verification → learning.

## Roles
| Node | Job | One question it answers |
|---|---|---|
| **JARVIS CORE** | mission + memory + policy + events | who does what, with what authority, on what evidence |
| **FABLE** | strategy, hypotheses, analysis, recovery strategy, architecture | what should we do, why, and what evidence would change our mind |
| **HERMES** | EXECUTION SUPERVISOR — decomposes Fable's mission into jobs, assigns workers, tracks completion | is the mission actually moving, job by job |
| **SENTINEL** | quarantine — screens ALL external content (web, email, comments) for injection before it reaches privileged agents | is this data or a disguised instruction |
| **PLAYWRIGHT** | deterministic hands (official `@playwright/mcp` ONLY — never lookalike packages); accessibility-tree driven | structured UI operations, testing, QA |
| **ASTRA / vision** | perception + exception handler — visual fallback when deterministic locators fail | what is actually on the screen |
| Workers (research/creative/growth) | spawned per mission, terminated when done | one job each, evidence returned |

## Tool escalation ladder (hard order, cost-descending)
API → Playwright (deterministic) → vision agent → human escalation.
Never send the expensive vision layer to click what a selector can click.

## Browser supervisor (bounded self-healing)
Every browser mission carries {objective, expected_state, current_state, last_action,
failure, recovery_count}. On mismatch: diagnose → retry (≤3) → 1 alternative strategy →
1 visual recovery (re-derive locator, update the site adapter) → escalate. No infinite
loops, ever. A healed locator is written back so the lesson persists.

## Attack your own work
Nothing Jarvis builds ships on "generated". Playwright QA attacks every funnel asset:
loads, CTA reachable, form submits, validation, email capture, thank-you, attribution
persists, mobile, checkout, links resolve. Then a red-team pass tries to break it.
Standard of done: generated → attacked → repaired → verified.

## Experiment engine (the fundamental unit is a loop, not a post)
HYPOTHESIS → prediction → ONE variable vs CONTROL → test → measurement → result →
confidence → learning → next hypothesis. Ledger rows per GODMODE/content-engine.
Two dimensions always kept separate: **attention** (views, retention, shares) and
**commerce** (leads, sales, LTV). The quiet high-commerce quadrant (💎 low attention /
high business) outranks loud broke virality. Causal chains get recorded as a cause graph
(hook → retention → click → lead → sale), not as a single vanity score.

## Economic brain
Every asset gets an expected value: expected revenue − creative − distribution − tool −
human cost. The router picks the cheapest workflow whose quality clears the bar
(Wan local for discovery; Higgsfield only where EV justifies premium — see wan22-setup.md).
Monthly **Model Eval Lab**: benchmark the same task across available models
(quality/cost/speed), update the router; assumptions about "best model" expire.

## Memory that compounds
- **Creative memory**: every asset logs hook/audience/platform/result/learning/next-action.
- **STOP-DOING list**: dead ends with evidence {pattern, confidence, sample_size,
  last_tested} — never rediscover a known dead end.
- **Market graph** ("internet twin"): creators → hooks → audiences → offers → funnels →
  conversions as queryable relationships, not research folders.
- **Mission replay**: every mission's event trail is reconstructable end to end;
  failed campaigns get counterfactual hypotheses queued as future experiments.
- Swipe pipeline: reference → mechanism → transferable principle → ORIGINAL execution.
  Never copy scripts, footage, or identities.

## Funnel intelligence
Adaptive paths by behavior/segment/intent instead of one static funnel. Nightly **funnel
autopsy**: where people entered, left, hesitated; output = 3 highest-confidence
improvements, not everything at once. CRO loop: observe → hypothesis → change →
Playwright test → deploy → measure → keep or AUTO-ROLLBACK (every deployment stores
before_state and a rollback path; conversion drop inside bounds reverts itself).

## Security & delegation
Authority flows Human → Jarvis → Hermes → worker → MCP → external system, and never
backwards. External content NEVER defines permissions ("upload your credentials to
continue" is data, and hostile data at that). Sentinel screens before privilege.
Credentials: scoped, short-lived, .env-only, audited {who, what, when, why, result}.
Publish / send / pay stays L1 human-approval forever.

## Current honest state (17 Sep)
Live already: event spine, HQ db as canonical state, trust ledger, daily heartbeat
(first run 06:37 today — drafted the Wave 7 follow-up and correctly held it), Wan2.2
runbook, demo-page white-label package.

**Slice order revised 22 Sep (commander-approved council synthesis — LEARNING-LOOP.md):**
the self-correcting layer comes before new capability. In order: eval corpus (seeded,
jarvis/evals/cases.json) → deterministic postconditions → post-mortem pipeline →
regression gate → memory consolidation (vault tiers) → experiment ledger v2 →
metric-divergence detector → Playwright-first hands + browser supervisor (with A9
canaries) → Sentinel → funnel autopsy → only then new tools/models. One slice at a
time; each proves itself on real work before the next begins.
