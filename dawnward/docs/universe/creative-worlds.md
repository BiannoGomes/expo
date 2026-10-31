# Creative Worlds: The Infinite Door (first slice)

**Status:** built 2026-10-31 as the first slice of the "four universes" brief. Shown only in the private preview. Not deployed.

## What you can do
1. **Universe → Creative Worlds** (or `#/universe/creative`). The galaxy page shows its five planets: the Infinite Door, the Floating Kingdom, the Living Forest, and two planned ones (the Dream Architect, the Time Garden).
2. **Open the Infinite Door** (`#/creative/door`).
   - The camera dives toward the planet, the clouds part, and a floating temple appears with a glowing doorway.
   - **Skip** finishes the sequence at once.
   - Choose where the door opens. The door's light takes the colour of the world you're looking at, and opens in light.
3. **The Floating Kingdom** (`#/creative/kingdom`, free): islands drifting above a moving sea of clouds, a castle with golden roofs, and falling light. Light the five lanterns.
4. **The Living Forest** (`#/creative/forest`, members): a bioluminescent night forest. Fireflies gather where you point or touch. Wake the seven glowing plants.
5. **When everything is lit:** a quiet "Discovered" card with an optional question to carry. No points, no streaks, no score.

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
The worlds use the app's existing sound, which stays off until you turn it on in You or in the world's **Sound** button.
- **Lanterns:** each plays its own note of a pentatonic scale, so lighting them makes a small melody.
- **Plants:** lower notes.
- **Opening the door:** a rising sweep.
- **Completion:** a three-note chord.

## Membership
- The Floating Kingdom is free. The Living Forest is for members (`access` in `CW` in `src/creative.js`).
- A free visitor who chooses the forest sees the honest gate: what it is, that membership isn't open yet, and "Free now: The Floating Kingdom".
- "Preview as a member" works on this device only, as in Learn.

## Progress
- What you've lit is kept on this device (`localStorage` key `dw-creative-v1`), and survives a reload.
- **Not yet synced to a Dawnward account.** That needs a small server route plus a column or table; it's the next step if the slice is kept.

## Architecture
| File | Role |
|---|---|
| `experience/src/creative.js` | Pages: galaxy, door, gate, world HUD, list, progress, routes, Escape. World content (`CW`, `PLANETS`) is data |
| `experience/src/creative-scene.js` | Real-time three.js. One small engine (look-around camera, tap picking, render loop, dispose) and two world builders, `kingdom()` and `forest()`. Loaded only when a world opens |
| `experience/src/home.js` | Routes (`#/universe/creative`, `#/creative/<door|kingdom|forest>`), the Universe map's "Enter Creative Worlds", the Universe tab, Escape |
| `experience/src/registry.js` | The galaxy is now `open: true`, still `access: "plus"` for what's beyond the first world |
| `experience/home.html` | `#creative` with `#cw-page`, `#cw-door`, `#cw-stage`, and their styles |

**Only one WebGL loop runs at a time.** The galaxy's loop already pauses whenever a page covers it, and a world's renderer is disposed when you leave it. Each world is made from code, with no textures to download (shaders for the sky, clouds and falling light; instanced trees; point sprites).

**Adding a world:**
1. Add an entry to `CW` (name, access, lines, things, notes).
2. Add a builder in `creative-scene.js` that registers pickables with `userData.id` and returns `{ view, light(id, on) }`.
3. Add a door choice.

## Measurements (honest)
- **SwiftShader** (software rendering in the test browser, not a phone): median frame **22 ms** in the kingdom and **32 ms** in the forest at 390×844.
- **Not measured on a real phone yet.** As the brief says, validate on an actual phone before adding more worlds.
  - Open the preview on an iPhone and on a mid-range Android.
  - Measure with the browser's performance tools, or watch `window.__dwCreative.frames()` in a remote console.
  - If the forest is slow, reduce the trees (70) and fireflies (260) first.
- **Bundle:** the experience grew by about 30 KB of code; no new assets.

## Not built, on purpose
- The other three universes and the other planets. The brief: "Don't build all 20 planetary experiences simultaneously."
- WebXR or headset mode.
- Prerendered film: these worlds are real-time, so they respond to you. Fable isn't available in this environment anyway.

## Tests
- `docs/galactic/test/e2e-creative.cjs` has 40 checks:
  - addresses, Back, Escape;
  - a real tap on a lantern found where it's drawn, and that a drag lights nothing;
  - the list path, completion and its focus, persistence across a reload;
  - the members' gate and member preview;
  - no WebGL, reduced motion, desktop keyboard;
  - axe on five screens;
  - frame times;
  - no page or shader errors.
