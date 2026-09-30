---
name: edit-kit
description: Edit a real talking clip with Claude, the Creator Stack method (Whisper ears + FFmpeg eyes + HyperFrames). Word-level transcript with a names glossary, frames to see the shot, beat sheet, deterministic rough cut that removes dead air and fillers on word boundaries with remapped timings, word-synced 2–3-word captions, and a verified HyperFrames scaffold (cut video + real voice + captions). Use when Bianno drops a clip or voice memo in footage/inbox, or says "edit this", "cut the pauses", "add captions", "transcribe", "rough cut", "check my shot".
---

# edit-kit · let Claude edit a real take

Claude can't hear or watch video. **Whisper gives it ears** (every word with its start and end).
**FFmpeg gives it eyes** (timestamped frames). Every effect is then anchored to a word, not guessed.
Method: *The Creator Stack, "Let Claude Edit Your Videos"* (@pauloshimas).

`K` = this skill's `scripts/`. `R` = `../motion-review/scripts/` (sibling skill).

## Law (from the project's CLAUDE.md, which outranks this skill)

- **Real footage and Bianno's real voice only.** Never synthesise, clone or face-swap him.
  No AI people in Becoming Project content.
- **Verbatim transcripts.** Only names from the glossary get corrected, and every correction is logged. Fillers
  are flagged, not deleted. Never "tidy" what he said. If a detail is misheard, ask.
- **Stories need `verified: yes`** in the story register before they appear in a piece. A new memo
  → transcribe → list its factual details → add the row as `pending` → Bianno confirms.
- **People are not content.** Anyone else in shot needs his per-asset OK. Yacht footage passes the NDA
  check (no vessel, guests, owners, live location).
- Work only from `footage/approved/`. `footage/inbox/` is for transcribing and checking, never for publishing.
- Versions, never overwrites: `v1/`, `v2/`… so any round can be undone.

## The loop

```
0 check the shot → 1 ears → 2 eyes → 3 beat sheet (wait for OK) → 4 rough cut → 5 captions
→ 6 scaffold + brand → 7 build effects on words → 8 preview, notes, fix → 9 render → QA
```

**0 · Check the shot** (5-second test clip, before the real take):
`node R/review-frames.mjs test.mp4 --out test-review`. Read the frames. Is the face well lit? Is there distance
from the wall? Is anything important near the edges? Say exactly what to fix.

**1 · Ears**
```bash
python K/transcribe.py take.mp4 --names names.txt           # add --model medium.en for tricky audio
```
→ `take.words.json` (every word with s/e/probability/filler) · `take.srt` · `take.transcript.md`.
`names.txt` holds his names (`Bianno`, `Becoming Project`…) and known mishearings (`Bianca -> Bianno`).
**Never put the vessel's name in it.** Read `transcript.md`: check low-confidence words with Bianno.
After a hand fix to `words.json`: `python K/transcribe.py --from-words take.words.json`.

**2 · Eyes** `node R/review-frames.mjs take.mp4 --out take-frames` gives a 1 fps film strip and a
15 fps hook sheet, with burned-in timestamps. Note where the face, the hands and the empty spots are, per moment.

**3 · Beat sheet** (`templates/beat-sheet.md`): one row per moment, with time, exact words, what
appears, where, and the sound. **Show it and wait for OK.** Changes on paper are free.

**4 · Rough cut** (rough cut first, effects after):
```bash
node K/rough-cut.mjs take.mp4 take.words.json --drop-fillers --beat <word index before a punchline>
```
It removes pauses over 0.3 s and fillers, never cuts inside a word, skips cuts under 0.2 s (not
worth a jump), and snaps to frames with 12 ms fades. → `take.cut.mp4` · `take.cut.wav` · `take.cut.words.json`
(remapped timings) · `take.cut.edl.json`. It flags any cut of 1 s or more, which may be a restart. Check those
with Bianno. Use `--drop 12.4-15.0` to remove a bad take, and `--dry-run` to plan without rendering.

**5 · Captions**
```bash
node K/captions.mjs take.cut.words.json --key "word,word" --srt
```
Cues of 2–3 words, 22 characters or fewer, read at 20 characters per second or slower, and never ending on
a weak word. The key word gets the accent. → `captions.json` · `captions.js` (for HyperFrames) · a sentence-level `.srt`.

**6 · Scaffold** `node K/scaffold-reel.mjs take.cut.mp4 productions/<date>-<slug>/v1` gives a HyperFrames
project already verified to lint, check and render: the muted video, a separate `<audio id>` for the voice (WAV,
because headless Chromium can't read AAC), and captions placed from `captions.js`. **Then brand it:** link
the brand tokens CSS and point the five `--cap-*` variables at them. Never hard-code colours.

**7 · Effects on words.** Every effect names its word and time from `take.cut.words.json`:
- punch-in 1.2× on the key word, at most one every 5 s, ease back out
- lower-third name tag the first time he speaks
- pop-ups beside him, never over the face (check against the eyes step)

Anything photoreal and AI-made gets flagged for Instagram's AI label.

**8 · Notes.** Take notes as `At 0:07 <what's wrong> → <what to see>`, one per line, and fix one note per
version. Then snapshot the frame and check it yourself: `npx hyperframes snapshot --at 7.0`.

**9 · Render and QA** Render through the HyperFrames workflow, then run the motion-review QA gate:
`spec-check --platform reels`, `review-frames --platform becoming`, `brand-lint`, `check-facts` if
there are claims. Export and approval then follow the project pipeline (e.g. `becoming-video` §4:
`exports/awaiting-approval/`, then **stop**).

## Where it struggles (from the method, and true)

It can't film new footage. Fast motion gives soft cutouts. Hour-long videos go section by section. Fine
colour grading and taste stay Bianno's. Whisper spells names by sound, which is why the glossary exists.

## Install

Python 3.11+ and `python -m pip install faster-whisper`. The model downloads on first use (small.en is
roughly 0.5 GB), and an NVIDIA GPU is used automatically. Plus ffmpeg, Node 22+ and HyperFrames. See `install/`.
