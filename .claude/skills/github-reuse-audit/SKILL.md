---
name: github-reuse-audit
description: Find and safely reuse open-source components. Use when improving Dawnward.
---

# Github Reuse Audit

## Operating instructions
Search official repositories first. Record repo URL, commit SHA, license, maintenance, dependencies, security history, bundle impact, accessibility, compatibility. Never copy code without compatible license. Prefer isolated adaptation and provenance ledger. Reject abandoned or incompatible projects.

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
