---
name: dawnward-selling-machine
description: Run Dawnward's content-and-proof advertising machine. Mine pain from competitor 1-2 star reviews and our own comments/DMs, turn each pain into a "name it" post or a complaint-to-fix video, keep the Notion brain current, and run the Sunday learning loop. Use when asked to make Dawnward content, plan the week, mine reviews, make complaint videos, update the Notion selling machine, or analyse how posts performed.
---

# The Dawnward Selling Machine

Two proven methods, one system:

- **The knife.** One platform (Instagram @bianno.becoming). Name the customer's problem better than they can, agree with them ("yes, I know"), and talk to them. No product pitch in the first eight weeks. Real conversations change the product.
- **The bad-review gold mine.** Competitors' 1 and 2 star reviews come from people who already paid for a solution and were let down. Their repeated complaints are the content plan. One complaint becomes one video: open on their actual words, then show Dawnward doing that exact thing in about five seconds. Reply to every comment with a real conversation.

## The brain: Notion

Hub page "Dawnward Selling Machine" (private, id `4055065c392e8105a793deffea005ef6`) holds four linked databases. Fetch each data source before writing to it and use exact property names.

| Database | Data source | Holds |
|---|---|---|
| Pain Points | `collection://6e9b32a0-f9c1-4841-891d-2ad5f940cfde` | Each pain in their words, affirmation, Dawnward's real answer, fit, status |
| Content Pipeline | `collection://0cab741b-b515-4547-a45b-99b71bb33abb` | Every post or video: format, linked pain, hook, script, caption, status, results |
| Proof Vault | `collection://c422d683-830d-4180-abe2-bfcef706f311` | Verbatim quotes with source links: reviews, comments, DMs, tester feedback |
| Weekly Learning | `collection://a7a82f0d-4e93-43e2-8c1c-8d8ebf36b227` | The Sunday loop: conversations, top pains, best/worst post, product signal |

## Jobs

### 1. Mine reviews
Search App Store, Google Play, Trustpilot and Reddit for 1-2 star reviews of journaling, habit and self-growth apps (Day One, Rosebud, Reflectly, Stoic, Finch, Fabulous, Habitica and similar). Copy quotes **verbatim from pages actually fetched**, with URLs; never paraphrase into quotes, never invent. Cluster into themes; for each, record Dawnward's honest fit. Write quotes to Proof Vault, themes to Pain Points (merge with existing rows; bump "Times seen"). Research archive: `dawnward/marketing/selling-machine/research/`.

### 2. Make a complaint video
Template: `dawnward/marketing/selling-machine/complaint-reel.html` driven by `reels.js` (one entry per video). Formula:

| Beat | Time | Content |
|---|---|---|
| Complaint | 0 to 2.5 s | Review card with the customer's real words, star rating, visible from frame one. Never name the competitor. |
| Cut | 2.5 s | Hard cut on the music downbeat (owner's Suno track, `launch-film/audio/suno/emotional-build.wav`, slice from 12.6 s so the swell lands on the cut). |
| Fix | 2.5 to 8.4 s | Dawnward full screen doing that exact thing, 5 second timer, one caption, then a second caption. |
| Tag | 8.4 to 11 s | Wordmark, one plain line, "Comment TELL". |

Fix scenes available: `debrief` (one question, talk or type, listening), `today` (three small moves, one kept, gold star), `evidence` (insight with its reason and "That's not right"). Only map a complaint to a fix the app really ships. If nothing fits, log it as product signal instead of making a video.

Render: `node render-reel.mjs <id>` then `sh encode-reel.sh <id>` from `dawnward/marketing/selling-machine/`.

### 3. Make "name it" posts (weeks 1-8)
Reels, carousels and question posts that state the pain in the customer's words, affirm it, and end on a question. Zero product mentions. Format examples: `dawnward/marketing/knife/week-01-batch.md`.

### 4. Weekly batch
Seven feed posts plus seven story stickers, each linked to a pain in Content Pipeline with status "Awaiting Bianno". Render what needs rendering. Only after Bianno approves: schedule via Blotato (@bianno.becoming, account 75385) and set status "Scheduled".

### 5. Sunday loop
Pull the week's comments and DM conversations via Blotato. Cluster by pain with exact phrases; update Pain Points (new rows, "Times seen", status to Validated when real people say it), add the best quotes to Proof Vault, record results on each posted item, write a Weekly Learning row with the product signal, then draft next week's batch from the strongest new language.

## Phases

| Weeks | Phase | Product mentions | Gate |
|---|---|---|---|
| 1-4 | Dig | none | 100 real conversations |
| 5-8 | Build in the open; complaint videos begin | the problem it solves; WAIT joins the waitlist | waitlist 150 |
| 9-12 | Show it (launch film v5 and cuts) | yes | waitlist 300 and 30 who'd pay |
| 13+ | Widen to TikTok, Threads, Shorts | yes | Instagram proven |

## Non-negotiables

- AI proposes, Bianno approves anything that posts, sends, schedules, spends, or switches on an automation.
- Warm only. Reply to people who spoke first; never cold DM.
- Every quote real and sourced; every feature shown real and shipped; no invented numbers, testimonials, prices or store claims.
- The Human Law: no em-dashes, no AI-sounding language, no guilt, no streaks or scores in our own content.
- Measure conversations first, then saves and shares, then waitlist joins. Not followers.
