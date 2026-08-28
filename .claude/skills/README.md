# AI-OS skill layer

Small, single-purpose Claude Code skills — the "brain" of a personal AI
operating system. Each skill is one `SKILL.md` and only loads when its trigger
matches, so context stays clean (five small skills beat one giant prompt).

Everything lives inside the **Jarvis Cowork folder** — the skills themselves
sit in `Jarvis\.claude\skills\`, and everything they produce is saved to
`Jarvis\AI-OS\`. One self-contained folder, no separate vault.

| Skill | Job | Fires on |
| --- | --- | --- |
| `metrics` | Pull KDP / Instagram / TikTok / ad numbers → short written summary | "how are my numbers", "how are sales", "how did the ads do" |
| `inbox` | Morning brief: mail + calendar → the 3 things that need me today | "morning brief", "what's on today", "start my day" |
| `trends` | Scan my sources → only what moved since yesterday | "trends", "what moved", "what's new in my space" |
| `plan` | Today's top-3 priorities → dated markdown file | "plan my day", "top three", "priorities" |
| `vault` | Read/write the Jarvis folder — the persistence layer every other skill uses | "save to my notes", "what did I write about X" |

## Rules baked in

- **One job per skill.** Only the matching one loads.
- **Triggers live in the description** so the right skill fires without naming it.
- **`vault` is the only writer.** Everything durable persists through it, into
  `Jarvis\AI-OS\`.
- **Nothing writes outside the Jarvis folder without telling you first**, and
  nothing overwrites one of your hand-made files without asking.

## Install (Windows / Cowork)

Drop the `.claude` folder from the bundle into your Jarvis folder so the path
becomes:

```
C:\Users\biann\Desktop\Jarvis\.claude\skills\{metrics,inbox,trends,plan,vault}\SKILL.md
```

Cowork loads project skills from the folder it's working in, so once they're
under `Jarvis\.claude\skills\` they're live the next time you open Cowork there.
(To make them load in *every* folder instead, put the same `skills\` folders
under `C:\Users\biann\.claude\skills\`.)

## Setup

1. **Where things save** — defaults to `C:\Users\biann\Desktop\Jarvis`. To use a
   different path, set a `JARVIS_HOME` environment variable. Skills write under
   `<Jarvis>\AI-OS\{Metrics,Briefs,Trends,Plans}\`.
2. **Credentials (metrics)** — stored in **Bitwarden**, fetched at runtime via
   the `bw` CLI (`bw get password "<item>"`). Nothing sensitive is ever in these
   files or in git. Ad platforms (Supermetrics/Motion) and TikTok (Higgsfield)
   come through connected MCP tools and need no stored key.
3. **Optional connectors** — `Tavily` (cleaner trends web search), `Stripe`
   (revenue), and `MailerLite` (email-list subscribers) enhance `trends`/
   `metrics` once authorized, but the skills work without them.
