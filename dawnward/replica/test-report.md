# Test report (replica-test, replica-diff)

Date: 2026-10-31.

**What was tested:** the server against a local Postgres 16, using the deterministic test double for the AI; the app type check; and the app's web build in Chromium at 390 × 844.

**What was not tested:** a real phone, VoiceOver or TalkBack, the real AI model, or a production database.

## Automated

| Suite | Before this change | After |
|---|---|---|
| Server unit (`npm test`) | 15 pass | **23 pass**, 0 fail |
| Server integration (`npm run test:integration`) | 25 pass | **33 pass**, 0 fail |
| Server typecheck | clean | clean |
| App typecheck (`tsc --noEmit`) | not run before (no dependencies installed) | clean |

**New tests:**
- `server/test/provenance.test.ts` covers the quote check:
  - exact quotes are accepted;
  - whitespace, case and curly quotes are tolerated, and the original text is returned;
  - paraphrase is dropped;
  - a quote cited to the wrong evening is dropped;
  - unknown evenings are dropped;
  - quotes that start or stop inside a word are dropped;
  - very short quotes and missing claims are dropped;
  - `attachSources` keeps every step and strips the raw claims.
- `server/test/integration/loop.test.ts`, "your evenings":
  - the list comes newest first;
  - search is literal, so `%` matches nothing;
  - another person gets an empty list and a 404 on leave out and bring back;
  - steps quote the right evening and invented words are dropped;
  - a left-out evening is never quoted and comes back on undo;
  - a belief resting only on a left-out evening is hidden from the model and the summary, survives a nightly pass, and is restored;
  - the constellation omits it.
- A "web clients" test checks that the CORS preflight allows PATCH and DELETE. It fails before the fix and passes after.

## Browser click-through (`scratchpad/e2e-evenings.cjs`, not committed)

| Check | Result |
|---|---|
| Today shows "From your evening" on the build step and the question | 2 of 2 |
| The quote the test AI invented ("words this person never said") is shown | 0 times (correct) |
| Your evenings lists the three demo evenings | 3 |
| Search "brother" | 1 result |
| Leave this out → "Left out" notice and card status | shown |
| Undo → back to "Leave this out" | yes |
| Search "zebra" → "None of your evenings mention" | shown |
| Tab from the search field | reaches "Leave out your evening of Friday, October 30" |

Screenshots are in the scratchpad (`shots/`). They use labelled demo data from the test AI and are not for marketing.

## Bugs

| ID | Severity | What | Status |
|---|---|---|---|
| B1 | S2 | The CORS default blocked every PATCH and DELETE from the web build: account deletion, settings, ticking a step, and Bring it back | **Fixed**, with a test |
| B2 | S3 | A quote could stop mid-word ("chapter befor"), which reads as a glitch and changes the words | **Fixed**: whole words only, with a test |
| B3 | S3 | The search field's edge was 1.25:1 against its background, under the 3:1 WCAG 1.4.11 minimum | **Fixed**: now 4.9:1 |
| B4 | S4 | React error #419 on the first load of Today when the plan is generated on the static web build | **Already there**: the build from before this change shows it too. Not caused by this change; left open. |

No S1 bugs are open.

## To check (not reproduced, not proven)

- Screen reader order on the evening card: the date, then the text, then the status, then the action. Needs VoiceOver.
- Long evenings with "Read all": the numberOfLines behaviour on Android.
- Search speed with more than 1,000 evenings (see the pg_trgm note in `architecture.md`).

## Round 2 (same day): no lost words, honest failures

**What changed:**
1. **Request timeouts.** Calls fail visibly instead of spinning forever: 20 s by default, 90 s for the model, 120 s for voice (`lib/api.ts`).
2. **Debrief send.** A failed send no longer shows "That's the day, witnessed. Sleep well". It says tonight isn't saved yet and keeps the words in the box.
3. **Voice.** The recording is kept until it's transcribed. If transcription fails, "Write my recording down" retries it, and "Speak it instead" is hidden so a new recording can't overwrite the kept one.
4. **Leaving the Debrief tab while recording** stops the microphone and writes down what was said, with a note.
5. **The listening dot** stays still when Reduce Motion is on.
6. **Onboarding.** A message that fails to send goes back into the box, and the bubble that looked sent is removed.
7. **Ticking a step.** A tick that fails to save is put back, with "That didn't save. Tap it again when you're connected." Before, it pretended to save and was silently lost.
8. **Accessibility:**
   - Step cards are checkboxes, with `aria-checked` so the done state reaches iOS, Android and the web. The web build exposed nothing before.
   - The debrief box, onboarding answer box, Send button, name field and Begin button now have labels or roles.
9. **The Debrief tab** shows the evening tonight's question came from, like Today does.
10. **Onboarding questions:** five long dashes removed (`packages/core/src/onboarding/chapters.ts`).

**Results:**
- Server unit 23 and integration 33 pass. Server and app type-check clean.
- Browser (`test/e2e-reliability.cjs` and `test/e2e-evenings.cjs`, Chromium with a simulated microphone): every check passes.

| Check | Result |
|---|---|
| Send fails | Error shown, no goodnight, words kept |
| Send retried | Goodnight shown, error gone |
| Transcription fails | Recording kept, retry offered, words arrive on retry |
| Leave the tab while recording | Mic stopped, words kept, note shown |
| Tick fails | Reverted, note shown; saves and reads as checked once online |
| Onboarding send fails | Words back in the box, fake bubble gone; sent on retry |
| Onboarding text | No long dash |

- React #419 still appears on first load. It's B4, already there before this work.

**Screenshots:** `test/shots/10` to `13`, using labelled demo data from the test AI.

**Still not covered:**
- A kept recording doesn't survive the app being closed.
- Recording stops if the phone sleeps (asked for in a Reflection review).
- Real-device and screen-reader passes.
