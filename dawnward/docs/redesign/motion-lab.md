# Motion lab: three directions to compare on a real phone (2 Nov 2026)

**What it is:** a switcher, so Bianno can feel each direction across the real app before one is chosen for the rebuild (step 3). It sits in **You › Display › Motion style (preview)**: Now · Calm · Living · Depth. Once a direction is on, a small pill above the tabs flips between the three anywhere in the app. The choice is kept on this device only (`dw-motion`). **Now** is the default and changes nothing.

**Where the numbers come from:** `docs/universe/motion-research.md`. That's public-source research on 12 reference apps, run in ChatGPT. Its timings are starting points, not measurements of those apps, and the code says so.

| | Calm (A) | Living (B) | Depth (C) |
|---|---|---|---|
| A place arriving | Dissolves in over 600 ms (ease-in-out), then the words settle 6 px, 60 ms apart | Parts rise 12 px with a critically damped spring (about 250–450 ms, no bounce) | Comes toward you out of the dark: 760 ms, ease-in-out, no roll, no lens change. 1000 ms for a world. Words fade in only once it has landed |
| A practice step | 280 ms dissolve, words follow | 6 px only, no scale: no bounce inside a practice | 420 ms approach, then the words on a still plane |
| Touch | (unchanged) | Every button squashes to 97% within 70 ms and springs back without overshoot | (unchanged) |
| Art | (unchanged) | (unchanged) | Leans up to 10 px with your hand or your phone's tilt; **stops while you read** (practices, dialogs) |
| Signature, on Done | A point of light rises and glides to the Journey tab (900 ms); the tab glows | The light pops up and springs to Journey (760 ms); the tab settles | The light starts close to you and recedes into Journey (1000 ms) |

**Rules for all three:**
- Only screens that are *arriving* animate. A click is never delayed, and nothing is left hidden or shifted at rest (tested).
- `prefers-reduced-motion` turns every one of them off. Apple names scaling and simulated depth as motion triggers.
- Reading text, Back and the tabs never drift.
- The star is `aria-hidden`; focus stays on the Done heading.

**Code:** `experience/src/motion.js`, hooked in `home.js` (`showPlace`, You › Display, the pill), `explore.js` (each step, Done) and `creative.js` (galaxy pages, doors, worlds). Every animation is tagged `id: "dw-motion"` so tests can count them.

**Tests:** `docs/galactic/test/e2e-motion.cjs`:
- Now adds nothing;
- the switcher and the pill;
- each direction animates and then settles;
- an expedition step animates;
- the star on Done;
- the choice survives a reload;
- reduced motion stands down even with Depth chosen;
- the pill fits at 320 px;
- axe.

**Not yet tested:** how each direction *feels* on a real phone, and frame rate on mid-range Android. That's your test.

**Next (step 3):** pick one direction, or a mix (for example, Calm travel with Living touch). Then rebuild the core flow in it: first open → Home → Universe → world → practice → Done → galaxy changes → Journey. The research's strongest cross-cutting advice goes in at the same time: skip travel and resume directly on repeat visits; one brief, skippable arrival ritual; one visible destination; protected zones behind labels.
