# DAWNWARD Marketing Engine — The Master Blueprint

**One system. Books + Website + DAWNWARD app + Jarvis (Claude), wired into a single
budget-managed marketing loop.**

> The answer up front: the most powerful thing is not a new tool. It is closing the loop
> between what you already have. You give the budget; the engine runs
> **MEASURE → DECIDE → CREATE → PUBLISH → LEARN** on a fixed cadence, and you stay the
> single approval gate for anything that publishes, sends, or pays.

---

## 1. What you already have (the audit)

You are further along than you think. Connected today:

| Layer | Tools already wired |
|---|---|
| **Creation** | Higgsfield (AI video, image, audio, virality predictor), Canva, Adobe Express/Firefly |
| **Distribution** | Higgsfield → TikTok direct publishing, `publish-ops` (IG/FB/TikTok daily queue), Gmail |
| **Intelligence** | Supermetrics (150+ data sources), Motion (Meta creative analytics) |
| **Operations** | Make (automation), Notion (vault/HQ), Google Drive + Calendar, GitHub |
| **The moat — your custom skills** | `book-factory`, `content-wave`, `publish-ops`, `launch-engine`, `kdp-optimizer`, `offer-architect`, `review-engine`, `weekly-review`, `morning-briefing`, `sea-mode`, `aeo`, `page-cro` |

Those skills are the real asset. An eight-figure operator's "playbook" is exactly this:
codified, repeatable processes that run without them. You already built yours.

---

## 2. What you must connect next (the gaps, in priority order)

1. **An email platform** (MailerLite, Beehiiv, or ConvertKit) via Make/n8n.
   *This is the #1 move.* An owned list is the only channel no algorithm can take away.
   Every book's back matter, every website page, every DAWNWARD onboarding screen feeds it.
2. **Meta Ads account → Supermetrics + Motion.** Motion is already Meta-native; once your
   ad account is linked, Jarvis reads creative performance and proposes reallocations.
3. **Amazon KDP reports + Amazon Ads → Notion** on a scheduled pull, so `kdp-optimizer`
   works from live sales data instead of screenshots.
4. **Google Analytics 4 + Search Console** on the website → Supermetrics. Pair with the
   `aeo` skill so the site gets cited by ChatGPT/Perplexity/Claude, not just ranked.
5. **DAWNWARD app instrumentation** (this repo is an Expo fork — the app side is code):
   - `expo-notifications` for push (re-engagement is the cheapest channel you'll ever own)
   - Deep links via `expo-router` so every social post can open a specific screen
   - Analytics (PostHog or expo-insights) + RevenueCat if you sell subscriptions
   - Email capture in onboarding → feeds the list from item 1
6. **Payments**: Stripe/Paystack/Payfast per `offer-architect`'s SA-seller checkout setup.
7. **The scheduler**: Claude Routines — daily `morning-briefing` + `publish-ops`, weekly
   `weekly-review`, per-release `launch-engine`. This is what turns tools into an engine.

---

## 3. The engine — how "I give the budget, it manages everything" actually works

Claude cannot hold your money, and per your own Jarvis rule it never should:
**AI proposes → Bianno approves anything that publishes, sends, or pays.**
Hard spend caps live at the platform level (Meta, Amazon). Inside those caps, the loop runs:

```
        BUDGET (you set it monthly)
                 │
   ┌─────────────▼──────────────┐
   │  MEASURE  – Supermetrics + Motion + KDP pull      (daily)
   │  DECIDE   – 70/20/10 allocation proposal          (weekly, you approve)
   │  CREATE   – content-wave + Higgsfield + Canva     (batched)
   │  PUBLISH  – publish-ops queue, one-word approval  (daily)
   │  LEARN    – weekly-review → next week's DECIDE    (weekly)
   └─────────────┬──────────────┘
                 └──────── loops forever ────────┘
```

**The 70/20/10 rule** (how big operators allocate): 70% of budget to proven winners,
20% to structured tests of new hooks/audiences, 10% to wild experiments. Losers are
killed fast; winners get scaled the following week. Jarvis brings you one weekly
message: "here's what won, here's next week's split — approve?"

**Cadence:**
- **Daily**: morning briefing, publish today's queue (your one-word approval), log results
- **Weekly**: scoreboard + budget reallocation proposal + creative kill/scale list
- **Per book**: `book-factory` → `launch-engine` 14-day countdown → `review-engine` → `kdp-optimizer`
- **At sea**: `sea-mode` pre-queues batches and runs the low-bandwidth version

---

## 4. The flywheel — merging books, website, and DAWNWARD into one funnel

```
 Short-form content (content-wave + Higgsfield)
        │  hooks & carousels, 10–20/week
        ▼
 Website (AEO-optimized hub + lead magnet from offer-architect)
        │  email capture
        ▼
 Email list  ──────────────► Books (KDP)
        │                      │  back matter → app + next book
        ▼                      ▼
 DAWNWARD app  ◄───────────────┘
        │  daily habit = retention engine, push notifications
        ▼
 Backend offers (bundles, subscription, premium)
        │
        └──► Readers become content (reviews, testimonials, UGC)
                 └──► feeds Short-form content … loop closes
```

Every asset promotes the next one. Books acquire the audience (and pay for the ads that
found them), the app keeps the audience, the backend offers monetize the trust.

---

## 5. What eight-figure operators actually do (reverse-engineered, no mysticism)

1. **They own distribution.** The list and the audience are the business; products rotate on top.
2. **Volume beats genius on creative.** They test dozens of hooks weekly and let data pick.
   Your `content-wave` + Motion + Higgsfield's virality predictor is exactly this machine.
3. **One funnel deep before two funnels wide.** Get one book → list → app path converting
   before adding channels.
4. **The value ladder** (Hormozi mechanics, already in `offer-architect`): free lead magnet
   → book → bundle → app subscription → premium backend. Rising LTV funds rising ad spend —
   whoever can spend the most to acquire a customer wins the market.
5. **A weekly scoreboard with one metric per funnel stage.** Not thirty metrics daily.
6. **Founder-face brand as moat.** Your story (yacht crew building UnifyMind from the ocean)
   is unmatchable content; corporations can't copy a person.
7. **The "billionaire merger" pattern, translated:** they acquire audiences and cash-flowing
   assets, then cross-sell across them. Your version: each book is an audience acquisition
   asset, DAWNWARD is the recurring-revenue asset, and the email list is the bridge that
   cross-sells everything to everyone.

---

## 5b. The expert layers most solo operators never learn

This is the "hidden knowledge" — not secrets, but hard-won craft that rarely gets taught
in one place. Each one plugs a specific gap in v1 of this blueprint.

**Unit economics — the language of scale.** Four numbers run everything: CAC (cost to
acquire a customer), LTV (lifetime value), payback period, contribution margin.
Break-even ROAS = 1 ÷ margin. Example: if a R250 paperback nets you R70 after Amazon's
cut and printing, a R70 CAC is break-even on book one — but if 40% of readers buy book
two, your true LTV is far higher and you can outbid every competitor who only counts the
first sale. **Whoever can profitably spend the most to acquire a customer wins — and that
is decided by LTV math, not ad skill.** The weekly scoreboard must report these four.

**Series read-through — indie publishing's hidden lever.** Book 1 is allowed to break
even or even lose money; the profit lives in read-through. Track the Book 1 → Book 2
conversion rate obsessively. Moving it from 30% to 50% changes how much you can spend on
every ad. A R19 (or free) first-in-series is a strategy, not a discount — it buys readers
whose next purchases are pure margin.

**Stages of awareness (Eugene Schwartz, 1966 — still the copy bible).** Every prospect is
at one of five stages: unaware → problem-aware → solution-aware → product-aware →
most-aware. Each stage needs a different message. Viral top-of-funnel content speaks to
problem-aware people ("why do mornings feel like this?"); retargeting and email speak to
product-aware people ("here's what's inside DAWNWARD"). Most brands blast one message at
everyone — that mismatch, not the creative quality, is usually why ads fail.

**Retention science for DAWNWARD.** Acquisition is rented; retention is owned. Median
app retention is roughly 25% day-1, 10% day-7, 5% day-30 — habit apps must beat that
badly. Build the Hook Model loop deliberately: trigger (push notification at the user's
chosen dawn hour) → action (one small ritual) → variable reward → investment (streaks,
saved reflections that make leaving costly). A 5% retention improvement compounds harder
than any ad campaign ever will.

**Positioning (April Dunford's rule).** Don't be a *better* self-help product; be a
*different thing*. "The mind system built at sea" is a category of one — nobody can
out-position lived experience. Positioning sets your CAC before a single ad runs, because
it decides whether you compete on price or on story.

**Pricing psychology.** Anchor high (show the bundle first), use a decoy tier, and have
the courage to raise prices — doubling a price and losing a third of your buyers still
increases profit while attracting more committed customers. Cheap prices attract the
most demanding, least loyal buyers; premium prices fund the ads that find the next reader.

**1,000 true fans math (Kevin Kelly).** You don't need millions of people. 1,000 true
fans × R1,000/year = R1M/year. The engine's real job is finding and deepening those
1,000 relationships — reach is a means, never the metric.

**Attention arbitrage.** Platforms over-reward new formats and features for their first
6–18 months (they need creators to adopt them). Being early to a format is the closest
thing to legally underpriced attention. Jarvis's morning briefing should flag these.

**The weekly scoreboard — one metric per stage:**

| Stage | Metric | The question it answers |
|---|---|---|
| Content | Hook rate + saves | Is the content stopping thumbs? |
| Website | Email opt-in rate | Is the lead magnet working? |
| Email | Click-through rate | Does the list trust us? |
| Books | Sales + Book 1 → 2 read-through | Is the ladder working? |
| App | Day-7 retention | Is DAWNWARD a habit? |
| Backend | LTV / average order value | Is trust converting to revenue? |
| Whole engine | CAC vs LTV, payback period | Can we afford to grow? |

---

## 5c. Testing discipline — where budgets go to die

- **Don't kill ads on feelings.** Judge only after the platform's learning phase and a
  meaningful sample (roughly 50 conversions per ad set); kill by cost-per-result vs your
  break-even number, nothing else.
- **One variable per test.** Hook OR audience OR offer — never two at once, or you learn nothing.
- **Keep a test log in Notion.** The library of dead hooks is as valuable as the winners;
  it stops you re-testing failures a year later.
- **Watch creative fatigue.** Frequency creeping past ~3 with rising CPM means rotate
  creative *before* performance decays, not after.

---

## 5d. The failure modes that kill eight-figure dreams

1. **Shiny-object switching** before one funnel converges. The 30-day rollout exists to prevent this.
2. **Launching to nobody.** Audience first, product second — this is why the email list is gap #1.
3. **Scaling spend before the funnel converts.** Ads pour fuel; make sure there's a fire.
4. **Ignoring churn and refund signals.** They are the earliest truth-tellers in the data.
5. **Founder burnout.** You work at sea — energy is the real budget. `sea-mode` is a
   strategy, not a compromise.
6. **Fake urgency or fabricated proof.** Short-term lift, permanent brand death. Never.

---

## 6. Safety rails (non-negotiable, per the Jarvis standard)

- Hard budget caps set **at the platform level**, not just in prompts.
- Nothing auto-publishes, auto-sends, or auto-pays — every queue waits for your yes.
- Scoped, least-privilege API keys; rotate anything ever exposed; cash buffer untouched.
- No fabricated proof, reviews, or testimonials — `review-engine` stays TOS-safe.

---

## 7. 30-day rollout

**Week 1 — Foundation:** pick email platform, wire it via Make; add capture to website +
book back matter. Link Meta Ads to Motion/Supermetrics.
**Week 2 — App:** add push notifications, deep links, analytics, and onboarding email
capture to DAWNWARD (code work in this Expo project).
**Week 3 — Engine on:** create the Routines (daily publish-ops, weekly review); run the
first 70/20/10 week with a small budget (e.g. R3–5k) to calibrate.
**Week 4 — First full cycle:** first weekly reallocation from real data; queue the next
`launch-engine` countdown; scale what won.

---

*What to do:* connect the seven gaps above, in order.
*How:* Make/n8n for plumbing, Routines for cadence, your existing skills for the work.
*Why it works:* it converts scattered tools into one compounding loop where every rand of
budget gets measured, every winner gets scaled, and every asset feeds the next.
