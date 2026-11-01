# Dawnward redesign: phases 1 to 4 (Home and Reflect pilot)

**Status:** 2026-11-01. The Home and Reflect pilot is built and tested, and the app-wide copy changes are applied. **Phase 5 (Universe, Learn, Expeditions, Journey) waits for Bianno's approval**, as the brief asks. Nothing is deployed.

## Phase 1: audit, with evidence
Before and after screenshots are in `shots/` at 360, 390, 430 and 1440 px wide.

**Reflect, before** (`shots/before-reflect-390.png`): the audit was right.
- Two back controls: the round back button, plus "← Mind" inside the sheet.
- Breadcrumbs (Universe › Personal Growth › Mind).
- A label line: "MIND · A PRIVATE REFLECTION".
- A 7-row textarea filling half the screen.
- A privacy sentence on every visit: "Only you can see this. It stays on this device."
- "Kept in Mind. Change": this is a world picker, not a save status.
- "Keep it", plus a speech note.

**Home, before** (`shots/before-home-390.png`):
- One card with 8 separate text elements: kicker, chapter, title, part, mission, bar, button, why.
- Below it, a gold medal and two more text links.
- Under the fold: "Explore your worlds" with "View galaxy", a three-tile "Your next steps" row, and "A moment for yourself", which repeated the privacy line.

**The app itself:**

| Area | What it is |
|---|---|
| Stack | Vanilla JS and three.js, built with esbuild into one page (`experience/home.html`, `src/home.js`). Expeditions live in `src/explore.js`; the galaxies in `src/creative.js` |
| Tokens | `:root` in `home.html` already holds the brief's palette: void #05070D, deep #0A1426, gold #E6C07B, cyan #37D5E8, blue #5B8CFF, violet #9B5BFF, teal (body) #5FE3C0. Display serif is Cormorant; sans is Inter |
| Navigation | The five bottom tabs the brief recommends keeping |
| Storage | Reflections are on-device (`dw-local-v1`) unless an account is connected; drafts in `dw-draft-v1`. Expeditions, the galaxies' creations, and now your direction (`dw-direction-v1`) are also on-device |
| Tests before this change | 10 browser suites (623 checks), plus 48 server unit tests |

## Phase 2: structure, copy and the design system
**Information architecture:**
- The five tabs stay, as the brief recommends.
- **Home** becomes: question, one primary action, an optional direction, the next step, your worlds, and a way to reflect.
- **Reflect** becomes one question, one input and one primary action.
- The Tree of Life, sacred geometry and Hermetic teaching stay in the Knowledge galaxy, not on Home, as the brief says.

### Copy inventory (applied across the app)
| Before | After | Where |
|---|---|---|
| Your intention | Your direction | Quantum Gateway, step 2 |
| What would you like to move toward? One sentence is enough. | What do you want to change? | Quantum Gateway |
| Save and continue | Continue | Every expedition |
| Mind · a private reflection | (removed) | Reflect |
| What is on your mind? | What's on your mind? | Reflect, Mind |
| Only you can see this. It stays on this device. | Moved behind a **Private** chip; still read to screen readers with the input; also in You › Private | Reflect |
| Kept in Mind. Change | A **Mind ▾** chip (it chooses the world; it isn't a save status, so "Saved · Edit" would have been untrue) | Reflect |
| Keep it | Save reflection | Reflect |
| Expeditions: short guided practices for real life… | Explore. Practise. Grow. | Learn |
| Continue (section) | Pick up where you left off | Learn |
| Step 3 of 6 | 3 of 6 | Learn |
| Members' Library | Library | Learn, the library pages |
| Lessons, films and guided audio from Bianno | Lessons, audio & films | Learn |
| Your journey | Your Journey | Journey, You |
| Your evolution | Your Progress | Journey |
| Milestones and discoveries | Milestones | Journey |
| 0 of 2 memories | 2 reflections (or "Showing 0 of 2 reflections" when a filter hides some) | Journey |
| A Tree of Life of knowledge, from the world you can see… | Explore science, philosophy and the mysteries of existence. | Universe map |
| A step toward the person you are becoming | Meet your future self. | Universe map |

"Practise" keeps its British spelling as a verb, matching the rest of the app.

### Design rules now in use
- **One primary (gold) action per screen.** Home: "Explore your worlds". Reflect: "Save reflection". The next step uses an outlined button.
- **Gold means meaning:** primary actions, your direction, discoveries.
- **Art stays visible and quiet under text.** Reflect dims the world's painting with a directional gradient instead of an opaque panel, and the question gets a soft shadow.
- **Progressive disclosure:** "Why this?", "Choose another" and "Not today" sit inside one fold; privacy sits behind one chip.
- **Touch targets:** chips and buttons are at least 44 px tall.

New reusable pieces:

| Piece | What it is |
|---|---|
| `nextcard` | The next-step card |
| `sheetdlg` | An accessible bottom sheet on the native `<dialog>`: focus stays inside, Escape closes, focus returns |
| `textarea.grow` | A compact input that grows to half the screen |
| `ed-chip` | A small, pill-shaped toggle button |

## Phase 3: what changed
**Home** (`src/home.js` `drawEarth`, `nextCard`, `directionSheet`):
- the question "Where will you grow today?";
- one primary action;
- "Set your direction" opens a sheet, and the direction then shows with Edit;
- a compact next step (title, one line, a thin progress bar, Begin or Continue, the time, and Why this?);
- "How did it go?" appears only when a real action is waiting;
- your five worlds;
- a single "What's on your mind?" row.

**Reflect** (`openEditor`, `closeEditor`):
- one question, two chips (World, Private), a 3-row input that grows, Save reflection, and a quiet Speak;
- the round back button closes the editor (its label becomes "Close");
- the second back link and the breadcrumbs are gone while writing;
- drafts are still kept silently, and the screen speaks only if a draft can't be kept.

**Your direction:**
- kept on this device;
- included in You › Export and deleted by You › Delete;
- goes through the same crisis check as Reflect, so support appears in the sheet and nothing is saved.

## Phase 4: verified, and what needs you
**Tests:**
- `docs/galactic/test/e2e-redesign.cjs`: 45 checks.
  - At 320, 360, 390 and 430 px: no sideways scroll, and the main action is visible without scrolling.
  - One primary action on Home; the sheet's focus and Escape; direction kept, exported, and crisis-checked.
  - Reflect: one question, no label, one way back, privacy hidden but read aloud, the input grows, the world chip works, Save works, Close returns.
  - With a phone keyboard open, the question and input both fit.
  - axe on Home, the sheet and Reflect; no page errors.
- All existing suites were updated to the new copy and rerun; results are in the commit.

**Not verified:**
- On a real phone with a real keyboard: the keyboard check above simulates a 500 px-tall screen.
- Whether someone new to Dawnward can find their way without help. That's the brief's real success test: watch one or two people use Home and Reflect without instructions.

**Your approval is needed for Phase 5:** applying the same system to Universe (the map first), Learn (a featured journey), Expeditions (one decision at a time, starting with the Thought Labyrinth) and Journey (a summary line, a constellation, then a timeline).
