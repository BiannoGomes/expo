# Source of the ECC skills and agents

- Repository: https://github.com/affaan-m/ecc
- Commit: b38be6a7f6350964d59328b52f0624e1d1d552d1 (2026-10-29)
- Licence: MIT, Copyright (c) 2026 Affaan Mustafa. A copy is in each copied skill folder (LICENSE-ECC) and in .claude/agents/LICENSE-ECC.
- Installed 2026-10-31, unmodified, at the owner's request. Only the parts used for testing and review:
  - Skills (.claude/skills/): security-review, e2e-testing, browser-qa, accessibility, frontend-a11y, react-native-patterns, react-testing, postgres-patterns, verification-loop, ai-regression-testing, tdd-workflow.
  - Agents (.claude/agents/): code-reviewer, typescript-reviewer, react-reviewer, security-reviewer, database-reviewer, e2e-runner, a11y-architect, performance-optimizer, pr-test-analyzer, tdd-guide.
- Not installed: ECC's 27 hooks (they run on every tool call, prompt and session event and would change how every session behaves), its memory and instincts system, MCP configs, and security-scan (it downloads the separate ecc-agentshield npm tool and needs an API key). The full plugin can be added by the owner with `/plugin marketplace add https://github.com/affaan-m/ECC` and `/plugin install ecc@ecc`.
- Review before install: every copied file was read for scripts and risky instructions; none of the copied skills contain scripts.
