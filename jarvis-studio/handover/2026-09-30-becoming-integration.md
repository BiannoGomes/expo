---
date: 2026-09-30
tags: [becoming-project, jarvis-studio, handover, proposal]
status: proposal, needs Bianno's "approve" before any vault file changes
---

# Jarvis Studio × The Becoming Project: integration

**Verdict:** the vault folder `BIANNO  THE BECOMING PROJECT\` stays the studio for this brand, with its
`CLAUDE.md` and the `becoming-video` pipeline in charge. Jarvis Studio plugs in as its **toolbelt**. It adds
the one thing the pipeline doesn't have yet: the Creator Stack's *ears and scissors* for real takes.

## What the toolbelt adds (all tested 2026-09-30)

| Step in `becoming-video` | Tool (plugin `jarvis-studio`) | What it does |
|---|---|---|
| Voice memo / clip lands in `footage/inbox/` | `edit-kit/scripts/transcribe.py` | faster-whisper, every word with start/end, `names.txt` glossary, verbatim (fillers flagged, never removed), `.words.json` + `.srt` + readable `.transcript.md` |
| Story register "list every factual detail" | `.transcript.md` | a timestamped, readable transcript for Bianno to confirm details against |
| Shot check | `motion-review/scripts/review-frames.mjs` | timestamped contact sheets (1 fps film + 15 fps hook) |
| Brief → Script table | `edit-kit/templates/beat-sheet.md` | the same table, plus *Where it sits* and *Sound* |
| Build: clips | `edit-kit/scripts/rough-cut.mjs` | cuts pauses over 0.3 s and fillers on word boundaries, frame-snapped, 12 ms fades; remaps every word time |
| Build: captions | `edit-kit/scripts/captions.mjs` | 2–3-word cues, 22 characters or fewer, 20 characters per second or slower, never ending on a weak word, key word accented |
| Build: composition | `edit-kit/scripts/scaffold-reel.mjs` | a HyperFrames project that already passes lint + check: muted video + separate WAV voice + captions. Then import `brand-tokens.css` |
| Quality gates | `motion-review`: `spec-check --platform reels`, `review-frames --platform becoming` (x 80–940, y 250–1500), `--platform cover-3x4`, `brand-lint` (enforces **no exclamation marks** and the **banned words** from brand.md), `motion-critic` agent | mechanical checks the gates table can cite |

## Found in the handover (worth fixing)

1. **Transcription command won't run.** `becoming-video` says `whisper <file> --language en`, but START HERE installs
   **faster-whisper**, a Python library with no `whisper` command. Proposed replacement is below.
2. **HyperFrames version drift.** With the plugin installed, HeyGen's own rule is to run the CLI through the plugin's
   launcher (`node "<plugin>/skills/hyperframes/scripts/plugin-cli.mjs" render …`), not a bare `npx hyperframes`, so the
   CLI matches the plugin's skills. Bare `npx` works, but may run a newer version than the skills describe.
3. **Voice track format.** In a HyperFrames composition, put Bianno's voice in a separate `<audio id>` as **WAV**: the
   headless Chrome used for checks can't read AAC (`.m4a`). `rough-cut` writes the WAV for you.

## Proposed changes to `becoming-video/SKILL.md` (apply only after "approve")

**§0 Before anything**, add:
> - Confirm the `jarvis-studio` plugin is installed (`/jarvis-studio:edit-kit`). If not, point Bianno to its `install\install.ps1`.
> - Confirm `python -c "import faster_whisper"` works.

**Replace "## Transcribing voice memos"** with:
> ## Real takes and voice memos (edit-kit)
> 1. `python <edit-kit>/scripts/transcribe.py footage/inbox/<file> --names names.txt`. Read the `.transcript.md`;
>    list low-confidence words for Bianno. Never tidy facts; only glossary names get corrected, and they're logged.
> 2. New story → add a `pending` row to the register from the transcript. It's only usable after "confirmed".
> 3. Cleared clips only: `rough-cut.mjs <clip> <clip>.words.json --drop-fillers` → `captions.mjs <clip>.cut.words.json --key "<key words>"`
>    → `scaffold-reel.mjs <clip>.cut.mp4 productions/<id>/v1`, then apply the format template from `brand/templates/`.

**§3 Check**, add after lint:
> 4. `spec-check.mjs <render> --platform reels` · `review-frames.mjs <render> --platform becoming` · `brand-lint.mjs productions/<id>/v1`
>    (with brand.md + MOTION.md copied in) · run the `motion-critic` agent on the review folder. Record the results in the gates table.

**Brief template:** add a *Sound* column to the Script table (`Time | On screen | Voice | Footage | Sound`).

## Proposed `names.txt` (new file, project root: needs "approve")

```
Bianno
Gomes
BIANNO
Becoming Project
Jarvis
UnifyMind
Matroosberg
Palma
Mallorca
HyperFrames
Claude
```
The vessel's name is deliberately **not** in the list (NDA). Add mishearings as they appear: `Bianca -> Bianno`.

## The first real piece (unchanged from START HERE, now with tools)

Record the 60–90 s Matroosberg telling → drop it in `footage/inbox/` →
"Use becoming-video. New clip in footage/inbox. Transcribe it with edit-kit, add the story to the register as pending,
then give me a Format A brief."
