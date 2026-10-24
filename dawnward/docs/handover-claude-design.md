# Handover: the final stylized design pass (paste into Claude Design)

Paste everything below the line into a Claude Design session opened on the Dawnward Screens canvas.

---

You are working on the **Dawnward Screens** canvas. Before anything else, read the canvas's `canvas.json`, its notes, and the installed design system `ds/dawnward` (its README is the brand book; its tokens.css is law). Build on what exists; never replace another session's boards, only refine or add.

**Your mission:** the final stylized pass. Make this the most beautiful dark-interface design system in the personal-growth category, using only what the brand already is: near-black `#0B0E12` ground, ink `#ECE9E2`, one gold `#C9A96A`, Cormorant Garamond display, Albert Sans body, IBM Plex Mono labels, borders never shadows, 8px grid, radius 14/22.

**Three sub-directions, one system** (shared tokens, shared laws):

- **A. The Living Sky** (primary, all daily rooms): sparse date-seeded stars, horizon light that knows the time of day, insights set like an intimate letter.
- **B. The Personal Atlas** (You, Personal Model, Future Self): structured and editorial, a refined twelve-domain life map, evidence lines connecting beliefs to lived moments, elegant campaign milestones. Still dark, still restrained.
- **C. First Light** (debrief close, witnessed, reveal, milestones): the warmest surfaces in the product, dawn and dusk ambience, the emotional payoffs.

**The star law** (from the brand book's Ambient Night addendum): stars are astronomical, never decorative. Real magnitude distribution where almost everything is faint and few burn, warm ink and cool `#C7D5EE` temperatures, gold only for moments that mattered, soft halos on the bright, four-point diffraction crosses on the brightest. Hand-placed fixtures are fine on boards, but they must look like a real sky.

**Boards to elevate:** Reveal, You, Witnessed, Icon, Splash, both Lock screens.

**Boards to add:**

1. **Atlas** (390x844): the Personal Model as a twelve-domain map, direction B at full power.
2. **FirstLight** (390x844): a campaign milestone moment, direction C.
3. **ShareCard** (1080x1920): the in-product share, a person's constellation composed as a story-format image they would be proud to post, wordmark small, no UI chrome.
4. **AdFrame-1 and AdFrame-2** (1080x1920): marketing frames in the same system, one quote-led, one screen-led with a phone at slight 3D tilt and gold rim light.

**Hard laws, never bend:** no streaks, badges, scores, points, progress bars that measure the person, red dots, confetti, guilt copy, light theme, or AI-telling language. No em-dashes in any copy. The product speaks like a caring person. Copy you invent must be marked in a gray note as an invented fixture, tier-labelled like the existing notes. Only the three sanctioned motion moments may be implied (constellation drift, listening pulse, star-birth); boards are still.

**Quality bar:** every board should survive the question "was this decided or defaulted?" Composition, scale contrast between serif display and small mono labels, generous darkness, one gold focal point per screen. If a board looks like a template, it is wrong.

**Hand back:** the updated canvas with a short note listing boards changed, boards added, and any invented copy, so the engineering session can implement from it.

---

## New creative direction: The Living Universe

Extend the existing Dawnward design system with a coherent planetary universe. Do not replace the current design system or overwrite other sessions' work. Read the Living Universe addendum in `docs/creative-playbook.md` first; it is canon for this direction.

**The language:** planets are life domains (Mind: cool blue with delicate rings. Body: warm and earth-like. Soul: quiet and luminous. Future: a distant destination that gains definition as aspirations clarify). Stars are meaningful moments, gold for the ones the person marked significant. Orbits are defensible or user-confirmed connections. Nebulae are possibility, atmosphere only, in the approved nebula tone `#4A5A7A`, never on components or text. Progress changes the universe itself, always qualitatively: atmosphere, definition and detail may grow; numbers, percentages, meters, streaks, punishment or arbitrary rewards never appear. A planet never shrinks or darkens for inactivity.

**Add these boards** to the Dawnward Screens canvas, each specifying user purpose, interaction, motion behavior, data required, empty state, accessibility and engineering notes:

1. **Universe Overview**: the cinematic, spatial view of the personal cosmos.
2. **Planet Detail**: one life domain with atmosphere, orbital details and a readable insight panel (what matters, what was learned, the evidence, what remains uncertain, one next action).
3. **Planet Journey**: the transition from wider universe to planet, spatially continuous.
4. **Star Memory**: a meaningful experience becoming a star.
5. **Constellation Connections**: evidence-backed or user-confirmed relationships, inspectable.
6. **Milestone Reveal**: a restrained planetary or atmospheric change after a genuine milestone.
7. **Future Universe**: the chosen direction and possible next destinations, clearly aspirations, never predictions.
8. **Reduced Motion**: a complete static alternative preserving all information and actions.
9. **Shareable Universe**: a private-by-default story card the user reviews before sharing.
10. **Motion Storyboard**: keyframes for the five signature moments (the quiet sky opening, camera travel toward a chosen planet, the transition into its readable detail screen, a memory becoming a star, the pullback revealing the interconnected universe), each with camera movement, lighting, duration, easing, user control, performance considerations and a reduced-motion alternative.

Create a convincing 3D visual direction: spatial depth, restrained planetary rotation, atmospheric lighting, layered stars, camera travel, a coherent sense of scale. The boards must remain readable and usable as app screens; the cosmos is the environment, never a replacement for the interface. Avoid neon, purple AI gradients, lens flares, floating icons and space-game HUDs.

Keep the implementation realistic for Expo and React Native: identify which effects the current SVG/Reanimated stack can carry and which genuinely require Skia or a 3D renderer; introduce no dependency before proving the need. A live 3D reference exists: the Dawnward Voyage artifact built in the engineering session.

**Return** the revised canvas plus a concise implementation handover: approved boards, interaction states, motion specifications, any proposed token additions, and unresolved engineering questions.
