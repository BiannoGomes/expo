# MOTION.md schema (30 fields)

Every brand's `MOTION.md` fills these fields, in this order. Any value that can't be
reliably determined from real references or from Bianno is written as `ASK ME`, never a
guess. A value Claude proposes but Bianno hasn't confirmed is written as
`PROPOSED: <value> (why)`. It can be used for drafts, but it stays marked until he confirms.

Value states: **CONFIRMED** (from Bianno or observed in a real reference, with the source
named) · **PROPOSED** (usable for drafts, needs a yes) · **ASK ME** (blocking for that field).

| # | Field | What a good value looks like |
|---|---|---|
| 1 | Colour palette | Hex values with names and roles. For example: `bone #EEE9DC: primary text`. |
| 2 | Colour hierarchy | What dominates, what accents, and the ratio. For example: "one gold accent per frame". |
| 3 | Typography | Families, weights, source files and licences. |
| 4 | Font sizes | A scale for each canvas (9:16 / 4:5 / 16:9), in px. |
| 5 | Weight hierarchy | Which weight carries headline, body and label. |
| 6 | Tracking | Letter-spacing per role, in em. |
| 7 | Leading | Line-height per role, as a multiplier. |
| 8 | Spacing | Margins, grid and safe inset per canvas, in px. |
| 9 | Frame rate | For example: 30 fps for social, 24 fps for cinematic. |
| 10 | Timing language | Base durations for micro / standard / hero moves, and hold lengths. |
| 11 | Entrance behaviour | How things arrive: direction, distance, blur, opacity curve. |
| 12 | Exit behaviour | How things leave. Usually faster than they arrived. |
| 13 | Transition language | Cut, match cut, push, mask wipe… and when each is allowed. |
| 14 | Easing | Named curves as cubic-bezier or GSAP ease, and when to use each. |
| 15 | Camera behaviour | Static / drift / push-in, with speed limits. |
| 16 | Depth | Flat or layered, how many planes, parallax ratios. |
| 17 | Texture | Clean or textured, and which kind of texture. |
| 18 | Grain | Amount, size, and whether it's animated. |
| 19 | Lighting | Glows, vignettes, light direction (or "none"). |
| 20 | Material language | Paper, glass, metal, matte: what surfaces feel like. |
| 21 | Shadow language | Soft / hard / none, with values. |
| 22 | Border language | Radius, stroke weights, rules and dividers. |
| 23 | Shape language | Geometric / organic, and the recurring motifs. |
| 24 | Image treatment | Grade, crop rules, overlays, and when to use generated images. |
| 25 | UI treatment | How product UI appears: device frames, real screenshots only, cursor rules. |
| 26 | Audio relationship | Music genre, energy, SFX density, VO or none, silence. |
| 27 | Accessibility | Contrast minimums, min text size, caption rules, flash limits. |
| 28 | Reduced-motion behaviour | What replaces motion when reduced motion is on (for web and UI). |
| 29 | Five never-dos | Five specific things this brand must never do. |
| 30 | Shot-by-shot example | One complete short piece (6–15 s) written in this language. |

## Compatibility with Charlie Hills' `brand-intake`

Charlie's `brand-intake` skill writes its own `brand.md` and `MOTION.md` at the project
root, and his production skills read them from there. This studio keeps each brand's files
under `brands/<slug>/` and **activates** a brand into a project by copying both files into
the project root with `scripts/activate-brand.mjs`. That way Charlie's skills find exactly
the files they expect, and the brands never bleed into each other.

When Charlie's intake produces fields this schema doesn't have, keep them. When this schema
has fields his output lacks, append them under a `## Studio extensions` heading, so his
skills still parse the file.
