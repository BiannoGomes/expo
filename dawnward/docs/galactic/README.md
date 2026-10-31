# Dawnward: the Living Intelligence Universe

Galaxy Home, the first full vertical slice, built from the October 2026 directive and Bianno's Galaxy Home board, using Bianno's ChatGPT world art.

**Update (later on 2026-10-31):** the Precision pass removed all sample data and rebuilt navigation, the world template, reflection and Memories. Where this file and `docs/ux-ui-audit.md` differ, the audit is current.

**Status: built and tested in a browser, not shipped.** Nothing is deployed. It was tested only on this machine's software GPU, not on any phone or headset.

| Where | What |
|---|---|
| `dawnward/experience/home.html` | The page: type and colour tokens, layout, every panel |
| `dawnward/experience/src/home.js` | Data, state, the slice, capture, review, text view, sound |
| `dawnward/experience/src/home-scene.js` | The 3D galaxy: worlds, core, stars, camera |
| `dawnward/experience/assets/img/worlds/` | The art, with provenance in `SOURCE.md` |
| `node build.mjs` | Writes `dist/home.html` and `dist/home.js`, plus `dist/dawnward-home.html` as one self-contained file |
| `docs/galactic/test/e2e-home.cjs` | The end-to-end test. Results in `e2e-home-results.json`, screenshots in `shots/` |
| `docs/galactic/chatgpt-screen-briefs.md` | The prompts that made the art |

## 1. Audit (what existed, what was missing)

**Already in place:**
- The `/galaxy` contract (stars, themes, links) and per-world filtering.
- `/debrief` with `world` and `clientKey`.
- Disputes with corrections, and `/campaign`.
- Read-time exclusions.
- The pause on learning.
- The Memory Galaxy page, with sparkling stars and WebXR.
- The Living Universe story site.

**Missing:**
- A home that is the galaxy itself.
- World screens.
- Capture inside a world.
- The moment a new star is born.
- A review that keeps what you said apart from what Dawnward thinks.
- A full text view.
- Image-based worlds.

**Problems the directive named, now fixed:**
- **The phone inside a phone:** gone. The galaxy is the whole screen.
- **Text painted into 3D:** never done. Every word is HTML.
- **No way out of a world:** the back button, the world dots, Escape and the wordmark all return home.

## 2. Typography and tokens

Fonts are self-hosted, so no visitor request goes to Google. Inter and Cormorant Garamond are variable latin subsets under the SIL OFL; IBM Plex Mono was already in the project.

| Role | Font | Size |
|---|---|---|
| Wordmark | Cormorant Garamond 500 | 32 to 40 px (34 on phones) |
| Headlines | Cormorant 500 | 32 to 40 px, line height 1.15 |
| Card statements | Cormorant 500 | 20 to 24 px |
| Body | Inter 400 | 16 px, line height 1.55 |
| Navigation | Inter | 14 px |
| Metadata | Inter or IBM Plex Mono (dates only) | 12 px |
| Buttons | Inter 500 | 15 px |
| World names on the home | Cormorant 600, spaced capitals, curved around each planet | 15 px phone, 18 px desktop |

**Colours:**

| Token | Value |
|---|---|
| void | `#05070D` |
| deep | `#0A1426` |
| cyan | `#37D5E8` |
| orbital blue | `#5B8CFF` |
| violet | `#9B5BFF` |
| gold | `#E6C07B` |
| gold text | `#F0D6A2` |
| ink | `#F3F0E8` |
| dim | `#C3C9D4` |
| danger | `#E39A92` |

**Rules:**
- Glass panels are `rgba(12,20,38,.62)` with an 18 px blur and a 1 px light edge.
- Gold marks small accents and the one primary button per panel. It is never used for thin body text.
- Only the core, the stars and the primary button glow.

## 3. Spatial interaction spec

**Moving between places:**
- **Home:** four worlds sit in a tilted disc around a spiral core. Mind is above, Body and Soul at the sides, Future below, as on the board.
- **Into a world:** tap the planet or its Explore button. The camera flies in an eased arc (950 ms). Then the world's close-up painting fades in (600 ms) and the 3D stops drawing.
- **Interruptible:** any new request takes over mid-flight, and moves land on time even when frames run slow.
- **Back home:** the back button, Escape, the world dots or the wordmark (900 ms). Focus returns to whatever you left from.
- **Measured here:** arrival takes 1.03 s on the phone and 1.15 s on desktop, including the frame it lands on. The directive asks for 650 to 1,100 ms; desktop ran over by one slow software-GPU frame.

**While you reflect:**
- The painting dims, the sound softens, and the panel rises.
- When you save, a new star ignites in that world, and a chime plays if sound is on.
- "See it in your galaxy" flies home with your new star selected.

**Comfort:**
- The worlds never spin; only the spiral turns, slowly.
- Reduced motion removes the entrance, the flight, the drift and the breathing, and arrival is instant (56 ms measured).

**Entrance:** a point of light opens into the galaxy over 3 s. Skip ends it. Returning visitors never see it, and neither do reduced motion or text view.

## 4. Component architecture

**`home-scene.js`** (presentation only; holds no words):
- `buildHome()` returns `project`, `pickWorld`, `setMemories`, `setSelection`, `focusWorld(key, onArrive)`, `setFrame`, `resize`, `degrade` and `frame`.
- The worlds are camera-facing paintings, composited as light on black. Each one's coverage comes from its disc, so halos blend into the sky.
- Worlds left of the core are mirrored, so their gold edge faces the light.
- The core is Bianno's spiral, lying in the disc. Dust, link and star shaders are shared with the Memory Galaxy.

**`home.js`** (one state object):
- State is `view`, `mode`, `selStar` and `suggestion`.
- Places: home, then a world. A world holds rows, and a row opens a sheet: memories, insight, capture, new star, review, destination, evenings, insights, tomorrow or privacy.
- `place()` lays out the curved names and Explore buttons every frame. Words only appear where they fit, and labels never leave the screen.
- `setFrame()` fits the four worlds into the space the panels leave free.

**`home.html`:**
- Layers: sky, canvas, close-up, labels, panels, popovers, entrance.
- Landmarks: header, nav, main, plus a live region and a skip link.

## 5. The working vertical slice

Galaxy Home → Mind → New reflection → Keep it → a new star, with your exact words → Review what I understand → Yes, it does (a new line is drawn) → Return to your galaxy.

**Sample mode (no token):**
- Twelve invented evenings and four beliefs, labelled "Sample universe" on screen.
- Everything you type stays in the page; nothing is sent anywhere.
- The link suggestion is labelled "Sample logic · a word match in this page, not Dawnward's model".

**Connected mode** (`home.html?api=…#token=…`):
- Reads `/galaxy` for each world, plus `/campaign`.
- Writes `/debrief` with the world and a `clientKey`, so a retry never makes a second evening.
- Writes `/assertions/:id/dispute` for "Correct it" and "That's not right".
- A crisis reply from the server is shown word for word, and nothing else follows it.
- The token is read once and removed from the address bar. It is only sent to the page's own origin or to localhost (tested).
- **Not tested end to end against the server in this pass.** The same contract was tested for the Memory Galaxy page.

## 6. Performance (measured here, software GPU)

| | Phone 390 × 844 | Desktop 1440 × 900 |
|---|---|---|
| Ready (sample data) | 420 ms | 583 ms |
| Arrival in a world | 1,029 ms | 1,153 ms |
| Frame median | 100 ms, then 33 ms after the governor degraded | 317 ms |

These frame times come from this machine's software renderer and say nothing about phones. **Real-device measurement is still needed (D6).**

**First load:**

| Part | Size |
|---|---|
| `home.js` | 160 KB gzipped (three.js included) |
| `home.html` | 36 KB |
| Images | 518 KB: four 640 px planets, the core, the moons, one sky |
| Fonts | 110 KB |
| **Total** | **About 0.83 MB**, against the 1.41 MB Living Universe baseline |

The world close-ups (about 150 KB each) load only when you enter a world.

**Governor:**
- Every 120 drawn frames, if the median runs past 28 ms, it drops the glow, the pixel ratio and half the dust.
- Inside a world, and in text view, the 3D stops drawing entirely.

## 7. Accessibility (axe-core, WCAG 2.0 to 2.2 A and AA)

**axe-core: 0 violations in 10 states:**
- Phone and desktop × home, a world, capture, review and text view.

**Also tested:**
- Focus moves to the world title on arrival and to each sheet's title. Back returns focus to where you came from.
- Escape returns home.
- Saving with nothing typed gives a spoken error.
- Setting an insight aside asks first, and can be cancelled.

**Built in:**
- Every world is a real button with its full name.
- The curved names are decoration, hidden from screen readers; the button says it all.
- The text view holds everything, with no picture of words anywhere.
- Speaking falls back to typing, with a note where it's unavailable.
- Sound starts only on a click.

**Not tested:** VoiceOver, TalkBack, switch control, real phones.

## 8. AI memory and privacy design

- **Recollection is kept apart from inference.** Every review pairs "What you said", your exact words with dates, with "What I think it means", a statement with a confidence level and "Seen in N of your evenings".
- **It can say "I don't have enough evidence to conclude that."** It says so on worlds and new evenings that don't support a conclusion yet, and on guesses still forming.
- **You decide.** "That's right" keeps a belief. "Correct it" replaces it with your words. "That's not right" asks first, then sets it aside, and the lines it drew disappear.
- **Future milestones come from your words.** A milestone is marked only when an evening says it happened, and it shows that evening. Planned milestones from `/campaign` show their day but are never marked done by date.
- **There is a privacy screen.** It covers words kept as you said them, leaving any evening out, pausing learning, export and delete, and "Private. Never sold."
- **No scores, streaks, badges or percentages** anywhere.
- **Sample mode can't run Dawnward's safety check**, because nothing leaves the page. It still recognises clear crisis phrases and answers only with the same hand-written support text the server uses.

## 9. Risks

1. **Unmeasured on real devices.** Every timing here comes from a software renderer (D6).
2. **The art is 2D paintings.** The worlds can't rotate or be orbited in true 3D; a world you can fly around needs purpose-built 3D assets.
3. **Image licensing.** The art was made with ChatGPT by Bianno. Check OpenAI's current terms before using it commercially. Provenance is recorded.
4. **Close-ups are 942 × 1670**, below phone resolution, so they look slightly soft. Upscaling costs credits and needs your approval.
5. **Connected mode needs a run against the live server**, plus a check of how `/campaign` milestones read.
6. **Web Speech differs by browser.** Typing always works.
7. **The sample crisis check is a phrase list.** It is a safety net, not triage. Real triage runs on the server.
8. **The Body painting is mirrored.** Its waterfall now flows the other way. If that bothers you, ask ChatGPT for a version lit from the right.

## 10. Phased roadmap

| Phase | What | Needs |
|---|---|---|
| **Now** | This slice, the Memory Galaxy and the Living Universe, all in a browser | Done |
| **1** | Run on real phones (iPhone 12 and newer, a mid-range Android) and tune the governor from the numbers | D6 |
| **2** | Connected mode against staging; the entrance art (prompt 8); review the close-up resolution | Staging access, the image, credits approval |
| **3** | Bring the home into the Expo app: the world screens and sheets map onto the app's routes, and the 3D runs in a web view or native GL | Architecture decision |
| **4** | Constellations from real themes in the Memory Galaxy, using the line-free sky; the Future destination with real milestones from evenings | Product decision on milestones |
| **5** | True 3D worlds (geometry or a depth-map parallax) and a headset mode for the home | 3D assets, headset testing |

**Owner decisions still open:** D1 to D7 (D3 was applied as a contrast fix), pricing, the app lock and the trust-first angle.
