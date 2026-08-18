# Dawnward — Owner Checklist

> Everything that needs **Bianno** personally. Parked here until the build
> phases in `roadmap.md` are complete — nothing on this list blocks Claude's
> work. When the build is done, work this list top to bottom; each item says
> exactly what to do and what it unlocks.

## 1. Give Dawnward its own repository — 2 minutes
Create an empty GitHub repo (suggested: `life-os`), no README, or grant repo
creation to the Claude GitHub app at your admin settings. Then tell Claude —
the `lifeos/` directory lifts over unchanged with one command.
**Unlocks:** its own CI, issues, releases; separation from the Expo fork.

## 2. Anthropic API key — 5 minutes
Create a key at console.anthropic.com, put it in `server/.env` as
`ANTHROPIC_API_KEY`. Then run `npm run eval -w server` — the safety
red-team gate (crisis recall must be 100%) and structural checks run against
the real model. Expect one prompt-tuning session with Claude after the first
run; the harness turns that into a diff, not vibes.
**Unlocks:** the real intelligence layer; everything currently runs on the
deterministic mock.

## 3. Hosting decision — 15 minutes
Pick where the server + Postgres live (e.g. Fly.io, Railway, Supabase,
Render — EU region per spec 04 §5). Create the project, hand Claude the
connection string and deploy credentials as scoped tokens.
**Unlocks:** the app working on your actual phone, not just in a container.

## 4. Email provider for sign-in — 10 minutes
Real auth ships as email magic-codes. Create a Resend or Postmark account,
verify a sending domain, provide the API key.
**Unlocks:** switching the dev bootstrap off; real accounts.

## 5. Domain + name check — 30 minutes
Buy the domain you want. Before spending on branding: "Dawnward" is a crowded
name — run a quick trademark search (EUIPO/USPTO) in the app-software class
and decide if you're comfortable or want a distinctive mark (e.g. a stylized
form). This is a business-risk decision only you can make.
**Unlocks:** landing page going live, app-store listing name.

## 6. Apple + Google developer accounts — 1 hour + fees
Apple Developer Program ($99/yr) and Google Play Console ($25 once). Then
Claude configures EAS builds and store metadata.
**Unlocks:** the app on real devices via TestFlight / internal testing.

## 7. Legal review — external
Privacy policy + terms reviewed by counsel. The engineering posture is
already written (spec 04: Article 9 consent model, deletion propagation,
retention, third-party rules) so counsel reviews a design, not a blank page.
**Unlocks:** onboarding real users beyond yourself.

## 8. Pricing confirmation — your call
The cost model (spec 05) supports PRO at €15–25/mo at ~85% gross margin.
Confirm tiers and price points before the paywall is built.
**Unlocks:** billing (see item 9).

## 9. Connector authorizations — 5 minutes each, optional
Three connectors are attached to Claude but need authorization in your
claude.ai connector settings before they work: **Stripe** (billing, when
pricing is confirmed), **MailerLite** (launch/waitlist email), **Tavily**
(research). Authorize the ones you want Claude to use.

## 10. Voice debrief provider — decision, optional
If you want spoken debriefs, pick a transcription provider and provide a
key. The recording UI can be built without it; transcription cannot.

## 11. User zero — the real test, ~30 min setup + 21 days of living
Complete the seven onboarding chapters yourself, honestly. Live the daily
loop for 21 days. Then run the acceptance criteria in spec 05 §4 together.
Recruit the 10–20 first testers from your audience when you're ready.
**Unlocks:** the only judgment that matters — whether the core sentence is
earned: "It understands me, sees where I'm going, knows what's holding me
back, and gives me the clearest next move."
