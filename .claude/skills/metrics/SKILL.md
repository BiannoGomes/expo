---
name: metrics
description: >-
  Pull my performance numbers from wherever they live and report them as a
  short, written summary — not a dashboard, a few sentences I can read in ten
  seconds. Covers Amazon KDP (book sales, royalties, page reads), Instagram and
  TikTok (followers, reach, engagement), and my ad platforms (Meta/Google spend
  & ROAS). FIRES when I ask "how are my numbers", "how are sales", "how did
  Instagram/TikTok/the ads do", "pull my metrics", "weekly numbers", or any
  request for how a platform is performing. After reporting, it saves the
  summary to the vault via the `vault` skill.
---

# metrics — pull my numbers, report in plain words

One job: gather the numbers and write a short summary. No charts.

## Platforms & where each number comes from

| Platform | Source to use |
| --- | --- |
| **Amazon KDP** (sales, royalties, KENP page reads) | No public API. Use the KDP dashboard CSV export if one is saved under `Jarvis\AI-OS\Metrics\_imports\`, otherwise tell me you need the latest KDP report and I'll drop it there. |
| **Instagram** (followers, reach, engagement) | Instagram Graph API token (see credentials below). If no token is set, ask me for the day's numbers rather than inventing them. |
| **TikTok** (views, followers) | The connected TikTok account via the Higgsfield tools (`tiktok_accounts`). |
| **Ad platforms** (Meta/Google spend, ROAS) | Supermetrics (`data_query`) for spend/ROAS; Motion for Meta creative-level performance. |
| **Revenue / email list** (optional) | Stripe (payments) and MailerLite (subscribers) if/when those connectors are authorized. |

## Credentials — Bitwarden via the `bw` CLI

Secrets live in **Bitwarden**, never in this file or in git. Fetch them at
runtime, e.g.:

```
bw get password "Instagram Graph API token"
bw get password "KDP report email"
```

Expected Bitwarden item names (create these once): `Instagram Graph API token`,
`KDP report email`, and any ad-platform keys not already covered by the
connected MCP tools. If `bw` is locked, tell me to run `bw unlock` — don't try
to work around it. Platforms reachable through the already-connected MCP tools
(ad platforms via Supermetrics/Motion, TikTok via Higgsfield) need no stored
key at all.

## Output

Write it the way a sharp assistant would say it out loud, e.g.:

> KDP: 41 sales + 12.3k KENP page reads yesterday (~$118 royalties), up ~15% on
> the day before. Instagram: +86 followers, the Tuesday carousel drove most of
> the reach. TikTok: flat. Ads: Meta spent $54 at 2.1x ROAS — steady.

State the date/window covered. If a source was unreachable, say so plainly
instead of guessing.

## Persist

After reporting, hand the summary to the **`vault`** skill to save at
`AI-OS/Metrics/YYYY-MM-DD.md`. That write is inside the AI-OS folder, so it's
routine — just do it and tell me the path.
