# Dawnward: Home and Universe, rebuilt for phones

**Date:** 2026-10-31. Web preview only. Nothing deployed.

Two directives drove this pass: "From a beautiful galaxy into a personal transformation platform" and "The 10/10 Experience Reconstruction". Bianno also supplied mockups of the Daily Compass and a chapter layout.

As the second directive asked, this pass covers only:
- the portrait layout fix;
- Home and Universe split into two complementary screens.

No new galaxies and no new animation. The academy and library work is a proposal in [`academy-plan.md`](academy-plan.md).

## 1. The mobile defect: root cause

The Universe Atlas was a desktop map shrunk onto a phone. The CSS shows it, and so do measurements at six sizes:

| Cause | Effect on a 390 × 844 phone |
|---|---|
| `#a-inner { width:max(100%, 760px); height:max(100%, 720px) }` | The map was 760 px wide inside a 390 px screen. Side galaxies and their names were cut off at the edges. |
| Galaxy size `calc(size × 1vmin + 40px)` | `vmin` is the window's shorter side. On a tall phone that is the width, so galaxies shrank to 96–157 px. |
| One landscape set of positions for every screen | A wide composition squeezed into a tall screen leaves bands of empty space. |
| No room kept for the tab bar | Earth sat under the tabs. |

Ruled out: a fixed-aspect canvas, the camera aspect, device pixel ratio and the preview frame. The Atlas isn't a WebGL canvas at all; it's HTML.

**Fix (no arbitrary margins or scaling):**
- **The map measures itself.** `#a-field` is a size container. Galaxies are sized in container units.
- **Landscape** sizes follow the map's height.
- **Portrait** gets its own composition: Gateway at the top, two galaxies on each side, Personal Growth in the centre, Earth at the bottom. Sizes follow the map's width, capped by its height on short phones.
- **Long names wrap within their column.**
- **Room for the tab bar** at the bottom on phones, or on the right on desktop.
- **Selecting a galaxy zooms toward it** using its measured position, so this works in both orientations.

Measured after the fix (galaxies, names and art pairwise; everything inside the map):

| Viewport | Map area | Overlaps | Off screen | Vertical fill | Personal Growth art |
|---|---|---|---|---|---|
| 320 × 568 | 320 × 391 | 0 | 0 | 98% | 84 px |
| 360 × 800 | 360 × 614 | 0 | 0 | 97% | 129 px |
| 390 × 844 | 390 × 681 | 0 | 0 | 96% | 140 px |
| 430 × 932 | 430 × 769 | 0 | 0 | 95% | 155 px |
| 820 × 1180 | 820 × 1017 | 0 | 0 | 95% | 232 px |
| 1440 × 900 | 1320 × 801 | 0 | 0 | 95% | 292 px |

**Before and after:** `shots/compare-360x800.png` and `shots/compare-390x844.png`.
- **"Before · Home"** is the last pushed build (commit `500b2792`).
- **"Before · Universe"** is today's page with the old layout rules re-applied. The Atlas was never in a pushed build, so this is the only honest way to show what it did.

Two more bugs found and fixed on the way:
- **Earth drawn as a 300 px disc covering Personal Growth.** The button's class `gx-earth` (from its id) was the same as the class for the Earth art.
- **Personal Growth rendering empty when reached from Home.** The planets' free space was measured from the galaxy card while that card was hidden. It's now measured only when the card is visible.

## 2. Information architecture

| Tab | Job | Built from |
|---|---|---|
| **Home** | The Daily Compass: where you are, your next step and why, your five worlds, next steps, a direct way to reflect | The Earth page, rewritten |
| **Universe** | The full-screen map: seven destinations, Personal Growth → five worlds → missions | The Atlas, plus the 3D galaxy |
| **Reflect** | Private writing and voice, one tap from anywhere | Unchanged |
| **Learn** | Expeditions by world, the quest player | Explore, renamed |
| **Journey** | Memories (galaxy or list), plus Milestones: discoveries and the real actions you chose | Memories, with a third view |
| You | Data, privacy, display | Moved to the top bar (Home and the galaxy) |

- **Everyone opens on Home.** The next step is visible in seconds, and the Universe is one tab away.
- **In the galaxy, the five repeated Explore buttons are gone.** Each planet's readable name is its button. On wider screens a short line about the world sits under the name.
- **The galaxy card** now says what the galaxy is for ("Where would you like to go?") instead of the generic evening prompt.
- **Time-neutral copy.** "Good afternoon … tonight" contradicted itself; greetings by clock time are gone and the questions no longer say "tonight".

## 3. The Daily Compass

One clear, optional suggestion. The rules are deterministic and listed in `drawEarth`/`compassPick` in `experience/src/home.js`:
1. An unfinished expedition: "You started it and stopped at step 3 of 6."
2. The next part of a system you've already begun.
3. The expedition in the world of your last reflection.
4. The next expedition you haven't tried; for a newcomer, "a short first expedition".
5. When everything open is done, it says so plainly.

**Why this?** Every suggestion shows its reason. It also says that suggestions come only from what you've done in Dawnward, and that nothing is read from your reflections.

You can always change or dismiss it:
- **Choose another** opens Learn.
- **Not today** hides it for the day.
- **Show it** brings it back.

Nothing punishes a missed day.

**What the mockup showed that isn't built,** because the content doesn't exist yet: "Day 4 of 14", "The Clarity Protocol", "Read · Chapter 2", "Your toolkit · 2 worksheets". The Compass shows real progress only ("Step 2 of 6"). The "Your next steps" cards are real: another expedition to practise, your real actions, and your journey.

## 4. Tests (rendered pages, Chromium with a software GPU)

| Suite | Result | Covers |
|---|---|---|
| `docs/galactic/test/e2e-universe.cjs` (new) | **91/91** | The Atlas at six sizes: overlaps, on screen, no sideways scroll. Home opens on the Compass, its reason, "Not today" and "Show it", first action above the fold, axe. Universe tab → closed galaxy says so → keyboard select → Personal Growth (no Explore pills) → Mind (breadcrumb, Lenses, Thought Patterns) → The Thought Labyrinth (lens ratings gate Continue) → reflection → discovery → Home (just discovered; the Compass moves on to The Bridge) → Journey milestones (star and moon) → reflect from Home → Universe crumb → reload keeps progress. Reduced motion. axe on Atlas, Home, Mind, the lens step and Home after the mission, on phone and desktop. |
| `e2e-home.cjs` | **99/99** | Seven viewports with no overlaps in the galaxy, the reflection journey, memories, patterns, the text view, delete, token origin, reduced motion. Reduced-motion arrival is now timed inside the page: 19 ms in the recorded run. |
| `e2e-expedition.cjs` | **48/48** | The Bridge end to end through Learn, an unsafe plan refused, discoveries, check-ins, reload. |
| Server unit (`server/test`) | **40/40** | The engine, including lens validation. |

Also new: while Home, Learn, Journey or You covers the 3D galaxy, it stops redrawing. The last frame stays visible, so nothing changes on screen and phones save battery.

## 5. Remaining issues, honestly

- **No real device has been tested,** and neither have VoiceOver or TalkBack. Frame times are from a software GPU.
- **Placeholder art, still needed:**
  - Earth is a CSS sphere;
  - the four unopened galaxies are the Personal Growth image with a hue shift;
  - the Gateway is a CSS ring;
  - Spirit's planet and close-up are made from the crystal image.
  See `experience/assets/img/worlds/SOURCE.md`.
- **You** is in the top bar on Home and in the galaxy, but not on Learn or Journey. One tab-bar slot was given to Universe.
- **The Compass suggests from three missions.** It becomes useful with real content: see `academy-plan.md`.
- **Progress shows as discoveries, not XP.** That's Bianno's earlier decision, and the brand brief rules out points. Both new directives ask for deterministic XP; that needs Bianno's call (decision A1 in the plan).
- **The Universe screen's 2.5D map** is HTML with images. The cinematic camera journey between galaxies (parallax, travel) is deliberately not built yet, per "do not add complex animations until mobile is fixed and verified".

## 6. Files

- `experience/home.html`: tabs, top bar, Atlas container layout, Compass and Journey styles, readable planet names.
- `experience/src/home.js`:
  - `compassPick`, `compassCard`, `drawEarth` (Home);
  - `drawMiles` (Journey);
  - tab mapping, start on Home;
  - galaxy measuring fix, render pause, portrait coordinates.
- `experience/src/explore.js`: Explore → Learn wording, breadcrumbs rooted at Learn and Home.
- `docs/galactic/test/e2e-universe.cjs` (new), `e2e-home.cjs`, `e2e-expedition.cjs` (navigation updates).
- `docs/universe/shots/`: before and after at 360 × 800 and 390 × 844, plus the lower half of Home and Personal Growth.
