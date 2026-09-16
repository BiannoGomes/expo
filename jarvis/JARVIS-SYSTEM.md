# JARVIS — Ultimate System · Build Record (2026-09-16)

> Built in a Claude Code cloud session on Bianno's explicit override of the shipping gate.
> One rule kept, per Bianno's own Command Center v3 spec: **Jarvis proposes → Bianno approves
> anything that publishes, sends, or pays.**

## What shipped this session

### 1. Jarvis HQ v4 — live now
**https://claude.ai/artifact/DhkipE7Vt2zstWvp3UH8PY** (private to Bianno's account)

One command deck fusing the four prior generations:
- **Mission Control** (2026-07-15) → decision rail, trust ledger, spoken brief
- **Day OS** (2026-07-19) → state check-in, yacht mode, day blocks
- **Command Center v3** (2026-09-01) → visual DNA (Sora/Inter, blue–purple–teal), governing rule
- **Neural Index** (2026-09-02) → ARMED / QUEUED / SKIP chips, standing intel

New in v4 over every predecessor: **state syncs across devices** (artifact database, not
localStorage), so the phone and the desktop finally see one Jarvis. The **exposure counter**
is the hero metric — humans reached, logged by hand, nothing invented. Seeded 2026-09-16 with
verified state only:

| Fact | Source |
|---|---|
| 2 books live on KDP, all formats, KDP Select | KDP dashboard screenshot (Drive, 8 Sep) |
| Book 3 typeset, 5 audit blockers | Cowork session, 16 Sep |
| Posting queue: 100/120 fired, dry Sun 20 Sep | Cowork session, 16 Sep |
| Heartbeat log stale since 2 Aug | JARVIS Heartbeat Log sheet (Drive) |
| UnifyOps pricing conflict (€400 product vs "a partir de 500€/mês" outreach) | Neural Index Wave 2 |
| Firecrawl API key exposed in an old Google Doc | Found this session — **rotate it** |

The HTML source lives beside this file: `jarvis/jarvis-hq.html`. Republishing it to the same
artifact URL updates every open device.

### 2. Decisions queued on the rail (need Bianno's yes)
1. UnifyOps pricing floor: €500/mo retainer, €1,500–2,500 setup, €97 audit.
2. Rotate the exposed Firecrawl key, then delete it from the "Jarvis — claude code setup" doc.
3. Posting queue past 20 Sep: extend, or rest while Book 3 ships (Jarvis recommends rest).

## What this cloud session could NOT reach — local follow-up list
Run these from a Cowork/desktop session (it can see `C:\Users\biann\Desktop\Jarvis`):
1. Point the desktop vault's Morning Brief Publisher at the new HQ (or keep writing
   `mission-data.js` — the HQ replaces the local dashboards, so the simplest path is retiring
   them and logging straight into the HQ).
2. Re-arm the heartbeat loop (stale since 2 Aug).
3. Obsidian vault ("Jarvis Brain") sync: the HQ is the cockpit; the vault stays the memory.
4. Higgsfield: the account-bound MCP server failed to connect in this session; the
   `jarvis-unify-ops.higgsfield.app` deploy is untouched. Redeploy from the desktop when wanted.

## Toolchain manifest — the repos and guides from the notes, adjudicated

**Install when a mission needs them (not before):**
- `Zie619/n8n-workflows` — 4,300+ workflow JSONs. Reference library; search it before building
  any n8n flow from scratch. Do not bulk-import.
- `ajsahni/agents-office` — agent-team scaffold; evaluate once UnifyOps productizes delivery.
- `sergebulaev/linkedin-skills` — only if LinkedIn becomes an active channel.
- AI Video Factory stack (Arcads/Creatify/HeyGen + OpusClip + ElevenLabs hosted MCPs) —
  layers 1–2 only, after Book 1 has 15+ reviews and a converting channel exists.
- AI Vault-style storefront — teardown held from 15 Sep session; build it for Bianno's own
  live products (books, Etsy, Reset PDF) once they're all listed.

**Never (standing kills, confirmed by Bianno's own Neural Index):**
- Any permissions-off / unverified-system-prompt hack. Deletes the safety layer the trust
  ledger exists for.
- A second autonomous coder (OpenHands etc.) — redundant risk surface.

## Security actions
- **Rotate the Firecrawl key** (`fc-be9…`) at firecrawl.dev; remove it from the Google Doc
  "Jarvis - claude code setup". Keys never belong in docs; use env vars on the machine that
  needs them.
