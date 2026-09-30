# ReStructure stack teardown → free replacements + wiring plan (1 Oct 2026)

> Source: the full system map + reels + newsletter catalog. Their newsletter runs the SAME
> architecture across verticals — one-person marketing team, 36-agent e-commerce ($5k
> tokens), $35k law-firm marketing, 42-agent car-dealership sales. META-INSIGHT: their
> business is one architecture sold per vertical at $25–35k. That is literally the
> UnifyOps thesis at clinic scale. We are not copying a tool stack; we are building the
> same machine on €0 and selling it downmarket.

## Every commercial tool in their map → the free/OSS replacement

| Their tool | Job in their system | Free replacement | Verdict for Bianno |
|---|---|---|---|
| GoHighLevel (CRM+SMS+voice) | leads, pipelines, missed-call text-back | **Twenty** (twentyhq/twenty, OSS CRM) — but at our scale the **HQ db + lead lanes** already does it | SKIP tool; we ARE the replacement. Their GHL-401 watchdog failure frame proves vendor APIs rot |
| Calendly/booking | site-visit booking | **Cal.com** (calcom/cal.com, OSS; free cloud tier) | **ADOPT — this upgrades slice-1**: Cal.com free replaces the planned Calendly, €0 forever |
| PandaDoc | proposals + sign | **Documenso** (documenso/documenso, OSS signing) or proposal-as-page + Stripe link | QUEUED — proposal page + €97/setup Stripe link first; Documenso when a client wants signatures |
| Fathom | call notes → proposal | **faster-whisper** (local, already in video-teardown stack) | ADOPT — already ours |
| Metricool | social scheduling | **Postiz** (gitroomhq/postiz-app, OSS scheduler) | QUEUED behind publish-ops volume; posting stays human-tap for now |
| QuickBooks | finance/invoices | **Invoice Ninja** (OSS) / Stripe dashboard + ledger | SKIP until real invoice volume; Stripe + hq ledger covers €0→first clients |
| Slack (approvals, watchdog pings) | notify + approve | **Telegram Bot API** (free) + the RAIL (already better: approve executes) | ADOPT Telegram for pings when inbox slice builds; rail already superior |
| Loom | async walkthroughs | **Screenity** (OSS screen recorder) / OBS | ADOPT when day-7 follow-up needs a walkthrough video |
| Zoom | calls | **Jitsi Meet** (free) / Google Meet (already connected) | ADOPT Meet — zero setup |
| Kit-class email | sequences | **Listmonk** (OSS) — but Kit free tier is less ops burden at sea | KEEP Kit free tier (Growth-OS corr. 2); Listmonk if Kit ever paywalls the need |
| Meta/Google Ads | paid reach | none — platforms | unchanged: Phase-3 gate, evidence first |
| GHL Voice AI (missed calls) | answers phone | **our own AI Front Desk** (Twilio trial + local stack) | This is THE PRODUCT — we sell it, not rent it |
| n8n | triggers 24/7 | n8n IS OSS — needs hosting off the laptop tunnel | amber on the system map; ~€5/mo reserve micro-spend when a money loop runs |
| Claude Code + Jev | brain + judge | already ours; judge wiring shipped | LIVE/ARMED |

## Their non-tool layers → already built here
Signals→System-of-Record→Brain→Departments→Permissions ladder (AUTO/ASK-FIRST/NEVER) →
Knowledge layer (markdown: /vision /brand /sales /rules…) → Watchdog → One Page:
maps 1:1 to events/HQ db/Jarvis core/lenses/trust-ledger/vault/canaries/Morning One Page.
Their "NEVER" column (sign contracts, move money, delete data) = our L1 wall. Validation.

## Who connects what
**Only Bianno can (account/auth, one-time each):** flip GitHub Pages; OpenRouter key+€5
(Jev); Cal.com signup (free); Kit signup (free); Telegram bot creation (2 min, free);
Twilio trial; n8n hosting signup (when unlocked); any new claude.ai connector; Meta
Business (Phase-3 only).
**Claude/Cowork does the rest (all wiring, zero manual config):** Cal.com event types +
booking link into demo page + follow-ups; Kit form + tag + sequence; Telegram→vault
inbox webhook; judge wiring test; n8n workflows; proposal page; Whisper call-notes flow;
embed + verify everything, behind the regression gate.

## Order (unchanged by all of this)
Slice-1 definition of done still rules: page live → follow-ups sent → Kit capture →
**Cal.com booking** (upgraded from Calendly) → events logged → Playwright-walked.
Everything QUEUED above waits behind a paying clinic.
