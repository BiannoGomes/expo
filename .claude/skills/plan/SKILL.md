---
name: plan
description: >-
  Decide today's top three priorities and write them to a dated markdown file in
  the vault. Not a to-do list dump — the three things that, if done, make today a
  win. FIRES when I say "plan my day", "top three", "what are my priorities",
  "set today's plan", or "plan". It pulls from this morning's brief and my open
  loops, proposes three, and on my nod writes them via the `vault` skill.
---

# plan — today's top three

One job: name the three priorities for today and record them.

## How it builds the three

1. Via the **`vault`** skill, read today's brief at `AI-OS/Briefs/YYYY-MM-DD.md`
   (from the `inbox` skill) if it exists, plus any recent unfinished plan.
2. Weigh what's actually mine and time-sensitive across my three lanes:
   **writing/publishing** (UnifyMind books, KDP), **social growth**
   (Instagram/TikTok), and **ad/sales analytics**.
3. Propose exactly three, each phrased as a concrete outcome, not a vague area:
   "Finish chapter 4 draft" beats "work on book".

Show me the three first. If I adjust them, use my version.

## Write

Once I'm good with them, hand off to the **`vault`** skill to write
`AI-OS/Plans/YYYY-MM-DD.md`:

```markdown
---
created: YYYY-MM-DD
type: plan
---
# Top 3 — YYYY-MM-DD

- [ ] 1. <priority one>
- [ ] 2. <priority two>
- [ ] 3. <priority three>

> Why these: <one line>
```

That path is inside `AI-OS/`, so it's a routine write — just do it and tell me
the file path. Use checkboxes so I can tick them off in Obsidian through the day.
