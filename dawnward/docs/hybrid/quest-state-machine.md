# Quest state machine

**Status:** proposal. It's implemented as pure functions in `server/src/expeditions/engine.ts`, with no I/O, so it can be fully unit-tested. The routes persist its output in one transaction.

## Attempt states

```
            begin                 answer(step)              last required step answered
 (none) ───────────▶ in_progress ─────────────▶ in_progress ─────────────────────────────▶ completed
                         │   ▲                                                                │
                  exit   │   │ resume                                     plan step present   │
                         ▼   │                                                                ▼
                       paused                                                     experiment: planned
                         │                                                                    │
                 abandon │                                                     review(outcome)│
                         ▼                                                                    ▼
                     abandoned                                                    experiment: reviewed
```

- **One open attempt per user and mission:** `in_progress` or `paused`. Beginning again resumes it, and never duplicates it.
- **`answer`** stores the answer as a record (kind `mission_response`) and moves the step pointer.
  - Answers to an earlier step can be changed while the attempt is open. A new record is written; records are never edited.
- **`completed`** is set only when every required step has an answer. The server checks this; the client can't claim it.
- **Abandoning** keeps the answers. A new attempt starts fresh.

## Step contract

| Type | Required answer | Validation |
|---|---|---|
| intro, close | none (acknowledge) | none |
| choice | `optionId` from the template | must exist in this version of the template |
| lens | a rating 1 to 3 per lens | every lens rated |
| rehearse, reflect | text, 1 to 2,000 characters | safety triage first; crisis stops the mission and shows support |
| plan | `action` (1 to 200 characters) and `when` (1 to 60) | safety triage; the action must not match unsafe patterns, otherwise a gentle "let's choose something smaller and safer" |
| checkin | `outcome` (did, partly, didn't) and text | safety triage |

## Events emitted (to the progression ledger)

| Event | Key (unique per user) | When |
|---|---|---|
| `mission_completed` | `mission:<id>:v<version>` | Attempt reaches completed for the first time. Repeats emit nothing. |
| `system_completed` | `system:<id>` | All the system's missions completed |
| `experiment_planned` | `experiment:<id>:planned` | A plan step answered |
| `experiment_reviewed` | `experiment:<id>:reviewed` | A check-in answered with any outcome |
| `reflection_saved` | `record:<id>` | Existing `/debrief` (for discoveries tied to reflection, if any) |

## Concurrency and retries

- **Every write** carries a client `requestKey`. Replays return the earlier result.
- **Attempt updates** use `update … where id = $1 and step = $expectedStep`. A stale step returns 409 with the current state, and the client resumes from there.
- **One transaction per step:** the answer record, the attempt update and progress events are written together. Events insert with `on conflict do nothing`.

## Resume and offline

- The client keeps the current step's unsent text as a draft on the device (same as Reflect).
- If saving fails, the step stays on screen with "Not saved yet. Your words are still here," and a retry. Moving on is never shown before the server confirms.
- On reopening, `GET /attempts?open=true` restores the step.
