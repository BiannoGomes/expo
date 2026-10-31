# Recon map: Reflection (iOS, iPadOS, macOS, visionOS, Android, web)

## Scope

Reflection: AI Journal & Coach, by Journal Better Inc. (reflection.app). App Store id 1504547616, Google Play package app.reflection.reflection, web app at web.reflection.app. Public sources only: marketing site, FAQ, premium page, changelog, privacy policy and terms, App Store and Google Play listings (including the reviews those pages show), Hacker News Algolia. No login, no sign-up, no paywall passed, no screenshots or images saved, no JavaScript bundles read. Purpose: learn from Reflection for Dawnward (an evening-debrief reflection app), not to clone it.

Evidence labels: **V** verified (help/FAQ, changelog, store listing feature text, or privacy policy describing actual behaviour), **M** marketing claim only, **R** reported by users in reviews, **A** my assumption.

## Date

2026-10-31

## Sources

| # | Source | URL | Notes |
|---|---|---|---|
| 1 | Marketing homepage | https://www.reflection.app/ | Feature list, privacy claims ("AES-256 at rest", "never used to train AI models"), FAQ snippet naming Google Gemini. Read 2026-10-31. |
| 2 | Premium / pricing page | https://www.reflection.app/premium | Free vs Premium table, $8/month, $5.75/month billed annually, 7-day trial. Page FAQ block contains lorem ipsum placeholder text. |
| 3 | FAQ (help centre; faq.reflection.app 301-redirects here) | https://www.reflection.app/faq | Offline, limited syncing, encryption, Gemini, export, deletion, plan limits, Voice Call platforms. |
| 4 | Changelog index (6.14 to 6.29) | https://www.reflection.app/changelog | Ten entries on the first page; older ones not read. |
| 5 | Changelog 6.29 detail | https://www.reflection.app/changelog/steadier-ai-stronger-search-and-entries-that-carry-over | AI retry on network drop, search on large journals, WebAssembly web app. |
| 6 | App Store listing (US) and version history 6.05 to 6.29 | https://apps.apple.com/us/app/reflection-ai-journal-coach/id1504547616 | Description, IAP prices, privacy nutrition labels, release notes back to May 2025. 4.7 from 1.1K ratings (US). Latest iOS version 6.29.0, 2026-09-02. |
| 7 | iTunes lookup API | https://itunes.apple.com/lookup?id=1504547616 | Confirms developer Journal Better Inc., seller URL reflection.app, first release 2020-08-05. |
| 8 | Google Play listing | https://play.google.com/store/apps/details?id=app.reflection.reflection | "NEW IN REFLECTION 7" redesign text, Data safety section, 4.3 stars, 2.42K reviews, 100K+ downloads, updated 2026-10-26. |
| 9 | Feature page: AI Coach (Depth) | https://www.reflection.app/feature/depth-ai-companion | One follow-up question drawn from the entry just written. |
| 10 | Feature page: Ask Your Journal | https://www.reflection.app/feature/ask-your-journal | Plain-language questions over all entries. |
| 11 | Feature page: Voice Call | https://www.reflection.app/feature/voice-call | Spoken back-and-forth, transcript saved; iPhone, iPad, Android. |
| 12 | Guides library | https://www.reflection.app/journal-prompts-guides-library | 16 tags, 6 collections, featured creators, "100+" guides. |
| 13 | Single guide page | https://www.reflection.app/journaling-prompts-guides/3-minute-gratitude-check | Structure of one guide: creator bio, description, 6 numbered prompts, 10 tags, "Open Guide in App". |
| 14 | Guided monthly review page | https://www.reflection.app/guided-monthly-review | Three parts; six life areas Mind, Body, Soul, Work, Play, Love; open-ended, no numeric scores seen. |
| 15 | Privacy policy and terms | https://www.reflection.app/terms-privacy-policy | Names Google Gemini as "AI Partner"; Google Analytics, Meta, RevenueCat, Klaviyo, Stripe; terms header dated 2025-09-04. |
| 16 | Apple customer reviews RSS | https://itunes.apple.com/us/rss/customerreviews/page=1/id=1504547616/sortBy=mostRecent/json | Returned zero entries for pages 1 to 3, sortBy mostRecent and mostHelpful, and for ca, au, gb, in storefronts. The same feed returned 50 entries for another app, so the feed works but is empty for this app. Not usable. |
| 17 | App Store "see all reviews" pages, 11 storefronts (us, gb, ca, au, nz, in, ie, sg, za, ph, ae) | https://apps.apple.com/{cc}/app/id1504547616?see-all=reviews | 81 unique reviews in total. Apple shows a selection per storefront, not a full recent-first list, so the sample skews positive. |
| 18 | Google Play pages, 5 country variants (US, GB, CA, AU, IN) | https://play.google.com/store/apps/details?id=app.reflection.reflection&hl=en_GB&gl=GB | 3 reviews shown per page, 9 unique in total. |
| 19 | Hacker News Algolia | https://hn.algolia.com/api/v1/search?query=reflection.app | Only founder posts (Show HN 2020, Depth launch 2023 "powered by OpenAI", Flutter blog). No user reviews. |
| 20 | Trustpilot | https://www.trustpilot.com/review/reflection.app | 404 via WebFetch, 403 bot check via curl. No data. |
| 21 | Product Hunt | https://www.producthunt.com/products/reflection-app | 403. No data. |
| 22 | Reddit | n/a | Blocked from this network by rule; not attempted. |

## Core loop

Open the app to a Today page with a fresh prompt, write or speak an entry, get an inline AI coach reply or follow-up question inside the entry, see post-entry insights (patterns, action items), and later look back through AI search, Insights and auto-generated weekly, monthly and annual reviews.

## Screens

| ID | Screen | How reached | Purpose | Key components | States seen | Evidence |
|---|---|---|---|---|---|---|
| S01 | Personalised onboarding | First launch | Collect goals, discovery source, set up first entry | Question steps, "Other Discovery Source" option, skip to journal without account | No-account mode (6.05) | V, App Store notes 6.05, 6.06, 6.12 |
| S02 | Sign in / sign up | Onboarding or Settings | Apple, Google, email auth | Last-used method label per device, Forgot Password shown on empty password | Error states, Google sign-in error messages | V, changelog 6.24, 6.29 |
| S03 | Today | App home tab | Daily entry point | Personalised welcome, daily question or prompt that stays the same all day, writing streak, quick actions (photo, inspiration, template) | New-user empty state; AI prompt retries on network drop | V, App Store notes 6.0.x, changelog 6.24, 6.29; Play listing |
| S04 | Entry editor | + button, Today quick action, Spotlight, share sheet | Write the entry | Rich text, photos (1 free, up to 10 Premium), one + button for photos, voice, scan, templates, prompts (v7), undo and redo, toolbar that fades while typing on desktop, Focus Mode with ambient sound (v7), date picker, autosave | Draft recovery, failed-save keeps page open, offline editing | V, changelog 6.19, 6.21, 6.24; App Store notes 6.12; Play "What's new" |
| S05 | Inline coach / Instant Chat | Press Enter or Return in an entry | Coach replies on the next line of the entry | Chat lines woven into entry, actions Go Deeper, Get Perspective, Coach Me, Action Items | Retry on network loss; "friendlier messages when things go wrong" | V, changelog 6.21, 6.29; Play listing; App Store notes 6.25.0 |
| S06 | Depth AI options | AI button in editor | Follow-up questions, summaries, feedback | Personalised follow-up question, AI Quick Actions bar (can be disabled), report a problematic AI response | Opt-out mode for a traditional editor | V, App Store notes 6.17, 6.22 |
| S07 | Voice journaling recorder | Mic in editor toolbar | Speak an entry, transcribe | Inline recorder, real-time waveform, pause and resume, playback with scrubbing and speed, "Upload audio", 10-minute limit, spoken "new paragraph" | Interrupted recording recovery, real-time backup, transcription timeout errors | V, changelog 6.18, 6.23, 6.26, 6.27; App Store notes 6.24.0, 6.25.0 |
| S08 | Voice Call (Coach) | Coach or Voice Call button | Talk it through aloud with an AI voice | Live call UI, transcript or summary saved into the entry on hang-up | Long-session handling | V (FAQ: iPhone, iPad, Android only; Play: Premium); changelog 6.18, 6.20, 6.27 |
| S09 | Post-entry insights | After saving an entry | Immediate reflection on the entry | Summary, Patterns, Action Items | Action Items "honor your stated constraints, with no invented names" | V, App Store notes 6.08, 6.15, 6.27.0 |
| S10 | Search / Ask Your Journal | Search tab, long-press app icon shortcut, Insights shortcut | Keyword and natural-language questions over all entries | Conversational answer with dates, follow-up questions with context, auto-scroll to answer | Large-journal timeouts fixed in 6.29 | V, App Store notes 6.0.x, 6.17, 6.28.0, 6.29.0; Play listing |
| S11 | Insights | Insights tab | Trends over time | AI themes, interactive calendar of writing activity, stats, sentiment over time, emotional landscape map, life domains, consistency view | Empty state for new users | V, changelog 6.28; App Store notes 6.0.x, 6.14 |
| S12 | Guides library | Guides tab | Browse 100+ guided journals | Featured, tags (16 on web), collections (6), featured creators, latest, search by creator, title or topic, recommendations | Desktop horizontal scroll bug | V, web library, App Store notes 6.08, 6.18; R (us 2025-09-05) |
| S13 | Guide or Journey player | Open a guide | Prompt-by-prompt or multi-day program | Creator bio, description, numbered prompts, multi-day Journeys (14-day Reflect & Reset), alternate gentler prompt on heavy days | Premium gate on most guides | V, guide page, changelog 6.20, 6.27 |
| S14 | Reviews (weekly, monthly, annual) | Look Back or reminders | Auto-generated recaps from past entries | Themes, wellness trends, top moments, growth patterns, bookmarked entries prioritised, editable, shareable | Week-boundary and DST date bugs fixed | V, App Store notes 6.16, 6.17, 6.19; changelog 6.21 |
| S15 | Look Back | Tab or Today | Revisit memories | Tabs auto-selected by relevance | n/a | V, App Store notes 6.14 |
| S16 | Templates and tags | Editor, Settings | Structure and organise entries | Custom quick templates (named), tag chips with usage counts, personalised tag suggestions, reserved system tags | n/a | V, App Store notes 6.0.10, 6.17, 6.27 |
| S17 | Scan handwriting | + button | Photograph paper pages, AI transcribes | Camera, transcription review | Accuracy improvements | V, App Store notes 6.22, 6.26 |
| S18 | Paywall and Customer Centre | Locked features, banners, Settings | Upsell and manage subscription | Monthly, annual, lifetime options, 7-day trial, all options visible on paywall, web-upgrade fallback on Android | Repeated popups reported | V, changelog 6.24, 6.28; App Store notes 6.08; R (gb 2026-05-01) |
| S19 | Settings | Gear icon | Account and privacy controls | AI off toggle, private entries excluded from AI, app lock (Face ID, Touch ID, PIN), PIN-protected entries, reminders, dark mode and themes, email change with verification, profile photo, delete account, MCP keys | n/a | V, FAQ, changelog 6.21, 6.27, 6.28 |
| S20 | Import and export | Settings | Data portability | Import Day One, CSV; export zip of JSON and CSV (free), PDF (Premium) by emailed link valid 24 hours | n/a | V, FAQ, changelog 6.18 |
| S21 | Depth long-term memory | Settings or Depth | What the AI remembers about you | Editable memory list | n/a | V, App Store notes 6.08 (detail of UI unknown, A) |
| S22 | Private share link | Entry menu | Share one entry by secure link | Link generation, web view of the entry | n/a | M, homepage feature list |
| S23 | Catch up from photos | + button (v7, Android) | Turn missed days into entries from the photo library | Photo picker by date | n/a | V, Play "What's new" |
| S24 | App lock | Launch with lock enabled | Biometric or PIN gate | Face ID, Touch ID, fingerprint, PIN pad | Improved PIN experience | V, App Store description, notes 6.14 |

## Flows

| ID | Goal | Screens | Happy-path taps (if knowable) | Edge cases |
|---|---|---|---|---|
| F01 | First run to first entry | S01, S03, S04 | Open, answer onboarding, start journaling without account, write | Sign-in failures (R, gb 2025-08-14); account created later (A) |
| F02 | Quick written entry | S03, S04, S09 | Open, tap prompt or +, type, save, read insights (about 3 taps, A) | Offline save then sync (V, FAQ); failed save keeps page open (V, 6.24) |
| F03 | Quick capture from outside the app | S04, S10 | iOS Spotlight new entry; share text from any app; long-press icon opens Search | No home-screen widget found (A, absent from all sources; R, ph 2025-10-04 asks for one) |
| F04 | Voice entry | S07, S04 | Mic, speak, stop, transcript lands in entry | Phone sleep or crash loses recording (R, ca 2026-04-23); auto backup and recovery (V, 6.12 era notes, 6.25.0) |
| F05 | Coach while writing | S04, S05 | Write, press Enter, coach replies on next line, keep writing | Network drop auto-retry (V, 6.29); AI action deleted text (R, za 2024-12-04) |
| F06 | Voice Call | S08, S04 | Start call, talk, hang up, summary written into entry | Mobile only (V, FAQ); length limits requested (R, Play 2026-08-25) |
| F07 | Ask your journal | S10 | Search, type a question, read answer with dates, ask follow-up | Large journals timed out before 6.29 (V) |
| F08 | Guided journey | S12, S13, S04 | Browse or search, open guide, answer prompt, return next day | Premium gate (V, FAQ); heavy-day alternate prompt (V, 6.27) |
| F09 | Periodic review | S14, S15 | Open weekly, monthly or annual review, read generated draft, edit, share | User says monthly and yearly reflection was removed in an update (R, ca 2026-02-22) |
| F10 | Keep an entry from AI | S04, S19 | Mark entry Private, or toggle all AI off | Private entries vanish from search, insights, reviews (V, 6.21) |
| F11 | Scan paper journal | S17, S04 | +, Scan, photograph, confirm transcription | Premium only (V, FAQ) |
| F12 | Export or delete | S19, S20 | Settings, Export, emailed link; or Settings, Delete Account | Must cancel subscription first; team cannot delete for you (V, FAQ) |
| F13 | Upgrade | S18 | Locked feature, paywall, trial | Upsell nags (R); regional and lifetime pricing (V) |
| F14 | Cross-device sync | All | Sign in on second device, entries appear | Free plan: other platform shows only the 10 most recent entries (V, FAQ); Mac sync needed manual trigger (R, gb 2025-08-14) |
| F15 | Connect MCP | S19 | Generate key, paste URL into Claude or ChatGPT | Premium; read and write access (V, FAQ) |

## Components

Prompt card (Today), entry editor with rich text and toolbar, single + insert menu (v7), inline coach chat line, AI quick-action bar (Go Deeper, Get Perspective, Coach Me, Action Items, Summarize), report-AI-response control, voice recorder with waveform and pause/resume, audio player with scrubbing and speed, Voice Call screen, post-entry insight panel (Summary, Patterns, Action Items), conversational search with follow-ups, Insights charts (sentiment line, emotional landscape map, life domains, consistency calendar), writing streak counter, tag chips with counts, template picker, guide card (title, creator, one-line description), guide detail with creator bio and numbered prompts, multi-day journey progress, review document (weekly, monthly, annual) with photos and bookmarks, private-entry indicator, PIN pad and biometric lock, paywall sheet, in-app banners and toasts with undo, nine colour themes (v7), Focus Mode with ambient sound (v7). Evidence: V from changelog and store text unless noted; exact visual design not seen (no screenshots used).

## Inferred data model

| Entity | Fields | Evidence | Confidence |
|---|---|---|---|
| User | id, email, auth provider (Apple, Google, email), name, profile photo, language, tone preference, AI enabled flag, last sign-in method per device | V: changelog 6.24, 6.28, 6.29; App Store privacy labels | high |
| Subscription | tier (free, monthly, annual, lifetime), store (Apple, Google, Stripe web), trial, status | V: IAP list, FAQ, privacy policy (RevenueCat, Stripe) | high |
| Entry | id, user_id, date (timezone-aware), title, rich-text body (HTML), word count, private flag, PIN-protected flag, bookmarked flag, source (typed, voice, scan, MCP, call), created/updated | V: 6.12 notes ("malformed HTML in journal entries"), 6.21, 6.24, 6.17 | high |
| Attachment | entry_id, type (photo, audio), url, order | V: FAQ photo limits, voice blocks in PDF export (6.0.10) | high |
| VoiceRecording | entry_id, audio, duration (max 10 min), transcript, language, backup state | V: 6.18, 6.25.0, 6.12 era notes | medium |
| CoachMessage | entry_id, role, text, action type (go deeper, perspective, coach me, action items), timestamp | V: Play listing, 6.21 | medium |
| CoachSession (Voice Call) | id, entry_id, transcript, summary, duration | V: 6.20 ("ends with a summary instead of a raw transcript") | medium |
| EntryInsight | entry_id, summary, patterns, action_items, themes, sentiment | V: 6.15, 6.27, 6.28 | medium |
| Memory | user_id, items (editable) | V: 6.08 "editable long-term memory for Depth" | medium |
| Tag | id, name, usage count, system-reserved flag | V: 6.17, 6.12 era notes | high |
| Template | id, name, body, tags, quick flag | V: 6.08, 6.27 | high |
| Guide | id, title, creator, creator bio, description, tags, collection, premium flag, prompts[] | V: guide page; premium flag A | high |
| Journey / GuideProgress | user_id, guide_id, day index, completed prompts | V: multi-day Journeys (6.20); fields A | medium |
| Review | user_id, period (week, month, year), generated content, edited content, photos, share link | V: 6.16, 6.17, 6.19 | medium |
| DailyPrompt | user_id, date, prompt text, personalised flag | V: 6.05, 6.24 | medium |
| Reminder | user_id, schedule | V: homepage, FAQ | medium |
| ShareLink | entry_id, token | M: homepage | guess |
| McpKey | user_id, key, scopes (read, write) | V: FAQ | medium |
| Streak / Stats | user_id, current streak, counts | V: App Store description, Play listing | medium |

## Pricing

Read 2026-10-31.

| Tier | Price | Source |
|---|---|---|
| Free Forever | $0. Unlimited entries, daily and personalised prompts, voice journaling, one photo per entry, a "daily allowance" of AI coaching, insights and search, limited syncing (other platform shows only 10 most recent entries) | https://www.reflection.app/premium and https://www.reflection.app/faq (V) |
| Premium monthly | $8.00 per month (also a $5.99 monthly IAP listed) | https://www.reflection.app/premium; App Store IAP list (V) |
| Premium annual | $69.00 per year, shown as $5.75 per month billed annually; $47.99 and $35.99 "Launch Special" annual IAPs also listed | Premium page; App Store IAP list (V) |
| Lifetime | $249.99 ("normally $250"); $124.99 "Lifetime Premium Special" IAP | App Store IAP list; FAQ (V) |
| Trial | 7 days on monthly and annual | FAQ (V) |
| Sliding scale / "scholarship" | Lower price on request | R only (us 2025-12-28 and us 2025-01-02 reviews) |
| Regional | GBP 20 per year reported; PHP 309 per month and 2490 per year reported | R (Play 2026-08-24; App Store ph 2022-11-04) |

## Privacy and AI model (what is verified)

- AI provider: Google Gemini on a paid tier. **V** (FAQ and privacy policy: "Currently we use Google Gemini as our AI Partner"). In 2023 the founder described Depth as "powered by OpenAI" (**V** historical, HN item 35197786), so the provider has changed at least once.
- Training: entries "never used to train or improve any AI model", including free accounts. **V** as policy statement (FAQ), although the privacy policy only says the paid API providers "do not train their models on user submitted data". It rests on the vendor's paid-tier terms, not on a technical control. Treat as **V** for stated policy, **A** that it holds for every AI feature.
- Encryption: AES-256 at rest and TLS 1.2+ in transit on Google Cloud. **V** (FAQ). Not end-to-end: the FAQ itself contrasts Reflection's "bank-level encryption" with Day One's end-to-end encryption, and server-side AI requires readable text. **A** that staff could technically access entries; the policy only says unauthorised reading "is forbidden".
- Certifications: "ISO/IEC 27001, SOC 1 & 2, GDPR compliant" refers to Google Cloud infrastructure, not to Reflection itself. **M**.
- AI controls: global AI off toggle (6.17 "AI Opt-out"), per-entry Private flag that excludes the entry from AI search, insights, themes and reviews (6.21), AI Quick Actions can be disabled (6.17), report problematic AI responses (6.22). **V**.
- Tracking and marketing: App Store label lists "Data Used to Track You: Identifiers"; privacy policy names Google Analytics, Meta/Facebook, RevenueCat, Klaviyo, advertising identifiers (IDFA, Android Advertising ID). **V**. Google Play Data safety says "No data shared with third parties" and declares Personal info and Audio. **V** but in tension with the policy naming Gemini as a recipient of entries (A: Google may treat processors as not "sharing").
- Deletion: in-app Settings, Delete Account, permanent. **V** (FAQ). Policy also allows email requests "in a reasonable time"; no retention periods stated. **V**.
- Offline: "You can write in Reflection without an internet connection", entries cached on each device and synced later. **V** (FAQ). Changelog 6.24 fixed a bug where "offline edits" could wipe local entries. **V**.
- MCP: Premium keys give "read and write access to your journal" from Claude, ChatGPT and other clients. **V** (FAQ, 6.26).
- Not a medical service disclaimer on Play. **V**. Changelog 6.27 says reflective entries "no longer trigger crisis prompts", so a crisis-detection layer exists. **V**.

## What cannot or should not be taken

- Guide content: the prompt texts of 100+ guides written by named creators (Seth Godin, Amber Rae, Jerry Colonna, Greater Good Science Center and others) are licensed or authored content. Do not copy prompts, guide titles such as "Reflect & Reset", or creator bios.
- Their AI prompts, system instructions, and the wording of coach actions ("Go Deeper", "Get Perspective", "Coach Me"), "Depth", "Instant Chat", "Ask Your Journal", "Look Back".
- The monthly review structure with life areas Mind, Body, Soul, Work, Play, Love (in use since about 2020). Dawnward's four worlds (Mind, Body, Soul, Future) overlap in three names; Dawnward must keep its own framing, visuals and copy and must not reuse their review wording or the Mind/Body/Soul question texts.
- Brand: name, logo, icon, colour themes, marketing copy, testimonials, "1M entries" style claims.
- Their review quotes for Dawnward marketing (only as internal research).
- Their user data or any content behind login.

## Size

- Company: Journal Better Inc., Wilmington DE address on Play. Founder posts on HN in 2020 (michaelrad573) and 2023 (daverad). "Small team" per App Store notes 6.16. **V**
- App Store US: 4.7 from about 1,115 ratings. **V** Google Play: 4.3 overall, 2.42K reviews, 100K+ downloads. **V** Marketing: "4.8 stars from 3,000+ reviews", "Over a million entries". **M**
- Built in Flutter (blog and 6.17 note "Flutter 3.38"); web compiled to WebAssembly (6.29). **V**
- Release cadence: roughly every 2 to 3 weeks across 2025 and 2026 (6.05 May 2025 to 6.29 Sept 2026, Reflection 7 on Android Oct 2026). **V**

## Lessons for Dawnward

1. **Reliability of capture is the trust floor, and losing words is the worst failure.** Two of the three 1-star App Store reviews in the sample are about lost content: "ive lost at least a dozen recordings" (R, https://apps.apple.com/ca/app/id1504547616?see-all=reviews#13987112413) and an AI summarize action that deleted a 2,000-word entry (R, https://apps.apple.com/za/app/id1504547616?see-all=reviews#12026124823). Their changelog spends most of 2026 on this: real-time voice backup and recovery, "offline edits no longer risk wiping your local entries" (V, https://www.reflection.app/changelog, 6.24), AI that retries on network drops (V, 6.29). Dawnward's evening talk must be saved locally first, recorded in chunks that survive the phone sleeping, and AI must never edit or replace the user's words in place.
2. **An inline coach that asks one question from your own entry is the loved feature.** Users single out AI follow-ups: "The feedback from AI is a game changer" (R, https://apps.apple.com/us/app/id1504547616?see-all=reviews#13912924642); "a combination of a friend and a therapist asking questions" (R, https://play.google.com/store/apps/details?id=app.reflection.reflection&reviewId=0317867a-9192-49e6-93a8-bda2ac385428). The feature page describes one follow-up "drawn from the entry you just wrote, not from a fixed list" (M, https://www.reflection.app/feature/depth-ai-companion). Dawnward's morning three steps should keep that property: visibly built from the user's own words, with a quote back to the sentence each step came from.
3. **Granular AI consent works and is cheap to build.** Global AI off, per-entry Private that removes an entry from AI search, insights and reviews, editable long-term memory, and a report-response button (V, https://www.reflection.app/changelog 6.21; App Store notes 6.08, 6.17, 6.22). This maps directly onto Dawnward's "That's not right" and "Why I think this": the Personal Model should be editable memory, and any entry can be excluded from it.
4. **Action items must not invent facts.** Reflection had to ship a fix so Action Items "stay forward-looking and honor your stated constraints, with no invented names" (V, App Store notes 6.27.0, https://apps.apple.com/us/app/reflection-ai-journal-coach/id1504547616). Dawnward's three steps need the same guard: no invented people, places or commitments, and respect for constraints the user stated.
5. **Users notice and resent upsell pressure more than price.** 7 of 90 reviews complain about paywalls, popups or price, for example "they keep trying to make you pay money" (R, https://play.google.com/store/apps/details?id=app.reflection.reflection&reviewId=c5642b8d-5e27-4d7e-b16b-7cc9a9d24da9) and "it keeps popping up with buy this by that" (R, https://apps.apple.com/gb/app/id1504547616?see-all=reviews#14016953297). A user also disliked being asked for a rating an hour after install (R, https://apps.apple.com/us/app/id1504547616?see-all=reviews#13102286180). Gating privacy (app lock, private entries) behind Premium drew a complaint (R, https://apps.apple.com/gb/app/id1504547616?see-all=reviews#9186441891). Dawnward should keep privacy controls free and ask for payment at one calm moment, not through banners.
6. **Quick capture paths beyond the app icon matter.** Reflection added Spotlight new entry, share-to-journal, a long-press icon shortcut to Search, and "catch up from your photos" for missed days (V, changelog 6.27, 6.28; Play "What's new"). No home-screen widget exists in any source, and a user asked for one (R, https://apps.apple.com/ph/app/id1504547616?see-all=reviews#13222801549). An evening reminder widget or lock-screen action that opens straight into recording is an open gap.
7. **Don't remove a loved ritual without warning.** A user of 2+ years left a 1-star after monthly and yearly reflection changed in an update (R, https://apps.apple.com/ca/app/id1504547616?see-all=reviews#13777701678). Dawnward should version its morning output format and give notice before changing it.
8. **Be precise about privacy.** Reflection's claims are mostly backed (V, FAQ) but rest on Gemini paid-tier terms, are not end-to-end, and sit beside a tracking label and Meta and Klaviyo in the privacy policy (V, https://www.reflection.app/terms-privacy-policy). Dawnward can win by being plainer about the facts: which model, what leaves the device, no ad trackers.

**Conflicts with Dawnward's rules (no streaks, scores, badges, guilt, fabricated proof):**
- Writing streaks are a listed feature: "See your writing streak and stats at a glance to stay motivated" (V, App Store description) and "keep a writing streak" (V, Play listing). A user says "Insights make me want to keep my streak going!" (R, https://apps.apple.com/ph/app/id1504547616?see-all=reviews#9487384800). Dawnward must not copy this. Note another user praised that "Missing a day doesn't feel like a failure" (R, https://apps.apple.com/ph/app/id1504547616?see-all=reviews#13222801549). That is the experience Dawnward should aim for, without a streak.
- "Journaling consistency view" and calendar of writing activity in Insights (V, changelog 6.28) are close to a score. Dawnward should avoid any consistency metric.
- Social proof on the site ("4.8 stars from 3,000+ reviews", "1M entries") does not match the store figures (4.7 from 1.1K on US App Store, 4.3 on Play). It is not proven false, because it may combine all storefronts, but Dawnward should only publish figures it can link to.
- In-app review prompts in every release note and on first use ("Love using Reflection? We'd appreciate a review") lean on obligation. Dawnward should not ask for reviews during reflection.
