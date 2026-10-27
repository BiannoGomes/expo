# The Becoming Project · creative system (27.10.2026)

This answers Bianno's 27.10 brief ("make BIANNO recognisable before anyone sees the username"). It doesn't start a new
direction. **The vault had already decided most of it.** This file only links what exists and records what's still open.

## Direction: the one the vault already holds
Recognition comes from four fixed things, used again and again in the same places, never from the name on screen:
1. **The gold line** (`#D8A45F`, hand-drawn jitter). It stands for identity, memory, evidence, connection, possibility
   and time. *It begins constrained, reaches the edge, and extends beyond it. It doesn't explode; it continues.* Each
   piece gives it one behaviour.
2. **The type:** Cinzel caps for keywords, Cormorant for lines and word-by-word captions, Inter for tracked labels and
   the mark.
3. **The dark sea:** the night palette in `MOTION.md` field 1 (PROPOSED: the values from Reel 01 v5).
4. **Night Watch:** the opening bells A-E-D, a tick that races into each turn, stops dead and hits, the landing
   E-D-A, and nothing below 60 Hz.

Five principles from the brief (human first, invisible things made visible, AI with intention, quiet authority, useful
meaning). Each already exists in the vault constitution (§1, §5, §7, §21–22). Two differences:
- "Human first" also allows his labelled AI-twin voice.
- A question counts as a valid payoff.

## What was built (repo, `workspace/library/becoming/`)
- **Foundation:**
  - tokens and OFL fonts;
  - the `BM` runtime: gold line, word reveals, captions, sea plate, grain, shaders;
  - the Night Watch engine, with a headless renderer;
  - the house mix and master, plus audio QA;
  - `tools/build.sh`, which runs every gate.

  The `templates/hello` piece proves it end to end.
- **Eight families** in `families/01-horizon` … `08-quiet-ending`. Each is a data-driven 8–12 s component with a
  README (inputs, timing map, variants, known limits).
  - Each was built, then judged by a fresh critic on the brief's 10-point rubric using real frames and measured audio,
    then revised once.
  - No hard fails remain. Final means are 6.8–7.2 out of 10.
  - Families 01, 05 and 06 are still marked "revise", mainly because the demo copy gives the viewer nothing to act on.
    Real script lines are the fix.
  - Every README lists its open problems honestly.
- **Showcase:** all eight in order, 86 s, −14.1 LUFS. It was rendered to the scratchpad and sent to Bianno. Renders
  never go in the repo.

Build any piece with:
`tools/build.sh families/<NN-slug>`
Swap `data.js` to use real lines or a real photo, in a scratchpad copy only.

## Audit and research (scratchpad, 27.10)
The full reports are local to the session that ran them (`creative-system/audit/`). The essentials:
- **Renderer:**
  - HyperFrames 0.8.97, pinned and offline, deterministic (renders hash identically).
  - WebGL works on the CPU.
  - No new framework was needed.
- **GetLayers:** reference only. Details:
  - Its MCP and its Claude Code plugin need the **Full Stack Lifetime plan, US$249 one-time** (getlayers.ai/pricing,
    27.10), plus an account and a sign-in. Claude can't buy or sign in, so that's Bianno's call.
  - Its Terms forbid redistributing prompts or source, and forbid rebuilding premium layers from their previews.
  - "Image Motion" is not depth or parallax, and "Orb Studio" is a voice-assistant orb.
  - Everything here is original code instead, so nothing can be claimed against it.
- **Creator references:**
  - Sam Kolder's YouTube is `@koldstudios` (`@samkolder` returns 404).
  - Hayden Hillier-Smith's Instagram handle is unverified.
  - Steven Wommack's channel is now mostly AI-video tutorials.
  - The approach: borrow techniques, never identities.
- **Licences:**
  - Cinzel, Cormorant Garamond and Inter: SIL OFL 1.1.
  - GSAP 3.14.2: the free "no charge" licence.
  - HyperFrames: Apache-2.0.
  - Real ambience needs his own recordings. BBC RemArc is non-commercial and Freesound needs a login.

## Where the brief conflicted with the brand (resolved in favour of the brand)
| Brief | Kept |
|---|---|
| gold `#E6C07B`, near-black `#05070D` | `#D8A45F` (the gold he liked) and `#04070B` (no visible difference from `#05070D`) |
| "make BIANNO recognisable" | never his name on a frame; the line, type, sea and bells do the work |
| "low-frequency accents" | nothing below 60 Hz |
| formats A–E with new meanings | the existing A–E letters stay; the brief's five formats are briefs inside them |
| a new 10-point rubric | the vault's 15-dimension scorecard comes first; the 10-point rubric is an extra lens for motion |
| ALL-CAPS library docs | the existing files plus this one dated file |

## Waiting on Bianno
1. Confirm the palette in `MOTION.md` field 1, or hand over the vault tokens CSS. It's PROPOSED until then.
2. Safe zone: the repo says x 80–940, y 250–1500; the becoming-video skill says x 80–1000, y 230–1650.
3. The gold line's meaning. The brief says it is "the boundary between who you've been and who you're becoming"; the
   vault says "it continues". The families use the vault's meaning.
4. Record 30–60 s of real sea (not aboard), for the sea layer.
5. Buying GetLayers (US$249) is optional and not needed for anything built here.
