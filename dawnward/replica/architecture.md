# Architecture (replica-architect, replica-backend)

Dawnward already has its stack, so nothing new was chosen:
- **Server:** Fastify, Postgres and zod.
- **App:** Expo 54 with expo-router.
- **Shared package:** `@dawnward/core`.

This slice adds to it without new packages.

## Schema: `server/migrations/0006_evenings.sql`

```sql
create table record_exclusions (
  record_id  uuid primary key references records(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);
```

- **Records stay immutable.** The existing trigger forbids updates, so leaving an evening out is a separate row and bringing it back deletes that row.
- **Nothing is ever pruned because of an exclusion.** Every reader filters at read time, so bringing an evening back restores every belief and star exactly as it was.
- **Deleting the account** cascades, as before.

## Rules: `server/src/model/exclusions.ts`

- `notExcluded(column)` hides left-out evenings.
- `stillSupported(alias)` keeps a belief visible only if it rests on at least one evening that hasn't been left out. Stated and corrected beliefs always stay, because they are the person's own words about themselves.

Where the rules are applied:

| Reader | File | Effect |
|---|---|---|
| Personal Model | `routes/assertions.ts` | Hidden beliefs drop out, and "Why I think this" counts only evenings still in |
| Model summary (what plans act on) | `model/summary.ts` | Hidden beliefs never reach the prompt |
| Nightly integration | `model/integrate.ts` | Left-out evenings wait, unprocessed, until brought back |
| Weekly review | `jobs/weekly.ts` | Skips them |
| Recent debriefs for the plan | `index.ts` | Skips them |
| Constellation | `routes/constellation.ts` | No star for them |
| Export | `routes/account.ts` | Still exported, plus a `leftOutEvenings` list |

## Quotes: `server/src/model/provenance.ts`

1. **What the model gets.** It receives the person's last five evenings that haven't been left out, word for word (`recentWords`).
2. **What it may claim.** It can attach `sourceRecordId` and a `quote` to any step and to the question.
3. **How the server checks it.** `verifySource` keeps a quote only when all of these hold:
   - The evening is one of those five.
   - The words appear in it, ignoring only whitespace, letter case and curly quotes.
   - The quote starts and ends on whole words.
   - It is 8 to 220 characters long.
4. **What gets shown.** The person sees the span exactly as they said it, never the model's copy of it.
5. **On a failed check.** The step stays and only its quote is dropped. Nothing is ever repaired.

The prompt (`intelligence/anthropic.ts`) also forbids inventing people, places, dates or commitments. That rule comes from a Reflection fix, its changelog 6.27.0, "no invented names".

## Routes: `server/src/routes/evenings.ts`

| Method | Path | Who | In | Out |
|---|---|---|---|---|
| GET | `/evenings?q=&before=&limit=` | the owner | Literal search: `%` and `_` are escaped. Paged by time, up to 100. | `{id, date, occurredAt, text, excluded, beliefCount}[]` |
| POST | `/evenings/:id/exclude` | the owner; anyone else gets 404 | – | `{id, excluded: true}`, and the summary is rebuilt |
| DELETE | `/evenings/:id/exclude` | the owner; anyone else gets 404 | – | `{id, excluded: false}`, and the summary is rebuilt |

`DailyPlan` also gains `slots[].source` and `questionSource`, each `{recordId, date, quote}`.

## Fixed along the way

- **CORS.** `@fastify/cors` allows only GET, HEAD and POST by default, so every PATCH and DELETE from the web build was failing. That included account deletion, settings, ticking a step, and now Bring it back. The server now allows PATCH and DELETE too, and a test proves the preflight.

## Parts that bite

- **Today's plan isn't regenerated.** Leaving out an evening today affects tomorrow's plan, because plans are stored per day. That's acceptable, and the UI copy says "steps", not "today's steps".
- **Search uses ILIKE over a jsonb field.** That's fine for hundreds of evenings per person. At thousands, add a `pg_trgm` index on `(payload->>'transcript')`.
- **The model sees the last five evenings.** That bounds the prompt size. Quotes from older evenings would need retrieval, which is part of the next slice (F7).

## Build order from here

1. **Phase 1, no lost words (F4).** Needs the test tools from D5.
2. **Ask your evenings (F7).** Answers come only from quoted, dated evenings, through the same `verifySource`.
3. **App lock (F6).** Needs `expo-local-authentication`, MIT, Expo 54 pin ~17.0.9, plus approval.
4. **The Body world (F8).** Starts with consent design.
