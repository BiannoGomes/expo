# Phase 5a: Learn, Journey, You, the app-wide fixes, and the galaxy path

**Status:** 2026-11-01. Built and tested. Nothing deployed. The baseline is the measured audit (`docs/audit/2026-11-01`): 752/752 browser checks, zero axe violations, no sideways scroll from 320 to 1440 px, and at most one gold button per screen.

## The galaxy path (`experience/src/progress.js`)
Galaxies open by doing real things, never by paying, and never by an invented percentage.

| Galaxy | Opens when you | Counted from |
|---|---|---|
| Personal Growth | always open | — |
| Earth Realm | always open: real life is the point, not a reward | — |
| Knowledge | finish one practice in Personal Growth | completed missions (expedition store) |
| Spiritual Exploration | finish two different practices | distinct completed missions |
| Creative Worlds | finish three practices, in at least two worlds | distinct completed missions and their worlds |
| AI Creation | make something in Creative Worlds: design a place, keep a moment, or light every lantern | the creative store |
| Quantum Gateway | finish a practice in Future, and set your direction | Future missions other than the Gateway itself, plus `dw-direction-v1` |

**Two rules changed from the brief, needing Bianno's OK:**
- "A completed creative discovery mission" doesn't exist as a mission, so AI Creation opens when you make something in Creative Worlds. Those are real, saved creations.
- "Practices" counts every finished mission, including chapters, guided questions and Becoming Consistent. Every one of them is a completed, saved activity.

**How it behaves:**
- **Visible:** every galaxy shows on the map and in the List view, which is now the path in order. A locked galaxy shows a lock and "1 of 2".
- **Locked:** selecting one shows exactly what opens it, a progress bar, and a button to the next real step ("Find a practice", "Go to Future", "Go to Creative Worlds").
- **No skipping:** `#/knowledge/...`, `#/creative/door`, `#/creative/<world>` and the galaxy routes show the locked page instead. The Gateway mission says what opens it, in Learn and in the player, and Future offers its own practice first.
- **Kept:** an opened galaxy stays open (`dw-progress-v1`), survives reloads, and opening is idempotent.
- **Existing users:** the first run of this version quietly opens what they'd already used and doesn't celebrate it.
- **The celebration:** one card on Home ("Knowledge is open", a ring of light, "Go there"), shown once. With reduced motion, the ring is still.
- **Your data:** export includes the path. "Delete everything" resets it, and its confirmation now says what it deletes.
- **Not connected to payment:** membership gates are unchanged and separate.

## Learn
| Before | Now |
|---|---|
| "Learn" twice (breadcrumb and title) | Once |
| Library first | Library last |
| No clear first step | One featured card with the only gold button: "Begin · 8 min", or "Continue · 3 of 6" with a progress bar |
| Chapter rows squeezed by an empty star column and a fixed-width meta | Full width; the state ("8 min · draft", "✦ Done", "Opens later") sits under the text |
| All-caps "MIND · EXPEDITION · 7 CHAPTERS" above each title | "Mind · 7 chapters" under it |

## Journey
| Before | Now |
|---|---|
| 11 controls before content | The summary first ("2 reflections · 1 practice · 1 action"); the view switch and one **Filter** chip, which reveals search and the world filters and shows an active filter ("Filter · Body"); zoom only in Galaxy |
| An almost empty sky for new people | Milestones first while you have fewer than five reflections; any view you choose is kept |
| Milestones panel not reachable by keyboard when it scrolls | A labelled, focusable region |

## You
| Before | Now |
|---|---|
| 253 words, five all-caps labels | Short sections: What I've noticed, Your data, Privacy, Your plan, Display. Plan and privacy details sit behind "More". "Discoveries shown" moved into Display; the discoveries list is behind a disclosure, since Journey's Milestones shows them |

## App-wide fixes (audit items 5, 6, 7, 9, 10, 11, 14)
- **All-caps labels:** section headings (`h3`), the label above titles (`.kicker`) and galaxy section labels (`.cw-h`) are normal case and readable.
- **Tree of Life labels:** 11 px faint became 13 px.
- **The step label over bright art:** a stronger veil behind it and a soft shadow. It no longer repeats the mission title, which is already in the breadcrumb.
- **World breadcrumbs:** 44 px targets in the same visual space.
- **The privacy line:** said once per practice, not on every writing step.
- **Back with a sheet open:** closes the sheet.
- **The Kingdom and the Forest:** each says the one thing to do first ("Tap a lantern to light it. Drag to look around.").

## Tests
- `e2e-path.cjs` (39 checks), a new person all the way along the path:
  - locks, previews and progress;
  - deep links blocked;
  - each unlock earned through real practices, a direction and a kept moment;
  - one celebration, reload, idempotency, migration, reduced motion, Delete, Back, 320 px, axe.
- `e2e-phase5a.cjs` (37 checks): every acceptance test above, at 320, 390, 768 and 1440 px, with axe on each screen.
- Suites that go straight to galaxies now start as a returning explorer with the path open. The path itself is tested separately.
- **Full run, 2026-11-01:** 16 suites, **833/833 checks pass** (phase5a 37, path 40, wisdom 22, questions 32, slice 16, redesign 53, tree 46, library 23, realms 63, creative 40, world 45, universe 102, home 101, expedition 50, chapters 110, gateway 53). axe stays at zero on every screen tested, and no screen scrolls sideways at 320 to 1440 px. The run found one real bug, now fixed: on a 320 × 568 phone, the new lock badges pushed the Quantum Gateway 10 px off a new person's map.

## Not verified
- A real phone.
- Whether people find the path motivating rather than frustrating. That needs watching two or three people.
- The Tree of Life art direction and the seven-branch tree. They wait for the images (`docs/universe/chatgpt-tree-and-path-prompts.txt`).
