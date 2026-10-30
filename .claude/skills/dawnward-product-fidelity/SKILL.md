---
name: dawnward-product-fidelity
description: Check that every Dawnward ad, film or experience shows only real, shipped product truthfully. Use before rendering or publishing anything that depicts the app.
---
# Dawnward product fidelity

- Screens come from `marketing/launch-film/assets` (canon boards for Debrief/Today/You, live captures for Universe/Mind). World copy is verbatim from `apps/mobile/app/world/[world].tsx`; metas from `apps/mobile/lib/universe.tsx`.
- Personal data shown is demonstration content and must be labelled as such on screen.
- Never claim: store availability, prices, download counts, testimonials, ratings, or features not in the app. The only verified next step today: Instagram @bianno.becoming.
- Real promises that are true today: no streaks, no scores, no badges, no guilt notifications; reflections never sold and never train anyone else's AI (store listing).
- If a screen or copy changes in the app, update `src/tokens.js` and re-render; do not edit the capture files by hand.
- Corrections to the captures live in code (`buildScreens()` in `src/main.js`) and must mirror the shipped app: the tab bar is Today / Debrief / Universe (the Personal Model is reached from the universe, `you` has `href: null`); greetings carry no real name.
- One thread, one person: the confession, the morning step, the Soul world's move and the Personal Model insight must agree with each other. Insights always show "Why I think this" and the real "That's not right" control.
