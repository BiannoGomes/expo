---
name: performance-budget
description: Enforce measurable performance constraints. Use when improving Dawnward.
---

# Performance Budget

## Operating instructions
Start from current QA: 1.41MB first load; SwiftShader 67ms hub and 117–150ms phone closeups, not device measurements. Set device-specific budgets after baseline. Measure frame timings, long tasks, memory, network and battery. Gate effects behind adaptive quality. Test physical iOS/Android before claims.

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
