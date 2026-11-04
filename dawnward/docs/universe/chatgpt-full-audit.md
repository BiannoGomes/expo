# Full-app audit prompt for ChatGPT (agent mode)

Updated 4 Nov 2026 for the no-AI version. Before using it, upload the latest `dawnward-review-site.zip` to Cloudflare (dawnward › Create deployment) so ChatGPT tests the current build.

Paste into ChatGPT **agent mode** (it needs its own browser to click through). Send the whole answer back to Claude.

```
You are testing Dawnward, a private personal-growth web app, and recommending changes to get every
part of it to a 10. Open https://dawnward.pages.dev (it works without an account; everything you type
stays in your browser; nothing is sent to a server or an AI). Use made-up example text only, never real
personal information. Take your time: it is a 3D app and may load slowly in your browser.

WHAT IT IS
A reflection and decision app, shown as a living universe. Home (today's one suggestion), Universe
(galaxies; Personal Growth holds 5 worlds: Mind, Body, Soul, Spirit, Future), Reflect (one question,
write a few lines, it becomes a star), Learn (short guided practices in series, with worksheets),
Journey (your stars, milestones, and a Week view), You (privacy, export, delete, display). There is NO
AI. Instead, everything is worked out on the phone from what the person wrote:
- Journey › Week: a weekly summary (counts, steps chosen and how they went, one line you wrote),
  Save as PDF.
- "What I've noticed": counted patterns that quote your own words (a word you keep using, the feeling
  you name most, the day you usually write), which you confirm ("That's right") or hide ("Not quite").
- Worksheets you fill in inside the app; answers save as you type and print with the PDF.
- "Remind me" makes a calendar file; later Home asks "How did it go?".
It is NOT therapy. Priorities, in order: correctness > privacy > accessibility > responsiveness >
cinematic spectacle.

HOW TO TEST
1. First visit, as a newcomer: what do you understand in the first 10 seconds? Do the suggested
   practice ("Beyond Overthinking") from start to Done, choose a step, press Remind me, then go Home.
2. Write 6 short reflections in Reflect across 2-3 worlds. Make them sound like one real person's
   week, and use the same few words naturally (for example "work", "tired", "sleep") in several of
   them. Then open Journey › Week and You › What I've noticed. Are the observations accurate, useful,
   and safe? Try "That's right" and "Not quite".
3. Back on Home, answer "How did it go?" (try "Not yet").
4. Learn: open a series, "All chapters", and a worksheet. Fill in a few cells, Add a row, reload the
   page, and check your answers are still there. Try Print or save as PDF.
5. Visit every main route: #/home #/universe #/universe/growth #/world/mind/overview (and body, soul,
   spirit, future) #/learn #/journey #/journey/week #/journey/milestones #/you #/knowledge/wisdom
6. You › Display › Motion style: compare Now, Calm, Living and Depth on the same flow.
7. Edges: skip steps, "I'm not sure", "Not this time", leave mid-practice and come back, reload, keyboard
   only (Tab, Enter, Esc), narrow widths (390 px and 320 px) if you can resize, then You › Delete
   everything and check it really is all gone.

SCORE 1-10 (10 = as good as the best: Calm, Headspace, Finch, Stoic, Day One, Monument Valley; Apple
HIG; WCAG 2.2 AA) for: first impression; clarity (always know where you are and what to do next);
ease of use; usefulness of the Week view and "What I've noticed"; worksheets; navigation; visual
design and typography; motion; readability over art; accessibility; performance; copy and tone;
emotional safety (no guilt, streak pressure, fake urgency or clinical claims); privacy honesty;
would you come back next week, and why; overall.

RULES
- Report only what you saw. Give the route and the steps. Mark anything you couldn't check UNVERIFIED.
- Every fix must be concrete: exact new wording, exact size/colour/spacing, or exact behaviour.
- Recommend NO AI features, accounts, servers, tracking or new data collection: the app's promise is
  that nothing you write leaves the phone. No dark patterns, no medical or therapeutic claims.
- Already known and being decided (don't repeat): renaming the "AI Creation" galaxy; the web Speak
  button uses the browser's own speech service; whether to put "Nothing you write ever leaves this
  phone" on the first screen; privacy policy not yet in the app; no age check yet; motion style not
  yet chosen.

RETURN ONE MARKDOWN DOCUMENT, nothing else:
Part 1 Scorecard: Area | Score | Why (one line) | What would make it a 10
Part 2 Findings: ID | Route | Severity (P0 broken or unsafe, P1 major, P2 polish) | What you saw |
       Why it matters | Exact fix | How to check it's fixed
Part 3 The 10 changes that would raise the overall score most, in order
Part 4 "What I've noticed" and the Week view: what was right, what was wrong or unhelpful, and 5 new
       on-device observations worth adding (each must be a count or a quote, never a diagnosis)
Part 5 The first 60 seconds rewritten: exact wording for the first screen and the first practice
Part 6 Motion: which style (Calm, Living, Depth or a mix) and why
Part 7 What you couldn't test, and why
```
