# Performance benchmarks

Run 2026-10-31 with `node lab/bench.mjs` (results: `lab/bench-results.json`). Conditions: 390x844, CPU 4x throttle, SwiftShader software WebGL in a container; upper bounds, not device numbers.

**Read these as relative comparisons and upper bounds.** Software WebGL in a container is far slower than any phone GPU at fill-heavy work and says nothing about battery or heat. No physical device was available; every device row below is NOT TESTED.

## Results

| Scene | Motion | Frame median (ms) | Frame p95 (ms) | Interaction to second frame (ms) | JS heap (MB) | Load to ready (ms) | GPU work per frame | axe violations | Still at rest (reduced motion) |
|---|---|---|---|---|---|---|---|---|---|
| Shipped experience (hub) | full | 83 | 217 | 64 | 5.7 | 3118 | n/a (not exposed) | 0 |  |
| Shipped experience (hub) | reduced | 67 | 383 | 135 | 5.4 | 1791 | n/a (not exposed) | 0 | yes |
| A · Holographic interface | full | 17 | 17 | 24 | 4.4 | 359 | 5 calls, 8 tris, 1800 pts | 0 |  |
| A · Holographic interface | reduced | 17 | 33 | 20 | 4.4 | 346 | 5 calls, 8 tris, 1800 pts | 0 | yes |
| B · World transition (in travel) | full | 17 | 200 | 35 | 4 | 380 | 5 calls, 8 tris, 2600 pts | 0 |  |
| B · World transition (in travel) | reduced | 17 | 167 | 45 | 4.4 | 402 | 5 calls, 8 tris, 2600 pts | 0 | yes |
| C · Living constellation | full | 17 | 17 | 24 | 4 | 258 | 2 calls, 90 tris, 13 pts | 0 |  |
| C · Living constellation | reduced | 17 | 17 | 37 | 5.3 | 233 | 2 calls, 90 tris, 13 pts | 0 | yes |

Interaction: the time from the input (key, button or form submit) to the second animation frame after it, measured inside the page under the CPU throttle; this includes the frame that first reflects the change. "Still at rest": two captures 600 ms apart, taken 1.5 s after any interaction, are identical.

Run-to-run noise on the shipped hub was 67 to 83 ms median across three runs today; compare prototypes against that range, not one value.

## Bundle impact (each prototype's own code, three.js excluded because it already ships)
| Prototype | Minified | Gzip |
|---|---|---|
| A · Holographic interface | 9.8 KB | 4.5 KB |
| B · World transition | 9.9 KB | 4.7 KB |
| C · Living constellation (incl. three's Line2 addon) | 12.8 KB | 5.9 KB |

Shipped experience for reference: 597 KB minified, 155 KB gzip (three.js is most of it); first load 1.46 MB, 18 requests.

## What the numbers say
- All three prototypes cost little: 2 to 5 draw calls each and under 6 KB gzip of their own code. None needs a new dependency (C uses three's bundled `Line2`).
- B's p95 in flight (about 200 ms) comes from the fog and four atmosphere billboards growing to fill the screen near arrival: the fill-rate pattern already known from the shipped phone close-ups. The quality ladder lowers fog and atmosphere taps on standard and low.
- C's earlier first run showed a 119 ms add-a-moment interaction (DOM rebuild plus relink); after the Line2 change it measured 24 ms. Worth re-measuring on devices with 100 or more moments.
- The shipped hub's cost is the full scene (nebula, 4,120 stars, four atmosphere billboards, labels), not any one prototype technique.

## Quality tiers (proposed defaults, to be tuned on devices)
| Tier | Pixel ratio cap | Stars | Atmosphere taps | Glass blur | Fog | When |
|---|---|---|---|---|---|---|
| High performance | 2 | all layers | 16 | on (open panels only) | full | default start |
| Standard | 1.5 | all layers | 16 | on (open panels only) | reduced | 60-frame median over 24 ms |
| Low power | 1 | far layer off | 0 (art only) | off, solid panels | half | median over 50 ms, or ?quality=low |

## Not tested (needs hardware)
| Check | Status |
|---|---|
| iPhone (Safari), recent and 3-year-old | NOT TESTED |
| Android mid-range (Chrome) | NOT TESTED |
| Desktop with integrated graphics | NOT TESTED |
| Battery drain over 10 minutes, thermal throttling | NOT TESTED |
| Low Power Mode / Battery Saver behaviour | NOT TESTED |
| Screen readers (VoiceOver, TalkBack, NVDA) | NOT TESTED (axe and scripted focus checks only) |
| Slow network (3G profile) first load | NOT TESTED in this run |
