# Dawnward review mining: what paying users hate about competing apps

Research date: 26 October 2026. Prepared for the Dawnward Selling Machine.

## Method and sources

- **Apple App Store (US), primary source.** For 12 apps I pulled the 10 most recent pages (up to 500 reviews per app) of Apple's public customer-review feed, then kept only 1 and 2 star reviews: **1,175 negative reviews** in total. Apps: Day One, Rosebud, Reflectly, Stoic, Mindsera, Finch, Fabulous, Habitica, Headway, plus Daylio, Journey and Clarity (CBT journal) as general journaling and self-growth comparisons. Every App Store quote below was checked by script to be an exact, unedited substring of the review text as fetched, under 30 words, and is listed with its Apple review ID and the exact feed URL it came from.
- **Trustpilot.** Direct download was blocked (HTTP 403), so the Fabulous page was read through a web-page reader tool that returned excerpts marked verbatim. Three quotes from it are included and flagged; spot-check them on the live page before using them in public content.
- **Reddit and Google Play.** Reddit blocked automated access (HTTP 403) and web search surfaced no Reddit threads with usable complaint text, so no Reddit quotes are included rather than risk unverified ones. Google Play was not reached in this pass. Both are worth a manual pass later.
- **Mindsera** has a small US review base (283 ratings, only 3 negative in the feed), so it is thinly represented.
- **Counts.** "Quotes" = verbatim quotes in this report supporting the theme. "Keyword hits" = a rough regex count across all 1,175 negative reviews (noisy, overlapping, indicative only) used to rank the themes by how often they recur. The ranking below follows keyword hits.
- Quote spelling, grammar and capitals are left exactly as the reviewer wrote them.

Total verbatim quotes collected: **101** (98 App Store, 3 Trustpilot).

## Summary: the 10 themes

| # | Theme | Quotes | Keyword hits (of 1,175) | Dawnward answer | Strength |
|---|---|---|---|---|---|
| 1 | Free-trial traps and cancellation mazes | 11 | 497 | None | none |
| 2 | Buggy and unreliable, especially voice capture | 10 | 168 | Evening debrief (voice or type, with a listening state) | partial |
| 3 | Upsell pop-ups that interrupt the writing | 10 | 108 | None | none |
| 4 | AI forced into a private space | 7 | 100 | Personal Model transparency (evidence + "That's not right") | partial |
| 5 | Overwhelm and patronizing content: self-care turned into homework | 12 | 92 | One question each evening; three small moves each morning drawn from your own words | strong |
| 6 | Paywall creep and usage caps on what you already paid for | 9 | 85 | None | none |
| 7 | Lost entries and being locked out of your own history | 9 | 83 | None | none |
| 8 | AI that forgets, assumes, or gives generic answers | 13 | 62 | Personal Model with evidence and "That's not right"; morning moves drawn from your own words | strong |
| 9 | Nagging notifications and guilt mechanics (streaks, pings) | 11 | 56 | No streaks, no scores, no badges, no guilt notifications | strong |
| 10 | "Who is reading my thoughts?" Privacy and AI-training fears | 9 | 32 | Reflections are never sold and never train anyone else's AI | strong |

**Where Dawnward is genuinely strong:** guilt mechanics (#9), privacy and AI training (#10), forgetful or generic AI (#8), overwhelm and patronizing content (#5). These are the complaint-to-fix videos to make.

**Where Dawnward has no answer yet (product signal):** billing traps (#1), upsell pop-ups (#3), paywall creep and caps (#6), data loss (#7). These are the loudest complaints in the category and none of them is solved by a feature; they are solved by policy and engineering choices Dawnward has not made public yet. Do not make fix videos for them until something real ships.

## 1. Free-trial traps and cancellation mazes

**Quotes supporting it:** 11 (keyword hits across all negative reviews: 497)

**Most vivid, verbatim:**

> "after a year of trying to cancel my subscription I am left believing that the app developers are praying on people with organizational difficulties"
> (Fabulous, 1 star, App Store US, review 14678422563, https://itunes.apple.com/us/rss/customerreviews/page=1/id=1203637303/sortby=mostrecent/json)

> "It’s incredibly predatory to people who struggle remembering things."
> (Clarity (CBT journal), 1 star, App Store US, review 12771010289, https://itunes.apple.com/us/rss/customerreviews/page=2/id=1010391170/sortby=mostrecent/json)

> "this criminal syndicate of an "app" kept stealing my money ONE WHOLE YEAR after I cancelled a "free trial"."
> (Fabulous, 1 star, Trustpilot, https://www.trustpilot.com/review/thefabulous.co)

**Pain line (my words, not a quote):** "I tried it for free, got charged for a year I never agreed to, and now I can't find the way out."

**Does Dawnward answer it?** None. **Strength: none.**

No shipped Dawnward feature touches billing, and pricing is not set yet. This is the single loudest complaint in the whole category, so it is product and trust signal: a trial that reminds you before it charges, one-tap cancel inside the app, and no bundled add-on offers during onboarding would be a real differentiator. Note the sharpest version of this pain: people with ADHD and memory problems feel targeted by it.

## 2. Buggy and unreliable, especially voice capture

**Quotes supporting it:** 10 (keyword hits across all negative reviews: 168)

**Most vivid, verbatim:**

> "it’s not easy to say it once, let alone try again from scratch."
> (Rosebud, 2 stars, App Store US, review 12757740440, https://itunes.apple.com/us/rss/customerreviews/page=9/id=6451135127/sortby=mostrecent/json)

> "I just tried TWICE to record 5 min worth of audio to transcribe for an entry. First time, it took down nothing."
> (Rosebud, 1 star, App Store US, review 14004379467, https://itunes.apple.com/us/rss/customerreviews/page=3/id=6451135127/sortby=mostrecent/json)

> "you have to be tapping your phone to send your message. It’s too awkward."
> (Rosebud, 2 stars, App Store US, review 14394864647, https://itunes.apple.com/us/rss/customerreviews/page=1/id=6451135127/sortby=mostrecent/json)

**Pain line (my words, not a quote):** "I finally said the hard thing out loud, and the app lost it."

**Does Dawnward answer it?** Evening debrief (voice or type, with a listening state). **Strength: partial.**

The debrief is built around talking freely to one question with a visible listening state, which answers the specific complaints that rivals make you tap to send, block dictation, or break the flow. But reliability is an engineering promise, not a feature. If Dawnward ever drops a recording, it hits this exact wound. Signal: save audio and transcript on the device before any processing, and show that it was kept.

## 3. Upsell pop-ups that interrupt the writing

**Quotes supporting it:** 10 (keyword hits across all negative reviews: 108)

**Most vivid, verbatim:**

> "I'm just trying to stop myself from having a panic attack and write in this journal but i can't"
> (Reflectly, 1 star, App Store US, review 9728680644, https://itunes.apple.com/us/rss/customerreviews/page=7/id=1241229134/sortby=mostrecent/json)

> "it prompts to buy the paid version literally every 15 to 20 seconds."
> (Day One, 2 stars, App Store US, review 13858285208, https://itunes.apple.com/us/rss/customerreviews/page=5/id=1044867788/sortby=mostrecent/json)

> "It was like someone was in your face screaming "Are you sure??! Are you sure?!!" over and over and over."
> (Fabulous, 1 star, Trustpilot, https://www.trustpilot.com/review/thefabulous.co)

**Pain line (my words, not a quote):** "Every time I open it to write, it asks me for money first."

**Does Dawnward answer it?** None. **Strength: none.**

None of the shipped features address this directly. The no-guilt-notifications stance is close in spirit, and the debrief opens on one question rather than a menu, but nothing stops a future paywall screen from sitting in front of it. Signal: never put an offer between the person and the debrief.

## 4. AI forced into a private space

**Quotes supporting it:** 7 (keyword hits across all negative reviews: 100)

**Most vivid, verbatim:**

> "AI. In a journaling app. It’s like, tell me you don’t fundamentally understand the point of journaling without telling me."
> (Day One, 1 star, App Store US, review 14527909064, https://itunes.apple.com/us/rss/customerreviews/page=1/id=1044867788/sortby=mostrecent/json)

> "there’s no way to turn it off. It’s always sitting there, waiting for you to accidentally hit it."
> (Day One, 1 star, App Store US, review 14122037326, https://itunes.apple.com/us/rss/customerreviews/page=3/id=1044867788/sortby=mostrecent/json)

> "The addition of AI features without an opportunity to opt out is finally getting me to switch to a paper notebook!"
> (Stoic, 1 star, App Store US, review 13030883695, https://itunes.apple.com/us/rss/customerreviews/page=4/id=1312926037/sortby=mostrecent/json)

**Pain line (my words, not a quote):** "I came here to write, not to be pushed into an AI chat I never asked for."

**Does Dawnward answer it?** Personal Model transparency (evidence + "That's not right"). **Strength: partial.**

Dawnward is AI by design, so people who want no AI at all are not its market, and claiming otherwise would be dishonest. What it can answer is the feeling of AI bolted on and unaccountable: every insight shows why it was made and can be disputed. Positioning signal: lead with being understood and with the evidence, not with the word AI, which is now a trigger word in this category.

## 5. Overwhelm and patronizing content: self-care turned into homework

**Quotes supporting it:** 12 (keyword hits across all negative reviews: 92)

**Most vivid, verbatim:**

> "It turned my anxiety into homework"
> (Clarity (CBT journal), 1 star, App Store US, review 14612036164, https://itunes.apple.com/us/rss/customerreviews/page=1/id=1010391170/sortby=mostrecent/json)

> "the app required a lot of clicking through excessive, patronizing praise for *drinking a glass of water*."
> (Fabulous, 2 stars, App Store US, review 14467072979, https://itunes.apple.com/us/rss/customerreviews/page=5/id=1203637303/sortby=mostrecent/json)

> "now i have 30 tasks. i don’t do any of them. it’s way too overwhelming to keep up with anything."
> (Finch, 1 star, App Store US, review 14667046112, https://itunes.apple.com/us/rss/customerreviews/page=4/id=1528595748/sortby=mostrecent/json)

**Pain line (my words, not a quote):** "I needed less on my plate, and it gave me homework, stickers and fortune-cookie advice."

**Does Dawnward answer it?** One question each evening; three small moves each morning drawn from your own words. **Strength: strong.**

One question ("What happened?") and three small moves taken from your own words is the direct opposite of 30 tasks, praise screens for drinking water, and generic advice like "take a bubble bath". Two honest caveats: the four-worlds universe must stay calm and not become another busy screen, and the morning moves must sound like the person, never like a poster.

## 6. Paywall creep and usage caps on what you already paid for

**Quotes supporting it:** 9 (keyword hits across all negative reviews: 85)

**Most vivid, verbatim:**

> "I paid for a full year in November, and now those same features have been removed from my plan and placed behind an even more expensive tier."
> (Day One, 1 star, App Store US, review 13905177530, https://itunes.apple.com/us/rss/customerreviews/page=5/id=1044867788/sortby=mostrecent/json)

> "I paid $150 for an annual subscription only to find out that after two weeks I can’t use it again until July 15th"
> (Rosebud, 2 stars, App Store US, review 14222808375, https://itunes.apple.com/us/rss/customerreviews/page=2/id=6451135127/sortby=mostrecent/json)

> "My own records are locked behind a paywall."
> (Daylio, 2 stars, App Store US, review 13911576936, https://itunes.apple.com/us/rss/customerreviews/page=4/id=1194023242/sortby=mostrecent/json)

**Pain line (my words, not a quote):** "I paid for it, then they took it back and asked me to pay more."

**Does Dawnward answer it?** None. **Strength: none.**

No shipped feature answers this. It matters more for Dawnward than most: a voice debrief invites long, conversational entries, and the Rosebud complaints show that weekly AI caps hit exactly the people who talk the most. Signal: never move a feature to a higher tier after someone paid, never lock a person out of their own past entries, and size any limits for talkers.

## 7. Lost entries and being locked out of your own history

**Quotes supporting it:** 9 (keyword hits across all negative reviews: 83)

**Most vivid, verbatim:**

> "You CANNOT make lasting change if you CANNOT access where you have BEEN."
> (Rosebud, 1 star, App Store US, review 13528568779, https://itunes.apple.com/us/rss/customerreviews/page=5/id=6451135127/sortby=mostrecent/json)

> "The app deleted years of journaling with an update."
> (Day One, 1 star, App Store US, review 14323865279, https://itunes.apple.com/us/rss/customerreviews/page=2/id=1044867788/sortby=mostrecent/json)

> "I suffer from memory loss and this was the app I used to remember things and now that’s gone."
> (Daylio, 1 star, App Store US, review 14090542800, https://itunes.apple.com/us/rss/customerreviews/page=3/id=1194023242/sortby=mostrecent/json)

**Pain line (my words, not a quote):** "Years of my life were in there, and one update wiped them."

**Does Dawnward answer it?** None. **Strength: none.**

No shipped feature addresses backup or export. This is existential for Dawnward specifically, because the Personal Model ("I have seen this in your days 4 times now") is built from the history. Lose the days and you lose the understanding. Signal: export, backups, and a visible promise that your entries are never held hostage by a subscription.

## 8. AI that forgets, assumes, or gives generic answers

**Quotes supporting it:** 13 (keyword hits across all negative reviews: 62)

**Most vivid, verbatim:**

> "I have to constantly correct it and retell the same info over and over again."
> (Rosebud, 2 stars, App Store US, review 13511022052, https://itunes.apple.com/us/rss/customerreviews/page=5/id=6451135127/sortby=mostrecent/json)

> "Every day it forgets and confuses basic details. The same details like that I moved from Oregon to California months ago."
> (Rosebud, 1 star, App Store US, review 14431786960, https://itunes.apple.com/us/rss/customerreviews/page=1/id=6451135127/sortby=mostrecent/json)

> "the only piece of advice I get, no matter if it’s work related or home, is a cozy blanket & a cup of tea."
> (Rosebud, 2 stars, App Store US, review 13579780008, https://itunes.apple.com/us/rss/customerreviews/page=5/id=6451135127/sortby=mostrecent/json)

**Pain line (my words, not a quote):** "It talks like it knows me, but it forgets my life and fills the gaps with guesses I keep having to correct."

**Does Dawnward answer it?** Personal Model with evidence and "That's not right"; morning moves drawn from your own words. **Strength: strong.**

This is Dawnward's clearest win. Rivals' users say they must "constantly correct it and retell the same info". Dawnward shows its reasoning ("Why I think this: I have seen this in your days 4 times now") and gives a one-tap "That's not right" to correct it. The morning moves come from the person's own words, not generic tea-and-blanket advice. Caveat: this only lands if the memory really holds up over months; Rosebud users loved it early and turned on it when recall slipped.

## 9. Nagging notifications and guilt mechanics (streaks, pings)

**Quotes supporting it:** 11 (keyword hits across all negative reviews: 56)

**Most vivid, verbatim:**

> "This app sends me more notifications that my mom emails me every day."
> (Fabulous, 1 star, App Store US, review 14330755863, https://itunes.apple.com/us/rss/customerreviews/page=8/id=1203637303/sortby=mostrecent/json)

> "Pushing 5 notifications at 4:40 Am"
> (Reflectly, 1 star, App Store US, review 12851205098, https://itunes.apple.com/us/rss/customerreviews/page=1/id=1241229134/sortby=mostrecent/json)

> "it almost influenced me to obsess over the notification to do my daily entry, which in turn had me scramble for thought."
> (Clarity (CBT journal), 1 star, App Store US, review 10378536317, https://itunes.apple.com/us/rss/customerreviews/page=7/id=1010391170/sortby=mostrecent/json)

**Pain line (my words, not a quote):** "It nags me, guilts me and pings me at 4am. A self-care app should not make me feel worse."

**Does Dawnward answer it?** No streaks, no scores, no badges, no guilt notifications. **Strength: strong.**

Dawnward deliberately ships none of this. That is a direct, provable answer: no streak to lose after midnight, no badge to chase, no guilt push. Keep it true in every future release and in Dawnward's own marketing.

## 10. "Who is reading my thoughts?" Privacy and AI-training fears

**Quotes supporting it:** 9 (keyword hits across all negative reviews: 32)

**Most vivid, verbatim:**

> "The LAST thing we need is our most personal and private thoughts fed into and training AI. What a violation of privacy."
> (Day One, 2 stars, App Store US, review 14004363624, https://itunes.apple.com/us/rss/customerreviews/page=4/id=1044867788/sortby=mostrecent/json)

> "Thanks for selling my thoughts to OpenAI~"
> (Stoic, 1 star, App Store US, review 11151513305, https://itunes.apple.com/us/rss/customerreviews/page=10/id=1312926037/sortby=mostrecent/json)

> "I don’t want to worry about my health insurance company buying my habit data someday."
> (Habitica, 1 star, App Store US, review 8680007344, https://itunes.apple.com/us/rss/customerreviews/page=7/id=994882113/sortby=mostrecent/json)

**Pain line (my words, not a quote):** "I don't know who is reading my most private thoughts, or who they are being sold to."

**Does Dawnward answer it?** Reflections are never sold and never train anyone else's AI. **Strength: strong.**

Dawnward's promise answers this word for word. Lower raw volume than billing complaints, but the anger is intense and it is often the reason long-time paying users leave (Day One, Stoic). Caveat: users have heard promises before (one Journey reviewer says the developer read their "end-to-end encrypted" entries). The promise needs proof: a plain privacy page naming which model providers see what, and retention terms.

## Appendix: all verbatim quotes

Feed URLs are Apple's public customer-review feed as fetched on 26 October 2026 (sorted by most recent, so page positions drift over time; the review ID is the stable reference). App Store listing for each app: https://apps.apple.com/us/app/id<ID>.

| # | Theme | App | Stars | Quote | Source |
|---|---|---|---|---|---|
| 1 | #1 Free-trial traps and cancellation mazes | Fabulous | 1 | "after a year of trying to cancel my subscription I am left believing that the app developers are praying on people with organizational difficulties" | App Store US, review 14678422563: https://itunes.apple.com/us/rss/customerreviews/page=1/id=1203637303/sortby=mostrecent/json |
| 2 | #1 Free-trial traps and cancellation mazes | Fabulous | 1 | "Predatory dark patterns and intentional friction targeting neurodivergent users" | App Store US, review 14628254115: https://itunes.apple.com/us/rss/customerreviews/page=2/id=1203637303/sortby=mostrecent/json |
| 3 | #1 Free-trial traps and cancellation mazes | Rosebud | 1 | "Canceled within the trial period and a day later I was charged for the full year." | App Store US, review 14003436003: https://itunes.apple.com/us/rss/customerreviews/page=3/id=6451135127/sortby=mostrecent/json |
| 4 | #1 Free-trial traps and cancellation mazes | Day One | 1 | "I started a free 30 day trial about 5 minutes ago but I was immediately charged for a full year." | App Store US, review 14143662458: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1044867788/sortby=mostrecent/json |
| 5 | #1 Free-trial traps and cancellation mazes | Stoic | 1 | "Charging $99 after a 3-day trial is predatory and I want my refund." | App Store US, review 14575004861: https://itunes.apple.com/us/rss/customerreviews/page=1/id=1312926037/sortby=mostrecent/json |
| 6 | #1 Free-trial traps and cancellation mazes | Headway | 1 | "Complicated app, designed to auto charge you without easy cancellation!" | App Store US, review 14205821252: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1457185832/sortby=mostrecent/json |
| 7 | #1 Free-trial traps and cancellation mazes | Reflectly | 1 | "I unsubscribed from this app in Apple App Store about March 2021. In Jan 2022 I got charged for a yearly price." | App Store US, review 9468806233: https://itunes.apple.com/us/rss/customerreviews/page=9/id=1241229134/sortby=mostrecent/json |
| 8 | #1 Free-trial traps and cancellation mazes | Clarity (CBT journal) | 1 | "It’s incredibly predatory to people who struggle remembering things." | App Store US, review 12771010289: https://itunes.apple.com/us/rss/customerreviews/page=2/id=1010391170/sortby=mostrecent/json |
| 9 | #1 Free-trial traps and cancellation mazes | Journey | 1 | "The company has unethical business practices that make it nearly impossible to cancel your subscription." | App Store US, review 13142704562: https://itunes.apple.com/us/rss/customerreviews/page=1/id=1300202543/sortby=mostrecent/json |
| 10 | #1 Free-trial traps and cancellation mazes | Stoic | 1 | "it said it would send me a reminder notification before the trial ended in case I want to cancel. They didn’t" | App Store US, review 13742843822: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1312926037/sortby=mostrecent/json |
| 11 | #1 Free-trial traps and cancellation mazes | Fabulous | 1 | "this criminal syndicate of an "app" kept stealing my money ONE WHOLE YEAR after I cancelled a "free trial"." | Trustpilot (via page reader, spot-check): https://www.trustpilot.com/review/thefabulous.co |
| 12 | #2 Buggy and unreliable, especially voice capture | Rosebud | 1 | "I just tried TWICE to record 5 min worth of audio to transcribe for an entry. First time, it took down nothing." | App Store US, review 14004379467: https://itunes.apple.com/us/rss/customerreviews/page=3/id=6451135127/sortby=mostrecent/json |
| 13 | #2 Buggy and unreliable, especially voice capture | Rosebud | 2 | "it’s not easy to say it once, let alone try again from scratch." | App Store US, review 12757740440: https://itunes.apple.com/us/rss/customerreviews/page=9/id=6451135127/sortby=mostrecent/json |
| 14 | #2 Buggy and unreliable, especially voice capture | Day One | 1 | "Doesn’t save audio entries, deletes them, or stops recording mid entry with no warning." | App Store US, review 13558614451: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1044867788/sortby=mostrecent/json |
| 15 | #2 Buggy and unreliable, especially voice capture | Day One | 1 | "my phone begins to heat up tremendously and the app itself is clearly struggling." | App Store US, review 13904946658: https://itunes.apple.com/us/rss/customerreviews/page=5/id=1044867788/sortby=mostrecent/json |
| 16 | #2 Buggy and unreliable, especially voice capture | Daylio | 1 | "When I receive a phone call while recording an audio entry, the recording gets interrupted or cut off." | App Store US, review 14092957450: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1194023242/sortby=mostrecent/json |
| 17 | #2 Buggy and unreliable, especially voice capture | Rosebud | 2 | "you have to be tapping your phone to send your message. It’s too awkward." | App Store US, review 14394864647: https://itunes.apple.com/us/rss/customerreviews/page=1/id=6451135127/sortby=mostrecent/json |
| 18 | #2 Buggy and unreliable, especially voice capture | Mindsera | 1 | "it blocks you from being able to use the speech to text button on your keyboard" | App Store US, review 14591635433: https://itunes.apple.com/us/rss/customerreviews/page=1/id=6742319153/sortby=mostrecent/json |
| 19 | #2 Buggy and unreliable, especially voice capture | Day One | 1 | "The app crashes 2 seconds after I open it." | App Store US, review 14026722137: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1044867788/sortby=mostrecent/json |
| 20 | #2 Buggy and unreliable, especially voice capture | Rosebud | 1 | "definitely not interrupt journaling, you guys don’t know what heavy thing I was in the middle of processing." | App Store US, review 14576930729: https://itunes.apple.com/us/rss/customerreviews/page=1/id=6451135127/sortby=mostrecent/json |
| 21 | #2 Buggy and unreliable, especially voice capture | Day One | 1 | "Latest update though introduced an unbearable keyboard lag" | App Store US, review 13900706990: https://itunes.apple.com/us/rss/customerreviews/page=5/id=1044867788/sortby=mostrecent/json |
| 22 | #3 Upsell pop-ups that interrupt the writing | Day One | 2 | "it prompts to buy the paid version literally every 15 to 20 seconds." | App Store US, review 13858285208: https://itunes.apple.com/us/rss/customerreviews/page=5/id=1044867788/sortby=mostrecent/json |
| 23 | #3 Upsell pop-ups that interrupt the writing | Reflectly | 2 | "The giant pop-up demanding you get premium EVERY time you open the app is so over the top." | App Store US, review 9632911878: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1241229134/sortby=mostrecent/json |
| 24 | #3 Upsell pop-ups that interrupt the writing | Journey | 1 | "Every click in the app brings up a reminder that I should pay again" | App Store US, review 12209861827: https://itunes.apple.com/us/rss/customerreviews/page=2/id=1300202543/sortby=mostrecent/json |
| 25 | #3 Upsell pop-ups that interrupt the writing | Reflectly | 1 | "I'm just trying to stop myself from having a panic attack and write in this journal but i can't" | App Store US, review 9728680644: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1241229134/sortby=mostrecent/json |
| 26 | #3 Upsell pop-ups that interrupt the writing | Journey | 2 | "I’ve already paid for Premium and should NOT be advertised to anymore." | App Store US, review 9777777250: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1300202543/sortby=mostrecent/json |
| 27 | #3 Upsell pop-ups that interrupt the writing | Day One | 1 | "constant popups begging you to pay them money to have the basic human right to change your color scheme" | App Store US, review 14215863756: https://itunes.apple.com/us/rss/customerreviews/page=2/id=1044867788/sortby=mostrecent/json |
| 28 | #3 Upsell pop-ups that interrupt the writing | Fabulous | 2 | "The constant up-sells creates a gimmicky and icky feeling" | App Store US, review 14361918541: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1203637303/sortby=mostrecent/json |
| 29 | #3 Upsell pop-ups that interrupt the writing | Clarity (CBT journal) | 1 | "Why call it a stress relieving app when you add on the extra stress of paying money?" | App Store US, review 10572313881: https://itunes.apple.com/us/rss/customerreviews/page=6/id=1010391170/sortby=mostrecent/json |
| 30 | #3 Upsell pop-ups that interrupt the writing | Fabulous | 1 | "It was like someone was in your face screaming "Are you sure??! Are you sure?!!" over and over and over." | Trustpilot (via page reader, spot-check): https://www.trustpilot.com/review/thefabulous.co |
| 31 | #3 Upsell pop-ups that interrupt the writing | Fabulous | 1 | "An AI riddled assault to the senses, that try's to shove paid apps at you at every turn." | Trustpilot (via page reader, spot-check): https://www.trustpilot.com/review/thefabulous.co |
| 32 | #4 AI forced into a private space | Day One | 1 | "AI. In a journaling app. It’s like, tell me you don’t fundamentally understand the point of journaling without telling me." | App Store US, review 14527909064: https://itunes.apple.com/us/rss/customerreviews/page=1/id=1044867788/sortby=mostrecent/json |
| 33 | #4 AI forced into a private space | Day One | 1 | "there’s no way to turn it off. It’s always sitting there, waiting for you to accidentally hit it." | App Store US, review 14122037326: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1044867788/sortby=mostrecent/json |
| 34 | #4 AI forced into a private space | Stoic | 1 | "The addition of AI features without an opportunity to opt out is finally getting me to switch to a paper notebook!" | App Store US, review 13030883695: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1312926037/sortby=mostrecent/json |
| 35 | #4 AI forced into a private space | Day One | 1 | "I’m done with apps that shove AI down our throats." | App Store US, review 13971284118: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1044867788/sortby=mostrecent/json |
| 36 | #4 AI forced into a private space | Clarity (CBT journal) | 1 | "really unhappy and creeped out by the new AI elements." | App Store US, review 12381505981: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1010391170/sortby=mostrecent/json |
| 37 | #4 AI forced into a private space | Stoic | 2 | "AI is everywhere - when you are journaling, typing or in the menu. Why?" | App Store US, review 11834458627: https://itunes.apple.com/us/rss/customerreviews/page=8/id=1312926037/sortby=mostrecent/json |
| 38 | #4 AI forced into a private space | Day One | 1 | "I don’t care about AI and I don’t want to be constantly pestered to ‘upgrade’ to the Gold plan." | App Store US, review 14201266417: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1044867788/sortby=mostrecent/json |
| 39 | #5 Overwhelm and patronizing content | Clarity (CBT journal) | 1 | "It turned my anxiety into homework" | App Store US, review 14612036164: https://itunes.apple.com/us/rss/customerreviews/page=1/id=1010391170/sortby=mostrecent/json |
| 40 | #5 Overwhelm and patronizing content | Finch | 1 | "now i have 30 tasks. i don’t do any of them. it’s way too overwhelming to keep up with anything." | App Store US, review 14667046112: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1528595748/sortby=mostrecent/json |
| 41 | #5 Overwhelm and patronizing content | Fabulous | 2 | "the app required a lot of clicking through excessive, patronizing praise for *drinking a glass of water*." | App Store US, review 14467072979: https://itunes.apple.com/us/rss/customerreviews/page=5/id=1203637303/sortby=mostrecent/json |
| 42 | #5 Overwhelm and patronizing content | Fabulous | 1 | "It’s full of wordy cheesy fortune cookie level “advice”" | App Store US, review 14369106080: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1203637303/sortby=mostrecent/json |
| 43 | #5 Overwhelm and patronizing content | Clarity (CBT journal) | 2 | "Too many silly affirmations and tips and generic advice. Very patronizing if you’re an adult with any self respect." | App Store US, review 11383266982: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1010391170/sortby=mostrecent/json |
| 44 | #5 Overwhelm and patronizing content | Stoic | 1 | "Just stay simple. Too many useless tools, notfications, pop ups." | App Store US, review 11848770125: https://itunes.apple.com/us/rss/customerreviews/page=8/id=1312926037/sortby=mostrecent/json |
| 45 | #5 Overwhelm and patronizing content | Habitica | 2 | "theres just too much going on in it." | App Store US, review 12037257302: https://itunes.apple.com/us/rss/customerreviews/page=4/id=994882113/sortby=mostrecent/json |
| 46 | #5 Overwhelm and patronizing content | Fabulous | 2 | "found it childish and spiritual in a way that didn’t work for me." | App Store US, review 14402861312: https://itunes.apple.com/us/rss/customerreviews/page=6/id=1203637303/sortby=mostrecent/json |
| 47 | #5 Overwhelm and patronizing content | Fabulous | 2 | "I wish it would just let me tick off my completed habits without all these interruption pages for congratulating me." | App Store US, review 14506861264: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1203637303/sortby=mostrecent/json |
| 48 | #5 Overwhelm and patronizing content | Reflectly | 2 | "My most recent before deleting the app was “take a bubble bath,” though I have no bathtub" | App Store US, review 10143099356: https://itunes.apple.com/us/rss/customerreviews/page=5/id=1241229134/sortby=mostrecent/json |
| 49 | #5 Overwhelm and patronizing content | Stoic | 2 | "Asking “what do you plan to do today?” is a great prompt for many, but it is completely unhelpful first thing in the morning when my brain is stuck" | App Store US, review 11691912999: https://itunes.apple.com/us/rss/customerreviews/page=9/id=1312926037/sortby=mostrecent/json |
| 50 | #5 Overwhelm and patronizing content | Stoic | 1 | "I found the questions posed by the app inane and unhelpful." | App Store US, review 12415199721: https://itunes.apple.com/us/rss/customerreviews/page=6/id=1312926037/sortby=mostrecent/json |
| 51 | #6 Paywall creep and usage caps on what you already paid for | Rosebud | 1 | "they put caps on how much you can use it, so after only 2 days of writing, all the features lock & are unusable." | App Store US, review 14626736034: https://itunes.apple.com/us/rss/customerreviews/page=1/id=6451135127/sortby=mostrecent/json |
| 52 | #6 Paywall creep and usage caps on what you already paid for | Rosebud | 2 | "I paid $150 for an annual subscription only to find out that after two weeks I can’t use it again until July 15th" | App Store US, review 14222808375: https://itunes.apple.com/us/rss/customerreviews/page=2/id=6451135127/sortby=mostrecent/json |
| 53 | #6 Paywall creep and usage caps on what you already paid for | Rosebud | 1 | "now have introduced limits that did not exist when I purchased the app." | App Store US, review 14628203819: https://itunes.apple.com/us/rss/customerreviews/page=1/id=6451135127/sortby=mostrecent/json |
| 54 | #6 Paywall creep and usage caps on what you already paid for | Day One | 1 | "I paid for a full year in November, and now those same features have been removed from my plan and placed behind an even more expensive tier." | App Store US, review 13905177530: https://itunes.apple.com/us/rss/customerreviews/page=5/id=1044867788/sortby=mostrecent/json |
| 55 | #6 Paywall creep and usage caps on what you already paid for | Day One | 2 | "if you ever stop paying for the subscription you are no longer able to access all the journal entries you made while paying for it." | App Store US, review 14153127183: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1044867788/sortby=mostrecent/json |
| 56 | #6 Paywall creep and usage caps on what you already paid for | Daylio | 2 | "My own records are locked behind a paywall." | App Store US, review 13911576936: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1194023242/sortby=mostrecent/json |
| 57 | #6 Paywall creep and usage caps on what you already paid for | Journey | 1 | "The only thing this app has done in the past few years is to make more and more features that were free into paid version." | App Store US, review 9734857129: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1300202543/sortby=mostrecent/json |
| 58 | #6 Paywall creep and usage caps on what you already paid for | Day One | 1 | "$10/lifetime, then $4/per month, then $8, then $12, now the only option is $75 yearly?!" | App Store US, review 14163393202: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1044867788/sortby=mostrecent/json |
| 59 | #6 Paywall creep and usage caps on what you already paid for | Clarity (CBT journal) | 1 | "This app used to be awesome. Now everything is locked." | App Store US, review 10868006416: https://itunes.apple.com/us/rss/customerreviews/page=5/id=1010391170/sortby=mostrecent/json |
| 60 | #7 Lost entries and being locked out of your own history | Day One | 1 | "The app deleted years of journaling with an update." | App Store US, review 14323865279: https://itunes.apple.com/us/rss/customerreviews/page=2/id=1044867788/sortby=mostrecent/json |
| 61 | #7 Lost entries and being locked out of your own history | Rosebud | 1 | "You CANNOT make lasting change if you CANNOT access where you have BEEN." | App Store US, review 13528568779: https://itunes.apple.com/us/rss/customerreviews/page=5/id=6451135127/sortby=mostrecent/json |
| 62 | #7 Lost entries and being locked out of your own history | Rosebud | 1 | "This app has lost months worth of my entries." | App Store US, review 12438974709: https://itunes.apple.com/us/rss/customerreviews/page=10/id=6451135127/sortby=mostrecent/json |
| 63 | #7 Lost entries and being locked out of your own history | Journey | 1 | "With this data loss, I lost all of my entries I made during important events in my life: my engagement & wedding, travels to Europe" | App Store US, review 10795292372: https://itunes.apple.com/us/rss/customerreviews/page=5/id=1300202543/sortby=mostrecent/json |
| 64 | #7 Lost entries and being locked out of your own history | Daylio | 1 | "I suffer from memory loss and this was the app I used to remember things and now that’s gone." | App Store US, review 14090542800: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1194023242/sortby=mostrecent/json |
| 65 | #7 Lost entries and being locked out of your own history | Day One | 1 | "today when I tried to open the app and make an entry it asked me to sign in and all my data was lost." | App Store US, review 13565584007: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1044867788/sortby=mostrecent/json |
| 66 | #7 Lost entries and being locked out of your own history | Reflectly | 2 | "Journaled almost daily for two years and it logged me out and wont let me sign back in so i js lost everything" | App Store US, review 13383509618: https://itunes.apple.com/us/rss/customerreviews/page=1/id=1241229134/sortby=mostrecent/json |
| 67 | #7 Lost entries and being locked out of your own history | Day One | 2 | "Journals Lost. Feels like Ransom." | App Store US, review 13928220599: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1044867788/sortby=mostrecent/json |
| 68 | #7 Lost entries and being locked out of your own history | Finch | 1 | "When your entire family dies and you depend on the littlest sense of comfort to get you through the days, this app will delete it all in an instant." | App Store US, review 14689674394: https://itunes.apple.com/us/rss/customerreviews/page=2/id=1528595748/sortby=mostrecent/json |
| 69 | #8 AI that forgets, assumes, or gives generic answers | Rosebud | 1 | "Every day it forgets and confuses basic details. The same details like that I moved from Oregon to California months ago." | App Store US, review 14431786960: https://itunes.apple.com/us/rss/customerreviews/page=1/id=6451135127/sortby=mostrecent/json |
| 70 | #8 AI that forgets, assumes, or gives generic answers | Mindsera | 1 | "It also would never remember past conversations" | App Store US, review 14503106480: https://itunes.apple.com/us/rss/customerreviews/page=1/id=6742319153/sortby=mostrecent/json |
| 71 | #8 AI that forgets, assumes, or gives generic answers | Rosebud | 2 | "It also makes weird assumptions about my life and feelings despite being told to not assume but ask instead." | App Store US, review 13511022052: https://itunes.apple.com/us/rss/customerreviews/page=5/id=6451135127/sortby=mostrecent/json |
| 72 | #8 AI that forgets, assumes, or gives generic answers | Rosebud | 2 | "I have to constantly correct it and retell the same info over and over again." | App Store US, review 13511022052: https://itunes.apple.com/us/rss/customerreviews/page=5/id=6451135127/sortby=mostrecent/json |
| 73 | #8 AI that forgets, assumes, or gives generic answers | Rosebud | 2 | "the only piece of advice I get, no matter if it’s work related or home, is a cozy blanket & a cup of tea." | App Store US, review 13579780008: https://itunes.apple.com/us/rss/customerreviews/page=5/id=6451135127/sortby=mostrecent/json |
| 74 | #8 AI that forgets, assumes, or gives generic answers | Rosebud | 1 | "Immediately offered generic questions as if I had not entered personal details." | App Store US, review 14645961948: https://itunes.apple.com/us/rss/customerreviews/page=1/id=6451135127/sortby=mostrecent/json |
| 75 | #8 AI that forgets, assumes, or gives generic answers | Clarity (CBT journal) | 1 | "The cbt ai agent just parrots useless questions back to me." | App Store US, review 14112411050: https://itunes.apple.com/us/rss/customerreviews/page=1/id=1010391170/sortby=mostrecent/json |
| 76 | #8 AI that forgets, assumes, or gives generic answers | Rosebud | 1 | "it’s really vanilla. the responses are super chatgpt" | App Store US, review 13241656168: https://itunes.apple.com/us/rss/customerreviews/page=7/id=6451135127/sortby=mostrecent/json |
| 77 | #8 AI that forgets, assumes, or gives generic answers | Stoic | 1 | "The AI counselor just responds back with the same sentence you’ve typed to them" | App Store US, review 13801887939: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1312926037/sortby=mostrecent/json |
| 78 | #8 AI that forgets, assumes, or gives generic answers | Rosebud | 1 | "day after day refer to a meaningful event in the wrong chronology - after repeated requests and commands not to" | App Store US, review 13773530728: https://itunes.apple.com/us/rss/customerreviews/page=4/id=6451135127/sortby=mostrecent/json |
| 79 | #8 AI that forgets, assumes, or gives generic answers | Rosebud | 1 | "Not listening, hallucinating, assuming, insulting. Not good for mental health." | App Store US, review 14277310055: https://itunes.apple.com/us/rss/customerreviews/page=2/id=6451135127/sortby=mostrecent/json |
| 80 | #8 AI that forgets, assumes, or gives generic answers | Clarity (CBT journal) | 2 | "Circular prompts and the classic very avoidant AI style." | App Store US, review 14374063764: https://itunes.apple.com/us/rss/customerreviews/page=1/id=1010391170/sortby=mostrecent/json |
| 81 | #8 AI that forgets, assumes, or gives generic answers | Rosebud | 2 | "as soon as the model doesn’t appear to be listening or comes across like an idiot it completely ruins what should be a healing experience." | App Store US, review 14002470145: https://itunes.apple.com/us/rss/customerreviews/page=3/id=6451135127/sortby=mostrecent/json |
| 82 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Fabulous | 1 | "This app sends me more notifications that my mom emails me every day." | App Store US, review 14330755863: https://itunes.apple.com/us/rss/customerreviews/page=8/id=1203637303/sortby=mostrecent/json |
| 83 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Reflectly | 1 | "Pushing 5 notifications at 4:40 Am" | App Store US, review 12851205098: https://itunes.apple.com/us/rss/customerreviews/page=1/id=1241229134/sortby=mostrecent/json |
| 84 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Fabulous | 1 | "Can’t get the notifications off" | App Store US, review 14359162989: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1203637303/sortby=mostrecent/json |
| 85 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Finch | 1 | "feel guilty about not sending gifts to people i don’t even know." | App Store US, review 14667046112: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1528595748/sortby=mostrecent/json |
| 86 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Fabulous | 2 | "This app NEEDS you to know that not only is it there, it craves your interaction." | App Store US, review 14306010663: https://itunes.apple.com/us/rss/customerreviews/page=8/id=1203637303/sortby=mostrecent/json |
| 87 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Clarity (CBT journal) | 1 | "it almost influenced me to obsess over the notification to do my daily entry, which in turn had me scramble for thought." | App Store US, review 10378536317: https://itunes.apple.com/us/rss/customerreviews/page=7/id=1010391170/sortby=mostrecent/json |
| 88 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Clarity (CBT journal) | 2 | "You literally lose your streak if you record after midnight its so upsetting" | App Store US, review 9983119917: https://itunes.apple.com/us/rss/customerreviews/page=9/id=1010391170/sortby=mostrecent/json |
| 89 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Fabulous | 1 | "It doesn’t know you, your life, or the struggles you might be going through." | App Store US, review 14637861194: https://itunes.apple.com/us/rss/customerreviews/page=2/id=1203637303/sortby=mostrecent/json |
| 90 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Daylio | 1 | "I haven’t written in it since Thanksgiving but I have 87 notifications showing on the app." | App Store US, review 13786324048: https://itunes.apple.com/us/rss/customerreviews/page=5/id=1194023242/sortby=mostrecent/json |
| 91 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Stoic | 1 | "no amount of nagging will change my mind." | App Store US, review 13030883695: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1312926037/sortby=mostrecent/json |
| 92 | #9 Nagging notifications and guilt mechanics (streaks, pings) | Finch | 1 | "it made her feel bad about herself" | App Store US, review 14624135920: https://itunes.apple.com/us/rss/customerreviews/page=8/id=1528595748/sortby=mostrecent/json |
| 93 | #10 "Who is reading my thoughts?" Privacy and AI-training fears | Day One | 2 | "The LAST thing we need is our most personal and private thoughts fed into and training AI. What a violation of privacy." | App Store US, review 14004363624: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1044867788/sortby=mostrecent/json |
| 94 | #10 "Who is reading my thoughts?" Privacy and AI-training fears | Stoic | 1 | "Thanks for selling my thoughts to OpenAI~" | App Store US, review 11151513305: https://itunes.apple.com/us/rss/customerreviews/page=10/id=1312926037/sortby=mostrecent/json |
| 95 | #10 "Who is reading my thoughts?" Privacy and AI-training fears | Day One | 1 | "I will never let them use my data for LLM. They’ve broken all trust with this bad update." | App Store US, review 13911796883: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1044867788/sortby=mostrecent/json |
| 96 | #10 "Who is reading my thoughts?" Privacy and AI-training fears | Habitica | 1 | "I don’t want to worry about my health insurance company buying my habit data someday." | App Store US, review 8680007344: https://itunes.apple.com/us/rss/customerreviews/page=7/id=994882113/sortby=mostrecent/json |
| 97 | #10 "Who is reading my thoughts?" Privacy and AI-training fears | Stoic | 1 | "They probably also likely sell all of the info you enter." | App Store US, review 11845324852: https://itunes.apple.com/us/rss/customerreviews/page=8/id=1312926037/sortby=mostrecent/json |
| 98 | #10 "Who is reading my thoughts?" Privacy and AI-training fears | Clarity (CBT journal) | 1 | "Any mental health app that collects your email and identifying information along with your personal thoughts and assessment results is dangerous." | App Store US, review 9782218195: https://itunes.apple.com/us/rss/customerreviews/page=10/id=1010391170/sortby=mostrecent/json |
| 99 | #10 "Who is reading my thoughts?" Privacy and AI-training fears | Journey | 1 | "If this product is end-to-end encrypted, why is the developer accessing private entries?" | App Store US, review 12202679273: https://itunes.apple.com/us/rss/customerreviews/page=3/id=1300202543/sortby=mostrecent/json |
| 100 | #10 "Who is reading my thoughts?" Privacy and AI-training fears | Day One | 1 | "now that ai was added i’ll have to look for an alternative i don’t trust it for privacy" | App Store US, review 13905029014: https://itunes.apple.com/us/rss/customerreviews/page=5/id=1044867788/sortby=mostrecent/json |
| 101 | #10 "Who is reading my thoughts?" Privacy and AI-training fears | Stoic | 1 | "probably a data point someone is monetizing, somewhere!" | App Store US, review 13030883695: https://itunes.apple.com/us/rss/customerreviews/page=4/id=1312926037/sortby=mostrecent/json |

App Store IDs used: Day One 1044867788, Rosebud 6451135127, Reflectly 1241229134, Stoic 1312926037, Mindsera 6742319153, Finch 1528595748, Fabulous 1203637303, Habitica 994882113, Headway 1457185832, Daylio 1194023242, Journey 1300202543, Clarity (CBT journal) 1010391170.
