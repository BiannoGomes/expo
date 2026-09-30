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
- 2026-09-30 · A HyperFrames `<audio>` in AAC (`.m4a`) can't be measured by the headless Chrome that `check` uses (`clip_media_fit` warning). Use WAV for voice tracks; `rough-cut` writes one.
- 2026-09-30 · Rough cuts: skip cuts under 0.2 s (a visible jump for no gain), but always cut a dropped filler however small. Keep about 0.45 s before a punchline (`--beat`).
- 2026-09-30 · Captions read better when a cue never ends on a weak word ("zoom in / on my hand.", not "zoom in on / my hand.").
- 2026-09-30 · Real-pixel multicam: vertical 4K (2160×3840) gives a native close-up up to 2×; a 1080p take upscales from the first punch-in. Animate a wrapper (`#cam`), not the `<video class="clip">`, and HyperFrames lint/check stay clean.
- 2026-09-30 · Handover check: faster-whisper has no `whisper` CLI. Pipelines must call `edit-kit/scripts/transcribe.py` (or Python), not `whisper <file>`.

## 2026-09-30 · two-versions (studio proof) · unifymind · 9:16 reel, 10 s, silent
Ship target: Instagram Reels next to the Book 1 carousels · Shipped: **no** (draft awaiting Bianno)
Worked: frame 0 states the first line (thumbnail = hook) · lines 2–3 rising in 110 ms stagger with power4.out read as "the thought completing" · the gold phrase landing last (colour shift, 400 ms) · the rule drawn under the old idea and leaving with it · the CTA pre-rolled 100 ms under a hidden container so the hard cut lands on content.
Failed → fix: empty frame 0 → start with line 1 visible (v2) · cut onto empty frames → CTA pre-roll (v3) · a transition 250 px from the focal point read as a progress bar → move it to the focal point (v4) · a pass-through exit still read as a loader → lift the rule with the text (v6) · a hold of 1.97 s created by v2 without re-timing → **after any timing fix, re-time everything downstream** (v5) · the product label styled as metadata → bone, 40 px (v7).
Values that earned their place: hero 104 px / 1.12 / −0.02 em · rise 32 px, 800 ms power4.out, 110 ms stagger · exits 300 ms power3.inOut, up 16 px · rule 5 px, draw 350 ms · holds ≤1.5 s except the CTA (≥3 s) · text block top at y 612 inside the strict safe zone.
Bianno's notes → variable that fixed it: pending (he hasn't watched it yet).
PROPOSED confirmed/overridden: pending. **Proposed update to MOTION.md field 13(b):** replace "the 95×5 bar stretches across the frame" with "the gold rule draws under the block and leaves with it" (awaiting Bianno).
Tool issues: review-frames 1 fps label drift (fixed) · check-facts CSS false positives (fixed) · brand-lint scanned the vendored GSAP and flagged a rule draw-on (fixed) · spec-check called a silent track "quiet" (fixed).
Honest critique to remember: apart from the rule, the format (white sans on black, the last phrase flips to gold, "comment X") is close to the stock faceless-motivation template. **The next UnifyMind piece should push a more ownable idea** (the diver and the mirror? a real manuscript line? his own voice?).
Audience result (Bianno's numbers only): pending
Next action to get it in front of a human: Bianno watches renders/final.mp4, approves or replaces the copy, and posts it as a Reel.

## 2026-09-30 · the-beginning · becoming-project · Reel 9:16 55.5 s + 15 s teaser
Ship target: first Reel on the Becoming account · Shipped: no (draft, awaiting Bianno's approve)
Worked: real photos only, with EXIF dates as on-screen documentary markers (bound in facts.md, so fact-lock proves them);
the "reveal" (hard cut into a tight crop of the opening photo, then a 3 s power2.inOut pull-back to the full frame);
an original score composed to the cut in code (compose-score.py, cue sheet keyed to the edit's cut points).
Failed → fix: (1) an @font-face family named "Serif" was silently dropped by HyperFrames (it treats generic names as
generics), so the whole v1–v4 serif rendered as a fallback with no lint or check warning → brand-lint rule
`generic-font-name`; always use the real family name. (2) Dissolving out of a subject on black (the eclipse) reads as a
double exposure → dip to black (0.45 s out, 1.0 s in). (3) Balanced wrap (`text-wrap: balance`) kills one-word widows;
anchor captions by `bottom` so 3-line captions grow upward instead of into the date stamp. (4) Caption box centred at
540 must be ≤ 780 px wide to stay inside x 80–940.
Values that earned their place: captions Cormorant Garamond 500 italic 70/1.12, bottom 506 px, 150–930 px; stamps Inter 500
24 px .22em at y 1452; scrim to rgba(8,10,12,.74); dissolve 0.6 s; Ken Burns 1.00→1.05–1.08 over the shot, sine.inOut.
Bianno's notes → variable that fixed it: pending
PROPOSED confirmed/overridden: none yet
Tool issues: the Drive connector refuses files over ~6.3 MB (23 of the folder's files, including both videos).
Audience result (Bianno's numbers only): pending
Next action to get it in front of a human: Bianno watches the draft and says approve, or names the one change.

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
