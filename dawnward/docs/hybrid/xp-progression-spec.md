# Progression specification

**Status:** proposal. The engine is the same whichever display Bianno chooses (D-H1). The default recommendation is **discoveries only**.

## Principles

1. Progress shows **what you did and found**, never who you are.
2. It is **deterministic**: fixed rules in code, never decided by the model.
3. It is **idempotent**: replaying an event changes nothing.
4. It **never goes down**: no decay, loss or dimming for inactivity, and no streaks.
5. **No reward for disclosure**: longer or more personal answers earn nothing extra.

## The ledger

`progress_events (id, user_id, kind, ref, created_at, unique (user_id, kind, ref))`, written only by the server, in the same transaction as its cause.

## Discovery rules (v1)

| Rule | Cause | Discovery key | What appears |
|---|---|---|---|
| R1 | `mission_completed` for any mission in a system | `star:<mission>` | A star in that system, beside the mission's world |
| R2 | `system_completed` | `moon:<system>` | A moon orbiting the world; opens an optional deeper mission |
| R3 | `experiment_reviewed` (any outcome) | `landmark:<world>:<n>` | The world's landmark grows: Soul's sanctuary gains a lantern, Body's trail a marker, Mind's lake a crystal, Future's city a spire |
| R4 | First reflection ever saved | `first-light` | The core glows once; the journey log begins |

**Rule properties:**
- Each rule is a pure function: `(events) → discoveries`. The server runs it after each transaction and inserts into `discoveries` with `on conflict do nothing`.
- Every discovery stores its `cause_event`. The journey log shows "Why this appeared: you finished The Bridge 1 on 3 November."

## If D-H1 is B or C: Explorer XP (display layer only)

| Event | XP | Cap |
|---|---|---|
| `mission_completed` (first time per mission) | 20 | Once per mission |
| `experiment_planned` | 10 | 3 a day |
| `experiment_reviewed` | 25 | 3 a day |
| `system_completed` | 75 | Once per system |
| `reflection_saved` | 10 | 1 a day (so writing more never pays more) |

**How it works:**
- XP is a **view over the ledger**: `sum(points(kind)) with caps`, computed by the server and never stored separately. It can't drift from the events.
- **Levels:** 200 XP per level, and the gap never grows (no grind).
- **Copy:** "Explorer level 3: places explored", never "growth level" or anything about the person.
- **Off by default** under option B. The settings toggle hides it without deleting anything.

## Tests (in `acceptance-test-matrix.md`)

- Replaying any event twice: no new discovery.
- Completing a mission twice: one star.
- Server restart mid-transaction: no half-written discovery.
- 50 reflections in a day: under option B or C, XP from reflections is at most 10.
