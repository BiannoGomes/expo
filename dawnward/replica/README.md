# Replica pass: five competitors, one upgrade to Dawnward

Date: 2026-10-31.

All eleven Replica skills were used on Rosebud, Mindsera, Reflection, Stoic and Exist. The goal was to take the best of each into Dawnward, not to clone any of them. Everything was built fresh from public sources, with no competitor code, assets, copy or prompts.

## The answer

**Why would someone open Dawnward tomorrow instead of Rosebud?** Because tomorrow's steps come from what you actually said tonight, and you can see the sentence.

- Every competitor remembers you, and users love that. None of them shows reliably where a memory came from or lets you fix it.
- Dawnward now quotes the evening behind every morning step, checks each quote word for word, and lets you leave any evening out and bring it back.

## What changed in the product (this branch)

| | What | Files |
|---|---|---|
| F1 | Morning steps and tonight's question show "From your evening, Thursday 29 October" with your own words. The server keeps a quote only if it's verbatim, whole-word, and from one of your recent evenings. Invented words are dropped. | `server/src/model/provenance.ts`, `apps/mobile/lib/quote.tsx`, `app/(tabs)/index.tsx` |
| F2 | **Your evenings**: every evening word for word, with search. Reached from You via "Your evenings, in your own words". | `server/src/routes/evenings.ts`, `apps/mobile/app/evenings.tsx` |
| F3 | **Leave this out / Bring it back**, with undo. Beliefs that rest only on that evening are hidden from you and from the plan, never deleted. | `migrations/0006_evenings.sql`, `server/src/model/exclusions.ts` |
| B1 | Fixed: the web build could not send PATCH or DELETE requests. That covered account deletion, settings and ticking steps. | `server/src/index.ts` |

## Results

- **Tests:**
  - Server unit tests went from 15 to 23 and integration tests from 25 to 33. All pass.
  - Server and app type-check cleanly.
  - A Chromium click-through at phone width passes (`test-report.md`).
- **Parity** against everything the five apps offer together went from **43.8** to **57.8**, with must-haves from 5 to 7 of 10 (`parity.md`).
- **Contrast:** 0 failures across the screen's 12 colour pairs, after one fix (`design/tokens.json`).
- **Brand sweep:** clean in all product code (`brand.md`).
- **Not tested:**
  - a real phone;
  - VoiceOver or TalkBack;
  - the real AI model (the tests use the deterministic test double);
  - production.

## Documents (in skill order)

| Step | File |
|---|---|
| recon | `recon/<app>.md`, `recon/<app>-features.csv` (one per app) |
| matrix | `features.csv`: 40 capabilities, which apps have each, and Dawnward's status |
| architect, backend | `architecture.md` |
| design | `design/tokens.json` plus the contrast result |
| build, test, diff | `test-report.md`, `parity.md` |
| entrepreneur | `feedback.md` (388 reviews ranked), `fixes.md` (what they hate, what is missing, the fix plan, the angle), `themes.json` |
| brand | `brand.md`, `brand.json` |
| launch | `launch/listing.json` (lints clean), `launch/pricing.md`, `launch/landing.md` (drafts only) |
| deploy | `deploy.md`: preflight, stopped at the gate |

## Kept out of the repo on purpose

The raw review corpus (388 rows of verbatim review text) and the browser screenshots stay in the session scratchpad. Only short, linked quotes appear in these documents.

## Needs your decision

1. **D5 test tools**, so Phase 1 can make words impossible to lose (F4). Lost recordings are the lowest-rated complaint across all five apps.
2. **D6 device testing**, set up by you.
3. **Pricing** (`launch/pricing.md`): one plan, no caps, privacy always free.
4. **App lock** (F6) needs one package, `expo-local-authentication`, MIT.
5. **The angle**: trust, in a calm tone (`fixes.md`). Your yes before it shapes the site or films.

**Nothing was deployed, published, sent or paid for.**
