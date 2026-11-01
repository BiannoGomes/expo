# Dawnward: measured audit (2026-11-01)

**What this is:** the read-only audit the Excellence Directive asks for, done on the running app, not from screenshots alone.
**Nothing was redesigned for it.** It answers ChatGPT's 22-screen review with measurements, and proposes one next phase for Bianno's approval.

## How it was measured
- **The app:** the built web experience (`experience/dist`), in Chromium with software WebGL (SwiftShader). That isn't a real phone, so speed numbers are only indicative.
- **Sizes:** phone 390×844, small phone 320×640, tablet 768×1024, desktop 1440×900.
- **For each of 25 screens:**
  - sideways scroll;
  - visible text under 13 px;
  - tap targets under 44 px;
  - visible words;
  - number of gold primary buttons;
  - axe (WCAG 2.2 AA);
  - page errors.
- **Script and raw numbers:** `measure.cjs` and `measurements.log` in this folder.
- **Function:** 14 browser suites, 752/752 checks, plus 50/50 server tests. These cover navigation, Back, deep links, saving, reload, resume, completion, Journey, reduced motion, keyboard, axe and phone sizes.

## Repository and runtime, in one table
| | |
|---|---|
| Web app | Vanilla JS + three.js r187, bundled by esbuild into one page (`experience/home.html`, `src/home.js`). No React on the web |
| Native app | Expo 54 / React Native 0.81 (`apps/mobile`), separate |
| Server | Fastify + Postgres (`server/`); the shared expedition engine is `packages/core` |
| Storage | On the device: reflections, drafts, expeditions, direction, creations. With an account, the server |
| Routes | `#/home`, `#/universe[/<galaxy>]`, `#/world/<w>/<tab>`, `#/<galaxy>/<place>`, `#/learn`, `#/journey`, `#/library`, `#/you` |
| Weight | `home.js` 243 KB gzipped; 29 requests to ready; ready in 0.3 to 0.7 s on localhost (no network delay, not a phone) |
| Dependencies | three, esbuild, axe-core, playwright-core. Nothing else |
| Skills | 50+ in `.claude/skills`, including impeccable, dawnward-visual-qa, qa-release, design-reference, spatial-universe |

## What the measurements say
- **No screen scrolls sideways,** at any of the four sizes.
- **axe found zero violations** on every measured screen.
- **No page errors** anywhere.
- **Gold buttons:** never more than one per screen. The direction sheet counts two, because the page behind it is dimmed but still counted.
- **Small text:**
  - The bottom-tab labels are 12 px. This is normal for tab bars and is kept.
  - The Tree of Life's sphere names are 11 px, in a faint colour.
  - About 20 screens still carry 12 px all-caps labels ("GALAXY · 9 OPEN, 6 FREE", "MIND · EXPEDITION · 7 CHAPTERS").
- **Small targets:** the breadcrumbs on world screens are 32 px tall (set deliberately to fit the header). That passes WCAG AA's 24 px but not the 44 px used everywhere else.

### Words a person sees (phone)
| Screen | Words |
|---|---|
| Reflect | 23 |
| Journey | 25 |
| Library | 36 |
| Universe | 38 |
| Personal Growth | 46 |
| Saved reflection | 61 |
| Floating Kingdom | 64 |
| Home | 78 |
| Inner Knowing | 92 |
| Mind | 106 |
| Creative Worlds | 144 |
| Principles | 158 |
| Calendar | 205 |
| **Learn** | **239** |
| **You** | **253** |
| **Knowledge** | **276** |
| Wisdom Library | 471 (a reading page by design) |

## ChatGPT's findings, checked
| # | ChatGPT said | Checked | Status |
|---|---|---|---|
| 1 | Small decorative text | 12 px all-caps labels on about 20 screens; 11 px on the Tree | **Verified**, except Home and Reflect, already fixed |
| 2 | Too much instructional copy (Mind, Knowledge, Temple) | Mind now has 106 words, Knowledge 276. The Temple's toast gives three instructions | **Partly verified**: Knowledge yes, Mind fixed |
| 3 | Low-poly worlds clash with the painted art | The Floating Kingdom is flat-shaded low-poly; the worlds are painted (`phone-kingdom.png`) | **Design judgement**, agreed |
| 4 | No consistent interaction pattern | Expeditions, the guided questions and Becoming Consistent now share one engine and one pattern; Knowledge places don't | **Partly fixed** |
| 5 | Long reading panels over scenes (Principles) | A three-line label over the heading, then 100+ words over the scene (`phone-principles.png`) | **Verified** |
| 6 | Galaxy navigation discoverability | Taps work and are tested. Whether new people find them isn't known | **Unverified**: needs people |
| 7 | Too many actions on Home | One gold button, 78 words | **Fixed earlier** |
| 8 | Journey needs guidance and a list | List and Milestones views exist. But 11 controls come before any content, and with one reflection the galaxy is one dot in a dark box (`phone-journey.png`) | **Verified**, a different problem |
| 9 | Drafts | Labelled "draft" everywhere they apply | **Verified**: a release blocker until reviewed |
| 10 | Empty Library | Only "Bianno is preparing the first packs" and Back (`phone-library.png`) | **Verified** |
| — | The Kybalion should be named as the source | It already is: "The Kybalion (1908)", with a note on where historians place it | **Already done** |
| — | "Upload the codebase" | Not needed: this audit ran on the code and the running app | — |

## Scores (phone; 5 = average; usability and look, function tested separately)
| Screen | Score | Main reason |
|---|---|---|
| Reflect | 8 | One question, 23 words, one action; Another question works |
| Home | 7.5 | One gold next step, quiet direction line |
| Saved reflection | 7.5 | One Done; the new star shows the question it answered |
| Universe / Personal Growth | 7.5 | Clear, few words; untested with new people |
| A world (Mind, Soul) | 7.5 | Question, one primary, the next step one tap away; breadcrumbs small |
| Expedition player | 7 | One step at a time, resumes; the label over art on the ending is hard to read |
| Wisdom Library | 7 | Evidence grouping is clear; long by nature |
| Creative Worlds galaxy | 6.5 | Fine; kicker labels |
| Knowledge (Tree) | 6.5 | Distinctive; 11 px labels; 276 words before you've done anything |
| Calendar / Inner Knowing / Stillness | 6.5 | Work; dense |
| Floating Kingdom | 6 | Works, but its look doesn't match the painted universe |
| Journey | 6 | 11 controls before content; empty galaxy for new people |
| Hall of Seven Principles | 5.5 | Reading panel over the scene; three-line label |
| Learn | 5.5 | "Learn" twice; Library before any journey; chapter rows squeezed into a narrow column; no clear first step |
| You | 5 | 253 words, five all-caps labels, a 60-word plan paragraph |
| Library (empty) | 4.5 | Nothing to do there yet |

## Top 20, by impact
Each item is marked **Verified** (measured or seen), **Hypothesis** (design judgement), **Assumption** (technical, unchecked) or **Unverified**.

| # | Problem | Where | Class | Severity | Fix | Size | Acceptance test |
|---|---|---|---|---|---|---|---|
| 1 | Learn has no clear first step; "Learn" twice; Library first; chapter rows squeezed | Learn | Verified | High | One featured "continue / start here" card; Library row last; chapter rows full width | S | One primary; no duplicate title; chapter title on one or two lines at 390 px |
| 2 | Journey shows 11 controls before content; new users see one dot | Journey | Verified | High | Summary line first; filters behind one "Filter" chip; with under 5 stars, open on Milestones | S | Content visible above the fold; at most 3 controls before it |
| 3 | You is a wall of text | You | Verified | Medium | Three short sections (Your data, Privacy, Plan); plan details behind "More" | S | Under 120 words above the fold; no all-caps labels |
| 4 | Reading panels over scenes in Knowledge places | Principles, Solids, Knowing | Verified | High | Discover → Interact → Apply: the scene first, a two-line card, "Read more" | M | Card under 50 words before Read more; scene visible |
| 5 | 12 px all-caps labels on about 20 screens | App-wide | Verified | Medium | Remove, or move under the heading as normal-case meta | S | Detector reports no kickers; tests updated |
| 6 | Tree of Life labels are 11 px and faint | Knowledge | Verified | Medium | 13 px minimum; planned spheres keep contrast | S | No visible text under 12 px outside the tab bar |
| 7 | Ending-screen label sits over bright art | Expedition ending | Verified | Medium | Darker veil behind the header, or the label below the art | S | Contrast ≥ 4.5:1 sampled over the image |
| 8 | Library is empty with nothing to do | Library | Verified | Medium | Until packs exist: show what's coming, and link to the Wisdom Library and expeditions | S | At least one real action on the page |
| 9 | World breadcrumbs are 32 px targets | World screens | Verified | Low | 44 px hit area with the same visual size | S | All targets ≥ 44 px except the 1 px skip link |
| 10 | "Kept on this device, in your words" on every writing step | Every expedition | Verified | Low | Once per expedition, on the first writing step | S | Appears once per run |
| 11 | An open sheet stays over the next screen if the address changes | Sheets | Verified | Low | Close sheets on route change | S | Back with a sheet open shows no sheet |
| 12 | Content is unreviewed (Knowledge, guided questions, Wisdom Library) | Content | Verified | High for release | Reviewer pass; remove "draft" only when approved | — | Review log per item |
| 13 | Floating Kingdom's low-poly style vs painted art | Creative Worlds | Hypothesis | Medium | Painted sky and island textures, or a stylised look shared by all 3D worlds | M | Side-by-side review with Bianno |
| 14 | Kingdom toast gives three instructions | Kingdom | Verified | Low | One instruction, the rest on first use | S | One sentence |
| 15 | New people may not find the galaxy → planet → world path | Universe | Unverified | High | Watch two or three people use it without help | — | Most people reach a world unaided |
| 16 | Real-phone speed unknown | All 3D | Unverified | High | Measure on Bianno's phone (frame time, load) | — | Numbers recorded, budget set |
| 17 | With an account, the question you answered isn't kept | Server mode | Verified (code) | Low | Add a `prompt` field to the debrief route | S | Server test |
| 18 | Membership has gates but no payment | Plans | Verified (code) | High for launch | Payment needs Bianno's approval and setup | M | Approved, then tested |
| 19 | VR untested | Galaxy XR | Unverified | Low | Only with a real headset | — | — |
| 20 | Whether people act differently afterwards | Product | Unverified | Highest, long term | Measure completion, return, actions done, "useful?", and safety, separately | M | A small study with consent |

## Proposed next phase (needs Bianno's yes)
**Phase 5a: bring Learn, Journey and You up to the standard Home and Reflect already meet.** These are three of the five tabs and the lowest-scoring core screens. The same week, apply the small app-wide fixes: items 5, 6, 7, 9, 10, 11 and 14.

**How:**
- the same rules as before: one primary per screen, no kickers, 44 px targets, nothing explained twice;
- before and after screenshots at four sizes;
- the existing suites updated, plus one new suite per screen.

**Not in 5a:**
- the Knowledge reading panels (item 4: its own phase, Discover → Interact → Apply);
- the 3D art direction (item 13: needs Bianno's eye);
- anything that spends money or publishes.

**Done means:**
- every acceptance test in rows 1 to 3 and 5 to 11 passes;
- the full suite stays green;
- axe stays at zero;
- no screen scrolls sideways.

## Screens in this folder
`phone-home`, `phone-reflect`, `phone-universe`, `phone-world-mind`, `phone-learn`, `phone-journey`, `phone-you`, `phone-knowledge`, `phone-principles`, `phone-library`, `phone-kingdom`, `phone-wisdom` (390×844, captured 2026-11-01).
