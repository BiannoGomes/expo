# Dawnward UX/UI audit: Galaxy Home (web)

**Date:** 2026-10-31, against the Precision Experience directive.

**Where the evidence is:**
- `docs/ux-audit/before/` and `docs/ux-audit/after/`: seven viewports × home and Mind, with `facts.json` (overflow, small targets, off-screen elements).
- `docs/galactic/test/shots/` and `docs/galactic/test/e2e-home-results.json`: the full journey, 97 checks.
- Re-run `docs/ux-audit/capture.cjs` and `docs/galactic/test/e2e-home.cjs`; serve `experience/dist` on port 8771 first.

**Not tested:**
- Real phones.
- VoiceOver and TalkBack.
- A connected account against the server.

Every timing here comes from a software GPU, so none of it is a device measurement.

## Baseline before this pass

| Screen | What was wrong (seen in screenshots or measured) |
|---|---|
| Home, 320 × 568 | Worlds, names and four Explore buttons piled on each other. The home card covered a third of the screen, and the "Tomorrow's steps" card ran off the right edge. |
| Home, all sizes | Explore buttons 34 px tall, under the 44 px minimum. The "Sample universe" label and twelve invented evenings were shown to everyone. The wordmark got lost on the bright nebula. |
| Home, tablet landscape | The sample label sat on top of the home card. |
| Home, desktop | Four competing entry points: the card, three quick cards, a star dock and a rail. |
| World screens | Four equal rows and no single main action. World dots doubled as navigation. |
| Inside a world | The invisible planet buttons could still be pressed: their visibility was forced on in code. |
| Capture | The word "null" was printed where an empty slot was. Speech failed silently: it stayed on "Stop" with nothing written, because the preview window gives the page no microphone. |
| Saving | A "kept" message with nothing kept: sample mode held words in memory only, and they were lost on reload. |
| Memories | No in-page memory history: a link to a separate page that showed sample data. |

## What changed (Phases 2 to 8)

- **Tokens.**
  - A 4 px spacing scale (`--s1` 4 px to `--s16` 64 px), a 20 px gutter (16 px at 360 px and below) and a 44 px minimum target.
  - Type: world titles 30 to 36 px, sections 24 to 28 px, cards 18 to 22 px, body 16 px at line height 1.55, metadata 12 to 13 px.
  - One easing curve; 240 ms for interface moves, 600 ms for fades, 650 to 700 ms for the camera.
- **No test data.**
  - With no account connected, the page starts empty: "Your first reflection becomes your first star."
  - What you write is kept in this browser on this device, and only called kept after it has been written and read back.
  - A draft is kept as you type and comes back after navigating away.
  - You can save a copy as a file, or delete everything after confirming.
- **One navigation.**
  - Home, Reflect, Memories and You, at the bottom on phones and as a rail on desktop.
  - The current place is marked.
  - Escape and back always return home.
- **Home.** One question, one main action ("Begin reflection"), four worlds with curved names, and Explore below each.
  - The labels measure themselves and step the galaxy back until nothing leaves the free space.
  - Below 700 px tall, four plain world buttons replace the labels, and the planets stay as the backdrop.
- **The world template** (identical for all four):
  - back button and world name at the top;
  - the painting;
  - your wireframe's kicker, question, line, invitation and one "Begin reflection";
  - then, quieter, memories in that world and what Dawnward understands there.
- **Reflecting.**
  - One question and a large editor at 18 px text.
  - The painting dims while you write.
  - The world can be changed in one tap.
  - **Speaking:** the microphone is requested first. A blocked microphone is said plainly and the button is disabled. Words appear as they're heard. A message appears if nothing is heard after 6 s.
- **The new star.** Your exact words and "Kept on this device, word for word." When two of your evenings share a word, a possible connection is offered as a plain fact; you link them or ignore it.
- **Memories.**
  - Your evenings as star buttons, at least 48 px apart.
  - Filter by world, search your words, list view and zoom.
  - Tap a star for the memory, its patterns, and Open or Delete.
  - Built on the line-free constellation sky; no painted line stands in for data.
- **You.**
  - Patterns, each with the evenings behind it.
  - "That's right", "Correct it", or "That's not right" (it asks first).
  - Possible connections; your data (copy, delete); privacy; text view, sound, and replay entrance.
- **Fixes.**
  - Hidden buttons can no longer be pressed, and "null" can no longer appear.
  - The wordmark has a dark backdrop.
  - Shaders and textures are prepared while the page loads (no hitch on first sight).
  - Fitting moves only the camera.

## After: measured

| Check | Result |
|---|---|
| End-to-end checks | **97 / 97** |
| Overlap, off-screen and sideways scroll at 320 × 568, 360 × 800, 390 × 844, 430 × 932, tablet portrait, tablet landscape and desktop | None |
| Targets under 44 px | None, except the visually hidden skip link |
| axe-core (WCAG 2.0 to 2.2 A and AA) | **0 violations** in 14 states: phone and desktop × home, world, editor, memories, You, text |
| Into Mind | 752 ms on the phone, 927 ms on desktop. The move itself is 700 ms; the rest is this machine's slow frames. |
| Reduced motion, into Soul | 37 ms |
| Kept data survives a reload | Yes |
| Draft survives navigation | Yes |
| Delete everything empties storage | Yes |
| A crafted link sends the token elsewhere | Never |
| Frame median, software GPU | 67 ms on the phone, 150 ms on desktop. Real devices not measured. |

## Scores (1 to 10; 5 is average; evidence above)

| Screen | Composition | Spacing | Type | Clarity | Continuity | Atmosphere | Mobile | Access | Perf | Reliability |
|---|---|---|---|---|---|---|---|---|---|---|
| Galaxy Home | 8 | 8 | 8 | 8 | 8 | 9 | 7 | 8 | 5 | 8 |
| World (Mind) | 8 | 8 | 8 | 9 | 8 | 9 | 8 | 8 | 6 | 8 |
| Reflect | 8 | 8 | 8 | 8 | 8 | 7 | 7 | 8 | 7 | 7 |
| Memories | 7 | 8 | 8 | 7 | 7 | 7 | 7 | 8 | 7 | 8 |
| You | 7 | 8 | 8 | 7 | 6 | 5 | 8 | 8 | 8 | 8 |

**Below 9, and what would raise it:**
- **Performance:** never measured on a phone. A real-device run (D6) is the only honest way up.
- **Mobile, home:** on a 320 px phone the planets are small, and selection moves to the world buttons. It works, but the galaxy is less present there.
- **Reflect, mobile:** keyboard behaviour is handled in code (`interactive-widget`, scroll on viewport resize) but untested on iOS Safari and Android Chrome.
- **Reflect, reliability:** speaking depends on the browser and is blocked inside the preview window. The app's own recorder (`/transcribe`) is the real path.
- **Memories:** with only a few memories, the field is mostly empty space. Clustering for many memories isn't built (only 48 px spacing and zoom).
- **Memories, continuity:** opening a star doesn't animate from the star yet.
- **You:** a plain page. Atmosphere is deliberately low, and it doesn't yet share the world template's header.
- **Everything:** VoiceOver, TalkBack and enlarged system text are untested.

## Release readiness

**Not releasable yet.** The web experience meets the directive's acceptance list in this environment:
- no overflow;
- no hidden primary controls;
- no lost reflections in normal navigation;
- no false save confirmations;
- no broken paths;
- nothing depending on 3D.

**Still open:**
- real-device measurement and screen-reader passes (D6);
- the connected flow against staging;
- bringing this into the Expo app (roadmap phase 3).
