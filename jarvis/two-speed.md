# JARVIS // Two-Speed Brain — the ReStructure teardown (adopted 30 Sep 2026)

> Source: ReStructure AI newsletter + Bianno's Drive folder "Claude + Jev" (8 frames,
> read in full). Verified: Jev = TypeSafe's decision model on OpenRouter (Jev 1.13,
> 18 Sep 2026; Jev Router 25 Sep) — typed choices + calibrated probabilities, 70–500ms,
> ~$0.042/M input. Their system: 41 agents, 9 departments, Claude reasons / Jev judges,
> owner signs every big move. OUR verdict: we already run the chassis (core=chief of
> staff, HQ db=shared data layer, rail=sign-off, heartbeat=escalation). We do NOT clone
> 41 agents (anti-sprawl, ARCHITECTURE v2). We adopt the ONE missing organ: the
> JUDGE — a second, fast, typed-decision speed under the reasoning brain.

## The primitive: a JUDGE CALL
Any node may ask a typed question and get a typed answer — never prose:
```
judge(question, options, context) -> {choice, confidence: 0..1, evidence_ref}
```
Rules (theirs, adopted): confidence ≥0.9 → proceed automatically (within trust-ledger
level); 0.5–0.9 → review lane (rail or Fable); <0.5 → blocked + logged. A judge NEVER
touches publish/send/pay — those stay L1 human forever. Judge outputs are data;
deterministic postconditions (LEARNING-LOOP A2) still outrank any judge's opinion.

## Implementations (model-agnostic interface, three tiers)
| Tier | Model | When |
|---|---|---|
| NOW (cloud) | Haiku via the Agent tool's fast tier | heartbeat + session judgments, €0 extra |
| ARMED on approval | **Jev via OpenRouter** (~€5 one-time top-up ≈ months of calls) | desktop classifier + high-volume scoring — say "arm Jev" |
| Fallback | free tiers per free-llm-apis.md | desktop cron if OpenRouter is down |
Jev Router (their model-picker) stays SKIP — routing Claude Code stays on the D-list;
Jev the JUDGE is in scope, Jev the router of our brain is not.

## Stolen mechanisms → where they land in Jarvis
1. **Lead lanes** — every Wave-7-class lead carries {lane: HOT|WARM|COLD, judged, evidence}.
   HOT skips the line (same-day reply drafted), WARM = follow-up until yes/no — a lead
   may never go cold in an inbox — COLD = nurture list. Judge re-scores on every reply.
2. **Ads/content scored on leads, not likes** — experiment ledger verdicts become typed:
   {SCALE | FIX_HOOK | PAUSE}, computed from lead attribution, never engagement.
   (Their example: 3,120 likes / 4 real leads = FIX_HOOK. Ours already says this in
   metric-divergence words; now it's a typed verdict per asset.)
3. **Search-intent scoring** — keyword lists judged {ready_to_buy | comparing | DIY |
   browsing}. For UnifyOps: PT dental queries ("marcação dentista urgente lisboa" class)
   scored before any Phase-3 ad euro moves. Free to run with the NOW tier.
4. **The Morning One Page** — heartbeat output reshaped (Routine prompt updated 30 Sep):
   MONEY (what's leaking + what was already done about it) · LEADS (lane counts + the
   one hottest) · YOUR TOP 3 (only decisions, never tasks) · then DID/LEARNED. One page,
   not a dashboard — the bridge stays the dashboard; the heartbeat becomes the page.
5. **Risk lanes** — Sentinel + trust ledger get the 0.9/0.5 thresholds as their standard
   vocabulary for autonomous-vs-review-vs-blocked.
6. **Their .md governance files** (agent-permissions, approval-limits, compliance-rules,
   sops) — we already hold these as GODMODE hard limits, trust ledger, LEARNING-LOOP,
   capabilities.json. Mapping noted; nothing new to write. Validation, not homework.

## What we explicitly do NOT copy
- 41 agents / 9 departments as org-chart: sprawl. Our 6 fleet nodes + spawned workers
  cover the same surface; a department is a view, not a process.
- Jev as autonomous actor: judges score, they never act. Acting stays with workers under
  the supervisor, gates intact.
- "Runs the whole business": ours runs the WORK; Bianno runs the business. Same line
  their owner drew — kept, because it is the architecture, not a limitation.
