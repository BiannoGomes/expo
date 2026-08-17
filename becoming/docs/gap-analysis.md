# BECOMING — Gap Analysis of the Current Model

> Compares Part 1 (`product-brief-part-1.md`, the original vision) with Part 2
> (`product-brief-part-2.md`, sections 48–68, the refined spec), and lists the
> gaps the current model still has before it can be built with confidence.
> Written 2026-08-17.

## 0. A scope caveat

Part 2's sections are numbered 48–68, which implies a formal document whose
sections 1–47 defined the core machinery: the Personal Model, Future Self
construction, Gap Analysis, Bottleneck Detection, the IdentityGraph schema,
and the campaign format. Part 1 covers this ground conceptually, but if a
formal 1–47 exists, it should be committed here too — several "gaps" below may
already be answered in it. Everything that follows assumes Part 1 + Part 2 is
the complete record.

## 1. What Part 2 improved

Worth stating so we don't regress on it: Part 2 added a real safety section
(48), a phased MVP discipline (52–55), separation of deterministic logic from
LLM reasoning (57), a structured reasoning format to limit hallucination (58),
an explicit entity list (59), anti-engagement-addiction metrics (60), and the
"you don't need another goal" principle (64). It also correctly reframed the
moat from "the dataset" (Part 1 §27) to "the accumulated architecture +
per-user history under strict privacy and consent" (Part 2 §62) — the Part 1
framing of aggregating millions of users' transformation data is a
privacy/regulatory liability if stated as the business asset.

## 2. Part 1 concepts that Part 2 dropped or demoted

Some of these are deliberate MVP discipline. Others look like accidental
losses. Each is marked **[keep deferred]** or **[restore]**.

| Part 1 concept | Status in Part 2 | Verdict |
| --- | --- | --- |
| The 12 Domains / 1% Blueprint (§4) | Absent. No domain taxonomy anywhere. | **[restore]** — Gap Analysis and Bottleneck Detection need a stable dimension system to reason over. Without a taxonomy, the Personal Model has no shape. This is also the claimed proprietary IP. |
| Daily five-slot home screen: Build / Train / Learn / Confront / Experience + one question (§11) | "Daily Evolution" named in the MVP loop but never specified. | **[restore]** — this is the MVP's daily surface. It's the most concrete UX in either document; the MVP cannot ship without a defined daily screen. |
| Evening Debrief extraction format (§12) | "Reflection" named, not specified. | **[restore]** — same reason. The extraction schema (achievements, emotions, decisions, patterns…) is what feeds Personal Model updates, which is step 9 of the MVP loop. |
| Truth Mode / The Challenger (§18, §23) | "Contradiction Engine" deferred to Phase 2. | **[restore a v1]** — "the AI should not always agree" is positioning-critical. A lightweight version (challenge one contradiction per week) belongs in the MVP; a sycophantic MVP will feel like every other AI coach. |
| The Mirror as a conversational surface ("Why am I stuck?") (§6) | Personal Model exists as infrastructure; no user-facing ask-the-model surface. | **[keep deferred, but decide]** — the MVP loop is push-only (system proposes). Whether users can *query* their own model in v1 is an open product decision, not settled anywhere. |
| Adventure Engine / experience generation (§9) | "Experience Portfolio" in Phase 3; "real-world experiences" as a metric. | **[restore a v1]** — "One Thing to Experience" is already in the daily five slots, and experiences-not-tasks is the core differentiation from habit trackers. Full engine can wait; the daily experience slot cannot. |
| Courage Index (§10) | Generalized into "Identity Evidence" (Phase 2). | **[keep deferred]** — evidence generalization is better. But name-check courage-type evidence in the evidence taxonomy so the concept isn't lost. |
| Anti-Potential Engine / current-trajectory projection (§19) | Trajectory Simulator in Phase 3 (§63) covers the optimistic half. | **[keep deferred]** — but note the Phase 3 simulator should include the *default trajectory*, not only alternative scenarios. Part 2 §63 only describes forward scenarios. |
| Claude's internal agent roles (Architect, Mirror, Coach, Challenger, Historian…) (§23) | Absent. | **[restore as design doc]** — Part 2 §57 lists Claude's functions but not how they're orchestrated. The agent decomposition is the practical answer to "how does one prompt do eleven jobs." |
| Product philosophy principles (§25) | Absent as a list; partially implied by §64–65. | **[restore]** — Part 2 says the philosophy should exist but no longer states it. It should live in the repo as the tone-of-voice source of truth. |
| "Version 0.1 = the founder's life" build strategy (§ final) | Absent. | **[restore]** — this is the validation strategy for the entire MVP. Part 2 §68 says "make one user genuinely experience…" but no longer says who that user is or how the test runs. |
| Name decision | Part 1 leans BECOMING; Part 2 uses BECOMING throughout. | Settled — record it: the product is **BECOMING**. |

## 3. Gaps in the current model itself

These are holes neither document fills — the things that will bite during or
immediately after the MVP build.

### A. Product & UX

1. **The cold-start / day-1 value problem.** Onboarding is seven days long
   before the payoff moment (§51). Nothing specifies what value a user gets on
   day 1–6, why they return on day 2, or what happens if they want to finish
   in one sitting. Seven-day gated onboarding is a retention cliff; the spec
   needs a compressed path and per-day payoffs.
2. **No failure/abandonment model.** What happens when a user misses five
   days mid-campaign? Ghosts a reflection week? Abandons a 90-day campaign on
   day 30? The re-entry experience is where identity products live or die,
   and it's unspecified. (Directly related to the Part 1 insight "addicted to
   beginnings" — the product itself must handle its users' inconsistency.)
3. **No correction loop for the Personal Model.** When the model asserts
   something wrong about the user ("your bottleneck is X") there is no
   specified way to see why it believes that, dispute it, or edit it.
   Trustworthiness (§68 priority 2) requires inspectability: show evidence,
   accept correction, decay stale inferences.
4. **Notifications and presence are unaddressed.** §60 forbids
   engagement-addiction mechanics, but daily execution requires *some*
   re-engagement surface. The spec never says how BECOMING shows up in a
   user's day without becoming a nag. This tension is named nowhere and needs
   an explicit policy (e.g., one daily touchpoint, user-scheduled, silent
   otherwise).
5. **Campaign generation quality bar.** The 90-day campaign is the onboarding
   climax, generated from seven days of self-report — the thinnest possible
   data. There's no spec for how the system hedges ("this is a hypothesis,
   we'll revise at day 14"), no early-revision checkpoint, and no definition
   of what makes a generated campaign *good*.

### B. Intelligence & memory

6. **Memory architecture is named, not designed.** Part 1 lists eight memory
   types; Part 2 says "structured personal memory + retrieval." Nothing
   specifies: write path (what gets extracted from a reflection and where it
   lands), retrieval policy per task, token budgets, summarization cadence,
   conflict resolution when new evidence contradicts stored beliefs, or decay.
   This is the hardest engineering problem in the product and currently has
   zero design.
7. **Personal Model schema and confidence.** §58 demands uncertainty be
   tracked, and §68 forbids presenting inference as fact — but the data model
   (§59) has no confidence fields, no provenance (self-reported vs observed vs
   inferred), and no versioning. Every inference in the IdentityGraph needs
   source + confidence + timestamp, or Truth Mode and "do not present
   inference as fact" are unimplementable.
8. **Bottleneck Detection has no method.** It's the pivotal MVP step (loop
   step 5) and the pitch's signature move, yet neither document says how a
   bottleneck is identified from onboarding data, what the candidate
   bottleneck taxonomy is, or how the system avoids confidently naming a wrong
   bottleneck on day 7 (see gap 5).
9. **Evaluation of the intelligence layer.** No spec for how we test that gap
   analyses, bottlenecks, and campaigns are any good — no eval set, no rubric,
   no regression protection when prompts or models change. For a product whose
   entire value is judgment quality, this is a first-class gap.

### C. Trust, safety & legal

10. **Safety is stated as principles, not mechanisms (§48).** Missing: crisis
    detection and escalation flow (self-harm, abuse, acute distress surfaced
    in a reflection — what exactly happens, which resources, which locales),
    the boundary policy for Challenger/Truth-Mode-style content with
    vulnerable users, and topic guardrails for medical/financial/legal
    adjacency. "Must recognize when a situation exceeds its role" needs an
    actual recognition + handoff design.
11. **Privacy and data rights are nearly absent.** This product stores the
    most sensitive data a consumer app can hold (fears, relationships, health
    behaviour, childhood memories), priced in euros — GDPR applies from day
    one. Missing: lawful basis mapping (much of this is Article 9 special
    category data requiring explicit consent), export, deletion (including
    deletion propagation into derived inferences and any model context),
    retention limits, encryption posture, and whether user data ever trains
    anything.
12. **Third parties in the data.** The Life Archive and Relationship Graph
    ingest photos, conversations, and stories about people who never
    consented. FAMILY tier adds children (GDPR-K/parental consent, and the
    ethics of building identity models of minors). Neither document
    acknowledges this at all.

### D. Economics

13. **No unit-cost model.** Deep onboarding, daily planning, nightly
    reflection analysis, and continuous model updates are all LLM-powered.
    Nobody has estimated tokens per user-day, which calls need a frontier
    model vs a cheaper tier, what's cacheable, or whether the FREE tier is
    affordable at all. The €15–25 PRO price (Part 1 §26) is asserted with no
    cost basis. This can quietly kill the product.
14. **"Meaningful Evolution" is not operationalized.** It's the north star
    (§60) but has no measurement definition. If it can't be computed, the
    team will silently revert to retention metrics — the exact failure §60
    warns against. Needs a v1 proxy (e.g., campaign milestone completion ×
    evidence entries × user-reported alignment, reviewed quarterly).
15. **No competitive or distribution thinking.** Nothing on the surrounding
    landscape (AI coaching apps, journaling-with-AI, habit trackers pivoting
    to AI) or on how the first thousand users arrive. Part 1's founder-as-V0.1
    at least implied an audience (existing Self-Mastery readership); Part 2
    dropped even that.

### E. Execution

16. **No stack decision and the wrong repository.** Part 2 §56 gives
    conceptual layers only. The concrete choices (Expo/React Native app,
    backend, database for a graph-shaped model, auth) are unmade. Relatedly:
    these briefs currently live in a fork of the Expo SDK monorepo, which
    cannot host the product — a fresh application repository is needed before
    Phase 1 of any build.
17. **MVP has no acceptance criteria.** §68's bar — one user genuinely
    experiencing the core sentence — is right in spirit but untestable as
    written. Define: N test users complete onboarding → campaign → 14 days of
    daily loop; ≥X% rate the bottleneck diagnosis as "true and non-obvious";
    ≥Y% still active at day 14. Otherwise "the loop works" is unfalsifiable.
18. **AI-provider abstraction is asserted, not designed.** §56/§68 require
    Claude be replaceable, but there's no defined intelligence-layer interface
    (task-shaped calls like `analyze_reflection`, `generate_campaign`, each
    with typed inputs/outputs) that would actually make that true.

## 4. The five gaps to close first

In order, before any code:

1. **Restore the 12-Domain taxonomy** into the formal spec as the Personal
   Model's dimension system (gap §2 row 1) — everything downstream (gap
   analysis, bottlenecks, campaigns) reasons over it.
2. **Design the memory + Personal Model schema** with provenance and
   confidence on every inference (gaps 6–7) — the hardest build item and a
   prerequisite for trustworthiness.
3. **Specify the daily loop surfaces** — five-slot morning screen and evening
   debrief extraction schema (gap §2 rows 2–3) — the MVP's actual product.
4. **Write the safety + privacy mechanism spec** (gaps 10–12) — crisis flow,
   consent model, deletion; foundational per §68, and much cheaper now than
   retrofitted.
5. **Build the unit-cost model and MVP acceptance criteria** (gaps 13, 17) —
   one spreadsheet and one page that decide whether the rest is viable.

Also: decide the product's home — a fresh repository, and confirm whether the
formal spec's sections 1–47 exist.
