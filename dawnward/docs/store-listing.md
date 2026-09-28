# Dawnward — Store Listing Kit

> Everything the App Store and Play Store forms will ask for, drafted and
> ready to paste. Screenshots come from the seeded fixture user via the
> craft-loop scripts. Items marked OWNER need Bianno's accounts or review.

## Identity

- **App name:** Dawnward
- **Subtitle (iOS, 30 chars):** Become who you're becoming
- **Short description (Play, 80 chars):** A quiet daily companion that learns who you are and who you're becoming.
- **Bundle / package:** com.unifymind.dawnward (already set in app.json)
- **Category:** Health & Fitness (iOS) / Health & Fitness (Play). Lifestyle is the fallback if review pushes back.
- **Age rating:** 17+ / Mature recommended, because the app invites open reflection. Answer the questionnaires honestly: no violence, no gambling, user-generated content is private to the user.

## Full description (both stores)

Dawnward is not a habit tracker. It is a quiet intelligence that gets to
know you: who you are, who you are becoming, and what stands between the
two.

You begin with a conversation. Seven short chapters, at your own pace,
about your life as it actually is. From it, Dawnward writes your Future
Self, names the one thing most in your way, and plans your first 90 days
toward the person you described.

Then it lives with you, gently:

- One plan every morning, sized to your real energy and your real hours.
- One honest question every evening. Speak it or type it.
- A model of you that shows its evidence, tells you why it believes what
  it believes, and lets you strike anything down. Your word wins.

What Dawnward will never do: no streaks, no badges, no guilt. Miss a
week and you are welcomed back, not punished. Rest is treated as wisdom.
Your reflections are never sold and never train anyone else's AI.

The mornings keep arriving either way. Dawnward makes them yours.

## Keywords (iOS, 100 chars)

`personal growth,journal,future self,reflection,life coach,mindful,daily plan,self improvement`

## Screenshot set (6.7" and 6.1" iPhone, Pixel for Play)

1. Today screen, named greeting, full plan (predawn sky)
2. Evening debrief with the day's question and Speak it instead (dusk)
3. The weekly reveal with constellation
4. You tab: Future Self card + a probable belief with its why
5. Onboarding consent: "What you share stays yours"
6. Settings: the quiet controls, data rights visible

Caption style: one short human line per shot, ink on ground, no feature
bullets. Example for shot 1: "Every morning, written for you."

## Review notes (paste into App Review information)

Dawnward requires a server. For review, use the demo account credentials
supplied in the review notes field (seeded via `npm run seed -w server`
against the production database; paste the printed token flow, or supply
the TestFlight build pointed at the staging API with an auto-seeded
reviewer session). Microphone is used only for dictating the evening
reflection; audio is transcribed and discarded. The app asks notification
permission only when the user sets their daily times in Settings.

- **Privacy policy URL (OWNER: goes live with the domain):** https://dawnward.app/privacy (site/privacy.html in this repo)
- **Support URL:** https://dawnward.app (site/index.html)
- **Marketing URL:** https://dawnward.app

## Data disclosure answers (Apple privacy nutrition label / Play data safety)

Collected, linked to the user, not used for tracking, not sold:

- Health & wellbeing related info: user-entered reflections (Article 9
  consent in-app). Purpose: app functionality only.
- Name (optional, user-provided). Purpose: personalization.
- Audio: collected transiently for transcription, not retained. Declare
  as "not collected" on Apple (it never persists) but say so in review
  notes; declare "collected, not stored" style answer on Play's form.
- Identifiers: an anonymous device token. No advertising ID, no
  third-party analytics SDKs, no tracking. "Data not used for tracking"
  everywhere.

Deletion: in-app account deletion is built in (both stores now require
it), Settings > Erase my account.

## OWNER items before submission

1. Apple Developer Program + Play Console accounts.
2. Domain live so the privacy and support URLs resolve.
3. Production API deployed (EU region) and `EXPO_PUBLIC_API_URL` in
   eas.json pointed at it.
4. Counsel pass over site/privacy.html.
5. `npx eas build` for both platforms (eas.json profiles are ready), then
   `npx eas submit`.
