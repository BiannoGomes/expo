# Jarvis Studio

**An AI-native motion and content studio for Bianno's brands, as one Claude Code plugin.**
It doesn't just "make videos". It decides what to make, for which brand, in which medium. It
routes to the best open-source production skills, holds brand and fact law, reviews its own
renders frame by frame, and remembers what every project taught it.

```
IDEA ──► studio (director) ──► brand-system ──► fact-lock ──► specialist skill ──► engine
                │                 activate one brand     facts.md           Charlie Hills /     HyperFrames
                │                 brand.md · MOTION.md   check-facts        HyperFrames /       (HTML+GSAP → MP4)
                │                 frame.md (tokens)                         Emil Kowalski       seek-render
                ▼                                                                               (window.seek → MP4)
        motion-review ◄───────────────────────────────────────────────────────────────── render
        review-frames · brand-lint · spec-check · motion-critic (fresh eyes) · Bianno watches
                │
                ▼
        studio-retro ──► learnings/motion-learnings.md · library/ · brand rules  (the studio compounds)
```

## What's inside

| Piece | What it does |
|---|---|
| `studio` skill | Director and entry point: the 12-step protocol, 3 creative directions, skill and medium routing, approval gate, delivery format. Full law in `references/constitution.md`. |
| `brand-system` skill | One folder per brand. A 30-field `MOTION.md` where every value is CONFIRMED / PROPOSED / ASK ME. `activate-brand` puts exactly one brand into a project, including a `frame.md` HyperFrames reads as brand truth. |
| `fact-lock` skill | `facts.md` ledger + `check-facts`. Every number, date, price and quote on screen must trace to an approved, sourced row. |
| `motion-review` skill | `review-frames` (timestamped contact sheets Claude can read), `spec-check` (7 platform presets, loudness, holds, flash risk), `brand-lint` (off-palette colours, glow, bounce, scale-from-zero, em-dashes…), `seek-render` (exports Charlie Hills' pages to MP4), and a designer-notes translator. |
| `edit-kit` skill | **The Creator Stack edit method for real takes.** `transcribe.py` (faster-whisper word timings + names glossary, verbatim), `rough-cut` (dead air and fillers cut on word boundaries, timings remapped), `captions` (2–3-word cues, reading-speed checked), `multicam-plan` (the "one take, every angle" look from **crops of the real take**, no AI re-render), `scaffold-reel` (a HyperFrames project verified to lint, check and render). |
| `studio-retro` skill | Learnings, rule promotion, library extraction, and "what gets this in front of a human next". |
| `motion-critic` agent | A fresh-eyes reviewer that didn't build the piece. |
| `workspace/` | The studio: `brands/` (UnifyMind pre-filled from its real spec, and four more), `projects/` (with the proof reel), `library/`, `learnings/`. |

Every script is zero-dependency Node and was tested on 2026-09-30 against planted errors and a real render.

## With the Becoming Project folder (your handover)

The vault folder `BIANNO  THE BECOMING PROJECT\` and its `becoming-video` pipeline **lead** for that brand. This
plugin is the toolbelt it calls. How they fit together, plus three fixes found in the handover (one is a
transcription command that won't run as written): [`handover/2026-09-30-becoming-integration.md`](handover/2026-09-30-becoming-integration.md).
**Nothing in your vault has been changed.** Every proposed edit there waits for your "approve".

The Creator Stack's six tools are covered: Claude Code · HyperFrames (plugin) · Whisper (faster-whisper) · FFmpeg ·
Python · Node. *Unbelievably Real* (AI-generated people) is deliberately **not** wired in: your handover reserves
it for the separate, AI-labelled project, and the studio's rules forbid AI people in your brands.

## Install (Windows)

Get just this folder (no need to download the whole repo it lives in):

```powershell
git clone --depth 1 --filter=blob:none --sparse -b claude/jolly-ptolemy-66dc2m https://github.com/biannogomes/expo jarvis-studio-src
cd jarvis-studio-src; git sparse-checkout set jarvis-studio; cd jarvis-studio
powershell -ExecutionPolicy Bypass -File install\install.ps1
```

The installer checks Node 22+, ffmpeg, git and Python, and installs faster-whisper
(`winget install OpenJS.NodeJS.LTS Gyan.FFmpeg Git.Git Python.Python.3.13`). It installs this plugin plus the
free production stack (HyperFrames as a plugin, the same route as your START HERE; `-HyperFramesSkills` for a lighter install), and copies the workspace to
`Jarvis Brain\03 Projects\Studio` **without overwriting anything already there**. Change the path with
`-StudioPath`. macOS/Linux: `./install/install.sh --studio "<path>"`.

Then:

```
cd "<your studio folder>"
claude
/jarvis-studio:studio make a 10s UnifyMind reel for Book 2
```

**Also in claude.ai and cloud sessions:** your claude.ai skills sync into Claude Code on the web.
To get the studio there too, zip each skill folder and upload it under claude.ai → Settings → Skills:

```powershell
New-Item -ItemType Directory -Force dist | Out-Null
Get-ChildItem skills -Directory | ForEach-Object { Compress-Archive $_.FullName "dist\$($_.Name).zip" -Force }
```

## The stack it installs (verified 2026-09-30)

| Layer | Repo | Licence | Why it's here |
|---|---|---|---|
| Engine | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | Apache-2.0 | Deterministic HTML/CSS/GSAP → MP4, lint/check (layout, contrast), captions, TTS, media. 21 skills. |
| Ears | [SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper) | MIT | Word-level transcripts. Up to 4× faster than openai-whisper, and it uses an NVIDIA GPU if there is one. |
| Workflows | [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) | MIT | 13 formats: launch video, Vox explainer, animated chart, milestone, 3D title, reel export… |
| Craft | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT | `apple-design`, `animate`, `review-animations` and more: easing, springs, restraint. |
| Editing | [WyattBlue/auto-editor](https://github.com/WyattBlue/auto-editor) | Unlicense | Free silence/dead-air cuts, SRT, export to Premiere/Resolve/FCP. |
| `--extras` | [diffusionstudio/lottie](https://github.com/diffusionstudio/lottie) · [louisedesadeleer/clipify](https://github.com/louisedesadeleer/clipify) | MIT | Lottie vector animation · long-form → speaker-tracked shorts |

**Optional paid tools** (install only when you decide the cost is worth it):
[elevenlabs/skills](https://github.com/elevenlabs/skills) (voice cleanup, TTS, SFX, music) and
[browser-use/video-use](https://github.com/browser-use/video-use) (an agentic raw-footage editor; it needs an
ElevenLabs key). Connectors you already have (Higgsfield, OpenArt, Canva, Adobe) cover image and video generation.
**Every paid call goes through the studio's approval gate.**

**Licence traps the studio blocks:** HyperFrames' MusicGen fallback is non-commercial (CC-BY-NC).
LinkedIn rejects MOV. X caps organic video at 40 fps and 1200×1900.

## The proof: `workspace/projects/2026-09-30-unifymind-two-versions/`

A 10 s 9:16 UnifyMind reel for Book 1 (`renders/final.mp4`), built through the whole pipeline:
brand activation, brief with 3 directions, storyboard, fact ledger, HyperFrames composition, 7
logged revisions with one hypothesis each, including 3 fixes from the fresh-eyes critic
(`review/log.md`), and the full QA gate. **It's a draft for Bianno's approval. Nothing was posted.**
The hook copy is draft copy on the book's "two versions of you" theme.

## Honest limits

- `transcribe.py` was verified against faster-whisper 1.2.1's API and on its output path, but **not run on a real
  model here**: this session's network blocks the model hosts (huggingface.co). Everything after transcription
  (rough cut, captions, scaffold, HyperFrames render, audio sync) was tested end to end on a real spoken take.
- Claude can't watch playback. It reads 15 fps timestamped contact sheets. Easing feel and audio
  sync still need a human, so **you watch every piece before it ships.**
- Platform safe zones and loudness targets come partly from third-party measurements (sources in
  `skills/motion-review/references/platform-specs.md`). Re-verify every 6 months.
- Charlie's repo was 4 days old and HyperFrames ships several releases a day. When their skills and
  this studio disagree about *their* tools, theirs win. On brand, facts and approval, this studio wins.
- Four of the five brands are mostly `ASK ME` on purpose: their visual systems need your references, not guesses.
