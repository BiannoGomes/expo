# Dawnward creative and engineering playbook (adopted 2026-10-24)

The condensed, canon-checked version of the owner's playbook. Where anything conflicts with `design-direction.md` or `brand-brief.md`, those win.

## Five disciplines, one product

1. Cinematic brand direction: a recognisable visual world, never generic AI imagery.
2. Premium product design: real-world mobile excellence in type and interaction.
3. Creative engineering: custom constellation rendering, controlled motion, polished transitions.
4. Reliable infrastructure: secure personal data, robust backend behavior, tests, observability.
5. Evidence-led marketing: concepts that communicate value and can be measured.

Claude is the coordinator and implementation partner, fed a curated set of references and acceptance criteria. Installing everything would create conflicting instructions and a less distinctive product.

## Reference libraries, by job

Tier A (essential): Mobbin (real mobile flows: onboarding, permissions, home, settings), Awwwards (site art direction; never import desktop effects into the app without product reason), SiteInspire (calm editorial layouts), Godly (unexpected compositions, filtered through black/ivory/gold), Lapa Ninja (landing structure and conversion), Refero (comparing real screens).

Tier B: The FWA, CSS Design Awards, Best Website Gallery, One Page Love, Land-book, Behance (full case studies), Dribbble (concepts, validate usability), Typewolf (type refinement only; the system is fixed), Pinterest (moodboards for night photography and cinematic light).

Rule: never "look at all of these and copy the best." Each reference gets four lines: what works, why, what Dawnward takes, what it refuses.

## Tool map (what makes what)

| Need | Tool | Where |
| --- | --- | --- |
| Native motion | Reanimated (+ Skia only if measured need) | app |
| Star systems | lib/sky.tsx, lib/constellation.tsx (already astronomy-grade) | app |
| Stylized boards, flows, UGC frames | Claude Design canvas + ds/dawnward | design space |
| Marketing site | hand-built HTML on canonical tokens (site/) | web |
| Launch films, ads | HTML timeline + anime.js + Playwright frames + ffmpeg (HyperFrames/Remotion family, pipeline proven with the advert) | web render |
| Live-action and photoreal shots | Higgsfield (gpt_image_2_5, video models) | external |
| Voice | Kokoro TTS locally; ElevenLabs when egress is allowed | local |
| Web QA | Playwright + Lighthouse | web |
| Mobile e2e | Maestro (when device testing starts) | app |
| Errors | Sentry with redaction of reflections, transcripts, tokens | server/app |

Web animation libraries (Theatre.js, Three.js) belong to the site and films only, never forced into the native app.

## Three sub-directions, one system

- **A. The Living Sky** (primary; all daily rooms): sparse stars, deep black, warm ivory type, one gold point of light, insights like an intimate letter.
- **B. The Personal Atlas** (Personal Model, Future Self): structured twelve-domain life map, evidence links, elegant milestones.
- **C. First Light** (debrief close, witnessed, reveal, milestones): warmth, dawn and dusk ambience, human storytelling.

Shared tokens, shared motion constraints, one brand.

## Production sequence

1. Audit (done: docs/audit-2026-10-24.md).
2. Curated reference library with reasons.
3. Design pass in Claude Design (handover: docs/handover-claude-design.md).
4. Document the chosen direction; tokens change only with justification.
5. Implement highest-value screens first: invitation, onboarding, Future Self, Today, constellation, then the audit's build order (reveal screen, star-birth, offline/rest states, a11y pass).
6. Marketing around the real product (site shipped; store shots and films next).
7. Visual and functional QA: screenshots, device tests, privacy and deletion verified, reduced motion.
8. Measure (after the privacy-respecting measurement decision) and improve.

## The QA standard ("flawless", made measurable)

- Visual: nothing clipped, no inconsistent type, no broken safe areas, no accidental light surfaces.
- Motion: only the three sanctioned moments plus press physics; reduced motion complete.
- Personalisation: no invented personal facts; every insight traceable to evidence and confidence.
- Privacy: access-controlled data, redacted logs, deletion verified end to end.
- Reliability: loading, offline, timeout, empty and error states designed and tested.
- Security: auth, validation, dependency checks, secret handling tested.
- Release: repeatable builds, device testing, crash monitoring, rollback plan.

## Honesty note

Galleries of "made with Claude Opus" ads are creator-reported, not verified provenance. Treat them as inspiration for technique. Dawnward's own pipeline (advert shipped 2026-10-24) is first-party proof and the repeatable base.

---

# ADDENDUM: The Living Universe (owner-adopted 2026-10-24)

Planets, orbital journeys and personal expansion. Dawnward is a universe the user travels through as they grow. The key design decision: progress changes the universe itself. As a person builds consistency, gains insight and completes meaningful commitments, their world gradually develops. No scores, streak pressure or artificial rewards.

## 1. Core creative idea

Dawnward is a universe the user gradually comes to know. The user begins in a quiet, expansive night sky. As they explore their inner world and take meaningful action, new celestial environments become visible. Stars preserve moments. Planets represent areas of life. Orbits represent relationships between parts of the self. Nebulae and distant galaxies suggest possibility, not achievement levels. The universe is a metaphor for human transformation: intimate, scientifically inspired, emotionally meaningful, visually extraordinary.

## 2. The celestial design language

**Stars = moments and memories.** Small faint stars are the wider field of lived experience. Brighter stars mark personally meaningful memories, insights or decisions. Constellation lines connect moments when a meaningful relationship has been established. Gold is reserved for moments the user identifies as significant. Stars must never become arbitrary rewards for opening the app.

**Planets = domains of life.** Planets represent domains such as Mind, Body, Soul, Relationships, Business and Expertise. Each has its own subtle material, atmosphere, surface character and orbital identity. A planet's appearance may evolve as the user explores a domain and takes actions they choose. Never imply that a person's worth, health or psychological condition can be measured by a planet's size, color or brightness. A planet must never shrink or darken to punish inactivity.

**Orbits = connections.** Orbital paths express relationships between life domains, commitments and meaningful experiences. A connection appears only when the product has a defensible basis for showing it, or the user creates it. Motion suggests continuity, never urgency. No cluttered webs of lines.

**Nebulae = possibility.** Soft volumetric clouds, used sparingly, restrained color, natural falloff. They symbolise unexplored possibility, never a diagnosis or prediction.

**Galaxies and destinations = longer journeys.** A galaxy or region can represent a longer personal chapter or chosen campaign. Destinations are invitations, not levels to grind. A new region may emerge after a meaningful milestone, but essential reflection and support are never withheld behind progression.

## 3. How the planets communicate, without measuring

- **Mind: clarity.** A cool blue planet with delicate rings. As self-understanding grows, richer connections between reflections and themes become visible.
- **Body: vitality.** A warmer, earth-like world. Shows chosen routines and personal observations without turning health into a score or implying medical conclusions.
- **Soul: connection.** A quieter, luminous planet for reflection, values, meaning and personally chosen practices.
- **Future: expansion.** A distant destination that becomes more visually defined as aspirations clarify. A chosen direction, never a prediction.

Qualitative always: atmosphere, definition and detail may grow; numbers, percentages and meters never appear on or near a planet.

## 4. Visual identity

Canonical tokens hold (ground `#0B0E12`, ink `#ECE9E2`, gold `#C9A96A`, cool `#C7D5EE`, the three faces, 8px grid, radius 14/22, borders not shadows). One addition, owner-approved with this addendum: **nebula `#4A5A7A`, atmosphere only**, like the sky-gradient colors it may never appear on components or text. The cosmos must look deep and spatial, never a flat star wallpaper: layered star fields, atmospheric perspective, restrained bloom, parallax, controlled camera. Avoid neon overload, purple AI gradients, lens flares, floating icons and space-game HUDs.

## 5. The signature experience: three scales

1. **The intimate sky**: a sparse field where the user recognises their own moments; gentle camera, negative space for the interface.
2. **The planetary system**: the camera travels to a chosen domain; surface, atmosphere and orbit become visible; a concise editorial panel explains the domain and offers one useful next action.
3. **The wider universe**: a pullback reveals the relationships between planets, constellations and destinations; growth is interconnected, not a list of isolated goals.

Transitions preserve spatial continuity: one coherent place, never unrelated animations.

## 6. Motion direction

Slow camera drift; gentle parallax between foreground planets, distant stars and nebulae; subtle axial rotation; soft atmospheric movement; a new star forming when a meaningful moment is saved; an atmosphere subtly changing at a genuine milestone; an orbit appearing when a connection is established; a slow pullback revealing the wider model. Every animation has a purpose. No constant spinning, aggressive zooms, endless particles or forced celebration. Reduced motion gets a complete, attractive static alternative. These moments extend, and must be reconciled with, the three sanctioned motion moments in design-direction.md before app implementation; the reconciliation is an owner decision.

## 7. The product flow

Arrival (a calm first sky, the metaphor explained briefly) → Discover (the user chooses which planets matter; no domain is assumed) → Understand (a planet opens into a readable domain screen: what matters, what was actually learned, the evidence, what remains uncertain) → Act (one useful next action, acceptable, changeable, dismissable) → Reflect (the debrief) → Connect (experiences become connected stars, inspectable and editable) → Return (the universe changes subtly with the story; continuity, never streak pressure).

## 8. Interface hierarchy

The cosmos is the environment, not a replacement for the interface. Keep text readable and actions discoverable: Today, Explore, My Universe, Reflect, Future Self, Settings. Editorial panels over the dark environment; no body text on busy nebulae; the main action visible without exploring a 3D scene.

## 9. Technical path

App (Expo/React Native): start with the existing SVG and Reanimated stack; evaluate Skia for star fields and atmosphere; a native 3D renderer only if the simpler stack demonstrably cannot deliver; the interaction model must work without 3D; test on mid-range devices. Marketing and films: Three.js or React Three Fiber where real camera and lighting earn their keep; the deterministic HTML-timeline pipeline for launch films. Marketing imagery never promises interactions the app does not have. Live 3D concept proof: the Dawnward Voyage artifact (Three.js, brand tokens, reduced-motion safe).

## 10. Trust, evidence and accessibility

Celestial visuals are a metaphor, never an assessment of a human being. Inferred insights are never presented as fact; user-entered information is distinguished from interpretation; memories and connections can be corrected, removed or disconnected. Celestial changes never imply failure, shame inactivity or manufacture urgency. Screen readers, contrast, reduced motion, non-3D navigation and clear controls are all supported; color and animation never carry meaning alone.

## 11. Required design deliverables (Claude Design)

Universe Overview, Planet Detail, Planet Journey, Star Memory, Constellation Connections, Milestone Reveal, Future Universe, Reduced Motion, Shareable Universe, Motion Storyboard. Each board specifies: user purpose, interaction, motion behavior, data required, empty state, accessibility requirements, engineering notes.

## Quality test

The experience should feel like an intimate journey through an expanding universe: recognisable without its wordmark, beautiful without sacrificing usability, meaningful without pretending a metaphor is a measurement. It succeeds when the universe helps a person understand their life and take a worthwhile next step, not when it merely makes them admire the animation.
