# Bianno Gomes

A personal site built to be the pillar that sells the UnifyMind books. One file,
no dependencies, no build step. Open `index.html`.

## Structure

| Section | Job |
|---|---|
| From Self-Mastery | The flyer hooks. The strongest selling copy on the page |
| From The Sealed Codex | Six of the thirty-three keys |
| Hero | The one sentence: what the whole life is aimed at |
| The through-line | Not one career, not one country |
| The many lives | Seven reinventions. Hovering a row morphs the sculpture |
| The record | Moravia Capital, Climate Fund Managers, Red and Yellow, maritime, BiannoArt, AIGLE |
| The invisible ocean | The inner work, which leads into the books |
| The books | The three volumes, with prices and buy buttons |
| The duality | The spreadsheet and the sunset |
| The pillars | Eight values |
| Legacy | Things meant to outlive the moment |
| Contact | Mailing list signup |

## Where the content came from

Two sources, both authoritative, neither invented.

**Books, prices, and brand** come from the UnifyMind production record: titles and
page counts (178 / 179 / 181), the $9.99 / $16.99 / $24.99 ladder, 6x9 cream
stock, and the gold `#c9a13b` / `#e8c56a` on dark ground palette.

**Everything biographical** was supplied directly by Bianno: the roles, the
employers, the certifications, the values, the duality, and the closing sentence.
Nothing on this page was inferred from those facts or filled in around them.

**Interpretation was left out on purpose.** The source material contains a lot of
hedged reading ("you seem to", "this may be"). Hedged interpretation does not
belong on a public page presented as fact, so the site states only what is
asserted plainly.

**House style honored:** zero em-dashes in any printable text, including the
`<title>`. None of the banned AI-tell vocabulary appears.

## Deliberately withheld

`FAMILY` is an **empty array**. The source material names Tiago, Rafael, and
Gunther Komnick, and mentions brother, mother, father, and grandfather. Naming
living people on a public website is Bianno's decision, not a default. The
legacy section is written to carry those names; adding them is one line:

```js
const FAMILY = ["Tiago", "Rafael", "Gunther Komnick"];
```

## What still needs filling in

All of it sits in one `const` block at the top of the script.

| Field | Status |
|---|---|
| `BOOKS[0].url` | Set. Shortlink supplied by Bianno, **unverified** (tr.ee is egress-blocked here) |
| `BOOKS[1].url` | Set. Same caveat |
| `BOOKS[2].url` | **Missing.** The Sealed Codex button reads "Link pending" |
| `BOOKS[0..1].blurb` | **Draft.** Written from Bianno's own sentences. Needs his approval |
| `BOOKS[2].blurb` | Empty. No source material for this title |
| `BOOKS[].cover` | Empty. Falls back to the designed typographic cover |
| `PORTRAIT` | Empty. No photograph is on the page |

**On the buy links:** both are `tr.ee` shortlinks and could not be resolved from
the build environment, so their destinations are unverified. Click both before
launch. Direct Amazon URLs are better on a sales page: they survive a shortener
outage and read as more trustworthy.

**On the blurbs:** books one and three now come from real source documents found
in Drive, not from inference.

- *Self-Mastery*: subtitle, audience, blurb, and the five hooks are quoted from
  `SelfMastery FLYER print_copy.pdf`. One OCR artifact was corrected: the flyer
  extracted as "Mast Men Only Talk About", set here as "most men only talk about".
- *The Sealed Codex*: subtitle, blurb, and the six keys are quoted from
  `⚡ The 33 Codex Keys (High-Level Map)`. That document is the presumed source for
  the book. If it is not, this section needs rewriting.
- *The Invisible Ocean*: still a **draft** built from Bianno's own description of
  the book. No marketing document for it exists in Drive. Approve or replace.

The closing line, "Bianno. From the Latin: lively, alive", is quoted from Codex 4.

The buy buttons say **"Link pending"** rather than linking to `#`, so a missing
link is visible instead of silently broken. The newsletter form is **not wired to
any provider**; it says so on the page and again on submit.

**No photographs are on this site.** They could not be retrieved. Drive is
egress-blocked in the build environment and the connector only returns files as
base64 into context, which is not viable for multi-megabyte images. The Jarvis
folder on the Windows desktop is likewise unreachable: this builds in an isolated
cloud container with no path to local disk. Drop image files beside this HTML and
set the fields above.

## Book covers

With no cover art available, each book renders a designed typographic cover in
the series look: a double gold rule, the volume numeral, a logarithmic spiral
generated from its equation rather than hand-authored path data, the title, and
the author line. Supplying `BOOKS[].cover` replaces it with the real 1600x2560 art.

## Structured data

A JSON-LD block describes the Person and all three Books with page counts and
offers, so search and answer engines can cite the work accurately. It contains
only confirmed facts.

## Design

The background is a raymarched signed-distance field that morphs between five
forms, gilded to the series brand. Scroll position selects the form, and hovering
a row in "the many lives" drives it directly, so the geometry follows the
narrative rather than decorating it.

The hero, through-line, ocean, duality, and legacy sections let it show. Lives,
record, books, pillars, and contact sit on a near-opaque ground, because a page
that sells has to be readable before it is impressive.

**Typography is now the real series pair.** Cinzel carries display (headings,
roles, covers, the seal numerals) and EB Garamond carries body, loaded from
Google Fonts with `display=swap` and a full Georgia-led fallback stack. This is
the one external request on the page; everything else remains self-contained.
To remove it, self-host both faces and delete the three link tags.

## The motion layer

All of it respects `prefers-reduced-motion`, which freezes or removes every item
below while keeping all content visible.

- **Hero letters** rise in one by one with a staggered delay on load.
- **A kinetic ticker** of the eight pillars runs between the through-line and the
  lives, set in outlined Cinzel. Under reduced motion it becomes a static line.
- **Scroll drives the camera**: the view orbits the sculpture almost a full turn
  over the length of the page, on top of pointer parallax on fine pointers.
- **A comet** arcs across the environment every eleven seconds, and because the
  form's material reflects the environment, the gold catches it.
- **The galaxy**: a third of the particle swarm forms a two-armed logarithmic
  golden spiral around the sculpture, distributed evenly by area, with
  differential rotation. The brand device, made of light.
- **The sky**: at dawn and dusk in the visitor's local time a warm band rises in
  the rendered environment. The footer notes it only while the engine runs.
- **Section titles** wipe in with a clip reveal; **book covers** tilt in 3D
  toward the pointer; **buy buttons** carry a gold shimmer on hover; a
  **progress rail** on the left tracks scroll; **film grain** overlays the scene.
- **Mobile**: the camera sits further back and the veil is stronger, so copy
  stays legible over the form on small screens.

The Seal section (a 90-year time capsule with live counters) was built, shipped,
and removed at Bianno's direction. It lives in git history at a188eb50 if ever
wanted again.

## Verified

Headless Chromium, no console errors on any path:

- Desktop 1400x1000 and 1200x760, mobile 390x844, no horizontal overflow
- All sections render: 7 lives, 6 record rows, 5 pairs, 8 pillars, 3 books
- Hovering a life row moves the morph target and marks the active row
- `prefers-reduced-motion`: rotation, morph noise, and shatter freeze; every
  reveal element renders immediately, so no content is hidden from it
- No WebGL2: canvas is removed, static ground takes over, all content still renders
- Header anchors clear the fixed header via `scroll-margin-top`

WebGL was exercised on SwiftShader only. No GPU was available, so real-world
frame rate is unmeasured. Adaptive render scaling (0.5x to 1.0x) is in place.
