# AI Creation: monetisation plan and first slice (2026-11-01)

**Promise:** Discover who you could become. Create something that moves you there.

**Status:** an audit and plan for Bianno's approval. Applied today, because Bianno approved them:
- the seven galaxies are kept;
- the unlock rules are tightened (section 2);
- a private preview is allowed.

Nothing touches payments, AI services or public publishing.

Labels:

| Label | Meaning |
|---|---|
| **V** (verified) | Checked in the code or by running it |
| **I** (inferred) | Reasoned from the code, not run |
| **U** (untested) | Not tried |

## 1. Architecture findings
| Area | Finding | |
|---|---|---|
| Routes | Galaxies `#/universe/<id>`; AI Creation is `#/universe/ai` with one place, the Creation Gallery (`#/ai/gallery`). Experience routes are listed in `docs/universe/architecture.md` | V |
| Unlocks | `experience/src/progress.js`: unlocks are computed from kept facts and stored in `dw-progress-v1`, separate from everything else. Idempotent, migrates existing users, resets on Delete. 45 browser checks and 6 unit tests | V |
| Progress | Expedition attempts, experiments (actions) and discoveries: on the device (`dw-expeditions-v1`) or in Postgres with an account. Creations live in `dw-creative-v1`. Reflections live in `dw-local-v1`, or on the server | V |
| Auth | Device-token accounts (`server/src/auth.ts`): an anonymous bearer token, hashed. No email or password login | V |
| Payments | **None.** An `entitlements` table exists (`server/migrations/0011_entitlements.sql`): `plan` is free, plus or pro; `source` is apple, google, stripe or grant; there's an `active_until`. Nothing writes to it except grants. On the web there's a "member preview" switch kept on the device: it shows members' content and charges nothing | V |
| AI | `server/src/intelligence/anthropic.ts` (the Anthropic SDK) for reflection debriefs, with a mock for tests. The web app on the device makes no AI calls | V |
| Tests | 16 browser suites (840 checks) and 56 server tests | V |
| Data risks | Device data lives in browser storage. Clearing the browser loses it unless it was exported (You › Save a copy). Purchases would need an account to be recoverable across devices | I |

## 2. Revised unlock specification (applied)

**The terms:**

| Term | Meaning | Counts toward unlocks? |
|---|---|---|
| Discovery | A lesson viewed | No |
| Practice | A guided exercise completed: a mission with at least one required step you do (choose, sort, write, plan, pause and similar) | Yes. Code: `isPractice()` |
| Action | A real-world task you planned, then said how it went | Yes, as before |
| Reflection | A saved reflection | — |
| Creation | A saved artifact: a place designed in the Dream Architect, or a moment planted in the Time Garden. Lighting lanterns is play, not a creation | Yes, for AI Creation |

**What each galaxy needs:**

| Galaxy | Opens when you… |
|---|---|
| Personal Growth, Earth | Always open |
| Knowledge | 1 practice |
| Spiritual Exploration | 2 practices |
| Creative Worlds | 3 practices, in at least 2 worlds |
| AI Creation | 1 saved creation in Creative Worlds |
| Quantum Gateway | A Future practice (not the Gateway itself) and a direction |

Every current mission qualifies as a practice (all 15 have required steps you do). The rule protects against future lesson-only missions.

**How it's stored and shown:**
- **Separate state:** exploration (visited places), mission completion (attempts), galaxy unlocks (`dw-progress-v1`) and entitlements (`plan`, or the server's `entitlements`) are each stored apart, and no rule mixes them.
- **Three states per galaxy:**
  - **Discoverable:** visible, with its art and what opens it.
  - **Unlocked:** its free experiences.
  - **Premium:** clearly marked, previewable, never behind progress.
- **Not yet built:** the premium toolkit itself, and the "not behind progress" preview that goes with it (section 3).

## 3. AI Creation, information architecture
```
AI Creation (galaxy)
├─ The Creation Gallery        free · everything you've made (exists)
├─ Life-to-Action: free sample free · one goal → one plan → one real action → Journey   (to build)
├─ Toolkits                    one-time · preview free, buy to own                       (to build, no live payment)
│   └─ The AI Life-to-Action System
└─ Studio                      later · subscription, not built until a toolkit sells
```

**The free sample**, the vertical slice:
1. Choose a goal: from your direction, or a Future reflection.
2. Clarify the outcome.
3. Name the constraints and resources.
4. A structured plan appears: 3 phases, a first week and one next action.
5. Edit it.
6. Save or export it as a file.
7. Do the one action.
8. "How did it go?", then Journey.

**First version, with no AI:** the plan is built from your own answers with a fixed template. That's honest, free to run and testable. An AI-assisted version would use the existing server integration, but only with your approval of the service and its cost, and with the same safety rules: no diagnosis, no hidden motives, imagination presented as imagination.

## 4. First toolkit outline: The AI Life-to-Action System (draft)

**What's in it:**
- A guided workbook (PDF and editable doc): goal → outcome → constraints → 90-day plan → weekly review.
- A prompt system: 8 prompts for planning, unblocking, weekly review and course-correcting, each with an example.
- Claude Code skills (for builders): a project-planner skill and a weekly-review skill.
- Templates: a 90-day plan, a weekly review, a decision log.

**Inside the app:** the free sample above, plus the toolkit's files in Owned, after purchase.

**Honesty:**
- Every file says what it is and what it needs (for example, a Claude account for the skills).
- Each file has a version number.
- No claims of results.

## 5. Pricing experiment (hypotheses, not validated)

**Offer:** one toolkit at **€19 launch / €29 standard**. Nothing else is for sale until it sells.

**Measures:**
- visitors to the offer page;
- people who finish the free sample;
- purchases;
- buyers who open the toolkit;
- buyers who finish a weekly review;
- a "Was it worth it?" answer from buyers.

**Target (Bianno's):** 50 qualified visitors → 10 free tries → 3 purchases. That's a signal to look closer, not proof.

**Rules:** no countdowns, no fake "was" prices, no testimonials until there are real ones (with consent).

## 6. Purchase and entitlement architecture (proposed)
- **Web first.** On the web, the checkout provider is Bianno's choice: Stripe Checkout, or a merchant of record such as Lemon Squeezy or Paddle, which handle EU VAT. The server records the result in the existing `entitlements` table (`source: stripe`) and in a new `purchases` table (product, version, receipt) for one-time toolkits.
- **Native apps:** Apple and Google rules apply to digital goods sold inside the apps, with in-app purchase or their alternative programmes. Decide the native plan before selling in the native app. Until then, the native app doesn't sell. (I: rules change, check current terms at the time.)
- **Recovery:** purchases need an account, which means adding email sign-in, or a way to link a device token to an email. Owned files can be downloaded again from the Owned library.
- **Separation:** buying never unlocks galaxies, and progress never grants purchases.

## 7. Screens to design (none built yet)
1. AI Creation overview
2. Free sample flow
3. Toolkit preview: what's inside, sample pages, prerequisites, version
4. Product details
5. Purchase states: not owned, checkout, owned, failed or refunded
6. Owned library
7. Download and recovery

All with accessible locked and owned states, no fake buttons, and no checkout button until payments are approved.

## 8. End-to-end test plan
Each step gets a browser check, as with every slice so far:
1. Creative Worlds mission
2. Saved creation
3. AI Creation unlocks, once
4. Free sample: goal → plan → edit → save
5. Its action in "How did it go?"
6. Result in Journey
7. Toolkit preview, with no purchase possible
8. Reload and Delete everything

Purchase tests come later, against the provider's test mode only.

## 9. Content review (prepared, not yet done by a reviewer)

**To review:**
- `docs/universe/questions.md`: 31 questions. Bianno's are marked ★.
- `docs/universe/wisdom.md` and `experience/src/wisdom.js`: 21 entries with sources and evidence notes.
- `docs/universe/knowledge-tree.md`: the branch texts.

**What a reviewer should check:**
- each source against the book itself;
- every "strong research" label against a review paper;
- the limits stated for each entry;
- repetition between the question bank and the guided missions.

Nothing here is published; all of it is marked draft in the app.

**Next Wisdom Constellation: Connection** (Bianno's choice). Drafting it waits until a reviewer has looked at Becoming Consistent, so mistakes aren't repeated.

## Risks and approvals needed
| # | Decision | Needs |
|---|---|---|
| 1 | Build the free Life-to-Action sample: template-based, no AI, no payment | Bianno's yes |
| 2 | Checkout provider, and web-only selling at first | Bianno's choice |
| 3 | Email sign-in, so purchases can be recovered | Bianno's yes |
| 4 | Any AI generation in AI Creation: service, cost, safety rules | Bianno's yes |
| 5 | A content reviewer before anything draft goes public | Someone named |
| 6 | Relationships, and Purpose & Prosperity, as cross-world paths | Content to write; later |
