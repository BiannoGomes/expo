---
name: dawnward-product-fidelity
description: Check that every Dawnward ad, film or experience shows only real, shipped product truthfully. Use before rendering or publishing anything that depicts the app.
---
# Dawnward product fidelity

- Screens come from `marketing/launch-film/assets` (canon boards for Debrief/Today/You, live captures for Universe/Mind). World copy is verbatim from `apps/mobile/app/world/[world].tsx`; metas from `apps/mobile/lib/universe.tsx`.
- Personal data shown is demonstration content and must be labelled as such on screen.
- Never claim: store availability, prices, download counts, testimonials, ratings, or features not in the app. The only verified next step today: Instagram @bianno.becoming.
- Real promises that are true today: no streaks, no scores, no badges, no guilt notifications; reflections never sold and never train anyone else's AI (store listing).
- If a screen or copy changes in the app, update `src/tokens.js` and re-render; do not edit captures by hand.
