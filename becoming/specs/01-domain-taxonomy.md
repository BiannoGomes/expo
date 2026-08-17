# Spec 01 — The Domain Taxonomy

Restores the 12 Domains (Part 1 §4) as the Personal Model's dimension system.
Every downstream engine — gap analysis, bottleneck detection, campaign
generation, daily planning — reasons over this taxonomy. It is the product's
claimed intellectual property, so it is versioned and owned by the product
team, not improvised by the model at runtime.

## 1. Why a fixed taxonomy

The LLM must never invent its own dimension system per user. A fixed taxonomy
gives us:

- **Comparable structure** — gap analysis is "compare current vs future self
  *per domain*"; without shared dimensions there is nothing to compare.
- **Stable storage** — every Capability, Evidence item, Goal, and Campaign
  references domain/facet IDs, so the IdentityGraph stays queryable.
- **Deterministic guardrails** — safety rules attach to domains (e.g.
  Physical and Emotional carry escalation rules; see Spec 04).
- **Evolvable IP** — the taxonomy has a version (`taxonomy_version` stored on
  every reference). Facets can be added in minor versions; domains change only
  in major versions with a migration.

## 2. The 12 domains and their facets

IDs are lowercase slugs, stable forever. Facets are the level the system
actually reasons at; domains are the level users see.

| # | Domain (`id`) | Facets |
| --- | --- | --- |
| 1 | Physical (`physical`) | strength, endurance, mobility, energy, sleep, nutrition, health-behaviour, physical-competence |
| 2 | Mental (`mental`) | focus, reasoning, learning, memory, intellectual-range, curiosity |
| 3 | Emotional (`emotional`) | self-regulation, resilience, courage, emotional-literacy, stress-response |
| 4 | Character (`character`) | discipline, integrity, responsibility, humility, consistency, honesty |
| 5 | Relationships (`relationships`) | family, friendship, love, communication, social-intelligence, boundaries |
| 6 | Career (`career`) | craft, leadership, expertise, reputation, opportunity, execution |
| 7 | Wealth (`wealth`) | financial-intelligence, income, assets, ownership, freedom, security |
| 8 | Creativity (`creativity`) | writing, music, art, invention, experimentation, expression |
| 9 | Adventure (`adventure`) | travel, exploration, challenge, novelty, physical-courage, spontaneity |
| 10 | Meaning (`meaning`) | purpose, philosophy, spirituality, contribution, gratitude |
| 11 | Environment (`environment`) | living-space, location, people-around-you, digital-environment, routines-context |
| 12 | Legacy (`legacy`) | building, teaching, family-legacy, lasting-work, story |

**[DECISION]** Facet lists ship as a versioned JSON asset in the application
(not in prompts alone, not in the DB per user). v1.0.0 is the table above.

## 3. What attaches to the taxonomy

- **Capability** → exactly one facet (`facet_id`), with a level (see §5).
- **Evidence** → one or more facets. ("Courage-type evidence" from Part 1's
  Courage Index = evidence tagged `emotional/courage` or
  `adventure/physical-courage` — the Courage Index survives as a query, not a
  separate system.)
- **Goal / Campaign / Mission** → a primary domain plus optional secondary
  domains. Campaigns spanning >2 domains trigger a focus warning (see §6).
- **Future Self** → per-domain narrative statements (the Part 1 §3 dimensions
  map onto domains: Body→physical, Mind→mental, Love→relationships, etc.).
- **Gap** → computed per domain: the delta between Future Self statements and
  the current Personal Model, expressed as missing capabilities, missing
  evidence, and missing experiences — never as a percentage score.
- **Reflection extractions** → tagged with the facets they touch, which is how
  daily life flows back into the model (Spec 02 §4, Spec 03 §3).

## 4. Never a scoreboard (enforced, not aspirational)

Part 1 §5 and Part 2 §60 both forbid "your life is 64% complete." Enforced as
product rules:

1. No aggregate score across domains exists anywhere in the data model. There
   is deliberately no column for it.
2. Per-domain, the UI shows **qualitative state** (narrative + evidence
   count + trend arrow), never a number out of 100.
3. Capability levels (§5) are shown only inside a capability's own detail
   view, framed as "current stage / next stage" — never summed or averaged.
4. Domains are never ranked against each other in the UI. Bottleneck output
   names *one* constraint, not a leaderboard.

## 5. Capability levels

From Part 1 §15 (1% Library). Each capability blueprint defines 3–7 named,
observable stages. Levels are **claims requiring evidence**:

- `level_claimed` — what the user says (provenance: self-reported).
- `level_evidenced` — highest stage supported by linked Evidence items.
- The system plans from `level_evidenced` and gently notes the difference
  ("you've told me you're a confident speaker; let's get one talk on record").

The MVP ships **without** a large capability library — campaigns may create
ad-hoc capabilities with model-drafted stage definitions, marked
`blueprint: "ad-hoc"`. The curated 1% Library is Phase 2; ad-hoc capabilities
migrate onto curated blueprints when one matching exists.

## 6. How bottleneck detection uses the taxonomy

Bottleneck Detection (MVP loop step 5) gets a method, closing gap analysis
item B-8. It is a **hypothesis generator constrained by a fixed candidate
list**, not free-form diagnosis.

**Candidate bottleneck classes (v1):**

| Class | Signal pattern |
| --- | --- |
| `focus-dilution` | Many concurrent goals/campaigns; low completion; starts >> finishes |
| `energy-deficit` | Physical facets (sleep, energy) weak while ambition high |
| `avoidance` | A named fear or postponed confrontation recurs across reflections |
| `environment-friction` | Environment facets contradict stated goals (place, people, digital) |
| `skill-gap` | A single missing capability blocks multiple goals |
| `identity-conflict` | Stated values contradict stated goals or observed behaviour |
| `relationship-drag` | Relationship stressors recur across otherwise unrelated domains |
| `overload` | Total committed load exceeds stated available time/energy |
| `no-evidence-loop` | Effort happens but is never converted to evidence/completion |
| `direction-unclear` | Future Self statements are vague/conflicting in the blocked domain |

**Procedure:** (1) the reasoning pass receives the Personal Model summary +
the candidate list and must propose 1–3 candidates *with cited evidence
records*; (2) each proposal carries confidence (Spec 02 §3) and is stored as a
`Hypothesis`, not a fact; (3) only a hypothesis at confidence ≥ `probable`
with ≥2 independent evidence sources may be presented as "your current
bottleneck," and it is always presented with its evidence and a one-tap
"that's not right" correction path (Spec 02 §6); (4) at day-14 of a campaign
the bottleneck hypothesis is explicitly re-tested against two weeks of real
reflections — onboarding data alone is never allowed to fix it permanently.

The candidate list is product-owned and versioned. The model may additionally
flag "something outside the list" as a `candidate-class-proposal` for the
product team — it may not present an off-list bottleneck to the user.

## 7. Onboarding coverage requirement

The 7-day onboarding (Part 2 §51) must touch every domain at least glancingly
— not as a 12-section questionnaire, but as a coverage checklist the
conversation planner tracks. A domain with zero signal at the end of
onboarding is recorded as `coverage: none` in the Personal Model, and the gap
analysis must treat it as *unknown*, not as *weak*. (This is how "do not
pretend to know what the system cannot know" — Part 2 §68 — becomes
mechanical.)
