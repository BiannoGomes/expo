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
