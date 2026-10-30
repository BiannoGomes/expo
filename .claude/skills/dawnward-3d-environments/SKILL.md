---
name: dawnward-3d-environments
description: Build or tune the Dawnward 3D scenes (the light, the phone, the portal, the universe, the four worlds) in three.js within the performance budget.
---
# Dawnward 3D environments

- Two scenes in `src/main.js`: `phoneScene` (light, dust, titanium phone with real UI, contact shadow) and `uniScene` (nebula, three star layers, kept star, four world sprites with halos).
- The portal: before the crossing, the universe renders into `portalRT` and the screen shader samples it in screen space; after the crossing it renders directly. Keep it one extra pass, only during the transition.
- Glows are shader or sprite based. No bloom pass, no shadow maps, no transmission. Additive glows never depth-test.
- Invisible objects must not be drawn (set `visible=false` below opacity 0.002); transparent meshes still write depth.
- Portrait screens: world positions compress in x and stretch in y; the phone is lifted (web) or lowered (film) for captions.
- Budget: under 100 draw calls on phones, DPR 1.5 phones / 2 desktop / 1 film, images WebP, fonts WOFF2 subsets.
