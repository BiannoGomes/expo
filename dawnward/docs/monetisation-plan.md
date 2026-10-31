# Dawnward: monetisation plan

**Status:** proposal for Bianno, 2026-10-31. Nothing built, nothing charges anyone. Every price below is a starting point to test, not a decision.

## 1. The recommendation in one paragraph

Keep the core free forever, so people trust Dawnward before they pay.
- **Dawnward Plus** at **€8.99 a month or €59.99 a year** is the main income: the full learning library (every chapter, expedition, worksheet and the Gateway, as often as you like).
- **Pro** at **€19.99 a month** comes only when the AI guide is live and reviewed.
- **Bianno's books** become guided expeditions, sold once or included in Plus.

No trial traps, no pop-ups in front of the writing, no locked memories, no ads, no selling data. Prove it changes people with a small paid beta first, as the product brief asks (Part 2: "Do not over-engineer monetization before proving transformation").

## 2. Principles

These come from the brand brief and from what users hate in competitors' reviews, collected in Bianno's earlier review mining (`dawnward-selling-machine`). The loudest complaint in the category was free trials that charged people a year they never agreed to. Next came upsell pop-ups that interrupt the writing.

1. **Never between a person and their writing.** No offer appears on the reflection screen, during a chapter's writing steps, or on the support screen shown in a crisis.
2. **Your words are always yours, free.** Memories, Journey, export and delete are never paywalled, and nor is reading anything you've written. If a subscription ends, nothing is hidden or deleted.
3. **No surprise charges.**
   - **Trials:** a reminder two days before any charge, in the app and by email.
   - **Cancelling:** one tap in the app.
   - **Refunds:** a plain refund policy.
4. **Pay for depth, not for removing nagging.** The free tier isn't made annoying on purpose; Plus adds more to learn and practise.
5. **Never sell what we can't back.** No promises of change, cure or results in the paywall copy, and no fake countdown timers.

## 3. What's free and what's paid, screen by screen

| Screen or feature | Free | Plus | Pro (later) |
|---|---|---|---|
| Home and the Daily Compass | ✓ | ✓ | ✓ |
| The Universe, Personal Growth, the five worlds | ✓ | ✓ | ✓ |
| Reflect: write or speak, unlimited | ✓ | ✓ | ✓ |
| Journey: memories, milestones, evolution | ✓ | ✓ | ✓ |
| Export everything, delete everything | ✓ | ✓ | ✓ |
| Chapter 1 of every expedition | ✓ | ✓ | ✓ |
| The Thought Labyrinth and The Bridge, part 1 | ✓ | ✓ | ✓ |
| Every chapter of every expedition | | ✓ | ✓ |
| Worksheets to print or save | Chapter 1's | All | All |
| Listen to lessons | Chapter 1's | All | All |
| The Quantum Gateway | Once | Any time | Any time |
| New expeditions as they're written | | ✓ | ✓ |
| Bianno's books as expeditions | Buy each | Included | Included |
| AI Expedition Guide: practice conversations, adapted scenarios, deeper pattern insight | | | ✓ |
| Patterns from your reflections | Basic | Basic | Deep |

**Where the offer appears:** only at the natural end of something free.
- At the close of a free Chapter 1: "Chapter 2 is part of Plus."
- On a locked chapter in Learn, with what it contains.
- In You › Plan.

Never as a pop-up on opening the app.

## 4. Prices, and why

**What similar apps charge in the US.** These are approximate, from third-party review sites; check each app's store listing before relying on them:

| App | Price | Source |
|---|---|---|
| Rosebud (AI journal) | about $12.99 a month or $107.99 a year; free plan reportedly retired September 2026 | [Life Note review](https://blog.mylifenote.ai/rosebud-review/), [MakerStack](https://makerstack.co/reviews/rosebud-review/) |
| Finch (self-care) | most often $69.99 a year; listings show several lower prices too | [Gerald](https://joingerald.com/learn/financial-wellness/finch-app-cost), [App Pricing Lab](https://apppricinglab.com/app/apple/1528595748) |
| Calm, Headspace | about $69.99 a year each (Calm sometimes $79.99) | [Mind Wanders](https://www.themindwanders.com/headspace-vs-calm/), [Paddle](https://paddle.com/blog/headspace-calm-pricing) |

**Dawnward Plus at €59.99 a year** sits just under the meditation apps and well under Rosebud's AI journal. That fits a content product whose AI layer isn't live yet. €8.99 a month makes the yearly plan a clear saving (about 44%).

**Pro at €19.99 a month** (or €149.99 a year) sits inside the €15–25 range in Product Brief Part 1 §26, and is priced for real AI depth.

## 5. Unit economics

Assumptions:
- **VAT:** EU prices include VAT, taken here as about 20%.
- **Store fee:** Apple and Google take **15%** through their small business programs, under $1M a year in proceeds ([MacRumors](https://www.macrumors.com/2020/11/18/apple-drops-app-store-fees/), [RevenueCat](https://revenuecat.com/blog/engineering/small-business-program)). Check current terms before launch.
- **Web payments:** web checkout (Stripe) costs roughly 1.5–3% plus a small fixed fee per payment.

| Plan | Price | After VAT | After the store's 15% | Main cost per user | Left per year |
|---|---|---|---|---|---|
| Plus yearly | €59.99 | ≈ €50.00 | ≈ €42.50 | hosting and storage, cents | ≈ €42 |
| Plus monthly | €8.99 | ≈ €7.49 | ≈ €6.37 | cents | ≈ €76 (if kept all year) |
| Pro monthly | €19.99 | ≈ €16.66 | ≈ €14.16 | AI ≈ $2.00–2.50 a month (spec 05) | ≈ €145 |

**Free users:** they cost about $1.20 a month at most, once the AI tier exists (spec 05 §3). Until then a free user costs almost nothing, because the content is static.

**Example at 2,000 paying Plus members on yearly plans:** about €85,000 a year after VAT and store fees, before hosting, support and Bianno's time.

**Not yet modelled:** voice transcription, support, accounting, and the time to write new expeditions. Spec 05 lists the same gaps.

## 6. Bianno's books

Each book becomes one expedition, mapped chapter by chapter with the workflow in `docs/universe/academy-plan.md` §4: objective, lesson, practice, reflection, real-world step, worksheet. Only from manuscripts Bianno owns, and only after review.

- **Price:** €6.99–9.99 each as a one-off purchase, or included in Plus.
- **Codes in the paperback:** each paperback carries a code that unlocks its expedition free, so readers become app users.
- **The app sells the books too:** a "Read the full book" link at the end of each expedition, to Amazon (KDP).

## 7. Trials and offers, done fairly

- **No card-required trial at launch.** The free first chapters are the trial.
- **If a trial is tested later:** 7 days, a reminder two days before it ends, one-tap cancel, and no charge without the reminder having been sent.
- **Founding members:** the first 500 beta members get Plus at €39.99 a year, at that price for as long as they stay. A thank-you, not a countdown.
- **Can't afford it:** a quiet "Can't afford Plus right now?" link offering a free year, no questions asked, capped per month. Finch does something similar, and it builds trust.

## 8. Testing before committing

1. **Beta (8–12 weeks):**
   - Who: about 50–100 people, recruited from Bianno's readers and audience.
   - Plan: everything unlocked, then the price question asked at the end.
   - Measure: whether chapters are finished and real actions are reported back. This is the "prove transformation" gate; the validation study is in `docs/hybrid/beta-validation-plan.md`.
2. **Price research:** a short four-question survey of beta members (too cheap, a bargain, getting expensive, too expensive). It gives an acceptable price range before any public price.
3. **Launch with two yearly prices, tested on the web:** €49.99 against €69.99, randomly split. Compare how many people subscribe, how many come back after 30 days, refunds, and complaints. App stores make this harder, so test on the web first.

**What would count as working:**
- **Upgrade rate:** 3–5% of active free users upgrade within 30 days.
- **Yearly plans:** at least half of subscribers choose yearly.
- **Complaints:** fewer than 1% of subscribers report billing problems.
- **Retention:** 30-day retention among subscribers above 60%.

These are targets to test, not industry facts.

## 9. How it would be built

- **App (iOS and Android):** subscriptions through Apple's and Google's own in-app purchases, which their store rules require. A service like RevenueCat can handle both, plus receipts and a single dashboard, but it's a third-party service needing Bianno's approval and account. Calling Apple and Google directly is the alternative: more work, no extra fee.
- **Web:** Stripe Checkout and Stripe's customer portal, which gives one-tap cancel.
- **Server:** a new `entitlements` table (user, plan, source, active until). The app asks the server what's unlocked and never trusts the device alone. Webhooks from the stores and Stripe keep it current.
  - Additive migration. Shown in the user's data export, and deleted with the account.
- **In the app:**
  - Locked chapters show "Part of Plus" in Learn and in each world's Expeditions, with what's inside.
  - You › Plan holds plan details and Cancel.
  - One upgrade screen, plain and honest.
- **Tests:**
  - nothing ever locks writing, memories, export or delete;
  - an ended subscription hides nothing already written;
  - no offer appears on reflection or crisis screens;
  - the trial-reminder rules.

## 9a. Built so far (2026-10-31): the gates, with no payments

- **Every piece of content has a level.** In `packages/core/src/expeditions/catalog.ts`:
  - `access: "plus"` or `"pro"` on a mission; omitted means free.
  - `freeOnce: true` lets anyone take it once (the Quantum Gateway).
  - Galaxies get `access: "plus"` in `experience/src/registry.js`; the four unopened galaxies already have it.
- **One rule decides, everywhere.** `canPlay` in the shared engine:
  - free is open;
  - members' pieces need the plan;
  - anything already started can always be finished;
  - "free once" means once.
- **The server enforces it.** Beginning a members' chapter without a plan returns 402. Membership lives in a new `entitlements` table (migration 0011): included in the export, deleted with the account, written only by tests until payments exist.
- **In the app:**
  - members' chapters show "Plus" in Learn, in each world's Expeditions and Library;
  - the Compass and "Next" only suggest what the person can open;
  - opening a locked chapter shows an honest gate: what's inside, what Plus includes, that membership isn't open yet, and a free alternative.
- **You › Plan** explains the plans. On this device, "Preview as a member" shows members' content without payment, so Bianno can see everything. It's off by default.
- **Never gated:** writing, memories, Journey, export, delete, the crisis screen.

- **The four galaxies are open** (`docs/universe/creative-worlds.md`). Each has at least one free world; the rest are for members, behind the same honest gate:
  - free: the Floating Kingdom, the Time Garden, the Temple of Stillness, the Dream Realm, the Cosmic Observatory and the Creation Gallery;
  - members: the Living Forest, the Dream Architect, the Sound Sanctuary, the Inner Cosmos and the Discovery Lab.
  - Writing worlds stay free, and anything made stays readable, saveable and deletable on any plan.
  - The AI studios wait: each needs a paid AI service, so they need approval and a cost model (Pro, section 4) first.

**Adding something members-only later:** give it `access: "plus"` in the catalog (or the registry for a galaxy). Nothing else is needed.

## 10. Decisions for Bianno

| # | Decision | My recommendation |
|---|---|---|
| M1 | Plus price | €8.99 a month, €59.99 a year, then test €49.99 against €69.99 |
| M2 | Trial | None at launch; the free first chapters are the trial |
| M3 | Founding offer | €39.99 a year for the first 500, for as long as they stay |
| M4 | Payment setup | RevenueCat for the app plus Stripe for the web (needs your accounts and approval) |
| M5 | Books | Included in Plus, also sold one by one, with paperback codes |
| M6 | When to start charging | After the beta passes its transformation gate |

**Needs approval before anything happens:**
- creating store products;
- connecting Stripe;
- adding a payments service;
- publishing prices;
- charging anyone.
