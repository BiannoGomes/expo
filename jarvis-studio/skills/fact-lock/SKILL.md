---
name: fact-lock
description: Factual integrity for motion and video — every number, date, percentage, price, name, quote and claim on screen must trace to an approved, sourced row in the project's facts.md ledger, verified mechanically by check-facts before any render ships. Use whenever a piece shows statistics, results, milestones, product claims, prices, dates, quotes, research findings, or Bianno's own numbers (sales, reviews, followers).
---

# fact-lock

**Facts first. Nothing invented.** A beautiful frame with a wrong number is a liability, not
content.

## Protocol

1. **Before any animation**, list every factual element the piece will show, then copy
   `SKILLS/studio/templates/facts.md` into the project and fill one row per fact:
   - `value`: the **exact on-screen string** ("4.8", "15 reviews", "12 March 2026")
   - `source`: a URL, a file path, "Bianno, <date>", or a named dashboard screenshot. Never "common knowledge".
   - `approved`: `yes` only when Bianno supplied or confirmed it, or when it comes verbatim from his
     own published system (e.g. the content-wave CTA words)
   - `kind`: `FACT` · `INTERPRETATION` · `PERSONAL EXPERIENCE`, kept visibly separate on screen or in the caption
   - personal stories: the source is the story-register ID (`S-001`), and it's only approvable when the register row
     says `verified: yes`. Details marked "unconfirmed" there never go on screen, even if they'd make a better story.
2. **Bind** each factual element in the composition: `<span data-fact="book1-rating">4.8</span>`.
   Count-ups animate *to* the bound text, and the final frame must show it exactly.
3. **Run** `node <this skill>/scripts/check-facts.mjs <project>` (exit 0 = clean). It checks:
   - bound elements match the ledger character for character
   - every other number, date, percentage, currency amount and quoted phrase in visible text,
     `alt`/`aria-label`, and display strings inside `<script>` appears in an approved value
   - no approved fact is missing its source, and no unapproved fact is pending
   - it ignores layout furniture like `3 / 7`; `--allow "x,y"` whitelists more
4. **Research-heavy pieces:** research → ledger → script → storyboard → animation. Use the
   `deep-research` skill for anything contested. Say "looks like", not "is", when evidence only
   shows a similarity.

## Laws

- Displayed value = approved value. No rounding, no "+", no visual exaggeration of proportions.
- Sample or illustrative data carries "Illustrative data" (or "Example") on **every** frame where it
  appears, and never looks like a real result.
- Never present a target as a result, or a concept as a shipped feature (see the Dawnward product-truth law).
- Bianno's own metrics (sales, reviews, followers, revenue, subscribers) come only from him or a
  dashboard he shares. If they're missing, the piece waits, or drops the number.
- No testimonials unless they're real, attributable and approved by the person quoted.
