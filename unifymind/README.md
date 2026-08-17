# Bianno Gomes · UnifyMind

An author site built to be the pillar that sells the UnifyMind books. One file,
no dependencies, no build step. Open `index.html`.

## Where the content came from

Everything factual on this page traces to the UnifyMind production record in the
`book-factory` skill. Nothing about Bianno's life was invented.

**Confirmed and used:**

| Fact | Source |
|---|---|
| Self-Mastery, 178 pages | production record |
| The Invisible Ocean, 179 pages | production record |
| The Sealed Codex, 181 pages | production record |
| $9.99 / $16.99 / $24.99 | pricing pattern |
| 6x9 in, cream stock | typeset spec |
| Gold `#c9a13b` / `#e8c56a`, bone `#e9e2d0`, dark ground | series brand |

**The five veins** are the five confirmed biographical veins from the TRUTH LAW,
and the page contains no sixth: Cape Town childhood, the drawing trance,
sea/yachting, the Matroosberg canyon night at fifteen, Mediterranean crossings.
Every biographical sentence traces to one of those. If a line reads wrong, the
framing is wrong, not the fact.

**House style honored:** zero em-dashes in any printable text, including the
`<title>`. None of the banned AI-tell vocabulary appears.

## What still needs filling in

All of it sits in one `const` block at the top of the script.

| Field | What to add | Consequence if left |
|---|---|---|
| `BOOKS[].url` | Amazon/KDP listing link | Button reads "Link pending" and goes nowhere |
| `BOOKS[].blurb` | One or two sentences per book | Blank space under the title |
| `BOOKS[].cover` | Path to the 1600x2560 ebook cover | Falls back to a typographic cover |
| `PORTRAIT` | Path to a portrait image | Shows a framed "portrait slot" |

The buy buttons deliberately say **"Link pending"** rather than linking to `#`,
so a missing link is visible instead of silently broken.

The newsletter form is **not wired to any provider**. It says so on the page and
again on submit. Connect a mailing provider before launch, or remove it.

## Design

The background is the same realtime engine as `/site`, re-skinned to the series
brand: a raymarched signed-distance field morphing between five forms, one per
vein, gilded rather than iridescent. Scroll position selects the form, so the
geometry follows the narrative.

The hero and the vein sections let it show. The books, about, and contact
sections sit on a near-opaque ground, because a page that sells has to be
readable before it is impressive.

**Typography is a stand-in.** The series faces are EB Garamond and Cinzel. This
file has no external requests by design, so it uses a Georgia-led system serif
stack. To match the books exactly, self-host both faces and add them to
`--serif`.

## Verified

Headless Chromium, no console errors on any path:

- Desktop 1440x900, mobile 390x844 (no horizontal overflow)
- `prefers-reduced-motion`: rotation, morph noise, and shatter all freeze; all 34
  reveal elements render immediately, so no content is hidden from it
- No WebGL2: canvas is removed, static ground takes over, all three books still render
- Header anchors clear the fixed header via `scroll-margin-top`

WebGL was exercised on SwiftShader only. No GPU was available, so real-world
frame rate is unmeasured. Adaptive render scaling (0.5x to 1.0x) is in place.
