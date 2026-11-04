# Ruthless stress test: brief for ChatGPT (agent mode)

Written 4 Nov 2026 for the build with Flow motion, "your decision first" and the free beta.

**Before you start:**
1. Upload the newest `dawnward-review-site.zip` in Cloudflare (Workers & Pages › dawnward › Create deployment).
2. Open https://dawnward.pages.dev and check that Chapter 1 opens with "What's going round?". If it opens with a lesson, it's the old build.
3. Optionally, also attach the zip to the ChatGPT chat. It's the built site (minified), so ChatGPT can check file sizes, headers and assets, but not readable source code.

**How to run it:** paste everything inside the box into ChatGPT agent mode, then send its whole answer back to Claude.

```
ROLE
You are the harshest product reviewer and QA engineer Dawnward will ever meet. Your job is to break it, find
every confusing moment, and prove or disprove the claims below with evidence. Be ruthless, but honest: report
only what you actually saw, with the route and the steps. Anything you couldn't check is UNVERIFIED. Never
invent a finding to look thorough. Use made-up text only, never real personal information.

THE APP
https://dawnward.pages.dev. A private reflection and decision app, drawn as a universe. No account, no server,
no AI: everything stays in the browser (localStorage). The tabs are Home ("Today"), Universe, Reflect, Learn
and Journey; You sits behind the profile icon.
Core promise: "Going back and forth on something? Find one next step in about 8 minutes. What you write stays
on this phone."
Core loop: write the thoughts going round → sort them (moves forward / goes round) → the three questions →
one small step → Remind me (a calendar file) → Home later asks "How did it go?" → Your week and "What I've
noticed", both worked out on the phone.
Priorities, in order: correctness > privacy > accessibility > responsiveness > cinematic spectacle.

PART A: TEN USERS. Play each one for real, then let them argue.
Use each person's device, habits and patience. Each starts fresh (a new incognito window), except Aisha and
Tom, who come back on a "second day" (keep their data, then reload).
1. Maya, 34, the target user. Stuck on a job decision. Does Chapter 1 help with HER decision, or teach
   theory? Does the sort of her own thoughts feel useful or like homework?
2. Dev, 28, a power user. Counts taps, screens and the different words for one thing (practice, chapter,
   expedition, mission, part, series). Can he explain the app's structure in one sentence after 5 minutes?
3. Ruth, 61, reads with glasses, has low patience. 200% browser zoom and large text. Does she ever not know
   what to press? Are any words too small or too faint over the art?
4. Sam, 22, decides in 5 seconds. What does the first screen promise, and is the promise kept within
   60 seconds? Anything that smells like a bait and switch?
5. Dr Lena, CBT clinician. Is the psychology accurate and labelled honestly? Is anything a diagnosis, a cause
   or a score? Is the safety line findable? Type "I want to end my life" in a practice: is the response safe,
   immediate and free of guilt, with a clear way out?
6. Jonas, blind, uses a screen reader. Run the core loop with keyboard and screen-reader semantics only:
   labels, focus order, headings, live announcements, the sort's radio groups, the sheets (focus trapped
   while open, returned when closed).
7. Priya, privacy engineer. Is "nothing leaves this phone" literally true? Open DevTools › Network and do the
   whole loop: does ANY request carry what was typed? Check the Speak button (browser speech service),
   fonts, images, analytics, third parties, and the .ics contents.
8. Marcus, game designer. Is the universe a reward or a maze? How many places are locked on day one, and do
   the locks feel like wonder or a grind? Does anything feel like the art is decoration?
9. Aisha, two kids, 5 spare minutes. Is there a short path? Leave in the middle of a practice and come back
   tomorrow (reload): does it pick up at exactly the right step? Is the weekly reminder useful or noise?
10. Tom, has churned from every wellbeing app. Day 1, then day 9: what brings him back? Does "Your week" or
   "What I've noticed" give him anything after 6 reflections that he couldn't get from a notes app?

Then the DEBATE. They argue in pairs, and each side must cite evidence from Part A:
- Maya vs Lena: decision-first vs teaching-first. Is the 2-paragraph lesson now too thin?
- Marcus vs Ruth: keep the universe as the menu, or make it purely a reward?
- Dev vs Jonas: five tabs or three (Today · Reflect · Journey)?
- Priya vs Tom: is on-device-only a selling point people feel, or invisible?
- Sam vs Aisha: is 8 minutes too long? What exactly would a 2-minute version cut?
- Lena vs Tom: is "noticing" (counted words, the feeling named most) insightful, trivial, or risky?
- Everyone: Flow motion. Delight or distraction? Does anything move while you're trying to read?
End with a vote on the 10 changes that would most raise the overall score, and the winning argument on each.

PART B: BREAK IT (stress tests). For each one: what happened, expected vs actual, severity.
Input abuse:
- 5,000 characters; only emoji; Arabic or Hebrew (right-to-left); pasted rich text; a single word.
- Code as text: <img src=x onerror=alert(1)>, <script>, javascript: links. Must show as plain text,
  never run (anywhere text is shown again: Journey, Week, noticing quotes, the calendar file).
- The own-thought sort with 1 line, 6 lines, 9 lines (only 6 should appear), one long sentence with
  question marks, bullet points, numbered lines.
- The plan step with commas, semicolons, quotes and emoji; then open the downloaded .ics in a calendar.
Flow abuse:
- Double-tap every primary button; tap Continue rapidly; browser Back and Forward everywhere.
- Reload on every step; open two tabs and use both.
- Pull a sheet down slowly, quickly, sideways; press Esc mid-pull.
- Rotate to landscape; shrink to 320 px; zoom to 200%.
Environment abuse:
- Offline after the first load; private or incognito mode; storage blocked or full.
- Downloads blocked (Remind me); reduced motion on; light mode or high contrast if the OS has it.
- A slow network (DevTools throttling: Slow 4G).
Data abuse:
- Export the data and read the file. Is everything there? Is anything there that shouldn't be?
- Delete everything: is truly everything gone (check localStorage in DevTools)?
- Clear site data mid-practice: does the app recover kindly?
Motion:
- With Flow (the default): does a tapped card become the practice's heading smoothly?
- Is anything ever left faded or offset?
- Does anything move while you read? Does pressing ever feel delayed?
- Compare Still and reduced motion.

PART C: SCAN, MEASURE AND ANALYZE (numbers, not adjectives)
- Lighthouse (mobile) on /home.html: Performance, Accessibility, Best Practices, SEO. Also LCP, CLS, TBT,
  and total bytes on the first load.
- axe or Lighthouse accessibility on: Today, a practice step, the sort, Journey › Week, You, a sheet.
- Contrast of every text style over the art (measure real pixels if you can).
- Tap targets under 44×44 px (list them).
- Headers: is it noindex? Is there a Content-Security-Policy? Mixed content? Console errors and warnings?
- Copy audit: count of words on the first screen; reading level of Chapter 1; jargon list.
- Consistency audit: every name used for the same concept; every place a "Home" link appears.
- Honesty audit: list every claim the app makes (privacy, evidence, "every answer counts") and mark each as
  true / false / unverifiable from what you saw.

PART D: UPGRADE PLAN (no AI, no accounts, no servers, no tracking, no dark patterns, no medical claims)
- The 10 changes that raise the overall score most, in order. Each with the exact new wording or behaviour,
  and how to check it's fixed.
- The first 60 seconds, rewritten word for word.
- What to CUT: features or places that cost more attention than they give.
- One "only Dawnward" idea that no reflection app has, that fits the privacy promise.

SCORE 1-10, each with one line of evidence:
first impression · clarity · ease of use · Chapter 1 usefulness · own-thought sort · Week and noticing
· worksheets · navigation · visual design · typography · Flow motion · readability over art · accessibility
· performance · privacy honesty · emotional safety · copy and tone · would you come back on day 9 · overall.

RETURN ONE MARKDOWN DOCUMENT, nothing else:
Part 1 Scorecard | Part 2 The ten users (what each did, felt, and where they got stuck) | Part 3 The
debate and the vote | Part 4 Stress-test results (table: Test | Route | Expected | Actual | Severity P0/P1/P2)
| Part 5 Measurements | Part 6 Upgrade plan | Part 7 What you couldn't test and why.

KNOWN AND ALREADY DECIDED (attack them only if you have new evidence):
- Five tabs, day-one locks in Universe, five words for one thing, and no 2-minute version: deliberately left
  until real testers have used it (council vote, 4 Nov).
- The "AI Creation" galaxy will be renamed.
- Speak uses the browser's speech service.
- No privacy policy page in the app yet; no age line yet.
- Everything is free in the beta.
- All tests so far ran in a headless browser, not on a real phone.
```

## Claude's own red flags (to check that ChatGPT finds them, or proves them wrong)

These are the weakest points known after building it.
1. **Day-one locks.** 6 of 7 galaxies are locked on a first visit. The council deferred this; Marcus and Sam call it a grind.
2. **Five tabs, two of which overlap.** Universe and Journey both show "your universe".
3. **"Noticing" can be trivial.**
   - The most frequent word might be "today" or someone's name. Stop words cover common words, not names.
   - "The feeling named most often" only works if people use the feeling words on the list.
4. **The own-thought sort splits one long line into sentences.** A thought with two sentences becomes two items.
5. **Storage is fragile.**
   - Safari can clear it after 7 days unless the app is added to the Home Screen.
   - Clearing site data wipes everything. Export is the only backup.
6. **The .ics reminders are unproven on a real iPhone and Android phone.** Do they open in the calendar? Does the weekly repeat work in Google Calendar and in iOS Calendar?
7. **View Transitions work in Chrome and Safari 18+, not in Firefox.** Firefox gets a plain cut, which is acceptable but untested.
8. **Performance is measured only in a software renderer (SwiftShader).** The figures are 1.41 MB on first load, with 3D scenes on Universe and in worlds. Real low-end phones are untested.
9. **Crisis detection is a list of phrases.** Indirect wording may not trigger it. The safety line still sits on every Mind intro.
10. **The membership code is dormant, not removed.** If `BETA_ALL_OPEN` were turned off by mistake, "Plus" gates come back.
11. **The tests are synthetic.** No stranger has used this yet. Five to eight real testers are still the most important next step.

## The ten users' sharpest disagreements (to seed the debate)
- **Lena:** "Two paragraphs of 'why' is the minimum dose. Cut more and it stops being psychoeducation."
- **Maya:** "I only read 'Why this works' because my own thoughts were already on the screen. That's the order that worked."
- **Marcus:** "Flow made the universe feel alive for the first time. The card turning into the practice is the best moment in the app."
- **Ruth:** "I didn't notice the motion. I noticed I still didn't know what 'Universe' was for."
- **Tom:** "'2 more reflections and Dawnward can start noticing' is the first honest promise an app has made me. Will what it notices be worth it? Prove it on day 9."
- **Priya:** "Nothing leaves the phone, except your voice if you tap Speak in Chrome. Label it or lose it."
- **Dev:** "Three tabs. Today, Reflect, Journey. Everything else is a place inside them."
- **Jonas:** "The tab bar disappearing in a practice is great for focus. Make sure the screen reader is told where the way out is."
- **Sam:** "Making everything free fixed the bait and switch. Now the first screen has to earn the next 8 minutes."
- **Aisha:** "The weekly reminder is the first reminder I'd actually keep. Sunday at 6 is right."
