# Recon map: Exist (platforms)

## Scope

Exist (exist.io) by Hello Code Pty Ltd, Melbourne, Australia. Personal analytics: automatic syncing from health, productivity and media services plus manual tracking (mood, custom tags, custom numbers), with daily insights, rolling averages, goals and weekly correlations. Platforms: web app, iOS (App Store id 986201088), Android (Google Play id co.hellocode.exist). Public API v2.

Purpose: competitor learning for Dawnward (evening debrief, morning three steps, Personal Model, Universe of Mind, Body, Soul, Future). Not a clone brief.

Method: public pages only, read with curl and WebFetch at a human pace. No login, no sign-up, no paywall, no JavaScript bundles or network calls, no images saved.

Evidence labels: **V** verified (help doc, API doc, changelog or blog describing shipped behaviour, store listing feature text, privacy policy), **M** marketing claim only, **R** reported by users in reviews, **A** my assumption.

## Date

2026-10-31

## Sources

| # | Source | URL | Notes |
|---|---|---|---|
| 1 | Marketing home | https://exist.io/ | Pricing, positioning, correlation pitch |
| 2 | Mood tracking page | https://exist.io/about/mood/ | Nightly notification, email reply, one year ago |
| 3 | Manual tracking page | https://exist.io/about/custom-tags/ | Value types, tags, correlations after a few weeks |
| 4 | Data syncing page | https://exist.io/apps-data-syncing/ | Full list of services and attribute names |
| 5 | Values page | https://exist.io/about/values/ | No AI, no selling data, export, deletion |
| 6 | FAQs | https://exist.io/page/faqs/ | Partly stale (mentions Dark Sky, Twitter, Google Fit) |
| 7 | Privacy policy | https://exist.io/privacy/ | Last updated 6 Oct 2023, history to 2024-09-19 |
| 8 | Developer home | https://developer.exist.io/ | API v2 index |
| 9 | API: object types | https://developer.exist.io/reference/object_types/ | Data model, correlation and average definitions, templates |
| 10 | API: correlations | https://developer.exist.io/reference/correlations/ | Endpoints, fields, example JSON |
| 11 | API: insights | https://developer.exist.io/reference/insights/ | Insight object |
| 12 | API: averages | https://developer.exist.io/reference/averages/ | Weekly medians by weekday |
| 13 | API: attributes | https://developer.exist.io/reference/attributes/ | Read endpoints |
| 14 | API: attribute ownership | https://developer.exist.io/reference/attribute_ownership/ | Acquire, release, one owner per attribute |
| 15 | API: OAuth2 | https://developer.exist.io/reference/authentication/oauth2/ | Read and write scopes per group |
| 16 | API: important values | https://developer.exist.io/reference/important_values/ | Base URL, rate limit 300 req/hr |
| 17 | API: changelog | https://developer.exist.io/reference/changelog/ | API 2 GA 2022-08-18 |
| 18 | KB: What are correlations? | https://kb.exist.io/article/37-what-are-correlations | Strength vs confidence, causation wording |
| 19 | KB: How long to find correlations | https://kb.exist.io/article/18-how-long-does-it-take-to-find-correlations | 3 weeks minimum, weekly on Monday |
| 20 | KB: Correlations across days | https://kb.exist.io/article/55-will-exist-find-correlations-across-multiple-days | Next-day lag check |
| 21 | KB: Goals | https://kb.exist.io/article/39-how-does-exist-calculate-goals | Goal = recent average for this weekday |
| 22 | KB: Export | https://kb.exist.io/article/14-how-do-i-export-my-data | PDF, CSV, JSON |
| 23 | KB: Scale 1-9 | https://kb.exist.io/article/62-why-are-scale-values-1-9 | Midpoint rationale |
| 24 | KB: Import | https://kb.exist.io/article/118-can-i-import-data-from-a-file | No file import |
| 25 | KB: Suggested tags | https://kb.exist.io/article/110-what-are-suggested-tags | Disappear after more than 6 tags |
| 26 | KB: Mood tracking | https://kb.exist.io/article/36-what-is-mood-tracking | 1 terrible, 9 excellent, one year ago |
| 27 | KB: Mood cannot be turned off | https://kb.exist.io/article/112-can-mood-tracking-be-turned-off | Always on Review tab |
| 28 | KB: One value per day | https://kb.exist.io/article/57-can-i-track-multiple-values-per-day | Daily granularity only |
| 29 | KB: Location | https://kb.exist.io/article/100-how-is-location-data-used | Coarse location, weather, location correlations |
| 30 | KB: Suspend | https://kb.exist.io/article/24-can-i-suspend-my-account | Long-term users only |
| 31 | KB: Fitbit migration | https://kb.exist.io/article/131-migrating-from-fitbit-to-apple-health-and-health-connect | Fitbit service turned off end of October 2026 |
| 32 | KB: iOS sync | https://kb.exist.io/article/40-how-often-will-my-ios-data-sync-to-my-exist-account | Background sync, locked phone limits |
| 33 | KB: Google Fit sleep | https://kb.exist.io/article/101-why-does-google-fit-sleep-show-up-as-time-in-bed | Google Fit limitation (article from Jan 2024) |
| 34 | KB: Initial sync | https://kb.exist.io/article/63-how-much-data-will-sync-when-i-connect-a-service | 30 days back, at least 14 |
| 35 | KB: Why not my service | https://kb.exist.io/article/13-why-dont-you-integrate-with-my-favourite-service | MyFitnessPal refused API access |
| 36 | Blog: 2025 redesign | https://exist.io/blog/post/exist-2025-redesign/ | Home, Review, Browse tabs, pins, subgroups, Symptoms and Medication groups |
| 37 | Blog: PDF exports | https://exist.io/blog/post/pdf-export/ | 23 Apr 2026, PDF reports, CSV of up to 5 attributes, merge tags |
| 38 | Blog: User survey 2025 | https://exist.io/blog/post/exist-survey-2025/ | 5 Feb 2026, usage, problems, genAI stance |
| 39 | Blog: 2023 updates | https://exist.io/blog/post/2023-updates/ | Sleep stages, Trakt, correlation graphs on trends pages |
| 40 | Public roadmap | https://changemap.co/hellocode/exist/ | Votes: multiple moods per day 557, weekly and yearly reports |
| 41 | App Store listing | https://apps.apple.com/us/app/exist/id986201088 | v4.4.1 of 2026-10-23, 47 US ratings, 4.0, privacy label, IAP $8.49 |
| 42 | iTunes lookup API | https://itunes.apple.com/lookup?id=986201088&country=us | Description, release notes, size 14.9 MB, iOS 18.0+ |
| 43 | Apple reviews RSS (US) | https://itunes.apple.com/rss/customerreviews/page=1/id=986201088/json | 20 reviews, only 1 page exists; feed returned empty on most attempts |
| 44 | App Store see-all reviews pages | https://apps.apple.com/{us,gb,au,ca,de,nl,se,nz,ie}/app/exist/id986201088?see-all=reviews | Reviews embedded in page; nz and ie had none |
| 45 | Google Play listing | https://play.google.com/store/apps/details?id=co.hellocode.exist&hl=en_US&gl=US | 4.5 stars, 207 reviews, 10K+ downloads, data safety, 3 reviews visible |
| 46 | Hacker News Algolia API | https://hn.algolia.com/api/v1/search?query=exist.io&tags=comment | 40 hits mentioning Exist, 20 user comments kept |
| 47 | Hello Code stats | https://hellocode.co/stats/ | Paid users and income, public |
| 48 | Trustpilot | https://www.trustpilot.com/review/exist.io | Not reachable: 403 by curl, 404 by WebFetch. No page found |
| 49 | Product Hunt | https://www.producthunt.com/products/exist | curl blocked (403); WebFetch showed 1 review, 5.0, text not retrievable verbatim, so not used |

## Core loop

Data flows in automatically from connected services and the phone, the user adds a nightly mood rating, note, tags and manual numbers on the Review tab, and Exist returns daily insights, progress against a personal weekday median, and weekly correlations that pair any two attributes in a plain-English sentence.

## Screens

| ID | Screen | How reached | Purpose | Key components | States seen | Evidence |
|---|---|---|---|---|---|---|
| S01 | Marketing home and sign up | exist.io | Explain, price, start trial | Animated example tags ("2/9 stress level", "headache"), "Discover how X affects Y", pricing card, values block | Logged out | V (page read) |
| S02 | Sign up and trial start | "Start your free trial" | Create account, 30-day trial | Email, password (strict rules), card up front per Play listing | Password "too weak" error with no rules listed (R, 2 reviews) | M (Play listing text), R |
| S03 | Home tab (mobile) | App launch | Daily overview | Insight cards with graphs and album art, 4 pinned attributes, "one year ago" mood and note | Not enough data for one year ago falls back to "a few months ago" | V (blog 2025 redesign, KB 36) |
| S04 | Review tab (mobile and web) | Tab bar, nightly notification | Enter the day's manual data | Mood 1-9 picker, mood note (max 1000 chars), tags, suggested tags, custom numbers, subgroups, Symptoms and Medication groups | Suggested tags shown until more than 6 own tags; mood cannot be hidden | V (KB 110, 112, API templates, blog) |
| S05 | Browse tab (mobile) | Tab bar | Raw history by month for any attribute | Month list, per-day values | Null days shown as N/A (A from KB 18 wording) | V (blog 2025 redesign, survey) |
| S06 | Attribute detail and trends page | Tap an attribute | Value history, averages, related attributes | Graphs, rolling average, graph of strongest correlations | Too little data for correlations | V (blog 2023 updates) |
| S07 | Correlations page (per attribute) | From attribute or trends | List relationships | Sentence, strength phrase, confidence stars, user rating | None found before 3 weeks of data | V (KB 37, 18, 100; API) |
| S08 | Mood trends page | Mood attribute | What goes with good and bad days | Strongest mood correlations graph, words written most per mood (M) | Not stated | V (blog 2023), M (mood page) |
| S09 | Dashboard progress bars | Web dashboard, Home | Today vs personal goal | Progress bar per attribute, end value = median for this weekday over last 60 days | Below or above usual | V (KB 39, API averages) |
| S10 | Attributes management | Name menu, "Attributes" | Turn attributes on or off, choose source service, groups | Collapsible coloured groups, autosave, service dropdown, merge tag, rename, delete | Multiple services for one attribute: one at a time | V (FAQ, blog 2023, blog PDF export) |
| S11 | Services page (web) | Plus icon or account, "Services" | Connect and disconnect integrations | Service list with Connect and Disconnect, OAuth hand-off | Disconnect keeps past data | V (FAQ) |
| S12 | Mobile settings: Apple Health or Health Connect integration | Cog icon | Choose which phone data syncs | Per-attribute toggles | Some attributes cannot be turned on (KB 43 title) | V (KB 131) |
| S13 | Account settings and export | Name menu | Billing, timezone, preferences, export | Update card, timezone dropdown, Export data (PDF, CSV, JSON) | Not stated | V (FAQ, KB 14) |
| S14 | Delete or suspend account | Account, delete page | Leave or pause | Delete, suspend (if qualified) | Suspend only for long-term paid users | V (KB 24, FAQ) |
| S15 | Weekly summary email | Email | Weekly recap | Insights, mood notes (can be turned off) | Not stated | M (home), V (roadmap: "Option to turn off full mood notes in weekly email", "Update weekly report emails" completed) |
| S16 | Nightly mood notification and email reply | Push or email at night | Two-tap mood rating | Rating 1-9, optional note | Email reply path | M (mood page), R (GB 2015 review) |
| S17 | PDF report | Export data | Share with doctor or family | One or two attributes, graphs, correlations, averages, raw table | Not stated | V (blog PDF exports) |
| S18 | Yearly report | Not stated | Year in review | Unknown | Not stated | V that it shipped (roadmap "2025 in review yearly report"), content A |
| S19 | Public roadmap | Footer link | Suggest and vote | Suggestions, statuses, votes | Not possible / seek alternatives | V (page read) |
| S20 | iOS Shortcuts actions (no screen) | Shortcuts app | Set or increment any manual attribute | Set value, increment value | Not stated | V (App Store release notes 4.4.1) |

## Flows

| ID | Goal | Screens | Happy-path taps (if knowable) | Edge cases |
|---|---|---|---|---|
| F01 | Start a trial | S01, S02, S11 | Start your free trial, email and password, card, connect first service | Password rejected without stated rules (R); card asked up front (M, Play listing); iOS uses in-app purchase at a higher price (V) |
| F02 | Connect a service | S11 or S12 | Plus icon, Services, Connect, log in at provider, grant access | Initial sync 30 days back, up to 24 hours (V KB 63); iOS syncs only when phone unlocked and iOS allows background run (V KB 40); Fitbit shutting down end of Oct 2026 (V KB 131) |
| F03 | Nightly review | S16, S04 | Notification, rate mood 1-9, optional note, tap tags, enter numbers, save | Only one mood per day (V KB 57); mood cannot be hidden (V KB 112); forgetting is a top problem, 17% in survey (V blog survey) |
| F04 | Read today's insights | S03 | Open app, scroll insight cards | Insights are generated, not requested (V API) |
| F05 | Explore a relationship | S06, S07, S08 | Tap attribute, open correlations, read sentence, rate it | Fewer than 3 weeks of data: nothing shown (V KB 18); next-day lag found (V KB 55) |
| F06 | Export or share data | S13, S17 | Account, Export data, pick PDF, CSV or JSON, choose attributes and dates | CSV up to 5 attributes (V); no file import (V KB 118) |
| F07 | Change data source for an attribute | S10 | Attributes, dropdown, choose service | Only one service per attribute (V FAQ, API ownership) |
| F08 | Leave | S14 | Account, delete page, delete or suspend | Stripe keeps payment records (V privacy); backup retention "commercially reasonable period" (V privacy) |
| F09 | Developer writes data | API | OAuth2, request scopes, acquire attribute, POST values | Must own attribute; 300 requests per hour (V API) |
| F10 | Weekly recap | S15 | Open email | Full mood notes in email can be turned off (V roadmap) |

## Components

- Attribute row with progress bar to a personal median goal (V KB 39).
- 1-9 scale picker; KB explains 5 is the exact midpoint (V KB 62).
- Tag chip (boolean per day), suggested tag chips, tag subgroups, merge tag action (V).
- Quantity, decimal, percentage, duration, time of day and scale inputs (V custom-tags page and API value types).
- Correlation item: second-person sentence, strength phrase, confidence stars, user rating (V API).
- Insight card: short text plus secondary line, sometimes graph or album art (V API, blog).
- "One year ago" mood and note card (V KB 36).
- Pinned attributes strip (4) (V blog).
- Month browser for raw data (V blog).
- Service connect list and per-attribute source dropdown (V FAQ).
- Weekly email, PDF report, CSV and JSON export (V).
- Shortcuts actions on iOS (V).

## Inferred data model

| Entity | Fields | Evidence | Confidence |
|---|---|---|---|
| User | username, first_name, last_name, avatar, timezone, local_time, imperial_distance, imperial_weight, imperial_energy, imperial_liquid, imperial_temperature, trial, delinquent | V, https://developer.exist.io/reference/object_types/ | high |
| Group | name, label, priority (e.g. activity, productivity, mood, sleep, workouts, events, finance, food, health, location, media, social, weather, custom, symptoms, medication) | V object types and OAuth scopes https://developer.exist.io/reference/authentication/oauth2/ | high |
| Attribute | group, template, name (ASCII id), label (may include emoji), priority, manual, active, value_type, value_type_description, service {name, label}, available_services | V object types, attributes reference | high |
| AttributeValue | attribute, date (user-local), value; one per day; null when missing | V object types: "tracked at a single day granularity", KB 57 | high |
| ValueType | 0 integer, 1 decimal, 2 string, 3 duration minutes, 4 time of day from midnight, 5 percentage 0-1, 6 time of day from midday (templates only), 7 boolean, 8 scale 1-9 | V object types | high |
| AttributeTemplate | name, group, value_type; around 90 templates such as steps, sleep, mood, mood_note (max 1000 chars), energy_level, stress_level, heartrate_variability, menstrual_flow, weather_temp_max, day_length | V object types | high |
| CustomTag | attribute with value_type 7 in custom group, value 1 = tagged, 0 or null = not | V object types | high |
| Service / Client | OAuth2 client; a client that writes is a service; integration = first-party service; scopes per group | V object types, OAuth2 | high |
| AttributeOwnership | attribute, owning service; one owner at a time; acquire, release | V https://developer.exist.io/reference/attribute_ownership/ | high |
| Correlation | date, period (days in window, e.g. 309, 364), offset (0 same day, A: 1 = next day), attribute, attribute2, value (-1 to 1), p, percentage, stars (1-5), second_person, second_person_elements [3 parts], attribute_category (sub-correlation e.g. one calendar), strength_description, stars_description, description, occurrence, rating | V https://developer.exist.io/reference/correlations/ | high (meaning of offset 1 is A) |
| CorrelationRating | positive (bool), rating_type (int, e.g. 50), rating (label e.g. "Useful") | V correlations reference | medium (other rating types not documented) |
| Insight | created, target_date, type {name e.g. dow_sleep, period, priority 1 real-time 2 day 3 week 4 month, attribute}, html, text | V https://developer.exist.io/reference/insights/ | high |
| Average | attribute, date, overall, monday to sunday; weekly; median of last 60 days | V https://developer.exist.io/reference/averages/ and object types | high |
| Goal | derived from Average for today's weekday, not stored separately | V KB 39 | medium |
| Subgroup | user-defined grouping of manual attributes and tags | V blog 2025 redesign; not in API docs | medium |
| Export | PDF report config (1 or 2 attributes, sections), CSV (up to 5 attributes, date range), JSON full | V blog PDF exports | medium |
| Subscription | plan monthly or yearly, Stripe or Apple IAP, trial, delinquent flag | V privacy (Stripe), user object (trial, delinquent), App Store IAP | medium |

## Correlations: how they are computed and worded

Computation (V unless marked):

- Scope: "automatically correlate everything against everything else" (founder on HN, 2015, https://news.ycombinator.com/item?id=10716209, M). API: correlations are pairs of any two attributes, including custom tags and location (V, https://kb.exist.io/article/100-how-is-location-data-used).
- Measure: "Correlation values vary between -1 and +1 with 0 implying no correlation. Correlations of -1 or +1 imply an exact linear relationship." (https://developer.exist.io/reference/object_types/). The exact coefficient (Pearson or rank) is not stated (A: a linear coefficient such as Pearson).
- Percentage: the example values show percentage = absolute value x 100 (value -0.5577 gives percentage 55.77) (V, https://developer.exist.io/reference/correlations/).
- Confidence: "P-values are a way of determining confidence in the result. A value lower than 0.05 is generally considered "statistically significant". We provide a user-friendly stars integer which maps to the P-value, where 5 stars indicates a value well below 0.05." (https://developer.exist.io/reference/object_types/). The other star thresholds are not published. Example: p 0.0288 gave 4 stars, "Almost certainly related" (V correlations reference).
- Minimum data: "We need at least three weeks' worth of data for an attribute, excluding days with no data (shown as "N/A"), before we can find correlations." (https://kb.exist.io/article/18-how-long-does-it-take-to-find-correlations).
- Cadence: "Correlations are generated weekly on Sundays." (API object types) and "Correlations are updated weekly, so each Monday you'll see new correlations available." (KB 18). The API list returns "all correlations generated in the last week".
- Window: the period field shows 305 to 364 days in examples (A: up to one year of history per pair).
- Lag: "If a correlation between two attributes isn't found for the same day, Exist will check for correlations between attributes across two consecutive days." (https://kb.exist.io/article/55-will-exist-find-correlations-across-multiple-days).
- Sub-correlations: attribute_category holds, for example, one specific calendar correlated with productive time (V object types).
- No control for third variables: roadmap item "Control correlations for a third attribute" is under consideration with 11 votes (V roadmap); a Play reviewer notes "this app doesn't give you r^2 values or allow you to control for certain variables (yet)" (R).
- Filters: strong=1 returns only correlations "above a certain relationship strength", confident=1 returns only "five-star confidence" (V correlations reference). Threshold not published.

Wording (V, quotes from docs):

- Sentence: "We create simple English sentences to represent each possible correlation as a combination of attributes." Examples: "you spend more time asleep when you go to bed earlier.", "you get more steps when you tag 'walk' more.", "You are less active when it's a warmer day." Stored as three elements: effect, "when", condition.
- Strength phrases seen: "Nearly always go together" (0.68), "Quite often go together" (0.56), "Rarely go together" (0.13).
- Confidence phrases seen: "Certain to be related" (5 stars), "Almost certainly related" (4 stars).
- Doc display example: "(55% strength / 5 stars / P 0.007)".
- Templated pairs get extra description and occurrence (e.g. "Very common") explaining why, e.g. music and productivity.

How they warn that correlation is not causation (V):

- API: "We're also careful to represent these as correlations only, not as one attribute directly causing a change in the other, and we ask that you do the same. Correlation is not causation. There may be many hidden factors which underlie the relationship between two attributes. It is up to the user to determine the cause." (https://developer.exist.io/reference/object_types/)
- KB: "Correlations can't determine the cause of the relationship" and "this is up to you to have a think about! One attribute changing might cause the other to change or vice versa, or a third variable might affect both attributes, or the relationship might be a coincidence." (https://kb.exist.io/article/37-what-are-correlations; split where the original has a long dash)
- KB: "All correlations can be read with either attribute first, because they don't imply any causation, only that both attributes happen to go up or down on the same days."
- KB on strength vs confidence: "You might have a very strong relationship between two attributes, for example, with a very low confidence if we don't have much data to use in our calculations."

Where their own copy drifts toward causation (V that the text exists; the judgement is mine):

- API: "We present these to users as a way to explain past trends, and use them to predict future behaviour."
- Home and App Store: "Run experiments on your behaviour, and Exist will confirm or rule out your hunches." (M)
- Custom-tags page: "Find out how alcohol, coffee, or particular foods affect your sleep and mood. Figure out what triggers your medical symptoms" (M). "affect" and "triggers" are causal verbs.
- Confidence label "Certain to be related" overstates what a p-value means.

How Exist shows numbers, and non-numeric equivalents for Dawnward:

| Exist number | Where | Non-numeric equivalent for Dawnward |
|---|---|---|
| Mood 1-9 nightly | Review tab (V) | Words the person chose that evening; a felt tone named in their language, never ranked |
| Strength as % | Correlation item (V API example) | Plain frequency phrase only: "often shows up together", "sometimes", "rarely" |
| Confidence as 1-5 stars and p | Correlation item (V) | Evidence ladder in words: "first noticed", "seen again", "a steady pattern", backed by the actual evenings in "Why I think this" |
| Progress bar to weekday median goal | Dashboard, Home (V KB 39) | Do not compare a day to a norm. If anything, "this was unlike your usual Tuesdays" with no bar or fill |
| "Highest steps in X days" insights | Insights (V API, HN founder) | Skip superlatives about the person; describe what happened, in their words |
| 1-9 energy and stress | Manual scales (V) | Optional free description during the debrief |

## Pricing

Read 2026-10-31.

| Tier | Price | URL | Label |
|---|---|---|---|
| Single plan, monthly (web) | USD 6.99 per month | https://exist.io/ | V (pricing card) |
| Single plan, yearly (web) | USD 62.90 per year, "25% off" | https://exist.io/ | V |
| iOS in-app subscription | "7.99 USD" in description; IAP list shows "Exist monthly subscription $8.49" | https://apps.apple.com/us/app/exist/id986201088 | V (listing), inconsistent within the listing |
| Android | Listing says "US$6/month" after trial | https://play.google.com/store/apps/details?id=co.hellocode.exist | V that the text says this, A that it is stale |
| Trial | 30 days free; Play listing: "We ask for a credit card up-front, but we give you plenty of warning before your trial ends." | Play listing, home | V |
| Tiers | "No pricing tiers, one plan gets you everything." Business accounts priced separately. No student pricing. | home, https://kb.exist.io/article/8-do-you-offer-student-pricing | V |
| Pause | Suspend account, long-term paid users only | https://kb.exist.io/article/24-can-i-suspend-my-account | V |

## Privacy

Verified (V) from https://exist.io/privacy/, https://exist.io/about/values/ and store labels:

- Business model: "We make money selling Exist subscriptions, not your data." No selling or renting of personal data; may transfer on sale or merger with advance notice and a chance to delete.
- Processors named: Help Scout (support), Stripe (payments, records kept for accounting), Mapbox (lat and long for suburb name and map), Apple Weather (lat and long for weather), Campaign Monitor (email), Sentry (crash logs, may include attribute data).
- No Google Analytics since 2024-09-19 ("No mobile or web analytics"); privacy policy still mentions cookies, clear gifs and email open tracking.
- Hosted outside the United States "to provide additional safeguards".
- Health Connect use follows Google's Limited Use requirements.
- Disconnecting a service stops new collection but keeps past data. Account deletion removes data, with backups kept "for a commercially reasonable period".
- Values page: "No AI. We don't chase trends and won't be stuffing large language models into Exist to hallucinate what your data means. We stick with old-fashioned statistical methods."
- Values page: not building features for "your boss, colleagues, or coach" to see your data.
- App Store label: Data Linked to You: Health and Fitness, Location (coarse), User Content, Usage Data (product interaction), for App Functionality. Not verified by Apple.
- Play data safety: "No data shared with third parties", may collect Location and App info and performance, encrypted in transit, deletion on request.
- Coarse location only from mobile apps (V KB 100).

## What cannot or should not be taken

- Name "Exist", the delta logo, "Understand your behaviour." tagline, Hello Code brand, insight copy and correlation sentence templates, their strength and confidence phrases verbatim, marketing lines, illustrations and screenshots.
- Their attribute template list as a product spec is fine as an idea (it mirrors Apple Health and Health Connect types), but not their copy or naming system wholesale.
- Partner integrations they hold: Oura, Garmin, Withings, Strava, RescueTime, Todoist, Toggl, Instapaper, GitHub, Swarm, last.fm, Trakt, Mastodon, Apple Weather. Each requires Dawnward's own developer agreement and review. MyFitnessPal refused them API access (V KB 13). Fitbit is being turned off at the end of October 2026 (V KB 131); Google Fit is replaced by Health Connect (V syncing page lists Health Connect, not Google Fit).
- Their user reviews and survey numbers must not be presented as Dawnward proof.

## Size

- Paid users: 916; last 4 weeks income USD 6,917.85 (V, https://hellocode.co/stats/, read 2026-10-31).
- Team: two founders, Belle B. Cooper and Josh Sharp (V values page, stats page). Running since 2014 (V blog redesign).
- iOS US: 47 ratings, average 4.02, version 4.4.1 released 2026-10-23, first release 2015-06-07 (V lookup API).
- Android: 4.5 stars, 207 reviews (header) or 197 (section), 10K+ downloads, updated Oct 28, 2026 (V Play listing).
- Platform split from their survey: 49% iOS, 42% Android, 5% both (V blog survey 2025).
- Roadmap: 379 open suggestions, 255 completed (V roadmap).

## Reviews collected (see reviews.csv)

- Total 61: App Store 38 (US via Apple RSS 20, which is every written US review the feed holds; GB 5, DE 4, CA 4, AU 3, SE 1, NL 1 from see-all pages), Hacker News 20 (user comments about Exist, founders and unrelated mentions excluded, no rating), Google Play 3 (only reviews visible on the public listing).
- By stars: 5 stars 28, 4 stars 2, 3 stars 3, 2 stars 1, 1 star 7, no rating 20 (HN).
- Fewer than the 60 to 150 target of rated store reviews exist publicly: the US store holds 47 ratings but only 20 written reviews. Most reviews are old (2015 to 2024); only 3 are from 2025 or 2026.
- URL format: App Store `https://apps.apple.com/{country}/app/id986201088?see-all=reviews#{reviewId}`; Hacker News `https://news.ycombinator.com/item?id={id}`; Google Play reviews have no per-review link, so the listing URL is used.
- The Apple RSS feed was intermittent: it returned empty on most attempts and returned the 20 US reviews twice; page 2 and 3 and the sortBy variants were always empty; country feeds were always empty.
- Developer match: App Store seller "Hello Code Pty Ltd", seller URL https://exist.io; Play developer "Hello Code", support hello@exist.io.

Top complaint themes (R, counts are reviews in reviews.csv):

1. Bugs, crashes and sync or settings not sticking: 6 (App Store 1335615693, 1712601329, 4420828432, 6751328434, 6536943271, 6197732691).
2. Data model and analysis limits (one mood per day, auto goals, no free-text tracking, no r squared or controls, trends basic): 5 (App Store 4260423031, 8649851698, 10090509634, 4304546250; Play 2019-11-28).
3. Sign-up and billing friction (password rules unstated, card-first trial called predatory, unexplained charges after cancelling): 4 (App Store 7777992522, 7074544034, 6197732691, 13650476076).
4. Insight quality (wrong or tautological patterns): 2 (App Store 13570280881, HN 41082637).

## Lessons for Dawnward

1. **Say "not causation" in the product contract, not only in a disclaimer.** Exist writes it into API terms, help and the sentence structure ("when", readable either way). V, https://developer.exist.io/reference/object_types/ and https://kb.exist.io/article/37-what-are-correlations. Dawnward: each Personal Model belief should read as "this tends to come up alongside that", and "Why I think this" should list the evenings, never a cause.
2. **Keep strength and confidence apart, and say confidence grows with evidence.** V, https://kb.exist.io/article/37-what-are-correlations. Dawnward: two word ladders (how often, how sure) with no stars, no percentages; confidence shown by the number of the person's own quoted moments behind it, which they can open.
3. **Wait before claiming.** Three weeks of non-empty data, then a weekly cadence. V, https://kb.exist.io/article/18-how-long-does-it-take-to-find-correlations. Dawnward: no belief appears in the Personal Model until enough evenings mention it; say plainly "still listening" rather than guessing.
4. **Let the person rate each pattern.** Every correlation carries a user rating object ("Useful", positive true or false). V, https://developer.exist.io/reference/correlations/. Dawnward's "That's not right" is the stronger version: it should remove or reword the belief and be remembered.
5. **One number a day is the most-hated limit.** "Multiple mood entries per day" is the top roadmap request at 557 votes (V, https://changemap.co/hellocode/exist/) and a reviewer says "If I’m 1 in the morning and 5 in the afternoon, a 3 misrepresents my day. I was never a 3 that day." (R, https://apps.apple.com/us/app/id986201088?see-all=reviews#4260423031). Dawnward's talk-or-type debrief already avoids this; keep mixed feelings as words, never averaged.
6. **Trivial or wrong patterns erode trust.** HN: "the data quickly becomes overwhelming and tautological ("you spend more time active when you work out for a longer distance")" (R, https://news.ycombinator.com/item?id=41082637). App Store 1 star: "many times says things that are just blatantly not true." (R, https://apps.apple.com/us/app/id986201088?see-all=reviews#13570280881). Dawnward: filter self-evident links, show fewer and better beliefs, and make dismissal one tap.
7. **Body world inputs: start from Apple Health and Health Connect, not vendor APIs.** Exist's current list relies on Apple Health and Health Connect for steps, sleep stages, HRV, workouts, mindfulness, menstrual flow; Fitbit is shutting down and Google Fit is gone. V, https://exist.io/apps-data-syncing/ and https://kb.exist.io/article/131-migrating-from-fitbit-to-apple-health-and-health-connect. iOS sync only runs when the phone is unlocked and iOS allows it (V KB 40), so Body data will lag; design for "not synced yet".
8. **Privacy values as a visible page wins loyalty, and their audience distrusts AI.** "No AI" is a stated value; 46% of surveyed users are glad Exist has no genAI, 16% wish it would reconsider (V, https://exist.io/blog/post/exist-survey-2025/). Dawnward uses language understanding, so it must show its evidence and never invent: every morning step and belief traced to the person's own words.

Conflicts with Dawnward rules (no streaks, scores, badges, guilt, fabricated proof; no correlation presented as causation):

- Progress bars against an auto-set "goal" (weekday median) are a score and a quiet pressure; a reviewer objects that the app sets goals for you (V KB 39; R #4260423031). Do not copy.
- 1-9 mood and scale ratings, percentage strength and star confidence are numeric scores about a person. Do not copy.
- Superlative insights ("highest or lowest steps value in however many days") invite comparison and guilt (V API object types). Do not copy.
- "Run experiments on your behaviour, and Exist will confirm or rule out your hunches" and "use them to predict future behaviour" present correlation as proof or prediction (M, V). Do not copy.
- "Certain to be related" overclaims from a p-value. Do not copy.
- Weekly email that included full mood notes by default until a toggle was added (V roadmap) is a privacy risk for an evening-debrief app; Dawnward's emails, if any, should never carry the person's words by default.
- Card required up front for the trial drew a "predatory trial/sub approach" complaint (R, https://apps.apple.com/gb/app/id986201088?see-all=reviews#6197732691), which matters for Dawnward's ethical onboarding.
