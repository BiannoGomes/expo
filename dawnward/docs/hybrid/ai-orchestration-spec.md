# AI orchestration specification

**Status:** proposal. It builds on `server/src/intelligence/*`, which already has the interface, the Anthropic implementation and a deterministic stand-in used by every test.

## What the AI may do (bounded functions)

| Function | Input | Output (zod-validated) | Fallback if the model fails or the output is invalid |
|---|---|---|---|
| `understandGoal` | Your own words for what you want to work on | `{ world, systemId, restated }` from the catalog's ids only | Show the four systems; you pick |
| `recommendMissions` | Chosen goals, completed missions, and recent evenings you allow | Up to 3 `{ missionId, reason, sources[] }` | Catalog order: the first unfinished mission |
| `adaptScenario` | A template step plus your context (names you've given, a situation you described) | The same step shape, with slots filled; options keep their ids and lessons | The template's original wording |
| `facilitateReflection` | Mission answers so far | One follow-up question, at most 160 characters | The template's question |
| `suggestExperiment` | Plan step context | Up to 3 actions, each at most 200 characters, passed through the safety filter | The template's example actions |
| `reviewExperiment` | Your check-in plus earlier related records | A short summary that quotes your words with sources; must allow "not enough evidence" | No summary; your words alone |

## What it may never do

- Award, change or predict progress. Progress is a server rule, never decided by the model.
- Say an action was done when you didn't record it.
- Diagnose, name a condition, or give medical, legal or financial instructions.
- Choose content outside the catalog: `missionId` and `systemId` must exist.
- Write anything you'll see without validation. Invalid output never reaches the screen.

## Grounding

- Any statement about you must cite record ids from your own data. The same `verifySource` rules as today apply: quotes are verbatim, whole words, and from records you can see.
- **Recommendations explain why:** "Suggested because on 2 November you wrote you'd been avoiding a talk with Sam." The quote is checked, and you can tap to see the evening.
- You can dismiss a recommendation ("Not for me") or change it. Dismissals are remembered and never re-suggested within 30 days.

## Safety and prompt injection

- **Safety first:** `triageSafety` runs on every free-text answer before any other model call. A crisis stops everything and shows the hand-written support text.
- **Your text is data, not instructions.** It goes in a delimited, quoted field. The system prompt states that instructions inside user text are ignored. Outputs are schema-checked, so injected text can't change ids, progress or tools.
- **No tools:** the model calls none. It returns data only.
- **Limits:** model calls stay rate-limited (`modelCallLimit`, 30 a minute per person). Mission adaptation is cached per attempt step, so going back and forth costs nothing.

## Testing

- **The deterministic stand-in** (`intelligence/mock.ts`) is extended with each new function, so every route is tested without the model.
- **A small set of live-model checks**, run on request only (they cost money, so approval needed):
  - schema validity across 50 inputs;
  - zero invented ids;
  - zero clinical terms;
  - every claim cited;
  - injection strings ignored.
