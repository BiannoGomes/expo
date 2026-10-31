# ECC review and full test pass (2026-10-31)

Tools used:
- ECC (github.com/affaan-m/ecc, MIT, commit b38be6a7), installed into the project. What was installed and why is in `.claude/skills/ecc-SOURCE.md`.
- Its `verification-loop` skill.
- Four of its reviewer agents, run read-only and in parallel: security, database, TypeScript with React, and accessibility.

**Not installed:** ECC's 27 hooks, its memory system, and its `security-scan` skill (it needs an extra npm tool and an API key).

## Verification report

```
VERIFICATION REPORT
==================
Build:     PASS  experience build; Expo web export
Types:     PASS  server, app, packages/core (0 errors)
Lint:      NOT CONFIGURED  no linter in the project; adding ESLint needs D5
Tests:     PASS  server 74/74 (25 unit, 49 integration), 89.7% line coverage
           Browser: 3 suites against the web builds, every check passing
Security:  PASS  no secrets in code; only .env.example committed
Diff:      ~40 code files changed since 51b57521
Overall:   READY for review, NOT READY to ship (see "Open")
Target:    NOT PERFORMED  no device, no headset, no production. Next: D6.
```

**Coverage:** `anthropic.ts` is 52% covered. That's expected: the tests use the deterministic stand-in for the AI, so the real model calls never run.

## What the reviewers found, and what was done

**Security** (no cross-user access and no SQL injection found)

| Finding | Fix | Test |
|---|---|---|
| No rate limiting | Built-in limiter: 60 new devices per minute per address; 30 model calls per minute per person, covering `/plan`, `/debrief`, `/transcribe` and `/onboarding/message`. **It lives in memory, so it works for one server instance only.** | Limiter unit test |
| A 25 MB body was parsed on every route, before auth | Auth now runs before the body is read. The global limit is 1 MB; only `/transcribe` allows 25 MB. | Over 1 MB returns 413 |
| `/debrief` and `/transcribe` didn't check consent | Both now require consent | Without consent: 403, nothing stored |
| Raw Zod, Postgres and provider errors reached clients | An error handler returns plain 400s and 500s; details stay in the log | `/plan/2026-02-31` returns 400 with plain text |
| `/export` wasn't complete | Now includes onboarding, model summary, events, safety events, people, name and personalization | Export test |
| A paused account still sent words to the model for extraction | When paused, the evening is saved and left out in one statement, and nothing more is sent to the model. Safety triage still runs. | Pause test |
| The 3D page would send the token to any `api` host | Only its own origin, or localhost during development | A crafted link isn't sent anywhere and falls back to the labelled sample |
| CORS reflected any origin | In production, only `CORS_ORIGINS` | Not tested in production |

**Database**

| Finding | Fix | Test |
|---|---|---|
| Missing indexes: evidence by record, extraction lookup, safety events, future selves, superseded | Migration `0008_review_fixes.sql` | Applied cleanly |
| Left-out evenings still raised a belief's confidence | Confidence is now worked out at read time, counting only evenings still in. It's applied to the summary, beliefs and galaxy, and promotion counts only kept evenings. | "Probably true", then "A guess" after two are left out, then back again |
| Saving and leaving out a paused evening weren't one atomic write | A single CTE statement | Pause test |
| `createHypothesis` was two writes (belief, then evidence) | A single statement | Existing nightly tests |
| `superseded_by` had no delete rule, which could break the nightly job | `on delete set null` plus an index | Migration |
| Paging skipped evenings that shared a timestamp | A `(time, id)` cursor | Five same-instant evenings, paged two at a time: all five come back |
| A stored plan kept quoting an evening left out later | Those quotes are removed when the plan is read | Test |
| Retries could create duplicate evenings | `clientKey` with a unique index; the app sends one key per composed reflection | The same key twice gives one evening |

**App (TypeScript and React)**

| Finding | Fix |
|---|---|
| The personalization switch showed "Paused" when the save had failed | Settings put back the real value and say nothing changed |
| A transcription landing during a send was wiped | Reflect is disabled while a recording is being written down, and only the words actually sent are cleared |
| "Show older" could overwrite a newer search or undo a leave-out | A sequence check, plus an append that ignores evenings already listed |
| An offline double tap on a step ended as "done" but unsaved | A failed tap is reverted only if nothing has changed the step since (browser test) |
| A failed onboarding message lost text typed in the meantime | Both the failed and the new words go back in the box |
| The oldest star was announced as "new" when the galaxy hadn't loaded | No star is picked as new without a loaded galaxy |
| The device sign-in request had no timeout | 20 s timeout |
| The new star flashed for one frame | `useLayoutEffect` |

**Accessibility (WCAG 2.2 AA)**

| Finding | Fix |
|---|---|
| iOS heard nothing after Keep it, Reflect, onboarding replies or notices (live regions are Android-only) | `lib/a11y.ts` `announce()` on iOS, and on Android where there's no live region, across world, debrief, onboarding, galaxy, evenings and Today |
| The weekly reveal wasn't a modal and couldn't scroll | `accessibilityViewIsModal`, the content behind hidden on Android, and a ScrollView |
| Settings fields and switches had no names; invalid times reverted silently | Labels on everything, and an invalid time is announced |
| Buttons without roles (Settings, "Noted", onboarding) | Roles added |
| Done step cards at 50% opacity (2.6:1); the danger red at 4.29:1 | No fading; danger is now `#C47A73` (D3, applied as a contrast fix; you can revert it) |
| Field borders at 1.25:1; galaxy lines at 1.89:1 | Inputs use the faint colour (4.6:1); lines are at 75% opacity |
| Button names didn't start with their visible text (voice control) | Keep it, Reflect, Speak it instead, Show as a list, Leave this out, and others |
| "That's not right" can't be undone | It asks first: "Set it aside" or "Keep it as it is" (browser test) |
| Undo disappeared after 6 s | It stays until the next action (checked after 7 s) |
| Star tap areas overlapped once a world had 7 or more evenings; the browser run hit this for real | Stars stay at least 32 apart and a crowded sky scrolls sideways. With 17 stars, 0 overlaps and the smallest target is 32. |
| No headings | Header roles on the main screen titles |
| 3D page: VR button and canvas inside `role="img"`, `outline:none`, focus lost | The canvas holds the role, the VR button is outside it, there's a focus ring, and focus moves to the panel |

## Open (not fixed, recorded honestly)

- **Transactions.** The dispute-with-correction route and nightly `markProcessed` are still several separate writes (database finding 7).
- **Rate limiter.** It works in memory for one instance only.
- **Focus after Leave out or Set aside.** It's announced now but not moved (accessibility finding 3).
- **Duplicate onboarding messages.** Onboarding messages have no retry key.
- **Smaller accessibility gaps:** the fixed tab-bar height, `useReducedMotion` starting as false, and some remaining labels that don't start with their visible text.
- **React #419** on the first web load. It was there before this work.
- **Not tested:** real devices, VoiceOver and TalkBack, a headset, the real model, and production.
