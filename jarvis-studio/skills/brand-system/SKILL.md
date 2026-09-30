---
name: brand-system
description: Manage Bianno's brand motion systems — one folder per brand (UnifyMind, The Becoming Project, UnifyOps, Dawnward, WonderWilds, or a new one) with brand.md + a 30-field MOTION.md, brand intake from real references with ASK ME for anything unknown, and activation of exactly one brand into a project (brand.md/MOTION.md for Charlie Hills' skills, frame.md tokens for HyperFrames). Use for "set up my brand", "brand intake", "MOTION.md", "new brand", "which brand is this", confirming PROPOSED values, or before any production.
---

# brand-system

`SCRIPT` = `<this skill>/scripts/activate-brand.mjs`. `STUDIO` = the folder containing `brands/_registry.md`.

## Commands

```bash
node SCRIPT --list                                # every brand: confirmed / proposed / ASK ME counts
node SCRIPT <slug> <project-dir>                  # activate one brand into a project
node SCRIPT --check <project-dir>                 # detect drift (source edited since activation)
node SCRIPT --new <slug>                          # scaffold a new brand from templates/
```

Activation writes three files into the project:
- `brand.md` and `MOTION.md`, stamped with the source hash. Charlie Hills' skills read these from the project root.
- `frame.md`, whose YAML frontmatter comes from the brand's "Frame tokens" block. HyperFrames reads
  `frame.md` → `design.md` → `DESIGN.md` and treats that frontmatter as brand truth.

It refuses to activate a second brand into an already-branded project. **Brands never share a project.**

## Value states (`references/motion-md-schema.md`)

- **CONFIRMED**: observed in a real reference or stated by Bianno. The source is named.
- **PROPOSED: value (why)**: Claude's suggestion. It's usable in drafts and listed in every delivery
  for him to confirm. When he confirms, change it to CONFIRMED with "(Bianno, <date>)".
- **ASK ME**: unknown. Never fill it with a guess. If a piece depends on it, ask before building.

## Intake (new brand, or a brand whose fields are all ASK ME)

1. If Charlie's `brand-intake` is installed, run its interview (two batches of questions, 3–5
   reference frames in `examples/`). Otherwise ask the same things yourself:
   - name + one line
   - audience
   - what the videos promote (a real link)
   - the feeling in the first second (up to 3 words)
   - hex colours, fonts, logo files (or "sample from my site")
   - 3–5 reference frames
   - one thing the motion must never do
2. Analyse **only what's observable** in the references. Fill `brands/<slug>/MOTION.md`, all 30
   fields, and mark each one's state. Write the `## Frame tokens` YAML block from the
   CONFIRMED and PROPOSED values only.
3. Charlie's intake writes `brand.md`/`MOTION.md` at the project root. Move them into
   `brands/<slug>/`, merge them into the 30-field table (keep his fields; add ours under
   "Studio extensions"), then re-activate.
4. Show Bianno the result as a short diff of what's CONFIRMED vs PROPOSED vs ASK ME. **Never
   save brand rules he hasn't seen.**
5. Update `brands/_registry.md`.

## Brand-specific laws (always re-read from brand.md, never from memory)

- **UnifyMind:** zero em-dashes · one gold phrase per frame · the sea/NDA rule.
- **The Becoming Project:** never present the becoming as complete · no gym, alpha or
  motivational clichés · failure and uncertainty are on-brand.
- **UnifyOps:** B2B, so never personal-brand aesthetics · sample data labelled · no fake results.
- **Dawnward:** the product-truth law: a concept must be labelled as concept.
- **WonderWilds:** no character work without the character bible · never redesign a character.

## Confirming PROPOSED values

After Bianno watches a piece, ask one question: "Keep these, or change any?" and list the
PROPOSED values it used. Record his answer in `MOTION.md` (CONFIRMED + date) and in the retro.
