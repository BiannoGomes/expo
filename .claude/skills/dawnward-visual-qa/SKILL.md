---
name: dawnward-visual-qa
description: Independent visual, accessibility and performance QA for the Dawnward Living Universe and films. Use after any change and before anything is shown to Bianno.
---
# Dawnward visual QA

- Run `node qa.mjs`: axe violations (start, world open, end, text version), keyboard reachability of worlds, transfer weight, frame timing under 4x CPU throttle (software GL: an upper bound, not a device number), film determinism.
- Probe desktop (1440x900), mobile (390x844) and film (1080x1920) at every rest point and every world: `node probe.mjs ...`. Look at full resolution, not just thumbnails.
- Check: captions never collide with the phone or labels; labels stay inside the viewport; panels readable; no dark slabs from invisible depth; the end card shows the real CTA only.
- Review as seven people: creative director, film director, motion engineer, product designer, sound designer, accessibility engineer, sceptical customer. Each gives concrete component or timestamp references and a fix. Do not self-certify with scores.
