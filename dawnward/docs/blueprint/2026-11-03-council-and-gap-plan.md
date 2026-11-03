# The blueprint against the app: council verdict, gap analysis, build order (3 Nov 2026)

**Input:** "Dawnward: The Ultimate Product & Design Blueprint" and "The Human Transformation System", both written in ChatGPT for Bianno. The pasted copy stopped at the content-schema table (after `expected_outcome`).
**Method:**
- An LLM council: 5 advisors, 5 anonymous peer reviews, then a synthesis.
- Every claim checked against the code on `claude/becoming-product-brief-45v3ua`.
- Lenses: emotional UX (no shame, no streak pressure, no invented insight), Apple HIG and Apple design (instant response, clarity, deference to content), output excellence.

## Council verdict, short
- **Agreed (5 of 5):** the loop the blueprint describes already exists: practice, optional real-world action, then "How did it go?". Nobody outside has used it. The next step is validating it with strangers, not building more of the blueprint.
- **Agreed (4 of 5):** start with **The Difficult Decision**, which is Beyond Overthinking. Concrete pain, results within days, already built.
  - **The other choice:** the Expansionist argued for The Bridge (difficult conversations), because it spreads by word of mouth.
  - **Why not:** all five reviewers rejected it for now. It can surface abuse and crisis before the AI safety check is deployed, and its "download a conversation card as an image" idea would put private text in camera rolls.
- **Agreed (4 of 5):** keep **one front door**, the Daily Compass. An intent screen next to it would give two answers to "what now?". The Outsider's point was accepted: speak in the user's words on the first visit.
- **Caught in peer review, all 5:**
  - On-device history can disappear. Safari clears script-written storage after 7 days without a visit unless the site is on the Home Screen. That silently breaks "How did it go?".
  - Testers should be strangers, not friends.
  - Crisis signposting must not depend on the server. **Checked: it already doesn't.** Every written answer is checked on the device against crisis phrases, with static help text.
- **Recommendation:** fix the return loop, then put the decision flow in front of 5 to 8 strangers. The measure: how many come back and report an action they actually took. If it's under 3 of 15, more content won't fix it.

## Built today (from the verdict)
| Change | Why | Test |
|---|---|---|
| **First-visit welcome:** "Going back and forth on something? This helps you find one next step, in about 8 minutes. You can stop any time… What you write stays on this phone." Shown only to a newcomer, above the Compass's one suggestion (Beyond Overthinking, chapter 1). | The Outsider: names like galaxies and "Quantum Gateway" don't say what it's for. One door, in plain words. | `e2e-return.cjs` |
| **Remind me:** on Done (when an action was chosen) and on Home next to "How did it go?". Choose a day and time; it saves a calendar file (.ics) on the device, with the action, an alert and a link back. Nothing is sent anywhere. | No accounts or notifications exist; the person's own calendar is the private way back. | `e2e-return.cjs` checks the file: date, time, escaping, line folding, alarm, link |
| **Keeping it safe:** Dawnward asks the browser to keep its storage once there's something worth keeping, and can now be installed (manifest, icons, Home Screen tags). You › Your data explains, on iPhone, the 7-day clearing and Add to Home Screen; elsewhere, it says to save a copy. | The peer reviews' main catch. | `e2e-return.cjs` |
| **Bug fixed:** opening the app fresh drew Home before practices had loaded and never redrew it, so a returning person didn't see "How did it go?" until they moved away and back. | Found by the new test. Earlier tests changed the address without reloading, which hid it. | `e2e-return.cjs` |

## The blueprint, item by item
**Legend:**
- **Built:** exists and is tested.
- **Part:** something close exists.
- **No:** not built.
- **Later:** deliberately waits for real-user evidence.

### Front door and loop
| Blueprint | State | Where / note |
|---|---|---|
| "Where would you like to begin?" intent screen | **Later** | Council 4 to 1 against now. Replaced by the newcomer welcome. Revisit if strangers can't say what Dawnward is for after 10 seconds. |
| One insight, one action, one change; no streaks | **Built** | Every practice ends with an optional action. "How did it go?" accepts any answer. No streaks anywhere. |
| Discover → Reflect → Act → Create → Grow | **Part** | Discover, Reflect and Act are built, plus Review. "Create" lives in Creative Worlds but isn't part of the loop. |
| Four questions per experience (what's happening, what might help, one thing, what happened) | **Built** | The question, then a lesson or perspectives, then the action, then the review. |

### Seven destinations
| Destination | State | Note |
|---|---|---|
| Personal Growth | **Built** | 5 worlds, Reflect, 13 practices |
| Knowledge | **Built** | Wisdom Library (25 thinkers, evidence labels, sources), Tree of Life |
| Spiritual Exploration | **Part** | The galaxy and places exist; practices are thin |
| Creative Worlds | **Built** | The Infinite Door and two real-time worlds |
| AI Creation | **Part** | A galaxy with no working software. **Jarvis is paused**, and the blueprint itself says don't simulate it |
| Quantum Gateway | **Built** | Imagination, labelled "not a prediction" |
| Earth (Home) | **Built** | Compass, "How did it go?", direction, now Remind me |

### Thinkers to add to the Wisdom Library
Already there: Clear, Frankl, Dweck, Neff, Kahneman, Gottman, Brown, Gollwitzer. **Missing:** BJ Fogg, Cal Newport, David Allen, Marshall Rosenberg, Rick Rubin, Julia Cameron, Donella Meadows. Each needs the same claim-level review before it ships (use ChatGPT job 4's format).

### The 12 missions
| # | Mission | State |
|---|---|---|
| 05 | The Difficult Decision | **Built** as Beyond Overthinking, 4 chapters. Chapter 4 is literally "The Decision Lab". **The one to test.** |
| 03 | The Conversation You've Avoided | **Part:** The Bridge, 3 chapters. Waits for the deployed safety check. |
| 10 | Seven-Day Connection | **Built:** Feeling Closer |
| 09 | Meet a Possible Future You | **Built:** Quantum Gateway, Horizon of Possibility |
| 02 | The Habit That Never Sticks | **Part:** Becoming Consistent |
| 06 | A Life With More Meaning | **Part:** Observatory of Being |
| 12 | Bring It Back to Earth | **Part:** "How did it go?" exists. The richer review (completed, postponed, changed, abandoned, and why) is a small step. |
| 07 | The First Creative Step | **Part:** Creative Worlds |
| 01 | The Overwhelmed Mind | **No:** the best first new mission after testing |
| 04 | When You Feel Behind | **No** |
| 11 | Your Life as a System | **No** |
| 08 | Build Your First AI Assistant | **No:** needs a real, tested product (Jarvis Lite), which is paused |

### Five signature tools
| Tool | State | Note |
|---|---|---|
| Daily Compass | **Part** | One suggestion with "why", "Not today" and resume. **Missing:** "How are you arriving?" and "How much time?". Next after testing, as long as it stays one tap. |
| Decision Lab | **Built** | Beyond Overthinking chapter 4 |
| Connection Studio | **Part** | The Bridge. AI role-play waits for the safety check and Bianno's approval of model use. |
| Life Map | **No** | The direction line and Journey are its seeds |
| Creation Workbench | **No** | Paused with Jarvis |

### AI guide, content schema and production
| Item | State | Note |
|---|---|---|
| AI guide as facilitator | **Part** | The server has Claude-powered safety triage, plans and reviews, **not deployed**. No chat guide in the app. |
| Content schema fields | **Part** | Missions have title, objective, minutes, world, safetyNote and steps. Missing `user_problem` and `expected_outcome` as explicit fields (the pasted blueprint was cut off here). Cheap to add when the next mission is written. |
| Offline | **Part** | Everything works without a server, but there's no service worker yet, so a first visit needs the network |
| Recovery | **Built** | Export to a file, delete everything; now installable and a persistent-storage request |
| Analytics | **No, by design** | Privacy first. Measure with consented test calls. |
| Customer support | **No** | Testers need a channel. Decision for Bianno: an email address shown in the app? |
| Accessibility | **Built** | axe-clean suites, reduced motion, 44 px targets, keyboard. **Not yet checked on real devices with VoiceOver or TalkBack.** |

## Build order
1. **Now (done):** the return-loop fixes above.
2. **Before strangers see it (small):**
   - Label the web Speak button, or turn it off (`docs/legal/FACT-CHECK.md` #1).
   - Add a "for people 16 and over" line.
   - Add a way for testers to report a problem.
3. **Test:**
   - 5 to 8 strangers with a real decision pending, on their own phones.
   - Consent first. A 15-minute call on day 4 (ChatGPT job 9 writes the script).
   - Count: finished chapter 1, planned an action, came back, reported what happened.
4. **Only then, in this order, if the test says so:**
   - Compass "arriving and time";
   - The Overwhelmed Mind;
   - the richer "Bring it back to Earth" review;
   - the schema fields;
   - the missing thinkers.
5. **After a deployed server and its safety check:** accounts (history on any device), the AI facilitator, then The Bridge as a lead experience and Connection Studio role-play.
6. **Paused until Bianno restarts it:** Jarvis Lite, the Creation Workbench, AI Creation as software, payments.

## What the blueprint got right, and where the app disagrees
- **Right:** build one experience and validate it with real people; label the evidence per claim, not per author; never simulate software that doesn't exist; Quantum Gateway is imagination, not physics.
- **Disagree:** "Launch with five tools". Two exist, and the other three should wait for evidence. An intent screen as the front door, too: the Compass already chooses.
