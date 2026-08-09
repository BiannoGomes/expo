---
name: trends
description: >-
  Scan the sources I care about and report ONLY what moved since yesterday — the
  delta, not a firehose. Covers my niche on Instagram/TikTok (trending formats &
  audio), Amazon chart movement in my book categories, and news in my space (AI,
  self-help/personal-growth, indie publishing). FIRES when I say "trends", "what
  moved", "what's new in my space", "anything I should know", or ask what's
  changed today. It diffs against yesterday's scan and saves the new one to the
  vault via the `vault` skill.
---

# trends — only what changed

One job: tell me what's *different* since yesterday. If nothing moved, say
"quiet day" — that's a valid, useful answer.

## Sources

- **Social / niche** — trending formats and audio in my lane. Use TikTok
  trending audio (Higgsfield `tiktok_music_trending`) and web search for what's
  breaking on Instagram/TikTok in personal-growth / UnifyMind's topic space.
- **Amazon** — movement in my book categories (bestseller-rank shifts, new
  entrants near my titles). Web search / category pages.
- **News** — AI, self-help/personal-growth publishing, KDP/indie-author policy
  changes. Use web search; if the **Tavily** connector is authorized, prefer it
  for cleaner results.

## The diff (this is the point)

Before reporting, use the **`vault`** skill to read yesterday's
`AI-OS/Trends/YYYY-MM-DD.md`. Compare against today's scan and report **only new
or changed** items — a format that's suddenly spiking, a new competitor in my
category, a policy change. Drop anything that was already there yesterday.

Format:

> **Moved since yesterday:**
> - TikTok: <sound/format> is spiking in our niche — worth a carousel/reel.
> - Amazon: a new title jumped into our category top 20 — <title>.
> - News: KDP changed <thing> — could affect <us how>.

## Persist

Save today's full scan via the **`vault`** skill to
`AI-OS/Trends/YYYY-MM-DD.md` (routine, inside AI-OS) so tomorrow's run has
something to diff against.
