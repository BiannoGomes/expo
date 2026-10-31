# Recon map: Mindsera (platforms)

## Scope

Mindsera (Mindsera OÜ, Tallinn, Estonia), an AI journal on iOS (iPhone, iPad, Apple Watch), Android (plus Wear OS) and web (app.mindsera.com / beta.mindsera.com). Public sources only: marketing site, help centre, roadmap page, privacy policy, terms, App Store and Google Play listings, public store reviews. No login, no sign-up, no paywall, no JavaScript bundles, no network calls, no images saved.

Focus: how journal history becomes insight, whether insights cite source entries, Ask Your Journal sourcing, voice and writing capture, privacy and AI providers. Purpose: learning for Dawnward, not cloning.

Evidence labels: **V** verified (help doc, roadmap/changelog, store listing feature text, privacy policy or terms describing behaviour), **M** marketing claim only, **R** reported by users in reviews, **A** my assumption.

## Date

2026-10-31

## Sources

| # | Source | URL | Notes |
|---|---|---|---|
| 1 | Marketing homepage (includes pricing anchor and FAQ) | https://mindsera.com | No separate /pricing page (404). Read 2026-10-31 |
| 2 | App Store listing (US) | https://apps.apple.com/us/app/mindsera-ai-journal-diary/id6742319153 | App id 6742319153, v1.59.0 released 2026-10-29, 4.8 from 283 US ratings, IAP prices, privacy label |
| 3 | iTunes Search API | https://itunes.apple.com/search?term=mindsera&entity=software&country=us | Full description and 1.59.0 release notes |
| 4 | Apple customer reviews RSS (US, GB) | https://itunes.apple.com/us/rss/customerreviews/page=1/id=6742319153/sortBy=mostRecent/json | Returned an empty feed (no entries) for pages 1 to 3, mostRecent and mostHelpful, US and GB |
| 5 | App Store reviews pages (US, GB, AU, CA) read normally | https://apps.apple.com/us/app/mindsera-ai-journal-diary/id6742319153?see-all=reviews | Fallback after empty RSS. 10 US, 8 GB, 1 AU, 2 CA reviews visible |
| 6 | Google Play listing | https://play.google.com/store/apps/details?id=com.mindsera&hl=en_US&gl=US | 4.7, 285 reviews, 10K+ downloads, updated 2026-10-26, 3 reviews visible without JS |
| 7 | Help centre index | https://mindsera.com/help | 40+ articles |
| 8 | Deep Analysis | https://mindsera.com/help/insights/deep-analysis | Unlock thresholds, tabs |
| 9 | Ask Your Journal | https://mindsera.com/help/insights/ask-your-journal | Sourcing statement, limits |
| 10 | Memory Profile | https://mindsera.com/help/account/memory-profile | Edit, delete, toggle |
| 11 | Entry Analysis | https://mindsera.com/help/editor/entry-analysis | Outputs on finish |
| 12 | Minds Comments | https://mindsera.com/help/editor/minds-comments | Built-in and custom Minds |
| 13 | Weekly Review | https://mindsera.com/help/insights/weekly-review | Monday email |
| 14 | Voice Journaling | https://mindsera.com/help/editor/voice-journaling | Audio stored, refine toggle |
| 15 | Call Mode | https://mindsera.com/help/editor/call-mode | 75 min calls |
| 16 | Go Deeper | https://mindsera.com/help/editor/personalized-prompts-go-deeper | Customize AI |
| 17 | Dashboard | https://mindsera.com/help/getting-started/dashboard | Quick actions, streak tracker |
| 18 | Rituals | https://mindsera.com/help/frameworks/rituals-morningevening | Set the Day, End the Day |
| 19 | Free vs Paid | https://mindsera.com/help/comparison/free-plan-vs-paid-plan | Feature table, free try counts |
| 20 | Privacy (help) | https://mindsera.com/help/general/privacy | AES-256, TLS 1.2, no E2EE, US storage |
| 21 | Subscription | https://mindsera.com/help/account/subscription | Billing, pause |
| 22 | Entries & Highlights | https://mindsera.com/help/getting-started/entries-and-highlights | Story View, search, filters |
| 23 | Roadmap (acts as changelog) | https://mindsera.com/help/general/roadmap | Monthly shipped list 2023 to Oct 2026 |
| 24 | Body-Mind | https://mindsera.com/help/insights/body-mind | Oura and Whoop |
| 25 | Connect AI Assistants (MCP) | https://mindsera.com/help/account/connect-ai-assistants-mcp | Scopes and limits |
| 26 | Mobile App | https://mindsera.com/help/getting-started/mobile-app | Platforms only |
| 27 | Frameworks | https://mindsera.com/help/frameworks/frameworks | Six categories |
| 28 | Settings | https://mindsera.com/help/account/settings | Full settings list |
| 29 | Privacy policy (effective 2026-09-09) | https://mindsera.com/privacy-policy | Providers, ZDR, trackers |
| 30 | Terms of service (effective 2026-09-09) | https://mindsera.com/terms-of-service | Refunds, AI disclaimer |
| 31 | Vendor article, ChatGPT vs Mindsera (2026-03-09) | https://mindsera.com/articles/chatgpt-vs-mindsera-ai-journaling-comparison-2026 | Marketing; hosting claim conflicts with help |
| 32 | Hacker News Algolia API | https://hn.algolia.com/api/v1/search?query=mindsera&typoTolerance=false | 0 hits for Mindsera |
| 33 | Trustpilot | https://www.trustpilot.com/review/mindsera.com | Bot challenge (403) via curl, 404 via WebFetch; no profile found by search |
| 34 | Product Hunt | https://www.producthunt.com/products/mindsera | 404 via WebFetch (also /posts/mindsera); not reached |

## Core loop

Write, speak, call or scan an entry, pull AI follow-up questions (Go Deeper) and persona comments (Minds) while writing, finish with Analyze to get a summary, emotions and an artwork, and over days the Insights area (topics, personality, emotions, suggestions, Ask Your Journal) plus a Monday email reflect patterns back.

## Screens

| ID | Screen | How reached | Purpose | Key components | States seen | Evidence |
|---|---|---|---|---|---|---|
| S01 | Onboarding and plan selection | First launch / web sign-up | Feature tour, choose plan | Tour of go-deeper, thinking tools, voice, entry details, finishing entries; plan picker | Replayable from Settings | V (help settings, roadmap Oct 2026 "new web onboarding and plan selection") |
| S02 | Dashboard (Home) | App open | Start an entry, rituals, prompts | Quick actions Scan/Speak/Write/Call (pick three), Daily Ritual, Favorites (frameworks), Recent Topics, "Ask your journal..." bar, flame streak icon, Customize | Streak icon becomes calendar icon when streaks hidden | V (help dashboard) |
| S03 | Entry editor | Write, or any quick action | Free writing | Minimal editor, "+" menu (Minds comments, Call mode, voice), Go Deeper button, Prompt Me, New Direction, cog for metadata | Draft, analyzed, archived | V (help go-deeper, entries) |
| S04 | Voice recording | Speak, mic icon, "+" in entry | Dictate entry | Recorder, Go Deeper while recording (sparkle), playback player | Recording, transcribing, failed recording (R) | V (help voice), R (review 14591635433) |
| S05 | Call Mode | Call quick action, phone icon | Spoken conversation | Live voice, AI replies on pause, voice choice, language on first use | Up to 75 min per call | V (help call-mode) |
| S06 | Scan | Scan quick action (mobile) | Photo of handwriting to text | Camera or upload, extracted text | Not on web | V (help dashboard) |
| S07 | Go Deeper reflection | Go Deeper button or Cmd/Ctrl+Enter | AI follow-up in the entry | Reflection text, Refresh, New Direction | Free: 3 uses then paywall | V (help go-deeper, free-vs-paid) |
| S08 | Minds comments panel | "+" > Minds comments | Persona comments on entry | Mind picker (up to 10), Create New, comment cards with "New" tag, reply thread, suggested questions | Short entries give little | V (help minds) |
| S09 | Entry analysis result | Analyze (mobile) / Finish entry (web) | Close the entry | Bullet summary, detected emotions, artwork (regenerate, share), streak update | 15 to 30 s processing on web | V (help entry-analysis) |
| S10 | Entries page | Entries tab | Browse history | Story view (timeline with recaps), List, Grid "Mind Gallery" | Daily/weekly/monthly/yearly recaps | V (help entries) |
| S11 | Search and filters | Search icon, sliders icon | Find entries | Natural language search, filters by state, contents, tags, frameworks, emotions, date | | V (help entries) |
| S12 | Insights: Patterns | Insights (sparkle) icon | Long-term reflection | Personality (Big Five), Recurring topics, Suggestions | Locked until 5 journaling days | V (help deep-analysis) |
| S13 | Insights: Emotions | Insights > Emotions | Emotion overview | Emotional state (Plutchik) for timeframe, emotion cards, Emotional Waves | Waves locked until 21 days | V (help deep-analysis) |
| S14 | Ask Your Journal | Insights > Ask, dashboard bar, emotion card | Q&A over entries | Question box, pre-made questions, suggested replies, Previous chats | Locked until 3 days; free: 2 questions | V (help ask) |
| S15 | Insights: Body-Mind | Insights > Body-Mind | Wearable vs mood | Period summary (Body, Mood averages, Overlap), tracker chart, Trend/Correlation/Anomaly cards, 7/30/90 days | Needs 3 days with analyzed entries | V (help body-mind) |
| S16 | Frameworks library | Dashboard favorites, thinking tools menu | Choose a guided template | Six categories, search, "Recommend me", custom framework creator, courses | | V (help frameworks) |
| S17 | Framework runner | Pick a framework | Guided entry | One question at a time or add all questions | Answers become one entry | V (help frameworks) |
| S18 | Daily Ritual | Dashboard Daily Ritual | Set the Day / End the Day | Conversational questions adapting to past entries and wearables, custom guidance | Free: 1 ritual | V (help rituals) |
| S19 | Streak tracker | Flame icon | Habit stats | Current streak, journaling time, word count, entries, calendar of active days | Hidden badge mode | V (help dashboard) |
| S20 | Settings | Profile/account icon | Configure | Appearance, Voice, Artworks, Weekly review, Custom portrait, Memory, Integrations, Subscription, General, Privacy & Data, Notifications, Passcode, Import/Export | | V (help settings) |
| S21 | Manage Memory | Settings > Memory | View and fix what AI remembers | Bullet list, Edit, Delete memory, Enable AI memory toggle | Refreshes nightly | V (help memory-profile) |
| S22 | Customize AI | From Go Deeper settings | Tone and persona | Sliders (Gentle/Direct etc.), length, perspective, custom instructions, presets, Call voice | Genius | V (help go-deeper) |
| S23 | Paywall / subscription | Hitting a limit, Settings > Subscription | Upgrade, cancel, pause | Monthly/annual, offers, Stripe portal on web, pause 1 to 3 months | "Already used your free chance" (R) | V (help subscription), R (review 14591635433) |
| S24 | Weekly Review email | Email, Mondays | Week recap | Summary, recurring topics, weekly mindset, three suggestions | Only after 4 journaling days | V (help weekly-review) |
| S25 | Passcode lock | Opening app when enabled | Local privacy | PIN entry | Web: after inactivity | V (help settings) |
| S26 | MCP consent page | Adding connector in Claude/ChatGPT/Gemini | Authorise assistant | Sign in, scope toggles, "Unverified app" warning, Settings > Integrations list | 30-day idle expiry | V (help mcp) |
| S27 | Widgets, Live Activities, Watch | OS surfaces | Fast capture | New entry, voice, ritual, call shortcuts | | V (help dashboard, voice) |

## Flows

| ID | Goal | Screens | Happy-path taps (if knowable) | Edge cases |
|---|---|---|---|---|
| F01 | Write an entry and get reflected back | S02, S03, S07, S09 | Write > type > Go Deeper (repeat) > Analyze | Free plan: Go Deeper 3 uses, Analysis 1 use, then S23 (V) |
| F02 | Voice entry | S02, S04, S07, S09 | Speak > talk > sparkle for follow-up > keep talking > Analyze | Failed recording consumed the only free try (R, 14591635433); retranscribe; refine toggle (V) |
| F03 | Spoken conversation | S02, S05, S09 | Call > choose language (first time) > talk > pause for reply > end | 75 min cap, start new call to continue (V) |
| F04 | Scan handwriting | S02, S06, S03 | Scan > photograph > review text | Mobile only (V) |
| F05 | Persona comments | S03, S08 | "+" > Minds comments > choose up to 10 > Get comments > tap comment > reply | Short entries yield weak comments (V) |
| F06 | See long-term patterns | S12, S13 | Insights icon > Patterns / Emotions tabs > tap emotion | Locked under 5 days; Waves under 21 days (V) |
| F07 | Ask the journal | S14 | Insights > Ask > pick or type question > follow suggested replies | Locked under 3 days; free 2 questions; earlier context loss in chats (R, 13738788545) |
| F08 | Morning and evening ritual | S02, S18 | Daily Ritual > Set the Day or End the Day > answer | Free: 1 ritual (V); evening to morning carry-over not documented |
| F09 | Correct what the AI remembers | S20, S21 | Settings > Memory > Edit > change bullet; or Delete memory; or toggle off | Per-item source not documented; whole-memory delete only (A from help wording) |
| F10 | Weekly recap | S24 | Receive Monday email | Not sent if under 4 journaling days (V) |
| F11 | Guided framework | S16, S17 | Frameworks > Recommend me or browse > run questions | Answers saved as one entry (V) |
| F12 | Connect an outside AI assistant | S26, S20 | Add https://app.mindsera.com/mcp in assistant > sign in > approve scopes | Create/edit off by default; no delete; data already read stays with assistant (V) |
| F13 | Upgrade, pause or cancel | S23 | Settings > Subscription > plan / Pause / Cancel | Store billing must be cancelled in store (V) |

## Components

Quick action tiles (Scan, Speak, Write, Call); customizable dashboard sections; minimal rich-text editor with "+" tool menu; Go Deeper button with Refresh and New Direction; Prompt Me / prompts sheet; voice recorder with playback, retranscribe and download; call screen with voice picker; Minds picker (multi-select up to 10) and comment cards with "New" tag and reply thread; entry analysis sheet (bullets, emotion chips, artwork); Story View timeline with period recaps; grid "Mind Gallery"; natural-language search; filter sheet; Insights tab bar (Patterns, Emotions, Ask, Body-Mind); emotion cards; Emotional Waves chart; Body-Mind dual-line chart with period summary; Ask chat with suggested replies and Previous chats drawer; frameworks browser with categories and recommender; one-question-at-a-time runner; ritual cards; flame streak badge and stats calendar; Customize AI sliders and presets; Manage Memory bullet list with Edit and Delete; settings list; passcode keypad; paywall with monthly/annual and offers; iOS widgets and Live Activities; watch recorder; weekly email template. All V from sources 7 to 28, layout details A.

## Inferred data model

| Entity | Fields | Evidence | Confidence |
|---|---|---|---|
| User | id, name, email, password, language, timezone, week start, theme, font, passcode settings, plan | V help settings | high |
| Entry | id, user_id, body text, created_at, edited_at, status (draft, analyzed, archived), highlight flag, tags, location, framework_id, ritual type, input mode | V help entries, roadmap | high |
| VoiceRecording | id, entry_id, audio file, transcript, language, refined flag | V help voice | high |
| Photo | id, entry_id, file (Cloudflare R2) | V privacy policy | high |
| AIReflection (Go Deeper turn) | id, entry_id, text, direction, created_at | V help go-deeper | medium |
| Mind | id, owner (built-in or user), name, focus prompt, visibility (private, public) | V help minds | high |
| MindComment | id, entry_id, mind_id, anchored passage, text, is_new, replies | V help minds | medium |
| EntryAnalysis | entry_id, bullet summary, emotions (Plutchik labels), artwork url, artwork prefs | V help entry-analysis | high |
| InsightSnapshot | user_id, period, recurring topics, Big Five profile, suggestions, emotion frequencies | V help deep-analysis | medium |
| AskConversation / AskMessage | id, user_id, title, messages, scope (all entries or emotion + period) | V help ask | medium |
| MemoryProfile | user_id, bullet facts, updated_at (nightly), enabled flag; four layers | V help memory-profile | medium |
| Recap | user_id, period (day, week, month, year), summary text | V help entries | medium |
| WeeklyReview | user_id, week, summary, topics, mindset, three suggestions, sent_at | V help weekly-review | medium |
| Framework / Course | id, category, title, questions[], is_custom, owner | V help frameworks | high |
| RitualConfig | user_id, morning guidance, evening guidance | V help rituals | medium |
| StreakStats | user_id, current streak, total time, word count, entry count, active days | V help dashboard | high |
| AISettings | tone sliders, length, perspective, custom instructions, preset, call voice | V help go-deeper | high |
| WearableDay | user_id, date, source (Oura, Whoop), body score, metrics | V help body-mind | medium |
| MCPConnection | id, client name, scopes (read, read analyses, create, edit), last_used, verified flag | V help mcp | high |
| Subscription | plan, platform (App Store, Play, Stripe), period, status, paused_until | V help subscription | high |
| FreeTrialUsage | user_id, feature, uses left | V free-vs-paid, R review 14591635433 | medium |
| Embedding index | entry chunk vectors with recency weighting | V roadmap Apr 2026 ("recency-weighted semantic search"), schema A | guess |

## Pricing

Read 2026-10-31.

| Tier | Price | Source |
|---|---|---|
| Curious | Free. Minimal journal, habit tracker, passcode, themes, tags, export, 52+ frameworks, custom frameworks, Smart Highlights, daily Story recaps, one-time tries of AI features | https://mindsera.com (pricing anchor), https://mindsera.com/help/comparison/free-plan-vs-paid-plan |
| Genius monthly | $14.99 / month | https://mindsera.com, App Store IAP "Genius Monthly" |
| Genius annual | $129 / year (shown as $10.75 / month, "save 28%") | https://mindsera.com, App Store IAP "Genius Annual" |
| App Store offers | "Genius Monthly Offer" $17.99, "Genius Annual Offer" $99.00 | https://apps.apple.com/us/app/mindsera-ai-journal-diary/id6742319153 |

Trial length: not stated anywhere I could read (homepage button says "Start free trial"). Terms: trials auto-convert unless cancelled; fees generally non-refundable, voluntary refund requests within 14 days; EEA web buyers have 14-day withdrawal right (V terms). A GB reviewer mentions "For £80" (R, 13819995453).

## Privacy and AI model (what is verified)

- At rest AES-256, in transit TLS 1.2+ (V, help privacy).
- No end-to-end encryption: "Mindsera does not currently use end-to-end encryption" (V, privacy policy). Help says E2EE "is impossible to use with AI at the moment" (V).
- AI providers named: OpenAI API, Anthropic Claude API, Google AI APIs; image generation and Call Mode providers unnamed ("available on request") (V, privacy policy).
- Training: "Your journal content is not used to train or improve AI models" (V statement in policy). Anthropic requests use zero data retention where eligible; OpenAI retention depends on endpoint; Google depends on service (V).
- Data sent to AI: "the minimum content and settings reasonably needed" (V).
- Staff access to entries: not stated; only "restricted staff access" (V that it is unstated).
- Storage location: help says "stored in the United States" (V help), vendor article says Fly.io in EU or US by location (M). Conflict.
- Subprocessors include Cloudflare, Fly.io, Upstash, Cloudinary, AWS, SendGrid, Kit, Stripe, RevenueCat, PostHog, Google Analytics, Sentry, AppsFlyer, Meta, X Ads, GTM (V). Policy says journal content is not sent to ad partners (V).
- App Store privacy label declares "Data Used to Track You: Purchases, Contact Info, Identifiers, Usage Data" and Sensitive Info linked to you (V, developer-declared).
- Voice recordings stored per entry; Call Mode audio not stored (V). Wearable data is special-category health data on consent (V).
- Memory Profile "encrypted just like your entry data" (V help).
- Insight citations: no help page says insights, Ask answers or memory bullets link to the entries they came from. Not verified either way; I assume answers do not show clickable source entries (A). Users describe the AI recalling related past entries in-conversation (R, 13763579237).
- Marketing: "Encrypted, private, and secure by design", ISO 27001, SOC 2 (M only).

## What cannot or should not be taken

- Their names and marks: Mindsera, Genius, Curious, Minds, Go Deeper, New Direction, Set the Day, End the Day, Mind Gallery, Story View, Body-Mind, "AI journal that reflects back", "gym for the mind", "copilot for thinking".
- Their frameworks library text, course text (7-Day Journaling Challenge), built-in Minds personas and prompts, Customize AI presets wording, ritual questions, onboarding copy, weekly email copy and layout.
- Their testimonials, press logos, stats (80,000+ users, 4M+ minutes, research percentages), founder statement.
- Artwork styles and generated images, app icon, colour themes, screenshots.
- Any prompts or system behaviour not publicly documented.
- Generic science (Plutchik wheel, Big Five, CBT, Stoicism) is public, but Mindsera's specific implementation and copy are theirs.

## Size

- iOS 145 MB, iOS 16.4+, watchOS 10+, iPad supported as of 1.59.0 (V).
- US App Store 4.8 from 283 ratings (253 five, 16 four, 6 three, 1 two, 7 one); GB 4.8 from 32; CA 4.7 from 18; AU 4.8 from 12 (V, store page data).
- Google Play 4.7, 285 reviews, 10K+ downloads (V).
- 12 App Store languages; homepage FAQ says optimised for English (V/M).
- "80,000+" users, 168 countries (M).
- About 59 features mapped; 27 screens; 13 flows.

## Lessons for Dawnward

1. **An editable memory is table stakes, provenance is the gap.** Mindsera shows a bullet Memory Profile, refreshes it nightly, lets you edit or delete it and turn it off, and says it "doesn't infer or assume things". None of its help pages show which entry a memory or insight came from. Dawnward's "Why I think this" (linked to the user's own words) and "That's not right" per belief go one step past it. V https://mindsera.com/help/account/memory-profile ; gap V/A https://mindsera.com/help/insights/deep-analysis
2. **Honest unlock thresholds instead of thin insights.** Insights wait for 5 journaling days, Ask for 3, Emotional Waves for 21, weekly email for 4 days that week. Dawnward can show calm "not enough of your words yet" states without guilt or counters. V https://mindsera.com/help/insights/deep-analysis , https://mindsera.com/help/insights/weekly-review
3. **Reflection, not answers.** Go Deeper "won't summarize, conclude, or answer for you". Users praise being challenged rather than echoed ("I didn't want an echo chamber", "tweak it to not be sycophantic"). Fits Dawnward's three steps from the user's own words. V https://mindsera.com/help/editor/personalized-prompts-go-deeper ; R https://apps.apple.com/us/app/id6742319153?see-all=reviews#13925740662 , #14414638669
4. **Keep the exact words.** Voice audio is kept, can be retranscribed, and "Refine transcription with AI" can be turned off "to keep exactly what you said". For a product that quotes the user back, verbatim capture matters. V https://mindsera.com/help/editor/voice-journaling
5. **Low-friction mixed capture drives the habit.** Users credit switching between voice, text, call and handwriting scan for sticking with it. V https://mindsera.com/help/getting-started/dashboard ; R https://apps.apple.com/us/app/id6742319153?see-all=reviews#13752024051 , #13763579237
6. **Scoped questions from an insight.** Tapping an emotion card opens Ask Your Journal for that feeling and period. Dawnward could let a person tap a belief or a world (Mind, Body, Soul, Future) to ask "why", answered with quoted entries. V https://apps.apple.com/us/app/mindsera-ai-journal-diary/id6742319153 (1.59.0 notes), https://mindsera.com/help/insights/ask-your-journal
7. **Name the AI providers and admit no E2EE.** Mindsera's policy names OpenAI, Anthropic (with zero data retention) and Google, and says plainly it has no end-to-end encryption, while its marketing says "secure by design" and its help and article disagree on US vs EU hosting. Dawnward should state providers, retention and hosting once, consistently. V https://mindsera.com/privacy-policy , https://mindsera.com/help/general/privacy ; M https://mindsera.com/articles/chatgpt-vs-mindsera-ai-journaling-comparison-2026
8. **Do not let a failed attempt use up a free try.** The 1-star review is about a voice recording that "recorded nothing" and then counted as the only free use. R https://apps.apple.com/us/app/id6742319153?see-all=reviews#14591635433 ; V https://mindsera.com/help/comparison/free-plan-vs-paid-plan

### Conflicts with Dawnward's rules

- Streaks are on by default with a flame badge, stats and calendar; the store listing and an App Store testimonial celebrate a "21-day streak"; "weekly targets" for a "cognitive-fitness habit". Dawnward forbids streaks. Hiding them is opt-in (V help dashboard, store listing).
- Numeric scores about the person: Body-Mind shows average Body and Mood scores and an Overlap percentage; Big Five "personality type"; emotion frequency counts. Dawnward avoids numeric scores about a person (V help body-mind, deep-analysis).
- Unsourced research percentages on the homepage (85%, 88%, 22.8%, 42%, 59%) and clinician quotes as proof. Dawnward forbids fabricated or unverifiable proof; do not copy this pattern (M homepage).
- "Gym for the mind" and productivity framing drew a 1-star complaint about tone ("Super macho man coded, no moments for emotional regulation") (R https://apps.apple.com/gb/app/id6742319153?see-all=reviews#13552845686).
- Paywall pressure: free users meet repeated upgrade prompts and one-shot tries (R Google Play c4beb253, App Store 14591635433). Dawnward should avoid guilt or scarcity nudges.
- Review clustering: 11 of 21 App Store reviews are dated 2026-02-11 to 2026-02-18 with developer replies on 2026-02-26, and one reviewer says the AI drafted their review. This suggests a solicited review push (A); treat Mindsera's rating as weaker evidence.

### Review coverage note

Only 24 reviews were reachable: Apple's RSS feed was empty, Play shows 3 without JavaScript, Hacker News has none, Trustpilot and Product Hunt were not reachable. App Store review URLs use the format https://apps.apple.com/{country}/app/id6742319153?see-all=reviews#{reviewId}. Play URLs use the listing URL plus &reviewId={id}. The App Store text field in reviews.csv is "Title: ... | Review: ..." with both parts verbatim. Some verbatim review text contains long dashes; they were left as written.
