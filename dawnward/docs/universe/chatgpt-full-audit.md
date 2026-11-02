# Full-app audit prompt for ChatGPT (agent mode)

Paste into ChatGPT **agent mode** (it needs a browser to click through). Replace `YOUR-LINK` with the Cloudflare address. Send the whole answer back to Claude.

```
You are auditing Dawnward, a private personal-growth web app, to get every part of it to a 10.
Open: YOUR-LINK (the app opens at the root; it works without an account; everything you type stays in
your browser). Use made-up example text only, never real personal information.

WHAT IT IS
Your inner life as a living universe: Home (today), Universe (7 galaxies; Personal Growth holds 5 worlds:
Mind, Body, Soul, Spirit, Future), each world has Reflect and short guided practices, Learn lists all
practices, Journey shows progress as stars and milestones, You holds privacy, data export/delete and
Display. Galaxies unlock by real practice: Personal Growth and Earth open; Knowledge after 1 finished
practice; Spiritual after 2; Creative after 3 across 2 worlds; AI Creation after saving a creation;
Quantum Gateway after a Future practice plus a chosen direction. It is NOT therapy; some content is
philosophy, labelled as such. Priorities, in order: correctness > privacy > accessibility >
responsiveness > cinematic spectacle.

HOW TO TEST
1. As a brand-new person: first open, Home, Universe, enter Personal Growth, a world, Reflect (try
   "Another question"), one guided question from start to Done, then Journey. Then unlock at least
   Knowledge and visit the Wisdom Library (#/knowledge/wisdom) and the two constellations there.
2. Visit every main route: #/home #/universe #/universe/growth #/world/mind/overview (and body, soul,
   spirit, future) #/learn #/journey #/journey/milestones #/you #/knowledge/wisdom #/universe/creative
   #/library
3. You › Display › "Motion style (preview)": try Now, Calm, Living and Depth across the same flow and
   say which feels best and why.
4. Widths: 390 px (phone), 320 px (small phone), 1440 px (desktop), if your browser can resize. Try
   keyboard only (Tab, Enter, Esc). If 3D doesn't render in your browser, say so and judge what shows.
5. Try the edges: skip steps, "I'm not sure", leave mid-practice and come back, reload, Delete everything.

SCORE 1-10 (10 = as good as the best: Calm, Headspace, Finch, Endel, Monument Valley; Apple HIG;
WCAG 2.2 AA) for: first impression; clarity (always know where you are and what to do next);
navigation; visual design and typography; motion; readability over art; accessibility; performance
and responsiveness; copy and tone; emotional safety and ethics (no guilt, streak pressure, fake urgency
or clinical claims); privacy honesty; content accuracy and evidence labels; delight and the sense of
progress; overall.

RULES
- Report only what you saw. Give the route and the steps. Mark anything you couldn't check UNVERIFIED.
- Every fix must be concrete: exact new wording, exact size/colour/spacing, or exact behaviour.
- No dark patterns, no manipulative retention, no medical or therapeutic claims, no new data collection.
- Already known and being handled (don't repeat): draft labels; privacy policy not yet in the app;
  web "Speak" uses the browser's speech service; no age check yet; motion direction not yet chosen.

RETURN ONE MARKDOWN DOCUMENT, nothing else:
Part 1 Scorecard: Area | Score | Why (one line) | What would make it a 10
Part 2 Findings: ID | Route | Severity (P0 broken or unsafe, P1 major, P2 polish) | What you saw |
       Why it matters | Exact fix | How to check it's fixed
Part 3 The 10 changes that would raise the overall score most, in order
Part 4 Motion: which direction (Calm, Living, Depth or a mix) and the 5 rules for it
Part 5 What you couldn't test, and why
```
