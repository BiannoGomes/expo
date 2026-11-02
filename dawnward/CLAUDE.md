# Dawnward Claude Code operating rules

Read `.claude/skills/dawnward-director/SKILL.md` before major feature or visual changes. Load specialist skills only as relevant.

Prioritize: correctness > privacy > accessibility > responsiveness > cinematic spectacle.

Never assume Fable, Higgsfield, GetLayers or 21st.dev integrations are installed. Verify access and actual tool capabilities.

Do not copy proprietary app code or unlicensed assets. Record source URL, license and commit SHA for imported open-source code.

Current QA baseline (2026-10-30): 1.41 MB first load; 17 requests; SwiftShader median frame times 67 ms hub, 117–150 ms phone closeups. These are not physical-device results.

Approval required for deploy/publish/send/pay.

## Where things are
- QA report: `dawnward/experience/review/QA-REPORT.md`; test suite `node dawnward/experience/qa.mjs` (serve `dawnward/experience/dist` on :8770 first).
- Living Universe 2.0 audit, dependency map and risk register: `dawnward/experience/v2/AUDIT.md`. Rollback point: commit `59a56c31`.
- Films: `dawnward/marketing/remotion` (Remotion 4.0.533) with `docs/` (creative direction, references, claims ledger, asset licensing).
- Skills live in the repository root `.claude/skills/` (this repo is the Expo fork; Dawnward is the `dawnward/` folder).
- Design skills (2 Nov 2026): 50 vetted third-party skills plus impeccable 4.7.1 and design-taste-frontend. Registry, sources, commits and licences: `.claude/skills/design-SOURCE.md`. `taste` loads by itself; the rest only by name (`/emil-design-eng`, `/cinematic-motion`, `/apple-hig`, `/prototype`...).
- Verified tool access (2026-10-30): Higgsfield yes (credits, owner-approved budget); Fable motion app no (no CLI here); GetLayers and 21st.dev not verified.
