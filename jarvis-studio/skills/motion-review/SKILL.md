---
name: motion-review
description: The studio's review and QA loop for any rendered video or motion piece — turns an MP4 into timestamped contact sheets Claude can actually read, runs technical spec checks per platform (Reels, TikTok, Shorts, YouTube, LinkedIn, X), brand-lint, safe-zone overlays, flash risk and hold detection, translates creative-director notes into fixable variables, and runs a fresh-eyes critic. Also exports Charlie Hills-style window.seek pages to MP4. Use after every render, for "review this", "critique", "QA", "is it ready", "it doesn't feel premium", "export for Reels", or any designer note.
---

# motion-review

`SCRIPTS` = this skill's `scripts/` folder. All of them are zero-dependency Node 18+ (22+ for
`seek-render`) and need `ffmpeg` and `ffprobe` on PATH.

## The loop (constitution §16)

```
render draft → review-frames → read EVERY image → name the top 3 problems → fix ONLY #1
→ re-render → verify #1 is fixed → next … → QA gate → final export
```

Log each revision in the project's `review/log.md`:
`## vN · hypothesis: <note> is caused by <variable>` · `Change: …` · `Result: ✔/✖ …`.
One hypothesis per revision. Revert anything that didn't fix its note.

## 1. See it: `review-frames`

```bash
node SCRIPTS/review-frames.mjs renders/draft-vN.mp4 --cuts 2.5,6.3 --platform universal --out review/vN
```

It writes timestamp-labelled sheets to `review/vN/`: the hook (the first 3 s at 15 fps), a
1 fps film strip, each cut ±0.5 s at 15 fps, first and last frames, one full-res frame per
scene, and safe-zone overlays (red = covered by platform UI). If `--cuts` is left out, cuts
are auto-detected. **Read `index.md`, then every image, in order.**

Being honest about "watching": you can't see playback. Motion is judged from change between
consecutive 15 fps tiles. Even spacing means linear. Big then small gaps mean ease-out.
Repeated tiles mean a hold. Easing *feel* and audio sync can't be fully verified from frames,
so Bianno watching the real MP4 is always the last gate.

## 2. Critique: what to look for

Frame 0 (is it the thumbnail, and does it state something?) · hook legible by 1.5 s · every cut
lands on content, never an empty frame · each transition reads as ONE intentional move · holds
of 1.5 s or more are justified (reading time, CTA) · one focal point per frame · type inside the strict
safe zone · no clipping or widows · brand law (`MOTION.md`) · house rules (constitution §6) ·
works muted.

Designer notes from Bianno → `references/designer-notes.md`. Translate each into variables and
fix only those.

## 3. The QA gate (all must pass before "finished")

| Check | Command | Passes when |
|---|---|---|
| Facts | `node SKILLS/fact-lock/scripts/check-facts.mjs .` | exit 0 |
| Brand + house rules | `node SCRIPTS/brand-lint.mjs .` | exit 0. Warnings each explained in the log. |
| Brand drift | `node SKILLS/brand-system/scripts/activate-brand.mjs --check .` | exit 0 |
| Engine | HyperFrames `lint` + `check` (via its skill/CLI) | 0 errors; check passed (layout, contrast) |
| Technical | `node SCRIPTS/spec-check.mjs renders/final.mp4 --platform <p>` | exit 0. Every ⚠ explained (holds listed in the storyboard). |
| Fresh eyes | the `motion-critic` subagent on `review/final/` | verdict SHIP, or its fixes applied |
| Human | Bianno watches the MP4 once with sound, once muted | his yes |

Presets: `reels · feed45 · tiktok · shorts · youtube · linkedin · x · universal`. Sources and
safe zones: `references/platform-specs.md` (machine-readable: `references/platforms.json`).

## 4. Final export

HyperFrames: `render --quality delivery --fps 30 --output renders/final.mp4`. If the piece
has no audio, add a silent AAC track, because some platforms mishandle video-only uploads:

```bash
ffmpeg -i renders/final.mp4 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
  -c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart renders/final-upload.mp4
```

With audio, normalise to the studio target (−14 LUFS, TP ≤ −1) as the last step:
`-af loudnorm=I=-14:TP=-1`. Then re-run `spec-check`.

**Charlie Hills' pages** (`window.seek(t)` + `?render`) don't render through the HyperFrames
CLI. Use the zero-dependency exporter:

```bash
node SCRIPTS/seek-render.mjs effect.html --duration 8 --width 1080 --height 1350 --fps 30 --out renders/effect.mp4 --silent-audio
```

It finds Chrome via `--chrome`, `$HYPERFRAMES_BROWSER_PATH` (set it to the output of
`npx hyperframes browser path`) or the standard install paths.

## 5. Recompose, don't crop (other aspect ratios)

HyperFrames has no reflow: author one composition per canvas (`formats/<ratio>.html`, rendered
with `-c`, or one project per ratio). Note that lint only gates the root `index.html`, so run
`brand-lint` and `check-facts` on every variant. Preserve hierarchy, focal point, readable
type and rhythm. Covers keep their text inside the centre 1080×1080 (y 420–1500).
