# Jarvis Studio

This folder is Bianno's creative production studio: brand systems, projects, reusable
components, and the studio's memory. The operating skills come from the **jarvis-studio**
plugin (`studio`, `brand-system`, `fact-lock`, `motion-review`, `studio-retro`, and the
`motion-critic` agent).

## Before making anything

- Any request for a video, reel, motion piece, animation, carousel-in-motion or visual content
  **starts with the `studio` skill**, even when another skill (such as HyperFrames' router) calls itself
  the entry point. `studio` decides the brand, the medium and the specialist skill, then hands off.
- Read the brand's `brands/<slug>/brand.md` and `MOTION.md` in full before designing,
  generating or animating anything. `MOTION.md` sets the look, not the ambition. "Go all out"
  means more design intelligence, not more effects.
- `ASK ME` means ask. Never fill a brand value with a guess.
- Skim `learnings/motion-learnings.md` for the brand and format first.

## Never without Bianno's explicit yes (for that specific action)

Publishing, posting, sending, uploading anywhere public, or spending credits or money (Higgsfield,
OpenArt, ElevenLabs, fal, paid Adobe ops). Drafts and renders are free to make.

## Always

- Every on-screen number, date, quote or claim is in the project's `facts.md` with a source. `check-facts` passes.
- Real assets only. Never redraw logos, covers or UI from memory.
- The sea/NDA rule: no vessel, guests, owner, crew faces or working locations.
- QA gate before "done": facts · brand-lint · HyperFrames lint/check · spec-check · every scene frame read · motion-critic · Bianno watches it.
- Deliver one verdict, the file path, what to confirm, and **one** next action.

## Layout

```
brands/        one folder per brand: brand.md, MOTION.md, assets/  (+ _registry.md)
projects/      YYYY-MM-DD-<brand>-<slug>/  brief, storyboard, facts, asset-manifest, composition, renders/, review/
library/       reusable components promoted by studio-retro
learnings/     motion-learnings.md: the studio's memory
```
