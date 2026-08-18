# Dawnward — Launch Checklist

> Everything that needs **Bianno** personally, in the order that gets a
> 10/10 app into real hands. Nothing on this list blocks Claude's work;
> everything on it unlocks a piece of the launch. Work it top to bottom.
> Estimated total hands-on time before TestFlight: about half a day, spread
> over a week while approvals and reviews come back.

## Phase 1 — Foundations (do these first, in one sitting)

### 1. Give Dawnward its own repository — 2 minutes
Create an empty GitHub repo (suggested: `dawnward`), no README, or grant
repo creation to the Claude GitHub app in your admin settings. Then tell
Claude; the `dawnward/` directory lifts over unchanged and CI
(`.github/workflows/ci.yml`) activates on the first push.
**Unlocks:** its own CI, issues, releases; separation from the Expo fork.

### 2. Anthropic API key — 5 minutes, then one working session
Create a key at console.anthropic.com and put it in `server/.env` as
`ANTHROPIC_API_KEY`. Then run `npm run eval -w server`. The safety red-team
gate (crisis recall must be 100 percent) and structural checks run against
the real model. Plan one prompt-tuning session with Claude after the first
run; the eval harness turns tuning into a measurable diff, not vibes.
This is the single highest-leverage item on the list: everything currently
runs on the deterministic mock.
**Unlocks:** the real intelligence layer.

### 3. Hosting — 15 minutes
Pick where the server and Postgres live (Fly.io, Railway, Supabase, or
Render; EU region, per the data posture in spec 04 §5). Create the project
and hand Claude the connection string and deploy credentials as scoped
tokens.
**Unlocks:** the app on your actual phone, not just in a container.

### 4. ElevenLabs API key for voice — 5 minutes
Create an account at elevenlabs.io, make an API key, put it in
`server/.env` as `ELEVENLABS_API_KEY`. The research and the decision are in
`docs/voice.md` (short version: Scribe is the most accurate transcription
available, about $0.40 per hour of audio, and the same key powers spoken
reveals later). Without it, the speak button degrades gracefully and typing
always works.
**Unlocks:** "Speak it instead" on the evening debrief.

## Phase 2 — Identity (can run in parallel with Phase 3)

### 5. Domain and trademark — 30 minutes
Buy the domain (dawnward.com or dawnward.app, whichever is free at your
registrar; the container could not reach registries to verify). Before
spending on branding, run a trademark search (EUIPO and USPTO) in the
app-software class for "Dawnward" and decide if you are comfortable or want
a distinctive stylized mark. Business-risk call that only you can make.
**Unlocks:** the landing page (`site/index.html` is ready to deploy) and
the store listing name.

### 6. Email provider for sign-in — 10 minutes
Real auth ships as email magic-codes on top of the anonymous device
sessions. Create a Resend or Postmark account, verify the sending domain
from item 5, provide the API key.
**Unlocks:** accounts that survive a lost phone.

## Phase 3 — Distribution

### 7. Apple and Google developer accounts — 1 hour plus fees
Apple Developer Program ($99 a year) and Google Play Console ($25 once).
Then Claude configures EAS builds, the store metadata, and the screenshot
sets. Note: the microphone permission text and notification behavior are
already declared in `app.json`, so review submissions have what they need.
**Unlocks:** TestFlight and Play internal testing on real devices.

### 8. Legal review — external, start it early
Privacy policy and terms reviewed by counsel. The engineering posture is
already written down (spec 04: Article 9 consent model, deletion
propagation, retention, third-party rules, and now voice: audio is
transcribed and dropped, never stored). Counsel reviews a design, not a
blank page.
**Unlocks:** onboarding real users beyond yourself.

## Phase 4 — Business

### 9. Pricing confirmation — your call
The cost model (spec 05) supports PRO at 15 to 25 euros a month at roughly
85 percent gross margin, voice included (transcription adds about 40 cents
per active user per month). Confirm tiers and price points before the
paywall is built.
**Unlocks:** billing.

### 10. Connector authorizations — 5 minutes each, optional
Three connectors are attached to Claude but need authorization in your
claude.ai connector settings before they work: **Stripe** (billing, once
item 9 is decided), **MailerLite** (waitlist and launch email), **Tavily**
(research). Authorize the ones you want Claude to use on your behalf.

## Phase 5 — The real test

### 11. User zero — 30 minutes of setup, then 21 days of living
Complete the seven onboarding chapters yourself, honestly, on your own
phone. Live the daily loop for 21 days: morning plan, evening debrief
(speak it), let the nightly and weekly jobs run against your real life.
Then run the acceptance criteria in spec 05 §4 together.
**Unlocks:** the only judgment that matters, whether the core sentence is
earned: "It understands me, sees where I'm going, knows what's holding me
back, and gives me the clearest next move."

### 12. Beta cohort, then launch
Recruit 10 to 20 first testers from your audience once user zero holds.
Watch their week-two retention and their debrief length (people talk longer
to things they trust) before opening the doors. The futurist design pass we
reserved runs right before this step, when every screen has survived real
use.
**Unlocks:** launch.
