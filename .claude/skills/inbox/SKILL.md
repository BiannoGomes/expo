---
name: inbox
description: >-
  My morning brief. Scan mail and calendar and return only the three things that
  actually need me today — not an inbox dump, a triage. FIRES when I say "morning
  brief", "what's on today", "start my day", "brief me", "check my inbox", or ask
  what needs my attention today. Best run first thing on a weekday. It reads Gmail
  and Google Calendar, decides what's genuinely mine to act on, and saves the
  brief to the vault via the `vault` skill.
---

# inbox — the morning brief

One job: cut today down to the three things that truly need me.

## What it reads

- **Gmail** (`search_threads`) — unread and recent threads from the last ~24h.
  Prioritise: anything from a real person awaiting my reply, publisher/KDP or
  payment notices, and time-sensitive asks. Ignore newsletters, receipts, and
  automated noise unless they carry a deadline.
- **Google Calendar** (`list_events`) — today's events. Flag anything that needs
  prep, a decision, or that I might have forgotten.

## How it decides

Return **exactly the top three** items that need *me* today — the ones that
don't happen unless I do something. For each: one line on what it is, and the
single next action. If fewer than three genuinely need me, say so; don't pad.
Everything else stays out of the brief.

Format:

> **Today, 3 things:**
> 1. Reply to <person> — they're waiting on the <thing>; needs a yes/no.
> 2. 2pm call with <name> — pull up the <doc> beforehand.
> 3. KDP payment cleared — nothing to do, just so you know.

## Persist

Hand the brief to the **`vault`** skill to save at `AI-OS/Briefs/YYYY-MM-DD.md`
(routine write, inside AI-OS). This note is also what the `plan` skill reads
when it builds today's priorities, so always save it.
