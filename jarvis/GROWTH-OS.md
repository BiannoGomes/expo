# JARVIS // Growth OS — the commercial layer (adopted 2026-09-18)

> Companion to ARCHITECTURE.md (roles, supervision, browser reliability) and GODMODE.md
> (limits, governing rule). This layer: content = acquisition, funnels = conversion,
> offers = monetization, Jarvis = nervous system. Adopted with three corrections below.

## Tool-role separation (locked)
| Layer | Tool | Rule |
|---|---|---|
| Cockpit (human view) | Notion | a VIEW of state, never the database |
| Canonical state | HQ artifact db → Postgres/Supabase *when outgrown* (see correction 1) | one source of truth |
| Deep memory | Obsidian vault | strategy, lessons, knowledge |
| Relationship / lifecycle | Kit (subscribers, tags, sequences) | every lead is tagged at capture |
| Transactions | Stripe (live: €97 audit) / Stan later | pay-gate |
| Scheduling | Calendly | bookings become events via webhook |
| Conversation intel | OpenReply / native comment mining | every DM & comment = market research |
| Design system / production | Figma / Canva | never a database |
| Video | Wan2.2 local → Higgsfield premium | per wan22-setup.md router |
| Hands / QA | official @playwright/mcp | per ARCHITECTURE.md ladder |
| Automation glue | n8n | webhooks → event spine |

## The BUSINESS entity
Everything belongs to a business; every object carries relationships so revenue traces
back to the content that caused it.
- **UnifyOps** (AI front desk, dental) — offers: €97 audit (LIVE) → setup €1.5–2.5k →
  retainer €500/mo. Funnel mid-flight: Wave 7.
- **UnifyMind** (books, Reset, DAWNWARD-someday) — offers: books (LIVE) → 7-Day Reset
  magnet → future ladder.
Chain recorded on every object: content → campaign → funnel → lead → sequence → booking
→ customer → offer → revenue. The question the system must answer: **which content made
customers**, never which content got views.

## Offer ladder (architecture fixed, prices experimental)
FREE (content/DM) → LEAD MAGNET (email) → LOW TICKET (buyer identity) → CORE OFFER →
IMPLEMENTATION → RECURRING. Jarvis routes people by source/behavior/intent (Kit tags),
not by one static funnel. UnifyOps already implements rungs 1–5 in embryo.

## Event vocabulary (extends GODMODE events)
lead.created · lead.tagged · email.sent/opened · offer.viewed · checkout.started ·
payment.completed · booking.created/canceled · content.published/measured ·
experiment.completed · learning.created — every one carries attribution
{content_id, campaign, utm}. Agent hand-offs use the standard envelope
{mission_id, task_id, objective, action, result, evidence, confidence, cost, blocker,
next_action}.

## Playwright is the customer
No funnel receives traffic until Playwright has walked it as a stranger end to end:
load → CTA → email submit → thank-you → Kit tag exists → sequence fires → offer →
checkout (test mode) → Calendly. PASS or Hermes repairs. (Per ARCHITECTURE.md QA rule.)

## Notion cockpit spec (Apple-simple)
One page: TODAY (status, mission, objective, revenue, leads, experiments, needs-you) ·
THE BUSINESS (attention→leads→customers→revenue) · ACTIVE MISSIONS · COMMANDER ·
WHILE YOU WERE AWAY · LEARNING. Numbers real or UNKNOWN — never invented, never 0-faked.
Complexity lives in the BLACK BOX (events, traces, costs, retries) — opened only when
something breaks.

## Three corrections (honest engineering)
1. **Supabase later, not first.** The HQ db is the canonical store for slice 1 (it holds
   ≤5,000 docs, no joins — fine for tens of leads, wrong for thousands). Migrate to
   Postgres/Supabase when lead volume is real; the event schema above is designed to
   move unchanged. Adding database infra before the first funnel converts is
   production-engine disease.
2. **Slice 1 needs TWO new tools, not nine.** Kit + Calendly. Figma, Canva-API, Stan,
   OpenReply, n8n-rebuild all wait behind a working loop. The directive's own rule:
   one vertical slice, then plug capabilities into the proven spine.
3. **Slice 1 already exists — finish it, don't found it.** The dental funnel IS the
   vertical slice, mid-flight: content (carousels live) → demo page (built, awaiting
   white-label deploy) → €97 Stripe (LIVE) → follow-ups (drafted, held). Mission one
   is instrumenting and completing THIS loop: deploy page → swap links → send follow-ups
   → add Kit capture + tag to the demo page → add Calendly booking link → log every
   step as events → Playwright-walk it. First real lead.created event beats any schema.

## Definition of slice-1 done
One stranger travels content → page → email captured in Kit (tagged) → sees the €97
offer → (test-mode) checkout → Calendly booking → every hop logged as an attributed
event in the HQ db → funnel autopsy reads it back. Then, and only then, the next
capability plugs in.
