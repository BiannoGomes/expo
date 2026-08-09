---
name: vault
description: >-
  Read from and write to my Obsidian notes vault. This is the persistence layer
  for the whole AI-OS — every other skill (metrics, inbox, trends, plan) calls
  this skill to save what it produced and to read what it saved before. FIRES
  whenever something needs to be persisted to or recalled from my notes: "save
  this to my vault", "put that in my notes", "what did I write about X",
  "append to today's note", or any time another skill has an output to store.
  This is the ONLY skill allowed to write to the vault, so all durable writes go
  through it.
---

# vault — the memory layer

I keep everything in a local **Obsidian** vault (linked markdown, no database).
This skill is the single door in and out of it.

## Where the vault lives

Resolve the vault root in this order and use the first that exists:

1. The `OBSIDIAN_VAULT` environment variable.
2. `~/Obsidian` (default if you haven't set the variable).

> One-time setup: `export OBSIDIAN_VAULT="/path/to/your/vault"` in your shell
> profile so this resolves the same way every session. If neither location
> exists, ask me for the path instead of guessing — never create a vault
> somewhere new on your own.

## Folder layout the AI-OS uses

All machine-generated notes live under an `AI-OS/` folder so they never mix with
my hand-written notes:

```
<vault>/
  AI-OS/
    Metrics/   YYYY-MM-DD.md   ← metrics skill
    Briefs/    YYYY-MM-DD.md   ← inbox skill (morning brief)
    Trends/    YYYY-MM-DD.md   ← trends skill
    Plans/     YYYY-MM-DD.md   ← plan skill
```

Every note gets YAML frontmatter (`created`, `type`, `source`) and uses
`[[wikilinks]]` so it connects into the graph. Prefer append over overwrite for
daily notes.

## Reading

- To recall something, search the vault (filename + full text) and read the
  matching markdown. Return the content plainly — you can read every word it
  knows, there's no lock-in.
- When another skill needs "what did we have yesterday" (e.g. trends diffing),
  read the previous dated note from the relevant folder.

## Writing — the one hard rule

**Nothing is written outside the vault root without telling me first, and
nothing overwrites an existing hand-written note without asking.**

- Writes inside `<vault>/AI-OS/**` are routine — just do them and report the
  path you wrote.
- A write anywhere else in the vault, an overwrite of a non-AI-OS file, or any
  path outside the vault root → stop and confirm with me first, showing the
  exact path and a preview.

After any write, tell me the file path so I can open it in Obsidian.
