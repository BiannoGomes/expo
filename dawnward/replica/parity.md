Before this build: **43.8** (must-haves 5 of 10). After: **57.8** (must-haves 7 of 10). Scored with `.claude/skills/replica-diff/parity.py` against the union of what the five apps offer (`features.csv`). No layout diff was run: matching a competitor's layout is not the goal, and their screenshots are not stored here.

## Parity: 57.8 / 100

features 57.8  (31 counted, must-haves 7 of 10 done)

Not shippable yet: 3 must-have features are not done.

## By area, weakest first
- body                           0.0  (2 features)
- platforms                     25.0  (2 features)
- tracking                      33.3  (2 features)
- reflection                    37.5  (2 features)
- privacy                       42.9  (3 features)
- insight                       42.9  (4 features)
- capture                       45.0  (5 features)
- trust                         50.0  (1 features)
- memory                        75.0  (2 features)
- ritual                        87.5  (4 features)
- history                      100.0  (1 features)
- data rights                  100.0  (2 features)
- goals                        100.0  (1 features)

## Missing, in build order
- [must] capture: Words are never lost when transcription or the network fails, partial  (Typed draft is saved locally; a failed transcription still drops the audio (backlog P0 #2). Reflection ships voice backup and recovery (changelog 6.24))
- [must] memory: Remembers past entries and builds on them, partial  (Morning steps and the question now quote recent evenings; the debrief reply still speaks about today only (deliberate rule against claiming multi-day patterns))
- [must] reflection: Follow-up question drawn from the person's own words, partial  (Tonight's question now cites a past evening, verified verbatim; no follow-up inside the debrief yet)
- [should] body: Health and activity data alongside reflections, no  (Body world. Exist: Apple Health, Fitbit, Oura and more; needs consent design)
- [should] body: Links between two things worded as X when Y with a confidence, no  (Exist waits about three weeks of data and says correlation is not causation; Dawnward version uses words, not numbers)
- [should] capture: Quick capture from widget, shortcut or share sheet, no  (No competitor has a home-screen widget (asked for in a Reflection review); open gap)
- [should] insight: Ask a question across your whole journal, no  (Rosebud Ask Rosebud links entries; Mindsera Ask Your Journal; next slice must cite every answer)
- [should] privacy: App lock with Face ID or passcode, no  (Reflection gates this behind Premium and got a complaint; keep it free)
- [should] privacy: Switch the AI off entirely, no
- [should] insight: Recurring patterns and themes over time, partial  (Pattern beliefs with evidence; no theme-over-time view)
- [should] tracking: Mood or feeling check-in, partial  (Energy is extracted from the debrief; no check-in of the person's own. Keep it in words, never averaged)
- [should] trust: Report a bad AI response, partial  (That's not right covers beliefs; not replies or steps yet)
- [could] capture: Photo or handwriting capture, no
- [could] capture: Read replies aloud, no
- [could] insight: Monthly and yearly review, no  (A Reflection user left 1 star when these were removed: version the format)
- [could] platforms: iPad layout, no  (supportsTablet is false)
- [could] reflection: Guided journal library, no  (Write our own; never copy theirs)
- [could] ritual: Breathing and meditation, no
- [could] tracking: Several check-ins a day, no  (Exist's most-voted roadmap request (557 votes))
- [could] platforms: Works on the web and on a computer, partial  (Expo web build runs; not a supported product)

## Left out on purpose (not scored)
- Writing streaks: Forbidden by Dawnward's rules. Note: all 6 reviews mentioning streaks were 4 or 5 stars
- Back-dating entries to keep a streak: Forbidden: fabricated record by design (Rosebud help centre)
- Word counts and writing stats: Forbidden: scores
- Numeric mood or body scores and personality types: Forbidden: numeric scores about a person
- Social proof numbers on the website: Forbidden unless linked and verifiable

## Yours, not in the original (not scored)
- Every step and question quotes the evening it came from (checked verbatim)
- Beliefs hidden when their only evidence is left out (restored on return)
- Safety triage before any processing
- A universe of four worlds: Mind, Body, Soul, Future
