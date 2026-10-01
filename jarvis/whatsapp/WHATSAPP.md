# JARVIS // WhatsApp line + shop — built 1 Oct 2026

> Sources: aiwithanushka "Give Claude a WhatsApp number" (Kapso, 9 slides) + gobi_automates
> "Build your Jev Company Brain" (8 slides) + Kapso's own repos read in full
> (gokapso/agent-skills, gokapso/claude-code-whatsapp) + Meta's pricing docs.
> Verdict: **Kapso + a Kapso Function is the line.** No server, no laptop, no Cloudflare
> account, no ban risk (official Cloud API). Code is written and tested (18/18).

## What it does
You WhatsApp the Jarvis line (text or voice note) from your own phone, any time of day.
Only your number is answered. Everyone else is ignored and nothing they write is stored.

```
ASK        you → Jarvis line (text / voice note; Kapso transcribes voice for free)
CLASSIFY   Jev message_route → ANSWER | DRAFT | CAPTURE | DEEP_WORK  (S1, ~ms, typed)
RETRIEVE   CAG context pack (who you are, rules, offer ladder, current bottleneck)
ACT        ANSWER → brain replies in chat
           DRAFT  → "📝 DRAFT — check it, then send it yourself" (never sent to anyone else)
           CAPTURE→ saved to the inbox (#id)
           DEEP_WORK → queued; say "sync whatsapp" in Claude and it gets done properly
WRITE BACK inbox in Kapso KV → sync.mjs → vault/_inbox/whatsapp-<date>.md → heartbeat/Fable
```
That is gobi_automates' six-step loop (Ask → Classify → Retrieve → Select → Act → Write back), running on €0 infrastructure.
Commands on the line: `/inbox` · `/done N` · `/clear` · `/help`.

## Files
| File | What |
|---|---|
| `jarvis-line.js` | the Kapso Function (Cloudflare runtime). Owner allowlist, HMAC signature check (fails closed), dedupe, Jev routing with lanes, keyword fallback, brain via OpenRouter, KV inbox, `sendToOwner()` is the ONLY outbound path and throws on any other recipient |
| `test.mjs` | `node jarvis/whatsapp/test.mjs` — 18 offline tests (signature, stranger, mixed batch, voice, Jev lanes, drafts, outage, dedupe, commands, chunking, send isolation, export auth) |
| `sync.mjs` | desktop pull of open inbox items into the Obsidian vault (read-only, key-authenticated) |
| `../../vault-sync/UnifyOps/WhatsApp Shop.md` | shop catalog, greeting/away/quick replies, PT |

## Safety (regression cases whatsapp-001…004)
- **Owner-only.** Kapso's reference repo has *no sender allowlist* — anyone texting it would drive Claude with your GitHub token. Ours ignores every number except `OWNER_WA`.
- **Never sends to third parties.** Customer-facing words are DRAFTS delivered to you. The outward tap stays yours (GODMODE; classifier denial of 30 Sep stands).
- **Jev scores, never acts.** <0.5 confidence = store only. 0.5–0.85 = deterministic router decides.
- **Nothing private in the repo.** `BiannoGomes/expo` is PUBLIC (verified 1 Oct). Messages live in Kapso KV + your private vault only. Secrets live in Kapso function settings only.

## Costs — verified 1 Oct 2026
| Item | Number | Source |
|---|---|---|
| Kapso free plan | 2,000 messages/month (inbound + outbound both count), 1 number, 100,000 function calls, 30 min audio transcription, no card | Kapso pricing pages (docs.kapso.ai blocked from this container — re-check on signup) |
| Meta, from **today** | first **1,000 delivered service messages per number per month free**, then per-message at the recipient market's utility rate; utility templates inside the window now billable | developers.facebook.com WhatsApp pricing |
| Jev | ~$0.042 per million input tokens, $0 output | two-speed.md (verified 30 Sep) |
| Brain | depends on the `BRAIN_MODEL` you choose on OpenRouter (Claude = best, paid; `:free` models = €0 but rate-limited — limits UNKNOWN here, check openrouter.ai) | — |
Realistic use: 20 voice notes a day ≈ 1,200 messages/month → inside Kapso's 2,000 and Meta's 1,000-reply allowance. **€0 until you choose a paid brain.**

## Setup — what only you can do (≈15 min, all free)
1. **kapso.ai** → sign up → take the free number (instant, no SIM) → create an API key.
2. **openrouter.ai** → create a key (the same one Jev needs). A top-up is a PAY action — your call; Jev alone costs fractions of a cent per message.
3. In Kapso → Functions → after Cowork creates `jarvis-line`, paste the secrets into its settings: `OWNER_WA`, `WEBHOOK_SECRET`, `KAPSO_API_KEY`, `PHONE_NUMBER_ID`, `OPENROUTER_API_KEY`, `BRAIN_MODEL`, `SYNC_KEY` (secrets never go through chat).

**Cowork paste-line (does everything else):**
> Install Kapso's skills with `npx skills add gokapso/agent-skills`. Using KAPSO_API_KEY from my .env: create a Kapso function named jarvis-line from jarvis/whatsapp/jarvis-line.js on branch claude/ai-vault-portal-replica-jutqvp with public_endpoint=true, deploy it, then create a phone-number webhook for my Kapso number pointing at the function's endpoint_url with events whatsapp.message.received, buffer_enabled=true, buffer_window_seconds=3, saving the webhook secret via KAPSO_SECRET_OUTPUT_FILE (never print it). Tell me which secrets to paste into the function settings. Then I'll send "/help" from my phone and you check the function logs until it replies. Add JARVIS_LINE_URL and SYNC_KEY to my .env for sync.mjs.

## The shop — honest verdict
A catalog doesn't create demand; buyers do. It earns its place **only** as the destination for the Wave 7 clinics: every follow-up ends with "ou fale connosco no WhatsApp". So the shop sells **UnifyOps only** (books stay on Amazon; mixing brands confuses a clinic owner).
- **Number:** the shop needs an EU number you control (a +351 number reads best to Portuguese clinics; a Spanish prepaid SIM from Palma works). Install the free **WhatsApp Business app** on it → Catalog → paste the items from `WhatsApp Shop.md`.
- **Later, one number for both:** connect that Business-app number to Kapso via coexistence (the app keeps working, messages sync) and move the Jarvis line onto it. You (owner) → Jarvis; clinics → you answer in the app, Jarvis can draft. Customer auto-replies are NOT built and need your explicit decision first.
- **The product angle:** Kapso Flows (forms inside WhatsApp: name → service → slot → confirm) is literally the clinic AI Front Desk on WhatsApp. Portuguese clinics live on WhatsApp. Once the line runs for you, it is the demo you sell.

## Jev Company Brain (gobi_automates) → what we adopt
| Their layer | Ours | Verdict |
|---|---|---|
| Jev = orchestrator (classify · route · escalate) | Jev = S1 judge; `message_route` now live in the line; 9 judges in registry | **ADOPTED** — Jev routes *messages* to lanes. Jev routing the Claude brain stays SKIP (two-speed.md) |
| Source layer (docs, chats, CRM, files) | vault + Drive + HQ db + Kapso KV inbox | live |
| CAG (cached understanding) | context pack in `jarvis-line.js` + GODMODE/CLAUDE.md | **live today** |
| RAG (fresh retrieval) | desktop Claude over the vault (Cowork) | live on desktop; not on the line yet — deep work goes there |
| Graph (who-knows-what) | — | **SKIP** until ≥3 clients exist; there are no relationships to graph yet |
| Composio (tools) | native MCP connectors (Gmail, Drive, Calendar, Notion, Canva, Higgsfield) + Kapso | **SKIP** — a second tool layer is sprawl |
| Treg (treg.to, pay-per-call data: SEO, enrichment) | — | **QUEUED** — useful for Wave 8 lead lists; costs per call, so behind a running money loop |
| Worktrees (Sales/Support/Ops/Research…) | departments-as-views on the bridge | already ours — validation, not homework |
