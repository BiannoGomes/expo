# Privacy and security model

**Status:** proposal. It extends the existing model: `server/src/guard.ts`, `auth.ts`, `account.ts` and `model/exclusions.ts`.

| Topic | Rule | How it's enforced and tested |
|---|---|---|
| Ownership | Every new row carries `user_id`. Every query filters by the authenticated user. | Integration test: user B can't read or change user A's attempts, experiments, events or discoveries (404, not 403) |
| Mission answers | Stored as immutable `records`. Leaving one out works like an evening, and anything it supported is recalculated. | Exclusion test on a `mission_response` |
| Export | `/export` includes attempts, answers, experiments, events and discoveries | Export test asserts every new table appears |
| Delete | `DELETE /account` cascades to all new tables | Delete test: zero rows remain for that user |
| Personalization paused | No mission answer is sent to the model; templates are used as written | Pause test |
| Consent | Missions require the same consent as `/debrief` | 403 without consent, nothing stored |
| Safety | `triageSafety` on every free-text answer. A crisis stops the mission, logs level and time only, and shows support. | Crisis test on a rehearse step |
| Model input | Only what the function needs. Names you typed stay as typed. No other user's data, ever. | Code review plus a unit test on prompt building |
| Prompt injection | User text is delimited data. Outputs are schema-validated against catalog ids. | Injection strings in tests |
| Rate limits | Existing `modelCallLimit`; step writes limited to 120 a minute per person | Limiter test |
| Analytics | Counts only (missions started and completed, time to first action), no content, opt-in, kept 90 days | Not built in v1. Proposal only. |
| Web preview | Without an account, everything stays in this browser on this device (as today). Same delete and copy. | Existing browser tests |

**Known limits, stated plainly:**
- **Rate limiting** is in memory, so it covers one server only. Several servers would need a shared store.
- **Encryption:** data is encrypted at rest only if the hosting provider enables it, which is a hosting decision. It isn't per-user encryption.
