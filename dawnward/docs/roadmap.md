# Dawnward — Build Roadmap

> What Claude builds autonomously, in order, before the owner checklist is
> touched. Every phase follows the design direction (`design-direction.md`)
> and the craft loop; every phase ends with tests passing, screenshots taken,
> and a push. Nothing here publishes, sends, or pays — those live in the
> owner checklist.

## Phase A — Deepen the daily magic
The loop works; make it feel inevitable.

1. **Campaign surface.** A campaign screen: title, mission, why, milestones
   with the day-14 revision visible as a promise ("we revise this together
   on day 14"), and graceful abandon (exit reflection invited, never
   guilted). Reachable from Today's BUILD slot.
2. **Correction sheet.** "That's not right" currently sets aside; add the
   optional one-field correction ("say it in your words") wired to the
   existing supersede endpoint — the full spec 02 §6 loop in the UI.
3. **The model visibly learns.** When nightly integration promotes an
   assertion to probable, queue a one-time gentle surfacing on the next
   morning screen: "I'm starting to understand something about you," with
   the evidence, once, dismissible forever. Endpoint + UI + test.
4. **Weekly review reveal.** The deep pass currently writes to the database
   silently; give its verdict the title-card reveal treatment (sacred
   moment #3) on the first open after it runs.

## Phase B — Trust infrastructure
1. **Device auth.** Replace the dev bootstrap: device-token registration,
   signed session tokens, per-user scoping on every route. (Email
   magic-codes activate later with owner item 4.)
2. **Consent screens.** Onboarding gains the unbundled Article-9 consent
   step and the challenge opt-in question (spec 04 §3), stored in the
   consent ledger.
3. **Data rights in the app.** Export (JSON + readable HTML) and
   delete-account endpoints wired to the existing propagation semantics,
   surfaced in a quiet Settings screen alongside presence controls
   (touchpoint times, weekly digest opt-in).

## Phase C — The sky comes alive
1. **The constellation.** Milestone screens (campaign, weekly review) gain
   the parallax evidence field: every star a real recorded moment,
   positioned by domain, brightening with confidence. Canvas-based, 90%
   darkness held, reduced-motion honored.
2. **Rest-day + re-entry polish.** The two most character-defining screens
   get their own compositions rather than reusing the plan layout.
3. **App icon + splash.** Designed in the visual language (night ground,
   gold point of light), generated at all required sizes.

## Phase D — Ship readiness
1. **CI.** GitHub Actions: typecheck, unit + integration tests (Postgres
   service container), eval harness in mock mode. Red builds block merges.
2. **Seed/demo mode.** One command loads a rich fixture user so any screen
   can be demoed with a lived-in model — also what store screenshots and the
   landing page will use.
3. **Landing page draft.** One page in the Dawnward visual language: the
   promise, the four surfaces, the philosophy, a waitlist form (form goes
   live only after owner items 5 and 9).

Then: the owner checklist (`owner-checklist.md`), top to bottom, together.
