# Bianno Gomes

A personal site built to be the pillar that sells the UnifyMind books. One file,
no dependencies, no build step. Open `index.html`.

## Structure

| Section | Job |
|---|---|
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

| Field | What to add | Consequence if left |
|---|---|---|
| `BOOKS[].url` | Amazon/KDP listing link | Button reads "Link pending" and goes nowhere |
| `BOOKS[].blurb` | One or two sentences per book | Blank space under the title |
| `BOOKS[].cover` | Path to the 1600x2560 ebook cover | Falls back to a typographic cover |
| `PORTRAIT` | Path to a portrait image | Currently unused; no photo is on the page |

The buy buttons say **"Link pending"** rather than linking to `#`, so a missing
link is visible instead of silently broken. The newsletter form is **not wired to
any provider**; it says so on the page and again on submit.

**No photographs are on this site.** They could not be retrieved: Drive is
egress-blocked in the build environment, and the connector only returns files as
base64 into context, which is not viable for multi-megabyte images. Drop image
files beside this HTML and set the fields above.

## Design

The background is a raymarched signed-distance field that morphs between five
forms, gilded to the series brand. Scroll position selects the form, and hovering
a row in "the many lives" drives it directly, so the geometry follows the
narrative rather than decorating it.

The hero, through-line, ocean, duality, and legacy sections let it show. Lives,
record, books, pillars, and contact sit on a near-opaque ground, because a page
that sells has to be readable before it is impressive.

**Typography is a stand-in.** The series faces are EB Garamond and Cinzel. This
file makes no external requests by design, so it uses a Georgia-led system serif
stack. To match the books exactly, self-host both faces and add them to `--serif`.

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
