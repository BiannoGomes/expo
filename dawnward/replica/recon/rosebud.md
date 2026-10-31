# Recon map: Rosebud (iOS, Android, web)

## Scope

Public-source study of Rosebud (rosebud.app, "Rosebud: AI Journal & Diary", Just Imagine, Inc.) for Dawnward. Focus: long-term memory (what it keeps, how users see, edit or delete it, how it cites past entries), follow-up questions that build on earlier entries, voice journaling, goals, weekly insights, and the privacy and AI model. Purpose is to learn from features and user complaints, not to clone.

Method: marketing site, help centre (help.rosebud.app), App Store listing and Apple's official review RSS feed, Google Play data safety page, privacy policy, terms, company blog, TechCrunch, Trustpilot, Product Hunt, Hacker News Algolia API. No login, no sign-up, no paywall, no JavaScript bundles, no images saved. Reddit not attempted (blocked).

Evidence labels: **V** verified (help doc, store listing feature text, privacy policy describing behaviour), **M** marketing claim only, **R** reported by users in reviews, **A** my assumption.

## Date

2026-10-31

## Sources

| # | Source | URL | Notes |
|---|---|---|---|
| 1 | Marketing home page | https://www.rosebud.app/ | Feature blocks, pricing section, "HIPAA aligned" badge. Read 2026-10-31. /pricing returns 404. |
| 2 | Help centre index | https://help.rosebud.app/ | Full article tree (Getting started, Tools for growth, Daily journaling, AI Analysis, Account, About us). |
| 3 | Help: Long-term memory | https://help.rosebud.app/ai-analysis/long-term-memory | Memory behaviour, Bloom only, weak time sense, "Memory Precision Experiment". |
| 4 | Help: Learned Preferences | https://help.rosebud.app/ai-analysis/learned-preferences | Feedback-derived preferences, manageable in Settings or Persona Settings, can be disabled. |
| 5 | Help: AI Personalization | https://help.rosebud.app/ai-analysis/ai-personalization | Bio, personas (instructions, model, voice), persona library. |
| 6 | Help: Voice journaling | https://help.rosebud.app/tools-for-growth/voice-journaling | Transcription, hands-free, Auto stop timer, Glossary (10 words), voice change steps dated 2026-10-27. |
| 7 | Help: Weekly report | https://help.rosebud.app/ai-analysis/weekly-report | Sections, in-depth report above 1,500 words a week. |
| 8 | Help: Entry reflection | https://help.rosebud.app/ai-analysis/entry-reflection | One-line description only. |
| 9 | Help: Dig deeper | https://help.rosebud.app/tools-for-growth/dig-deeper | "Go deeper": Interactive and Focused modes. |
| 10 | Help: Ask Rosebud | https://help.rosebud.app/tools-for-growth/ask-rosebud | Answers include links to related journal entries. |
| 11 | Help: Morning intention | https://help.rosebud.app/daily-journaling/morning-intention | 3am to 12pm, three questions, editable prompts, "imagination". |
| 12 | Help: Evening reflection | https://help.rosebud.app/daily-journaling/evening-reflection | 12pm to 3am, Rose, Bud, Thorn questions. |
| 13 | Help: Streaks | https://help.rosebud.app/daily-journaling/streaks | Morning or evening check-in counts; change entry dates to keep a streak. |
| 14 | Help: Entry history | https://help.rosebud.app/daily-journaling/entry-history | History is "simple right now"; date change; editing previous entries "isn't possible yet". |
| 15 | Help: Notifications | https://help.rosebud.app/daily-journaling/notifications | Push, web push, SMS (US and Canada), personalised evening notification, midweek progress update. |
| 16 | Help: Custom journals | https://help.rosebud.app/daily-journaling/custom-journals | Create Journal, AI or own prompts, imagination level, favourites on Home. |
| 17 | Help: Personalized prompts | https://help.rosebud.app/tools-for-growth/personalized-prompts | Daily prompts from recent entries, Explore tab, bookmark. |
| 18 | Help: Happiness recipe | https://help.rosebud.app/tools-for-growth/happiness-recipe | Per-entry suggestions into goals; Add Goal; snooze or archive. |
| 19 | Help: Guiding Light | https://help.rosebud.app/tools-for-growth/guiding-light | Help when stuck: ideas, challenge, reframes, thinking traps. |
| 20 | Help: Auto-tagging | https://help.rosebud.app/ai-analysis/auto-tagging | Mood, relationships, life themes; not searchable yet. |
| 21 | Help: Usage limits | https://help.rosebud.app/ai-analysis/usage-limits | Weekly budget, Bloom vs Thrive, no rollover. |
| 22 | Help: Changes to the Free Plan | https://help.rosebud.app/account/changes-to-the-free-plan | Free plan retired 2026-09-30, tied to new memory system. |
| 23 | Help: Billing | https://help.rosebud.app/account/billing | Web, Apple and Google billing, cancellation. |
| 24 | Help: Export data | https://help.rosebud.app/account/export-data | Markdown export of entries. |
| 25 | Help: Delete your account | https://help.rosebud.app/account/delete-your-account | Deletes entries, goals, personalised prompts. |
| 26 | Help: Rosebud's limitations | https://help.rosebud.app/getting-started/rosebud's-limitations | Weak time sense, hallucinations, not therapy, crisis pointers. |
| 27 | Help: Roadmap | https://help.rosebud.app/getting-started/roadmap | Roadmap not public; Discord. |
| 28 | Help: ChatGPT vs. Rosebud | https://help.rosebud.app/comparison/chatgpt-vs.-rosebud | "Your input is not used to train future AI models." |
| 29 | Privacy policy | https://help.rosebud.app/about-us/privacy-policy | Last updated Sep 8, 2026. Providers, ZDR, BAAs, retention, staff access. |
| 30 | Terms of service | https://help.rosebud.app/about-us/terms-of-service | Ownership kept by user; no training clause; no date shown. |
| 31 | App Store listing and iTunes lookup | https://apps.apple.com/us/app/rosebud-ai-journal-diary/id6451135127 | Description, IAP prices, privacy label, version history. Rating 4.88 from 3,371 (search API, 2026-10-31). |
| 32 | Apple customer reviews RSS | https://itunes.apple.com/us/rss/customerreviews/page=3/id=6451135127/sortBy=mostRecent/json and .../page=1/.../sortBy=mostHelpful/json | Only these two pages returned entries. mostRecent pages 1 and 2 and mostHelpful pages 2 and 3 returned empty feeds after 4 spaced retries. |
| 33 | Google Play data safety | https://play.google.com/store/apps/datasafety?id=co.justimagine.rosebud&hl=en_US | Main Play listing page could not be read (truncated). |
| 34 | Rosebud blog: $6M raise | https://www.rosebud.app/blog/rosebud-raises-6m-to-expand-the-worlds-leading-ai-journal | Memory and privacy claims, user numbers (June 2025). |
| 35 | TechCrunch | https://techcrunch.com/2025/06/04/rosebud-lands-6m-to-scale-its-interactive-ai-journaling-app | Press: memory and voice were premium; no training claim. |
| 36 | Trustpilot | https://www.trustpilot.com/review/rosebud.app | 4.8, 226 reviews. Read via WebFetch, which returns only opening excerpts. |
| 37 | Trustpilot, 1 to 3 star filter | https://www.trustpilot.com/review/rosebud.app?stars=1&stars=2&stars=3 | Critical reviews, excerpts only. |
| 38 | Product Hunt reviews | https://www.producthunt.com/products/rosebud/reviews | 4.9 from 24 reviews, relative dates only (1 to 3 years ago); used for context, not in reviews.csv. |
| 39 | Hacker News Algolia | https://hn.algolia.com/api/v1/search?query=rosebud.app | One relevant comment. |
| 40 | Life Note review (competitor) | https://blog.mylifenote.ai/rosebud-review/ | Written by a competing app's founder, no subscription. Used only to cross-check; not used as evidence. |

Review notes: reviews.csv holds 124 reviews (97 App Store, 26 Trustpilot, 1 Hacker News). App Store URL format: https://apps.apple.com/us/app/id6451135127?see-all=reviews#<reviewId>, review id from the RSS feed; text is the review body, title not included. Trustpilot rows are opening excerpts only (WebFetch would not return full text), marked with " [...]", linked to the listing page because per-review URLs were not visible. One Trustpilot review about a "Scale 3" plan at $400 a month was left out because Rosebud journal has no such tier (A: it is about a different product). Some App Store texts contain long dashes; they are kept because the text is verbatim.

## Core loop

Check in morning or evening (type or talk), Rosebud reflects back and asks follow-up questions using what it remembers about you, the entry ends with a summary and suggested goals, and a weekly report rolls the week up into themes, moods and people.

## Screens

| ID | Screen | How reached | Purpose | Key components | States seen | Evidence |
|---|---|---|---|---|---|---|
| S01 | Home | App launch | Start points and goals | Morning or evening check-in card, favourited journals, goals list, "Add Goal" (mobile), "Add Ingredient" (web), personalised prompts | Morning window (3am to 12pm) vs evening window (12pm to 3am); goals active, snoozed, archived | V https://help.rosebud.app/tools-for-growth/happiness-recipe , https://help.rosebud.app/daily-journaling/custom-journals |
| S02 | Entry composer | Check-in card, prompt, journal, or blank entry | Write or speak an entry in a chat-like thread | Text field, mic, persona selector top-left, date field, "Go deeper", Guiding Light, add photo, edit previous user message (mobile) | Draft (web drafts do not sync to mobile), in progress, finished | V https://help.rosebud.app/ai-analysis/ai-personalization , https://help.rosebud.app/daily-journaling/entry-history |
| S03 | Morning Intention | Home, 3am to 12pm | Plan the day | Three questions (priority, worry, one kind act), editable prompts, imagination level | Available, completed (reminder skipped) | V https://help.rosebud.app/daily-journaling/morning-intention |
| S04 | Evening Reflection | Home or personalised notification, 12pm to 3am | Review the day | Rose (highlight), Thorn (tension), Bud (learned) questions, editable prompts | Available, completed | V https://help.rosebud.app/daily-journaling/evening-reflection |
| S05 | Entry reflection (end of entry) | Finish an entry | Mirror back the entry | Summary, key insights, Happiness Recipe or goal suggestions (editable before adding), tags (add or remove), haiku, quote; artwork on mobile | Mobile richer than web (R) | V https://help.rosebud.app/ai-analysis/entry-reflection ; R https://apps.apple.com/us/app/id6451135127?see-all=reviews#13936814131 |
| S06 | History / Entries | Tab or web Entries page | Browse past entries | List with digest per entry, highlight haiku and insights, change date, drafts first on web | No search, no calendar described; editing old entries not possible | V https://help.rosebud.app/daily-journaling/entry-history ; R https://apps.apple.com/us/app/id6451135127?see-all=reviews#11588403440 |
| S07 | Explore | Tab | Find prompts and journals | Personalised prompts (refreshed daily, removed once used), bookmark, guided journals | Empty prompt library after use (A) | V https://help.rosebud.app/tools-for-growth/personalized-prompts |
| S08 | Guided and custom journals | Explore or Create Journal | Structured journals (CBT, gratitude, IFS) and user-made journals | Journal list, Create Journal, AI-generated or own prompts, imagination slider, favourite | Favourited shows on Home | V https://help.rosebud.app/daily-journaling/custom-journals ; M https://www.rosebud.app/ |
| S09 | Ask Rosebud | Tool entry point | Ask questions about yourself | Question box, suggested questions, long answer with links to related entries | Answer improves with more entries | V https://help.rosebud.app/tools-for-growth/ask-rosebud |
| S10 | Weekly report | Notification (default Monday) or insights area | Roll up the week | Writing stats (words, entries, daily word count), Emotional landscape, Key themes, Cast of Characters, up to five key insights; in-depth version | Locked until enough writing; midweek "Progress Update"; in-depth above 1,500 words | V https://help.rosebud.app/ai-analysis/weekly-report , https://help.rosebud.app/daily-journaling/notifications |
| S11 | Goals / Happiness Recipe | Home | Keep goals and habits | Goals by category, Add Goal (AI asks for detail and suggests steps), swipe to snooze or archive, history kept; daily, weekly, monthly goals (R) | Active, snoozed, archived | V https://help.rosebud.app/tools-for-growth/happiness-recipe ; R https://apps.apple.com/us/app/id6451135127?see-all=reviews#12852119112 |
| S12 | Persona settings (mobile) | Settings or persona selector | Shape the AI | Instructions, AI model choice, Voice (preview, save), Auto stop timer (Low, Medium, High), Glossary (up to 10 words), Learned Preferences, persona library (Sage, Challenger, Connector, Gardener, Strategist) | Switching voice may block return to an old OpenAI voice | V https://help.rosebud.app/ai-analysis/ai-personalization , https://help.rosebud.app/tools-for-growth/voice-journaling |
| S13 | Settings | Gear icon | Account and app setup | Brief bio, Tailor your experience (web), Memory Precision Experiment, Daily Reminder, phone number for SMS, Time & Locale (week start), Export, Manage account, Delete account, Subscription (usage reset date), biometric lock | Web settings error on iMac (R, 2024) | V https://help.rosebud.app/ai-analysis/long-term-memory , https://help.rosebud.app/account/export-data ; R https://apps.apple.com/us/app/id6451135127?see-all=reviews#11682679572 |
| S14 | Subscription and paywall | Onboarding, limit hit, Settings | Sell Bloom or Thrive | Monthly vs annual, "Start Free Trial", "SAVE 30%", Thrive 2x and 5x (apps only), usage meter | Limit reached, warning at low remaining usage (R: warning at 2% left) | V https://help.rosebud.app/ai-analysis/usage-limits ; M https://www.rosebud.app/ ; R https://apps.apple.com/us/app/id6451135127?see-all=reviews#14222808375 |
| S15 | Voice / call mode | Mic in composer or persona | Real-time spoken conversation, spoken replies | Hands-free mode, auto stop, spoken reply voice | "AI is having a bad day" error (R) | M https://apps.apple.com/us/app/rosebud-ai-journal-diary/id6451135127 ; R https://apps.apple.com/us/app/id6451135127?see-all=reviews#12907053741 |
| S16 | Biometric lock | App open | Protect journal | Face ID, Touch ID, PIN | Locked, unlocked | V https://help.rosebud.app/getting-started/biometric-lock (title in help index), store text https://apps.apple.com/us/app/rosebud-ai-journal-diary/id6451135127 |
| S17 | Scan handwritten journal / add photos | Composer | Bring paper pages and photos in | Camera or photo picker | Not read in detail | V (help titles only) https://help.rosebud.app/ ; R https://apps.apple.com/us/app/id6451135127?see-all=reviews#12173065344 |
| S18 | Onboarding | First launch | Account, bio, plan choice | Sign-up, bio questions, trial offer | Not observed | A |

## Flows

| ID | Goal | Screens | Happy-path taps (if knowable) | Edge cases |
|---|---|---|---|---|
| F01 | Evening debrief | S01, S04, S02, S05 | Tap Evening Reflection, answer three questions (type or mic), optionally Go deeper, finish, read summary, add suggested goal | Outside 12pm to 3am window shows Morning instead (V); AI tries to end session early (R, 2 reviews); voice transcription loops or loses audio (R) |
| F02 | Morning intention with carry-over | S01, S03, S05 | Open from reminder, answer three questions, finish; personalised Evening Reflection notification follows | Reminder that references last night's entry (R https://apps.apple.com/us/app/id6451135127?see-all=reviews#13209717082); reminder skipped when already done (V) |
| F03 | Voice entry | S02, S15 | Tap mic, speak (hands-free optional, auto stop), transcript appears, send, read or hear reply | Transcription repeats or captures nothing (R); recording stuck loading and lost (R); latency between transcribe, response and spoken reply (R) |
| F04 | Go deeper | S02 | Tap "Go deeper", pick Interactive (one perspective plus one pointed question) or Focused (three questions from the entry so far) | Questions said to use current entry; use of older entries not stated (V gap) |
| F05 | Ask about yourself | S09 | Open Ask Rosebud, type or pick a suggested question, read answer with links to related entries | Weak sense of time and dates (V); mixes up events (R) |
| F06 | Weekly report | S10 | Get notification (default Monday), open report, read stats, themes, people, insights | Midweek progress nudge to "unlock" it (V); in-depth only above 1,500 words (V) |
| F07 | Set and keep goals | S05, S11 | Accept and edit suggestion after an entry, or Add Goal; AI suggests steps; swipe to snooze or archive | Reminders only show when app is next opened (R https://apps.apple.com/us/app/id6451135127?see-all=reviews#12829640750) |
| F08 | Shape the AI | S12, S13 | Create persona, write instructions, choose model and voice, save; switch via selector top-left of an entry | Persona instructions not followed (R https://apps.apple.com/us/app/id6451135127?see-all=reviews#14277310055); support answer is "update preferences" (R) |
| F09 | Correct the AI | S02, S12 | Tell Rosebud a broad preference in an entry; it is saved as a Learned Preference; manage in Settings or Persona Settings | No documented way to see or correct individual memories (V gap) |
| F10 | Keep a streak | S01, S02, S06 | Complete a morning or evening check-in daily | Missed day "fixed" by changing the entry date (V) |
| F11 | Leave | S13 | Export to Markdown, cancel subscription, Manage account, Delete account | Must cancel subscription first; irreversible; up to 30 days in backups (V) |
| F12 | Pay and hit limits | S14 | Start trial, choose monthly or annual; at weekly limit, upgrade to Thrive | Charged after cancelling trial (R, 2 reviews); asked to subscribe while already subscribed (R, 2); limit hit in two weeks (R) |

## Components

Check-in card (time-windowed); chat-style entry thread with editable user turns; mic button with hands-free and auto stop; persona selector chip; "Go deeper" control with two modes; Guiding Light helper; end-of-entry reflection card (summary, insights, haiku, quote, artwork); suggestion chips that add to goals; tag chips (mood, relationship, theme); goal row with swipe actions (snooze, archive); prompt card with bookmark; journal tile with favourite; weekly report sections (stats, mood chart, themes, cast of characters, insights); answer card with entry links (Ask Rosebud); usage meter and upgrade wall; streak counter; settings toggles (Memory Precision Experiment, Learned Preferences, Daily Reminder); glossary list (max 10); voice picker with preview; biometric lock; export button. All V from the help pages above except artwork (R) and usage meter look (R).

## Inferred data model

| Entity | Fields | Evidence | Confidence |
|---|---|---|---|
| User | id, email, name, phone (optional, SMS), time zone and week start, plan, usage budget and reset date | V privacy policy, help Notifications, Usage limits; Play data safety | high |
| Bio | values, relationships, milestones, aspirations; religious affiliation (optional) | V AI Personalization; Play data safety lists "Political or religious beliefs" (optional); R https://apps.apple.com/us/app/id6451135127?see-all=reviews#13884646917 | high |
| Entry | id, user_id, type (morning, evening, guided, custom, blank, prompt), journal_id, date (user-editable), status (draft, finished), photos, summary, haiku, quote, tags | V Entry history, Streaks, Entry reflection | high |
| Message | entry_id, role (user, ai), text, audio transcript, persona_id, editable for user role | V Entry history ("Tap your previous message"), Voice journaling | medium |
| Tag | entry_id, kind (mood, relationship, theme), label; add or remove by user | V Auto-tagging, Entry history | medium |
| Memory item | user_id, fact or topic, linked people and events, source entry ids, time hints | M blog ("organizes what it learns"); V help says it "organizes what it learns about you"; structure not documented | guess |
| Learned preference | user_id or persona_id, text, enabled | V Learned Preferences | medium |
| Persona | name, instructions, model, voice, auto stop sensitivity, glossary (up to 10 terms), preset source | V AI Personalization, Voice journaling | high |
| Goal | title, category, status (active, snoozed, archived), history, cadence (daily, weekly, monthly per R), suggested steps | V Happiness recipe; R https://apps.apple.com/us/app/id6451135127?see-all=reviews#12852119112 | medium |
| Prompt | text, source entries, created_date, bookmarked, consumed | V Personalized prompts | medium |
| Journal template | title, prompts, generated_from_goal, imagination, favourite | V Custom journals | medium |
| Weekly report | week_start, word stats, mood series, themes, cast of characters, insights (max 5), in_depth flag | V Weekly report | high |
| Streak | derived from daily check-in completion | V Streaks | medium |
| Subscription | store (web, Apple, Google), tier (Bloom, Thrive 2x, Thrive 5x), period, usage cycle | V Billing, Usage limits; App Store IAP list | high |

## Pricing

Read 2026-10-31.

| Tier | Price | Where | Evidence |
|---|---|---|---|
| Free plan | Retired 2026-09-30 ("Effective September 30, 2026, the Rosebud free plan will be retired") | https://help.rosebud.app/account/changes-to-the-free-plan | V |
| Free plan (marketing) | Home page still says "Rosebud is free to use" | https://www.rosebud.app/ | M, conflicts with the help doc |
| Bloom monthly | $12.99 | Home page and App Store IAP | V (IAP) https://apps.apple.com/us/app/rosebud-ai-journal-diary/id6451135127 |
| Bloom annual | $107.99/yr ("$8.99/mo", crossed out $155.99, "SAVE 30%") | https://www.rosebud.app/ | V (IAP $107.99), M (crossed-out price) |
| Thrive 2x | $24.99 and $199.99 (periods not labelled; A: monthly and annual) | App Store IAP | V price, A period |
| Thrive 5x | $59.99 and $499.99 (A: monthly and annual) | App Store IAP | V price, A period |
| Affiliate Bloom | $11.00 and $92.00 | App Store IAP | V |
| Discounts | Student, senior, disability, military and veteran; promo codes; gift cards | https://help.rosebud.app/ (article titles) | V (titles only) |
| Trial | "Start Free Trial"; length not stated | https://www.rosebud.app/ | M |

Usage model: weekly usage budget, no rollover; Thrive has a larger budget and no extra features; Thrive only on iOS and Android (V https://help.rosebud.app/ai-analysis/usage-limits).

## Privacy and AI model (what is verified)

- Encryption in transit and at rest; Firestore encrypts automatically. No end-to-end encryption; the policy names user-held keys as a data-loss risk. V https://help.rosebud.app/about-us/privacy-policy
- AI providers named: OpenAI, Anthropic, Google, Amazon Web Services, Groq; some via Vertex AI or Bedrock. BAAs and Zero Data Retention agreements claimed. V (privacy policy)
- Transcription and voice: audio sent to a transcription provider under ZDR and discarded; ElevenLabs named, under ZDR. V (privacy policy)
- Training: the privacy policy and terms do not say whether journal data trains models. The help comparison page says "Your input is not used to train future AI models" (V, help doc); the company blog and TechCrunch say entries are never "used to train AI models" (M). Dawnward note: the no-training promise is not in Rosebud's legal documents.
- "Automated quality evaluations in which AI systems review real interactions", "not reviewed by a person". V (privacy policy)
- Staff access: restricted to "a small number of authorized individuals", for technical or safety issues. V (privacy policy). One user objected: "I don't like how the app builder has access to my journal entries." R https://www.trustpilot.com/review/rosebud.app?stars=1&stars=2&stars=3
- Retention: deleted data kept up to 30 days in backups. V (privacy policy)
- Analytics and ads: Mixpanel, LogRocket, Sentry; Meta, Google, Apple pixels; journal content "never sent" to them. V (privacy policy). App Store label lists analytics on email, user id and product interaction. V https://apps.apple.com/us/app/rosebud-ai-journal-diary/id6451135127
- Play data safety: name, email, user ids, phone shared for analytics; optional religious or political beliefs collected for personalisation; deletion request supported. V https://play.google.com/store/apps/datasafety?id=co.justimagine.rosebud&hl=en_US
- "HIPAA aligned" badge (M); BAA with Google (V, policy).
- Memory controls: no documented view, edit or delete of individual memories; Learned Preferences can be managed and disabled; editing previous entries "isn't possible yet"; deleting single entries not documented. V (absence in help docs 3, 4, 14, 25)
- Export: Markdown, entries only (V). Delete: whole account only (V).

## What cannot or should not be taken

- Name, logo, rose imagery, and the black and white illustration style (brand).
- Their prompt wording: the three morning questions, the Rose, Bud, Thorn evening questions with emoji, persona names (The Sage, The Challenger, The Connector, The Gardener, The Strategist), "Happiness Recipe", "Guiding Light", "Ask Rosebud", "Go deeper", "Cast of Characters", "Bloom" and "Thrive" tier names.
- Guided journal content (CBT, IFS, gratitude), personalised content, haiku and quote formats as written, system prompts (not seen and not to be sought).
- Their user testimonials, ratings and statistics (e.g. "500 million words", "75% of users surveyed").
- Screenshots and help-centre copy.
- Anything behind login (memory UI, report layout details).

## Size

- US App Store: 4.88 from 3,371 ratings; version 1.5.7 released 2026-10-30; first iOS release 2024-08-06; 18 languages listed; about 118 MB; age 17+. V (iTunes lookup)
- About 25 iOS releases between 2026-05-14 and 2026-10-30. V (version history)
- Web app footer version v1.15.0. V (home page)
- Trustpilot 4.8 from 226 reviews. V
- Home page claims "100K+" and elsewhere "150K+" users, and "4.9 from 5K" vs "4.7 from 35,311" ratings. M (inconsistent)
- 7,500+ paying customers, 500 million words (June 2025). M https://www.rosebud.app/blog/rosebud-raises-6m-to-expand-the-worlds-leading-ai-journal
- $6M seed, June 2025. M/press https://techcrunch.com/2025/06/04/rosebud-lands-6m-to-scale-its-interactive-ai-journaling-app
- Blog: 182 posts. V

## Lessons for Dawnward

1. **Carry yesterday into today, and say so.** The most loved moment is a morning reminder that picks up last night's topic. Rosebud documents a personalised evening notification after the morning check-in (V https://help.rosebud.app/daily-journaling/notifications); a user describes the morning reminder bringing up a work release from the night before (R https://apps.apple.com/us/app/id6451135127?see-all=reviews#13209717082). Dawnward's three morning steps from the user's own words are exactly this; quote the source sentence on each step.
2. **Cite the entry, every time.** Ask Rosebud answers "including links to related journal entries" (V https://help.rosebud.app/tools-for-growth/ask-rosebud), but entry reflections, follow-up questions and memory recall have no documented citation. Users praise "it remembers" (R, 14 of 97 App Store reviews use the word "remember") yet 9 critical reviews complain about the AI itself, and 5 of them say it mixes up events, forgets or gets dates wrong (#14002470145, #14083093840, #13533483498, #14283074836, #14277310055). Dawnward's "Why I think this" should link each belief to dated quotes, and nothing should be shown as remembered without a source.
3. **Memory needs a correction path.** Rosebud has no documented way to view, edit or delete individual memories, only Learned Preferences (V https://help.rosebud.app/ai-analysis/learned-preferences) and whole-account deletion (V https://help.rosebud.app/account/delete-your-account). A user says support "only tells me to update my preferences" (R https://apps.apple.com/us/app/id6451135127?see-all=reviews#14083093840). Dawnward's "That's not right" is a real gap in the market; make a correction visibly change future steps.
4. **Capture first, think second.** Voice failures are the most painful complaints: audio lost while "stuck in the loading stage", and a reviewer asks for raw audio to be saved before AI processing (R https://apps.apple.com/us/app/id6451135127?see-all=reviews#12757740440; also #14004379467). Dawnward's talk-about-your-day flow should save audio and transcript locally before any model call, and let the user keep a debrief even if the AI fails.
5. **Time is a weak spot of model memory.** Rosebud says it "doesn't have a great sense of time" and offers an opt-in "Memory Precision Experiment" (V https://help.rosebud.app/ai-analysis/long-term-memory); users report wrong dates (R https://apps.apple.com/us/app/id6451135127?see-all=reviews#14283074836). Dawnward should store dates and sources in its own data, not ask the model to recall them.
6. **Let the user end the evening.** Two reviewers say the AI "kept trying to end my session" (R #14283074836, #14222808375). Dawnward's debrief should end only when the user says so, with a gentle close offered, not forced.
7. **No hidden meters.** Weekly usage caps (V https://help.rosebud.app/ai-analysis/usage-limits) drew the angriest paid-user reviews: "a meter running out", a 2% warning with no notice (R #14422213357, #14222808375), and trial charge disputes (R #14003436003, Trustpilot). Dawnward should price plainly and never cut someone off mid-reflection.
8. **Put the privacy promise in the policy.** Rosebud names its AI providers and ZDR terms (V privacy policy), which persuaded at least one user (R #13885786156), but the no-training promise sits only in a help comparison page and the blog. Dawnward should state no-training, providers and retention in its legal privacy policy, in plain words.

### Conflicts with Dawnward's rules (do not adopt)

- **Streaks:** "Every day that you complete a daily journal (morning, or evening) counts towards your streak" (V https://help.rosebud.app/daily-journaling/streaks). Users brag about "a 134 day streak" (R #12852119112) and Product Hunt reviewers mention "28-day streak" and "day 340" (R https://www.producthunt.com/products/rosebud/reviews). Dawnward forbids streaks.
- **Back-dating to keep a streak:** the help doc tells users they can change entry dates to keep a streak going (V, same URL). This is fabricated proof by design; Dawnward must not do it.
- **Scores and unlocks:** weekly report "Writing stats" (word counts) and a midweek "Progress Update" toward "unlocking the weekly report" (V https://help.rosebud.app/ai-analysis/weekly-report , https://help.rosebud.app/daily-journaling/notifications). Dawnward forbids scores and gating reflection behind effort.
- **Celebration of wins** in insights (R #12816644247) can drift into badges; Dawnward should not grade the user.
- **Proof claims:** inconsistent ratings and user counts on the same home page, "therapist-recommended", "75% of users surveyed" (M). Dawnward must not publish unverifiable proof.
- **Therapy framing:** many reviews call Rosebud a therapist replacement (R, e.g. #14024436137) while the help doc says it is not one (V https://help.rosebud.app/getting-started/rosebud's-limitations). Dawnward should not invite that comparison.
