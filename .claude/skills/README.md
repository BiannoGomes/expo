# AI-OS skill layer

Small, single-purpose Claude Code skills — the "brain" of a personal AI
operating system. Each skill is one `SKILL.md` and only loads when its trigger
matches, so context stays clean (five small skills beat one giant prompt).

| Skill | Job | Fires on |
| --- | --- | --- |
| `metrics` | Pull KDP / Instagram / TikTok / ad numbers → short written summary | "how are my numbers", "how are sales", "how did the ads do" |
| `inbox` | Morning brief: mail + calendar → the 3 things that need me today | "morning brief", "what's on today", "start my day" |
| `trends` | Scan my sources → only what moved since yesterday | "trends", "what moved", "what's new in my space" |
| `plan` | Today's top-3 priorities → dated markdown file | "plan my day", "top three", "priorities" |
| `vault` | Read/write the Obsidian vault — the persistence layer every other skill uses | "save to my vault", "what did I write about X" |

## Rules baked in

- **One job per skill.** Only the matching one loads.
- **Triggers live in the description** so the right skill fires without naming it.
- **`vault` is the only writer.** Everything durable persists through it.
- **Nothing writes outside the vault without telling you first**, and nothing
  overwrites a hand-written note without asking.

## Setup

1. **Vault path** — `export OBSIDIAN_VAULT="/path/to/your/vault"` in your shell
   profile. Skills write under `<vault>/AI-OS/{Metrics,Briefs,Trends,Plans}/`.
2. **Credentials (metrics)** — stored in **Bitwarden**, fetched at runtime via
   the `bw` CLI (`bw get password "<item>"`). Nothing sensitive is ever in these
   files or in git. Ad platforms (Supermetrics/Motion) and TikTok (Higgsfield)
   come through connected MCP tools and need no stored key.
3. **Optional connectors** — `Tavily` (cleaner trends web search), `Stripe`
   (revenue), and `MailerLite` (email-list subscribers) enhance `trends`/
   `metrics` once authorized, but the skills work without them.

These live in the repo at `.claude/skills/` and are installed to
`~/.claude/skills/` so Claude Code loads them.
