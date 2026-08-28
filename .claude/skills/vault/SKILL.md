---
name: vault
description: >-
  Read from and write to my Jarvis notes folder. This is the persistence layer
  for the whole AI-OS — every other skill (metrics, inbox, trends, plan) calls
  this skill to save what it produced and to read what it saved before. FIRES
  whenever something needs to be persisted to or recalled from my notes: "save
  this to my notes", "put that in Jarvis", "what did I write about X", "append
  to today's note", or any time another skill has an output to store. This is
  the ONLY skill allowed to write into the Jarvis folder, so all durable writes
  go through it.
---

# vault — the memory layer (inside the Jarvis folder)

Everything the AI-OS remembers lives as linked markdown **inside my Jarvis
Cowork folder** — the same folder all my other work is in. There is no separate
vault. This skill is the single door in and out of it.

## Where it writes

Resolve the Jarvis root in this order and use the first that exists:

1. The `JARVIS_HOME` environment variable, if set.
2. `C:\Users\biann\Desktop\Jarvis` (my Cowork folder — the default).

If neither exists, ask me for the folder instead of guessing — never create the
folder somewhere new on your own.

> Optional: I can point Obsidian at this same folder if I want the graph view,
> but nothing here requires Obsidian. It's plain markdown either way.

## Folder layout the AI-OS uses

All machine-generated notes live under an `AI-OS\` subfolder **inside Jarvis**,
so they stay tidy and never collide with my hand-made Cowork files:

```
C:\Users\biann\Desktop\Jarvis\
  AI-OS\
    Metrics\   YYYY-MM-DD.md   ← metrics skill
    Briefs\    YYYY-MM-DD.md   ← inbox skill (morning brief)
    Trends\    YYYY-MM-DD.md   ← trends skill
    Plans\     YYYY-MM-DD.md   ← plan skill
  ...my other Cowork work...
```

Every note gets YAML frontmatter (`created`, `type`, `source`) and uses
`[[wikilinks]]` so it connects up. Prefer append over overwrite for daily notes.

## Reading

- To recall something, search the Jarvis folder (filename + full text) and read
  the matching markdown. Return the content plainly.
- When another skill needs "what did we have yesterday" (e.g. trends diffing),
  read the previous dated note from the relevant `AI-OS\` subfolder.

## Writing — the one hard rule

**Nothing is written outside the Jarvis folder without telling me first, and
nothing overwrites one of my existing hand-made files without asking.**

- Writes inside `Jarvis\AI-OS\**` are routine — just do them and report the path.
- A write anywhere else in Jarvis, an overwrite of a non-AI-OS file, or any path
  outside the Jarvis folder → stop and confirm with me first, showing the exact
  path and a preview.

After any write, tell me the file path so I can open it.
