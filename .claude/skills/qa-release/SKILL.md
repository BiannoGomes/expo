---
name: qa-release
description: Prevent regressions and unsupported claims. Use when improving Dawnward.
---

# Qa Release

## Operating instructions
Run unit, integration, e2e, axe, keyboard, screen reader and mobile device checks. Include failure, offline, low-power, reduced-motion and compression cases. Maintain evidence with reproducible commands. Mark untested explicitly; block release on critical failures.

## Required workflow
1. Inspect current code, tests, design tokens and relevant files.
2. Identify exact user-facing problem and measurable acceptance criteria.
3. Research references with links and distinguish observations from assumptions.
4. Propose smallest safe change, dependencies, risks and rollback.
5. Implement on a branch; preserve source attribution and licensing.
6. Run relevant tests and compare to baseline.
7. Report files changed, evidence, remaining gaps and next decision.

## Output contract
Provide: Findings | Reference links | Decision | Files | Tests | Measurements | Risks | Approval needed.
