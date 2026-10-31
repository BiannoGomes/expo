# Recon map: Stoic (iOS, iPadOS, macOS, watchOS, visionOS, Android, Web)

## Scope

Public-source recon of "stoic. journal & mental health" by Stoic app inc. (getstoic.com), App Store id 1312926037, Google Play id com.stoicroutine.stoic. Purpose: learn from its ritual design, features and user complaints for Dawnward (evening debrief app). Not a clone brief. No login, no sign-up, no paywall crossed, no screenshots saved, no JavaScript bundles read.

Evidence labels used throughout:
- **V** verified: help centre article, store listing feature text, release notes (changelog), privacy policy or store privacy declaration describing actual behaviour.
- **M** marketing claim only (website hero copy, testimonials, editorial).
- **R** reported by users in reviews (see reviews.csv for verbatim text).
- **A** my assumption or inference.

Note on help centre: every help article read shows "Last updated November 11, 2025". Release notes run to 2026.21 (2026-10-26), so some help text may lag the current app (A).

## Date

2026-10-31

## Sources

| # | Source | URL | Notes |
|---|---|---|---|
| 1 | Marketing home page | https://getstoic.com/ | Feature blocks, AI disclosure, platform list. No prices shown. |
| 2 | Features page | https://getstoic.com/features | Daily Reflections, Streaks & Badges, Gentle Notifications, Writing Goals, Privacy. |
| 3 | App Store listing (US) | https://apps.apple.com/us/app/stoic-journal-mental-health/id1312926037 | Description, In-App Purchase prices, App Privacy label, version history to 2026.21. Read 2026-10-31. |
| 4 | iTunes Search API record | https://itunes.apple.com/search?term=stoic+journal&entity=software | Confirms id 1312926037, seller "Stoic app inc.", seller URL https://getstoic.com/, 4.8 from 36,147 ratings, 330.7 MB, 8 languages. |
| 5 | Google Play listing | https://play.google.com/store/apps/details?id=com.stoicroutine.stoic | Title "stoic. journal & habit tracker", 4.6 stars, 100K+ downloads, updated Oct 12, 2026. Description adds a medical disclaimer and 988 crisis line. |
| 6 | Google Play Data safety | https://play.google.com/store/apps/datasafety?id=com.stoicroutine.stoic&hl=en | Developer declares sharing for analytics, data not encrypted in transit, no deletion request. |
| 7 | Help centre home | https://help.getstoic.com | 8 categories. |
| 8 | Help: Daily Journaling Flow | https://help.getstoic.com/stoic-user-guide/mooMJC6qGFVeG62FpCwNAw/daily-journaling-flow/6f9eBdDY7m4AnbXtALLGtM | Mood check-in on launch, daily vs morning/evening check-in, tags, streak restore. |
| 9 | Help: Home Screen | https://help.getstoic.com/stoic-user-guide/mooMJC6qGFVeG62FpCwNAw/home-screen/6f9eBdDY7kpekp8AYu18Xq | Daily Check-In card, Personalize. |
| 10 | Help: Add Button | https://help.getstoic.com/stoic-user-guide/mooMJC6qGFVeG62FpCwNAw/add-button/6f9eBdDY7nQhVPFjkq29Ka | Empty Page, Mood Check-In, Journaling Suggestions, Favorites, Custom Templates, Library. |
| 11 | Help: Explore Screen | https://help.getstoic.com/stoic-user-guide/mooMJC6qGFVeG62FpCwNAw/explore-screen/6f9eBdDY7mmGmvLJB6xkCh | Featured, For You, Emotions Check-In, Weekly Themes, Library, Search. |
| 12 | Help: History Screen | https://help.getstoic.com/stoic-user-guide/mooMJC6qGFVeG62FpCwNAw/history-screen/6f9eBdDY7k2Stic7r4orYU | Time frames, Insights card, Trends, HealthKit. |
| 13 | Help: Ideas Screen | https://help.getstoic.com/stoic-user-guide/mooMJC6qGFVeG62FpCwNAw/ideas-screen/6f9eBdDY7kQrq6SWcwmXtt | Quotes, Paths, slideshow, "Write It Out". Renamed "Quotes" in 2026.15. |
| 14 | Help: Data Storage, Import and Backups | https://help.getstoic.com/stoic-user-guide/mooMJC6qGFVeG62FpCwNAw/data-storage-import-and-backups/6f9eBdDY7jYcoaF9t9ytqz | No own servers, JSON and TXT export, Day One import, no iOS to Android sync. |
| 15 | Help: Where Your Data Is Kept | https://help.getstoic.com/privacy--security/i65nxnVdxPXQfGZJXynaYu/where-your-data-is-kept/6f9eBdDY7m3fVtcX2B5Mv5 | On-device only, optional iCloud. |
| 16 | Help: Password Protection | https://help.getstoic.com/privacy--security/i65nxnVdxPXQfGZJXynaYu/password-protection/6f9eBdDY7mo5FmhGjhtrAe | PIN, Face ID, Touch ID, Premium only. |
| 17 | Help: Privacy for AI Features Users | https://help.getstoic.com/privacy--security/i65nxnVdxPXQfGZJXynaYu/privacy-for-ai-features-users/6f9eBdDY7n6xp3yDruS4SW | Only the current entry sent, OpenAI, up to 30 days retention. |
| 18 | Help: What Always Stays Private | https://help.getstoic.com/privacy--security/i65nxnVdxPXQfGZJXynaYu/what-always-stays-private/6f9eBdDY7m3Spmr1ZTYwHk | No encryption claim made. |
| 19 | Help: Behavioral Data | https://help.getstoic.com/privacy--security/i65nxnVdxPXQfGZJXynaYu/behavioral-data/6f9eBdDY7nimzzHgUfvyow | Anonymous usage data, opt-out toggle. |
| 20 | Help: Using AI features in the App | https://help.getstoic.com/premium-ai-features/xcBoxz1TZA2bdrEzFsGkhJ/using-ai-features-in-the-app/6f9eBdDY7mQ224fRxsXxYY | 10 mentors, Go Deeper, AI reminders, AI in routines. |
| 21 | Help: Premium AI Subscription | https://help.getstoic.com/premium-ai-features/xcBoxz1TZA2bdrEzFsGkhJ/premium-ai-subscription/6f9eBdDY7nj4ZYuAFi7UMj | Reflective Analysis, smart notifications. |
| 22 | Help: Foundation Model AI Features | https://help.getstoic.com/premium-ai-features/xcBoxz1TZA2bdrEzFsGkhJ/stoic%E2%80%99s-foundation-model-ai-features/6f9eBdDY7kLBJL6XSFHaB9 | On-device AI on iOS 26. Specific features not listed. |
| 23 | Help: Subscription & Plans | https://help.getstoic.com/getting-started/nMb4jABmc8oatYuUUyT5Q5/subscription--plans/6f9eBdDY7ngGS3y5u7kPU6 | Free vs Premium vs Premium + AI, trials 7 and 3 days, annual only. |
| 24 | Help: Download & Set Up | https://help.getstoic.com/getting-started/nMb4jABmc8oatYuUUyT5Q5/download--set-up/6f9eBdDY7muH12dseBvJap | Onboarding: objectives, age, notifications. |
| 25 | Help: Setting Up and Exploring Your Profile | https://help.getstoic.com/getting-started/nMb4jABmc8oatYuUUyT5Q5/setting-up-and-exploring-your-profile/6f9eBdDY7mPSQyUthaS2ei | Preferences, Appearance, Stoic Shield, Apple Health, Account & Settings. |
| 26 | Help FAQ: Journaling and Customization | https://help.getstoic.com/faq/3sfUSwpkyPFw22e8F1CRHk/journaling-and-customization/6f9eBdDY7njMvRmxFbraod | Streaks restore, badges, turn off, day start time ("For Night Owls"). |
| 27 | Help FAQ: Privacy, Data, and AI | https://help.getstoic.com/faq/3sfUSwpkyPFw22e8F1CRHk/privacy-data-and-ai/6f9eBdDY7nmUseRBxVxvQV | No account, delete via app and iCloud folder, daily vs AI reminders. |
| 28 | Help: Android App | https://help.getstoic.com/android-app/6f9eBdDY7nBErZqN88hSpP/android-app/6f9eBdDY7jYfqgb9xsw3Gi | Android has fewer features than iOS. |
| 29 | Privacy policy | https://getstoic.com/privacy-policy | Names OpenAI, Anthropic, Google Gemini; RevenueCat, Beehiiv, Typeform; retention periods; no revision date shown. |
| 30 | App Store Editors' Choice story | https://apps.apple.com/us/iphone/story/id1841742937 | Apple editorial: morning and evening prompts, AI persona questions, GAD-7 and PHQ-9. |
| 31 | MobileSyrup review (2019-06-09) | https://mobilesyrup.com/2019/06/09/stoic-self-reflection-journaling-app-review/ | Historical: Morning "Prepare" card, Evening dark card, question sets, 2019 prices. |
| 32 | Product Hunt product page | https://www.producthunt.com/products/stoic | 5.0 from 4 reviews. Reviews page behind a Cloudflare check; full review text not obtainable, not used in reviews.csv. |
| 33 | Apple customer reviews RSS (US, mostRecent) | https://itunes.apple.com/us/rss/customerreviews/id=1312926037/sortBy=mostRecent/json | 50 reviews (2026-07-08 to 2026-10-27). Pages 2 and 3, mostHelpful and GB/CA/AU feeds returned empty on every attempt. |
| 34 | App Store pages, reviews view (US, GB, CA, AU) | https://apps.apple.com/{us,gb,ca,au}/app/stoic-journal-mental-health/id1312926037?see-all=reviews | 39 featured reviews read from the page as served. |
| 35 | Trustpilot | https://www.trustpilot.com/review/getstoic.com | 404, no profile. |
| 36 | Hacker News Algolia | https://hn.algolia.com/api/v1/search?query=getstoic | No relevant hits about the app. |

## Core loop

Open the app, log a quick mood, answer a short set of morning preparation prompts (focus, plan) and in the evening answer reflection prompts and habit checks, with each completed day extending a streak shown behind a fire icon.

## Screens

| ID | Screen | How reached | Purpose | Key components | States seen | Evidence |
|---|---|---|---|---|---|---|
| S01 | Onboarding | First launch; later Profile > Application > Onboarding | Personalise the app | Journaling objectives picker, age input, notification permission | First run, revisit | V (src 24) |
| S02 | Paywall / plan picker | Onboarding and in-app upsells | Sell Premium or Premium + AI | Monthly and yearly plans, free trial (annual only), lifetime option since 2026.15 | Trial offered, upgrade from Premium to AI | V for plans and trials (src 3, 23); screen layout A; repeated upsell prompts R |
| S03 | Mood check-in (launch) | Opens on each app launch if "Track Mood on Launch" is on | Quick mood log | Mood scale, emotions, influencing factors | On, off | V (src 8, 25); new emotions check-in look in 2026.7 V (src 3) |
| S04 | Home / Today | App tab | Daily hub | Daily Check-In card or Morning Preparation and Evening Reflection cards, date strip for past days, fire icon (top left), quick action button (2026.21), Personalize link at bottom, quotes and affirmations | One check-in mode, two check-in mode, missed day, completed day | V (src 8, 9, 26, 3) |
| S05 | Personalize | Home > Personalize | Shape the daily ritual | Choose home elements, one or two check-ins, choose prompts and metrics, add own questions | Redesigned 2026.15 | V (src 9, 26, 3) |
| S06 | Morning Preparation | Home card | Prepare for the day | Focus selection (redesigned 2026.6), prompts, metrics, notes and to-do planner, AI questions in place (2026.21) if AI on | Free, Premium, AI | V (src 3, 20); exact prompt list not public A |
| S07 | Evening Reflection | Home card | Reflect on the day | Reflection prompts, habit tracker, reflection guided by morning focus, AI questions if on | Free, Premium, AI | V for habit tracker (src 3); focus link R (review 5950189546); dark visual treatment in 2019 (src 31) |
| S08 | Journal editor | Add button, check-ins, prompts, "Write It Out" | Write or speak an entry | Text editor, Aa Markdown styling, + media (photo, video, attachment), voice memo (redesigned 2026.4), mentor button (stars icon), Go Deeper | Empty page, template, guided | V (src 8, 20, 3) |
| S09 | Completion screen | End of guided journal or template | Save and organise | + Add Tags, + Create New Tag (name, icon), Save and Finish | With or without tags | V (src 8) |
| S10 | Add sheet | Plus button | Start any entry | Empty Page, Mood Check-In, Journaling Suggestions, Your Favorites, Custom Templates, Library | Suggestions need Health and iOS permissions ("Go to Settings") | V (src 10) |
| S11 | Template builder | Add > Create Your Own Journaling Template | Custom ritual | Name, prompts, metrics (1 to 5 scale, yes/no), habits, save | Edit, delete, favourite | V (src 10) |
| S12 | Explore | Tab | Discover content | Featured, For You, Emotions Check-In, Weekly Themes, Library, Search | Seasonal events | V (src 11) |
| S13 | Weekly Theme | Explore > Weekly Themes | One prompt a day for a week | Day prompts unlock Monday to Sunday, See All Themes | Locked future days | V (src 11) |
| S14 | Library item detail | Explore or Add > Library | Guided journals and exercises | Card with how it works, favourite toggle | Free or premium | V (src 10, 11) |
| S15 | Breathing exercise | Library | Calm or focus | Animated pulsing circle | No audio or haptic cue reported | M for "science-backed" (src 3); circle and no sound R (review 14677247666) |
| S16 | Meditation | Library | Meditate | Guided or unguided, background sounds, timed chimes | | V store feature text (src 3) |
| S17 | Quotes (formerly Ideas) | Tab | Inspiration to write from | Full-screen themes swiped, Paths (Optimist, Go-Getter, Soulkeeper, Philosopher, Artist), favourites (double tap), brush (background), play (slideshow focus mode), search, "Write It Out" / "Journal About It" | | V (src 13, 3) |
| S18 | History | Tab | Review the past | Days, Weeks, Months, Years, Smart selector; entry count; total words; memories; filter; Insights card | Show Memories on or off | V (src 12) |
| S19 | Trends | History > Insights > See All | Patterns | Mood and activity charts, mood breakdown, emotions analysis, HealthKit (sleep, activity, mindful minutes, daylight), calendar of completed exercises | HealthKit connected or not | V (src 12) |
| S20 | Stats, streaks and badges | Fire icon on Home | Motivation | Streak count, badges, Show Streak and Show Badges toggles | Streak broken, restored | V (src 8, 26) |
| S21 | Profile | Tab or avatar | Settings | Preferences (day and week start, haptics, sounds, name, birthdate, description, language), Appearance, Stoic Shield, Apple Health, Account & Settings (Notifications, Data Storage, Subscription), Your Data (Privacy, Import & Export, Send Behavioral Data, Storage) | | V (src 25, 26, 14, 19) |
| S22 | AI personalisation | Profile > Account > Active Premium | Feed AI context | Personal details, toggle AI in morning and evening, toggle AI reminders | AI Premium only | V (src 20) |
| S23 | Mentor picker | Mentor button in any journal or tap mentor avatar | Choose AI voice | 10 mentors | | V (src 20, 3) |
| S24 | Go Deeper dialogue | Go Deeper button in editor | AI follow-up questions | Short dialogue prompt, arrow to choose prompt types | Weekly AI token limit since 2026.16 | V (src 20, 3) |
| S25 | Stoic Shield | Profile > Stoic Shield | Block distracting apps | App and category selection (Screen Time), "Open Anyway" | Shield active | V (src 25); can gate apps until morning reflection R (review 12652915155); bugs R (review 10509991504) |
| S26 | App lock | Profile > Your Data > Privacy | Lock the journal | PIN, Face ID, Touch ID | Premium only | V (src 16) |
| S27 | Import and Export | Profile > Your Data > Import & Export | Backup and move | JSON, TXT, Include Attachments, Day One import | | V (src 14, 26) |
| S28 | Questionnaires | Library (A) | Anxiety and depression screening | GAD-7, PHQ-9 | | M Apple editorial (src 30); R "anxiety risk or a depression risk" (review 13970836430) |
| S29 | Widgets | Home screen and lock screen | Glanceable prompt, quote or streak | Lock screen widget (2026.2), streak count widget | | V (src 3); streak widget R (review 13970836430) |
| S30 | Notifications | System | Bring user back | Daily reminders (Premium), AI reminders (AI Premium), journaling suggestion notifications (2026.17) | Permission denied | V (src 27, 20, 3) |

## Flows

| ID | Goal | Screens | Happy path taps (if knowable) | Edge cases |
|---|---|---|---|---|
| F01 | First run | S01, S02, S04 | Pick objectives, enter age, allow notifications, see plan offer, land on Home | Notifications refused; trial accepted then auto-renews annually (R, 3 refund complaints) |
| F02 | Morning preparation | S03, S04, S06 | Open app, log mood, tap Morning card, choose focus, answer prompts and metrics, finish | Skipped morning; done late. 2021 review says back-filling a missed morning was not possible then (R 7460197859); now restorable (V src 26) |
| F03 | Evening reflection | S04, S07, S09 | Tap Evening card, answer reflection prompts and habit checks, add tags, Save and Finish | Night owls: day start time setting (V src 26) |
| F04 | Single daily check-in instead of two | S04, S05 | Home > Personalize > choose one Daily Check-In | Switching back anytime (V src 9) |
| F05 | Free entry | S10, S08, S09 | Plus > Empty Page > write or record > Save | Entries not saving on Mac (R 14302460468) |
| F06 | AI deepening | S08, S23, S24 | In an entry tap mentor button > pick mentor > Go Deeper > answer > Go Deeper again | No AI subscription; weekly token limit (V src 3) |
| F07 | Restore a broken streak | S04, S20 | Tap a past date on Home > complete that day's check-in > streak reinstated | Streak counts only check-ins, not blank pages (R 10394657996) |
| F08 | Turn off gamification | S20 | Fire icon > toggle Show Streak and Show Badges off | |
| F09 | Breathing or meditation | S12 or S10, S14, S15 or S16 | Library > exercise card > start | No audio cue for breathing (R) |
| F10 | Build a custom ritual | S10, S11 | Plus > Create Your Own Journaling Template > name > add prompts, metrics, habits > save | |
| F11 | Lock the journal | S21, S26 | Profile > Your Data > Privacy > enable PIN or Face ID | Forgot PIN: data unrecoverable (V src 16) |
| F12 | Back up and leave | S21, S27 | Profile > Your Data > Import & Export > JSON with attachments | Free users have no iCloud sync; Android cannot sync with iOS (V src 14) |
| F13 | Phone-free morning | S25, S06 | Set Shield to block apps until morning reflection is written | Shield selection bugs (R) |
| F14 | Delete everything | S21 | Optionally turn off Send Behavioral Data, delete app on each device, delete Stoic folder in iCloud Drive | No server account to delete (V src 27) |

## Components

- Check-in card (morning, evening, daily) with completed state (V).
- Mood picker plus emotions list plus influencing factors (V src 2, 8).
- Prompt card with a single question and answer field (V).
- Metric inputs: 1 to 5 scale, yes/no, habit checkbox (V src 10).
- Focus selector chips for the day (V changelog 2026.6, exact options unknown A).
- Rich text editor with Markdown toolbar (Aa) and media (+) (V).
- Voice memo recorder with transcription (V store text "journal with voice notes"; transcription R review 8648970168).
- Mentor avatar button and Go Deeper button (V).
- Tag chips with icons (V).
- Fire icon streak badge and badge grid (V).
- Date strip on Home for past days (V src 26).
- Quick action button on Today (V 2026.21).
- Full-screen quote viewer with swipe, slideshow, background picker (V).
- Time frame segmented control (Days, Weeks, Months, Years, Smart) (V).
- Charts: mood over time, emotions breakdown, HealthKit series, exercise calendar (V).
- Breathing circle animation (R).
- Paywall sheet with plan cards and trial toggle (A, plans V).
- Widgets: quote, prompt, streak, lock screen (V partly, R for streak widget; quote widget removed then R 14279773939).

## Inferred data model

| Entity | Fields | Evidence | Confidence |
|---|---|---|---|
| Entry | id, date, type (empty, template, guided, check-in), body (Markdown), attachments, tags, mentor_id, word_count, created_at, updated_at | Editor, tags, word counts in changelog 2026.21 (V) | high |
| CheckIn | id, date, kind (daily, morning, evening), focus, answers[], metrics[], habits[], completed_at | Help src 8, 9, 26 (V) | high |
| MoodLog | id, timestamp, mood value, emotions[], factors[] | Features page, Trends (V) | high |
| Prompt | id, text, set or theme, category, locale | Weekly themes, daily prompts (V) | high |
| Template | id, name, prompts[], metrics[], habits[], favourite | Help src 10 (V) | high |
| Metric | id, label, type (scale 1 to 5, yes/no), value | Help src 10 (V) | medium |
| Habit | id, name, done per day | Habit tracker in evening (V store text) | medium |
| Tag | id, name, icon | Help src 8 (V) | high |
| Attachment | id, entry_id, kind (photo, video, audio, file), offloaded flag | Offload Assets (V src 14) | medium |
| StreakState | current_length, longest, restored days | Help src 26 (V) | medium |
| Badge | id, criteria, unlocked_at | Help src 26 (V) | medium |
| UserProfile | name, birthdate, description, objectives, age, language, day_start, week_start, AI personal details | Help src 24, 25, 20 (V) | high |
| Mentor | id, name, style | Help src 20 (V) | high |
| AIUsage | weekly token count | Changelog 2026.16 (V) | guess on shape |
| Favourite | item type, item id | Help src 10, 13 (V) | high |
| QuestionnaireResult | instrument (GAD-7, PHQ-9), score, date | Apple editorial (M), review R | guess |
| HealthSample | sleep, activity, mindful minutes, daylight, heart rate, State of Mind | Help src 12, 25; heart rate chart fix 2026.11 (V) | medium |
| Settings | track_mood_on_launch, show_streak, show_badges, lock, behavioural_data, notifications, sync | Help (V) | high |

Storage: local on device, optional iCloud (CloudKit or iCloud Drive folder "Stoic") for Premium; no own server (V src 14, 15). Android stores separately and cannot sync with iOS (V src 14).

## Pricing

Read 2026-10-31 from the US App Store In-App Purchases list (https://apps.apple.com/us/app/stoic-journal-mental-health/id1312926037) and help src 23.

| Tier | What it includes (V src 23) | Prices seen (V, US App Store IAP list) | Notes |
|---|---|---|---|
| Free | Daily prompts, quotes, affirmations, basic guided journals, limited breathing and meditation | $0 | Journaling stays free (V store text) |
| Premium | Full library, custom templates, mood and habit tracker, personalised suggestions, streaks and badges, widgets, iCloud sync and backup, Face ID or passcode lock | $6.99, $6.99, $17.99, $26.99, $39.99, $39.99 | Mapping of each price to monthly, quarterly, yearly is not labelled (A: $6.99 monthly, $39.99 yearly). Users report "$40 for a year" (R 14620426539) |
| Premium + AI | Premium plus mentors, Dig Deeper / Go Deeper, evolving insights, AI notifications | $12.99, $69.99, $99.99 | A: $12.99 monthly, $99.99 yearly. Users report "$99 after a 3-day trial" (R 14575004861) |
| Lifetime Premium | Premium for life | $299.00 | Added 2026.15 (V) |
| Trials | 7 days Premium, 3 days Premium + AI, annual plan only, once per user | | V src 23 |
| Student discount | 50% (R 13236058306); FAQ article and student form exist (V src 7, footer) | | |
| Gift vouchers | 1 month, 1 year Premium AI | | V changelog 2025.47, 2026.2 |
| 2019 pricing (historical) | $5.49 per month, $12.49 per 3 months, $39.99 per year, 7-day trial | | src 31 |

## Privacy and AI model

Verified:
- Storage: "stored only on your devices"; Stoic "does not have its own servers"; optional iCloud sync and backup for Premium (V src 15, 14). Data lost if the device is lost without backup (V src 15).
- No account: there is no server profile to delete; delete the app and the Stoic folder in iCloud Drive (V src 27).
- App lock: PIN, Face ID, Touch ID, Premium only; forgotten PIN means data cannot be restored (V src 16).
- Encryption: no help article or the privacy policy states an encryption method for journal data (V by absence). Google Play Data safety form declares data is not encrypted in transit and deletion cannot be requested (V src 6, developer-declared). Apple label lists only Data Not Linked to You: usage data for analytics and personalisation, diagnostics (V src 3).
- Behavioural data: anonymous feature-usage analytics, toggle "Send Behavioral Data" (V src 19). Privacy policy says usage data kept up to 24 months, error logs (may include IP) up to 180 days (V src 29).
- Cloud AI: only the entry being edited is sent when an AI feature is used (V src 17). Help names OpenAI with up to 30 days retention and no training (V src 17, 27). Privacy policy names "OpenAI, Anthropic or Google Gemini" and says content is not used to train models (V src 29). The two sources are inconsistent on providers (V, observed).
- On-device AI: Apple Foundation Model features on iOS 26 that "run entirely on your device"; on-device photo descriptions in 2026.19 (V src 22, 3). Specific features not listed in help (V by absence).
- AI features: 10 mentors (Motivating Marcus, Supportive Seneca, Evil Ego, Wordy William, Productive Plato, Mindful Maya, Curious Curie, Heroic Hypatia, Funky Frida, Time Traveller), Go Deeper follow-up questions, AI questions inside morning and evening routines, AI check-in reactions (2026.12), AI reminders timed to habits and mood patterns, reflective analysis of past entries, personalised quotes and affirmations, weekly AI token limits (2026.16) (V src 20, 21, 3).
- Safety copy: Play description says it is "a wellbeing tool, not a medical device" and gives the 988 crisis line (V src 5).
- Marketing claims (M): "Absolutely nobody can access them but you" (src 1); "only you have access to your data" (src 2); "We always apply, by default, the strongest possible security measures" (src 29).

## What cannot or should not be taken

- Their quotes and affirmations library, curated quote themes, Paths names (Optimist, Go-Getter, Soulkeeper, Philosopher, Artist).
- Prompt text, weekly theme content, guided journal scripts, question sets ("Stoic-way", "Be happier", "Productivity"), CBT thought dump template text.
- Mentor names and personas (and the idea of persona voices named after real historical people).
- Brand: the name "stoic." with the trailing period, lowercase voice, "dear stoics ... happy journaling! m." release note voice, logo, sun and moon card art, illustrations, colours.
- Feature names: Stoic Shield, Go Deeper, Dig Deeper, Journey, Ideas, Trends as branded features.
- Licensed or partner content: Huberman and Sleep Foundation sleep lessons.
- Testimonials and user counts ("4 million stoics", "It's my best friend").
- Any screenshot, icon or sound (including the meditation bowl sound praised in review 6231629611).

## Size

- iOS binary 330.7 MB; iOS 17+, iPadOS, macOS 14+, watchOS 10+, visionOS; iMessage (V src 3, 4).
- 8 languages: Dutch, English, French, German, Italian, Polish, Spanish, Swedish (V src 4, 26).
- App Store: 4.8 from 36,147 ratings (V src 4). Google Play: 4.6, 100K+ downloads (V src 5). "Over 4 million" downloads or users (M src 5, 3).
- Release cadence: 25 versions listed from 2025-12-17 to 2026-10-26 (V src 3), roughly every 2 weeks.
- 30 screens and 14 flows mapped here; 84 features in features.csv; 89 verbatim reviews in reviews.csv. Two reviews contain a long dash in their own verbatim text, left unchanged.

## Lessons for Dawnward

Strongest attributes worth learning from (not copying):

1. **The ritual flexes to the person's bandwidth.** Users choose one daily check-in or a morning plus evening pair, and can change it anytime from Personalize. V: https://help.getstoic.com/stoic-user-guide/mooMJC6qGFVeG62FpCwNAw/home-screen/6f9eBdDY7kpekp8AYu18Xq . R: "sometimes I want to do one reflection in the morning and one at night, other times I only have enough mental bandwidth to get through one, and there are days that I just do a mood-check" https://apps.apple.com/us/app/id1312926037?see-all=reviews#14482232383 . Dawnward: offer a "short debrief" path (one sentence, one mood) on heavy days, without calling it a lesser version.
2. **Prompts beat the blank page for people who never kept a journal.** Many 5-star reviews credit prompts for the habit sticking. R: https://apps.apple.com/us/app/id1312926037?see-all=reviews#14717728262 , https://apps.apple.com/us/app/id1312926037?see-all=reviews#13146260799 . Dawnward: a gentle opening question at the evening debrief, then let the person talk freely.
3. **Morning intention linked to evening reflection closes a loop.** Morning focus choice steers the evening questions. R: https://apps.apple.com/us/app/id1312926037?see-all=reviews#5950189546 ; focus selection redesign V: https://apps.apple.com/us/app/stoic-journal-mental-health/id1312926037 (2026.6). Dawnward runs the loop the other way (evening words feed morning steps), so the lesson is to show the person the link explicitly the next evening ("this morning's step came from what you said").
4. **Forgiveness for missed days is the most loved mechanic.** Users can complete a past day and nothing is lost. V: https://help.getstoic.com/faq/3sfUSwpkyPFw22e8F1CRHk/journaling-and-customization/6f9eBdDY7njMvRmxFbraod . R: "having that forgiveness with the streak is great, and makes you feel as if you haven’t failed" https://apps.apple.com/gb/app/id1312926037?see-all=reviews#13581104438 . Dawnward: keep the forgiveness, drop the streak. Allow a late or next-day debrief with no penalty and no counter.
5. **Speed and voice lower the cost.** R: "It doesn’t take more than 2 to 3 minutes to do you just talk into your phone using the microphone option?" https://apps.apple.com/au/app/id1312926037?see-all=reviews#13648176257 ; R: the old routine "was simple and took 5-10 mins" https://apps.apple.com/gb/app/id1312926037?see-all=reviews#9057347387 . Dawnward's talk-first debrief is aligned; target under 3 minutes.
6. **Feature sprawl erodes the ritual.** 5 reviews say the app became harder, more spread out or overwhelming, and one says repeating questions made it "less mindful and a bit more stressful". R: https://apps.apple.com/gb/app/id1312926037?see-all=reviews#9057347387 , https://apps.apple.com/us/app/id1312926037?see-all=reviews#9790655566 . Dawnward: protect a single path from opening the app to finishing the debrief.
7. **Plain, specific privacy pages build trust, but contradictions undo it.** Stoic has clear local-first pages and an anonymous analytics toggle (V: https://help.getstoic.com/privacy--security/i65nxnVdxPXQfGZJXynaYu/where-your-data-is-kept/6f9eBdDY7m3fVtcX2B5Mv5 ), yet help names only OpenAI while the policy names three providers (V: https://getstoic.com/privacy-policy ), and Google Play declares no encryption in transit (V: https://play.google.com/store/apps/datasafety?id=com.stoicroutine.stoic&hl=en ). Dawnward: one source of truth for what leaves the device, consistent across store forms, policy and in-app "Why I think this".
8. **Billing surprises drive most 1-star reviews.** 17 of 89 reviews complain about price, paywall or trial charges, including 3-day AI trial converting to about $99 per year and refunds denied. R: https://apps.apple.com/us/app/id1312926037?see-all=reviews#14575004861 , https://apps.apple.com/us/app/id1312926037?see-all=reviews#14620426539 . Dawnward: remind before any trial converts, and never let the free core feel like an advert for the paid tier.

Conflicts with Dawnward's rules (do not adopt):

- **Streaks**: fire icon streak counter on Home, streak widget, streak restore framing (V src 8, 26; R "5 is my PB" 13970836430). Streak anxiety reported: "there’s this silent fear about being unable to complete routines in time" (R 7460197859).
- **Badges**: badges for milestones, streak length, activities (V src 26). Marketed as "Fun Incentives" and "rewarding badges" (M src 1).
- **Scores**: GAD-7 and PHQ-9 risk scores (M Apple editorial; R), writing goals "celebrating your progress", entry and word counts in History (V src 12), community counter (option to hide it added 2025.47, V).
- **Guilt and nudging**: AI reminders timed to "mood patterns" and repeated premium prompts in the free app (V src 21; R 14638481561, 14312341623).
- **Fabricated or unverifiable proof**: "Join over 4 million stoics", a hand-picked testimonial "It's my best friend" (M src 3). Dawnward must not use claims it cannot show.
- **Persona AI named after real people**: mentors such as "Supportive Seneca" and "Funky Frida", plus "Evil Ego" that challenges the user. Conflicts with Dawnward's grounded "Why I think this" approach, where every belief traces to the person's own words.
- **Streak gated to prompts**: blank-page entries do not count (R 10394657996), which pushes people toward the app's agenda over their own words.
