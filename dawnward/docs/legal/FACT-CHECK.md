# Privacy policy and terms: claims checked against the code (2 Nov 2026)

**The drafts** (`privacy-policy-DRAFT.md`, `terms-of-use-DRAFT.md`) were written in ChatGPT for Bianno (Job 2). They are marked "not ready to publish" and have 8 and 11 [LAWYER CHECK] notes. **They are not in the app,** and shouldn't be until a lawyer has resolved those notes and the mismatches below. This page is for that lawyer: what the code actually does, checked on branch `claude/becoming-product-brief-45v3ua`.

## Mismatches to fix (in the policy, the app, or both) before publishing
| # | The drafts say | The code does | Suggested fix |
|---|---|---|---|
| 1 | Without an account, "nothing is sent anywhere" | **Speak** in the web app uses the browser's own speech recognition (`SpeechRecognition` in `experience/src/home.js`). In Chrome that audio goes to Google's servers; other browsers differ. Everything else stays on the device. | Either label Speak ("Your browser turns speech into text; in Chrome, Google does this") or turn it off without an account, then say so in the policy. **Decision for Bianno.** |
| 2 | "Reflections are sent to Anthropic's Claude API to generate a reply" | With an account, the server (`server/src/intelligence/anthropic.ts`) also sends text to Claude for: a **safety check** on each entry, daily plans, debrief extraction, onboarding, chapters, weekly deep reviews, and a **nightly job** that works over stored entries in the background (`server/src/jobs/nightly.ts`). | Describe every purpose, including the background processing, in §3 and §4 |
| 3 | You must be 16 or over | **No age check exists** in the web or phone app | Add an age confirmation at sign-up (and possibly on first open), or change the policy |
| 4 | Crisis information "when someone writes about self-harm" | Without an account: a **keyword list** (`DISTRESS` in `home.js`, also used in expeditions). With an account: a Claude **safety triage**. No human review, no alerts, no emergency contact. | The terms' wording ("may miss relevant content") is right; add the two mechanisms, and that the AI check sends text to Anthropic |
| 5 | Voice goes to ElevenLabs | True **only with an account**, through the server (`server/src/intelligence/transcription.ts`). Without one, see #1 | Make the split explicit |
| 6 | "Railway, EU region" | Nothing in the code fixes the region; it's chosen when the project is set up (`YOUR-TODO.md` step 3 says pick EU) | Confirm in the Railway dashboard once deployed |
| 7 | "Export everything and delete everything from inside the app" | Without an account: **true** (You › Your data: export file, Delete everything). With an account: `DELETE /account` deletes the user row and its linked data. **Backups and provider-held copies aren't covered,** and the export covers device data | The lawyer's retention note (§6) stands; state backup and provider timings |
| 8 | "No advertising or tracking" | **True as far as checked:** no analytics, ad or crash-reporting code found in the web app or server; fonts are self-hosted (`fonts.css`); the only external request is the account API. Outbound links (Wisdom Library sources, findahelpline.com, Instagram) are plain links, opened only if tapped | Keep; re-check before each release |
| 9 | Sensitive data needs separate explicit consent (Art. 9) | **No consent step exists** | Needs a consent screen before an account stores reflections; design it with the lawyer |
| 10 | Terms "accepted" | No acceptance step, link or saved version exists | Add links in You › Privacy, plus acceptance at sign-up |

## True as written
- Payments: none exist.
- Some content is labelled philosophy or practice (Wisdom Library evidence labels).
- AI replies can be wrong; the app doesn't claim to be therapy.

## Not checked here
- The phone app (`apps/mobile`): built, but not examined for this page.
- Providers' data-processing agreements, subprocessors and transfer safeguards. Those are contracts, not code.
