---
name: interaction-engineering
description: Engineer fast predictable interactions. Use when improving Dawnward.
---

# Interaction Engineering

## Operating instructions
Design primary flow capture→save→review→revisit. Support optimistic UI with rollback, autosave state, clear undo, touch targets, keyboard and focus management. Instrument input latency, navigation time, errors. No misleading instant success for unconfirmed saves.

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
