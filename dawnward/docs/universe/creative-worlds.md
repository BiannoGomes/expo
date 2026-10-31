# The galaxies you can walk into

**Status:** updated 2026-10-31. Everything here runs on the device: no AI service, no paid API, no new hosting, no generated art. Shown only in the private preview; not deployed.

## What's open, galaxy by galaxy
| Galaxy | Planet | Access | What you do |
|---|---|---|---|
| Creative Worlds | The Infinite Door | free | The way in: choose where it opens (four destinations) |
| | The Floating Kingdom | free | Light five lanterns over a sea of clouds |
| | The Living Forest | members | Wake seven glowing plants; fireflies follow your touch |
| | The Dream Architect | members | Make a small place from four choices (ground, sky, something built, something alive), name it, keep up to twelve, tap the building to light it |
| | The Time Garden | free | Write a moment; it becomes a flower that grows over a week of real time. Read it again or let it go |
| Spiritual Exploration | The Temple of Stillness | free | Paced breathing (1, 3 or 5 minutes; in 4 out 6, or in 4 out 4) with a light that grows and fades. Nothing recorded |
| | The Dream Realm | free | Keep dreams as bubbles above a pastel sea. No interpretation |
| | The Sound Sanctuary | members | Strike seven tuned singing bowls (synthesised live), with an optional low hum |
| | The Inner Cosmos | members | Inside a nebula; six bright stars, each with a short invitation to notice |
| | Sacred Traditions | planned | Waits for writers and reviewers from each tradition |
| Knowledge | The Cosmic Observatory | free | The Sun and eight planets with true year ratios (Earth = 24 s). Tap for facts, marked **draft, awaiting a reviewer** |
| | The Discovery Lab | members | Real Newtonian gravity: drag to throw moons, tap for a circular orbit, or try circle, oval, too slow, too fast |
| | The Human Mind, Civilizations, The Philosophy Temple | planned | Lessons need writing and checking by a qualified reviewer |
| AI Creation | The Creation Gallery | free | Everything you've made: places, moments, dreams, lit worlds. Save a copy as a file, or delete all of it |
| | The Dream Forge, The Architect, Future Self, The Companion Nexus | planned | Each needs an AI service, which costs money per use, so they wait for your approval |

## Why some things are free
- **Writing is never behind membership.** The Time Garden and the Dream Realm are free, and anything you've made stays readable, saveable and deletable whatever your plan. This follows the monetisation plan's principle 2.
- **One free world per galaxy at least**, and the members' worlds use the same honest gate as Learn.

## Privacy and safety
- **Where things are kept.** Everything is in `localStorage` key `dw-creative-v1` on this device: places, moments, dreams, lanterns.
- **Saving and deleting.**
  - The Creation Gallery saves a copy as a file, and deletes everything with a confirmation.
  - You › Export now includes it under `worlds`.
  - You › Delete removes it too.
- **Crisis check.** Anything written, in the garden, the dream realm or a place's name, goes through the same crisis check as Reflect. If it matches, support comes first. The words are still kept privately: they're the person's own.
- **Breathing.** The practice says plainly: "If you feel light-headed, stop and breathe normally."
- **Unchecked facts.** The Observatory's facts are well established, but they're marked as a draft until a reviewer checks them. Dreams are never interpreted.

## Not built, and why
| Planet | Why it waits |
|---|---|
| The Dream Forge, The Architect (AI), Future Self, The Companion Nexus | They need a paid AI service; approval required. The Quantum Gateway already offers a non-AI future-self practice |
| The Human Mind, Civilizations, The Philosophy Temple, Sacred Traditions | Educational and spiritual content needs qualified writers and reviewers. I won't invent it |
| Account sync for what you make | Needs a small server route and table; no extra cost, but a privacy decision (sending personal writing to the server). Next if you want it |

## Controls
| Input | Does |
|---|---|
| Drag (touch or mouse) | Look around, with the Gravity damping (half-life 0.32 s) |
| Pinch, or scroll wheel | Come closer or step back, within limits |
| Tap | Light a lantern or wake a plant. Generous invisible targets make it easy for a fingertip |
| Arrow keys, + and − | Turn, tilt and zoom (keyboard) |
| Escape | Leave: world → galaxy page → Universe |
| **Things here** | Every touchable thing as a button, with a line for what happens. Works with a screen reader and switch control |

## Accessibility and fallbacks
- **No WebGL, or the text view:** the world opens in words. The list is open, and each item can be lit. The progress kept is the same.
- **Reduced motion:**
  - the door appears still, with no dive or clouds;
  - opening the door is a cut, not a flight;
  - in the worlds there's no auto-turn, bobbing, swirling or fireflies drifting. Your own drag still moves the view.
- **Focus and announcements:** focus moves to each new heading. Every lit thing is announced with its line and the count.
- **axe:** no violations on the galaxy page, the door, the members' gate, the kingdom with its list, or the forest in words.

## Sound
- **The app's sound** stays off until you turn it on in You, or with a world's **Sound** button. With it on:
  - each lantern, plant, star and planted moment plays its own note;
  - the door plays a rising sweep, and a completed world a three-note chord;
  - the breathing practice plays a low tone as each breath turns.
- **The Sound Sanctuary is the exception.** Tapping a bowl is asking for sound, so each strike plays even when the app's sound is off. The page says so. Its audio closes when you leave.

## Membership
- `access` on each planet in `REALMS` (`src/creative.js`) decides it. The gate offers "Free now" with the galaxy's free world, and "Preview as a member" on this device only.
- **A direct link** to a members' world waits for the membership to load before deciding, so a member's link never flashes the gate.

## Architecture
| File | Role |
|---|---|
| `experience/src/creative.js` | All four galaxies (`REALMS`), the galaxy pages, the gate, the door, the world HUD, the Creation Gallery, and one small experience per planet (`EXP`). Writing worlds share `journal()` |
| `experience/src/creative-scene.js` | One engine (look-around camera, tap picking, a fixed top-down view for the lab, dispose) and ten world builders (`BUILDERS`), each exposing an `api` the page drives |
| `experience/src/home.js` | Routes `#/universe/<creative\|spiritual\|knowledge\|ai>` and `#/<galaxy>/<planet>`, "Enter …" on the Universe map, Escape, and export and delete in You |
| `experience/src/registry.js` | All four galaxies are `open: true`, with honest "Open now / Planned" lines |
| `experience/home.html` | `#creative` with `#cw-page`, `#cw-door`, `#cw-stage`, and their styles |

**Only one WebGL loop runs at a time.** The galaxy's loop pauses whenever a page covers it, and a world's renderer is disposed when you leave. Every world is made from code, with no textures to download.

**Adding a world:**
1. Add a planet to `REALMS`.
2. Add an experience to `EXP`: a function returning `{ opts, pick, ready, words, stop }`.
3. Add a builder to `BUILDERS` that registers pickables with `userData.id` and returns `{ view, api }`.

## Measurements (honest)
- **SwiftShader** (software rendering in the test browser, not a phone): median frame times at 390×844 range from about 20 ms (the Dream Architect, the garden) to about 65 ms (the Inner Cosmos, the Observatory, the lab, the temple). They vary run to run; see `e2e-realms-results.json` and `e2e-creative-results.json`.
- **Not measured on a real phone.** Try each on an iPhone and a mid-range Android before launch.
  - The Inner Cosmos is the most expensive: a full-screen nebula shader. If it stutters, lower its pixel ratio or the noise detail first.
  - Watch `window.__dwCreative.frames()` in a remote console.
- **Bundle:** the experience grew by about 85 KB of code in all; no new assets.

## Not built, on purpose
- WebXR or headset mode.
- Prerendered film: these worlds are real-time, so they respond to you. Fable isn't available in this environment anyway.

## Tests
- `docs/galactic/test/e2e-realms.cjs` has 63 checks: the three new galaxy pages, writing, reading and letting go in the garden, the crisis check, dreams, breathing, a real tap on the Sun, facts, members' gates by link, the gallery's save and delete, the garden without WebGL, the Dream Architect (choices, keeping, a real tap on its building, reopening from the gallery), bowls and hum, stars, the gravity lab (circle, escape, a drag on the sky), reduced motion, axe on twelve screens, frame times, and no errors.
- `docs/galactic/test/e2e-creative.cjs` has 40 checks:
  - addresses, Back, Escape;
  - a real tap on a lantern found where it's drawn, and that a drag lights nothing;
  - the list path, completion and its focus, persistence across a reload;
  - the members' gate and member preview;
  - no WebGL, reduced motion, desktop keyboard;
  - axe on five screens;
  - frame times;
  - no page or shader errors.
