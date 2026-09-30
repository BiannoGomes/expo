# Motion learnings

The studio's memory. **Read the relevant sections before every project. Append after every project**
(the `studio-retro` skill). Short, specific, reusable. Numbers from Bianno only.

## Defaults (promoted from results)
_None yet. A default needs a result Bianno confirms._

## Proposed rules (a mistake seen twice → a proposed rule; Bianno approves brand rules)
_None yet._

## Tool lessons
- 2026-09-30 · `review-frames`: ffmpeg's `fps` filter picks mid-interval frames, so 1 fps labels drifted by up to 0.5 s. Fixed with `select` on true timestamps. **Always trust burned-in timestamps only from the fixed script.**
- 2026-09-30 · `check-facts` flagged CSS strings in scripts (`"0% 50%"`, `:nth-child(n+2)`). Fixed: CSS selectors and values are skipped.
- 2026-09-30 · `brand-lint` scanned the vendored GSAP and flagged a line draw-on (`scaleX: 0`). Fixed: `vendor/`, `*.min.js` skipped; one-axis draw-ons are a warning, not an error.
- 2026-09-30 · HyperFrames renders output no audio stream when the piece is silent. Mux a silent AAC track before upload (`motion-review` §4).

---

## Entry template
```
## YYYY-MM-DD · <project> · <brand> · <format>
Ship target: … · Shipped: yes/no (where, when)
Worked: …
Failed → fix: …
Values that earned their place: …
Bianno's notes → variable that fixed it: …
PROPOSED confirmed/overridden: …
Tool issues: …
Audience result (Bianno's numbers only): pending
Next action to get it in front of a human: …
```
