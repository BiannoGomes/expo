# Brand (replica-brand)

Dawnward keeps its name, palette and voice. It isn't a clone of anything, so the brand skill was used only for its guard: nothing that belongs to a competitor may reach the product.

## Decisions

- **The four worlds stay: Mind, Body, Soul and Future.** They are the base of the app (owner, 2026-10-31).
  - Reflection's monthly review also uses Mind, Body and Soul, among six areas. These are everyday words that nobody owns, so they are not on the avoid list.
- **Copy is written fresh.** Nothing borrowed from a competitor's guides, prompts, quotes or frameworks. Their copy is research only.
- **Streaks, scores, badges and unsourced proof numbers stay forbidden,** even though some competitors' users like streaks (see `fixes.md`).

## Sweep

`brand.json` lists the competitor names, developers and domains.

```
python3 .claude/skills/replica-brand/sweep.py dawnward --config dawnward/replica/brand.json
```

- **Result, 2026-10-31:** 36 hits, all in `marketing/selling-machine/research/review-mining.md`. That's an internal research file from the earlier review mining, where competitor names belong.
- **Zero hits** in the app, server, website, interactive experience or films.
- **Before anything publishes:**
  - either move that research file under a planning folder the sweep skips;
  - or confirm it is never published.

## Store listing

`launch/listing.json` passes `listing.py` with 0 errors and 0 warnings. That covers:
- App Store and Google Play length limits;
- ranking and price claims;
- any competitor name, plus Calm, Headspace and Day One.
