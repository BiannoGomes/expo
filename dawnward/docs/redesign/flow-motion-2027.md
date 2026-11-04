# Flow: Dawnward's default motion (4 Nov 2026)

**Asked by Bianno:** "the full 2027 experience of motion graphics, movement and flow", taking the best of the best apps, simplified.

**Method:** the installed motion skills, read before building:
- `find-animation-opportunities`, `emil-design-eng`, `improve-animations` and `apple-design` (emilkowalski/skills@2d22863, MIT);
- `taste-motion` (madebymustafa/design-taste@c4a6bff, MIT).

Their rule is **restraint**. Every moment below passed four tests:
- **Frequency:** how often people see it.
- **Purpose:** feedback, spatial continuity, state, avoiding a jarring jump, or delight on rare moments only.
- **Speed:** UI motion stays under about 300 ms; sheets can take up to 500 ms.
- **Function:** nothing people are reading moves.

The public principles behind it:
- Apple's "Designing Fluid Interfaces" (WWDC 2018): respond instantly, springs, interruptible, gestures that follow the finger.
- Emil Kowalski's "You don't need animations".
- What iOS-quality apps share: sheets that follow the finger, cards that become the screen they open, critically damped springs.

## What moves (Flow)
| # | Where | Purpose | How often | Motion |
|---|---|---|---|---|
| 1 | Today's card → the practice it opens (also Learn's featured card) | Spatial continuity | Occasional | View Transitions API: the card's title becomes the practice heading, 420 ms on the drawer curve `cubic-bezier(.32,.72,0,1)`; the rest cross-fades in 260 ms. It's a plain cut where the browser can't do it. |
| 2 | Sheets (Remind me, Set a direction, Your week, Delete) | Spatial continuity and a gesture | Occasional | The sheet rises from the bottom edge (`@starting-style`, 380 ms, drawer curve). You can pull it down from the top strip: it follows your finger, rubber-bands upward, and dismisses past a third of its height or on a flick (> 0.11 px/ms). Otherwise it springs back. Keyboard, Esc and Cancel work as before. |
| 3 | Tab bar inside a practice (focus mode) | Avoiding a jarring jump | A few times a day | Slides down out of the way (260 ms, drawer curve), then becomes unreachable, so screen readers and keyboards don't find a hidden tab bar. Slides back when you leave. |
| 4 | Places arriving (Today, Universe, Journey, Learn, You) | Avoiding a jarring jump | Tens a day, kept subtle | The Living springs: critically damped (no bounce), 12 px rise (6 px inside a practice), 30 ms stagger, at most 14 parts. Never delays a tap; nothing is left hidden at rest. |
| 5 | Pressing anything | Feedback | Constant | `scale(.97)` in 70 ms, then a spring back. Under 100 ms, so it reads as response, not animation. |
| 6 | The step you're on (progress dots) | State | Every step | The current dot grows into a short bar (240 ms, `cubic-bezier(.23,1,.32,1)`). |
| 7 | "All chapters", "Why this works", "More" | State | Occasional | Height animates open and closed (`interpolate-size` and `::details-content`, 320 ms). Instant where unsupported. |
| 8 | Finishing a practice | Delight (rare) | A few times a week | One point of light rises and settles into the Journey tab. |
| 9 | World and Home art | Depth | Occasional | The art leans a few pixels with your hand or phone (60% of Depth's), and **stops while you read** (practices and sheets). |

## Deliberately still (rejected by the four tests)
- **Tab switches:** no page transition. Tens a day: motion would make the core navigation feel slow. Arrivals stay subtle (4).
- **Numbers in Your week and Journey:** no count-up. They're data people read, and moving them hinders.
- **Typing in Reflect:** no effects. It's the most personal, most frequent writing surface.
- **The noticing cards:** no entrance flourish. The evidence is in the person's own words, and it should read as calm and factual.
- **Parallax while reading:** none. Apple lists simulated depth as a motion trigger, and text must never drift.

## Choices and accessibility
- **The five motion choices:** You › Display › Motion style offers **Flow** (default), Calm, Living, Depth (the comparison pill appears for those three) and **Still**, which keeps only state changes. The choice is kept on this device.
- **Reduced motion:** `prefers-reduced-motion` turns all of it off: no springs, no morph, no sliding sheets or tab bar, no parallax and no star.

## Tested
- **`e2e-motion.cjs`:**
  - Flow is the default;
  - arrivals settle;
  - one View Transition opens a practice and leaves no transition names behind;
  - the tab bar hides and returns;
  - progress bar width;
  - a sheet rises, a small pull springs back, a long pull dismisses;
  - Still and reduced motion do none of it;
  - the pill fits on a 320 px screen.
- **The functional suites** run with Still (`docs/galactic/test/still.cjs`), so they test what's on screen, not the timing.

## Not used, and why
- **REA (github.com/morluto/rea):** checked at d7df9df (MIT). It's a reverse-engineering toolkit for binaries and runtime behaviour (Ghidra, Frida and similar). Using it on other companies' apps to lift how they're built would mean copying proprietary software. That is against this project's rule ("Do not copy proprietary app code or unlicensed assets") and REA's own disclaimer. It isn't installed. Everything here comes from public principles and Dawnward's own code.
- **Mobbin (mobbin.com/discover/apps/ios/latest):**
  - Its screens load only after signing in, and an automated fetch gets an empty shell.
  - Its terms don't allow scraping.
  - It's a good place for Bianno to browse for inspiration. Screenshots of other apps are references for principles, never something to copy.
