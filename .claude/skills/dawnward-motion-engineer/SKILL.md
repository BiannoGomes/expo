---
name: dawnward-motion-engineer
description: Implement or change motion in the Dawnward Living Universe engine. Use for camera paths, easing, scroll response, transitions, reduced-motion behaviour and the five motion families.
---
# Dawnward motion engineer

- Tokens: `dawnward/experience/src/tokens.js` (`motion`). Every animation belongs to one family: Breath, Orbit, Emergence, Gravity, Revelation. Do not invent new curves; extend the tokens.
- The engine is a pure function of story time `s` (0 to 5) and time `t`: `frame()` in `src/main.js`. Never read the previous frame's state; compute from `s` and `t` (the film depends on it).
- Camera: `cameraFor(s, t)` is one continuous path; world focus is a damped mix toward `focusPose()`. Compute the camera first in each frame.
- Scroll: Gravity damping (half-life 0.32 s), rest points in `chapters`, no snapping before the first input.
- Reduced motion: damping becomes instant; the matchMedia listener updates live. Keep every interaction usable without motion.
- Verify with `node probe.mjs desktop|mobile|film ...` and `node qa.mjs` (determinism must report "identical").
