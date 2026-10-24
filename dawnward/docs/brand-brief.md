# Dawnward: the complete brand brief

This document is written for anyone, human or AI, who needs to understand Dawnward deeply enough to design for it, write for it, or market it. Everything in here is canon.

## What Dawnward is

Dawnward is a personal evolution app. The one-line pitch: **the operating system for your Mind, Body, Soul and Future.**

It is not a habit tracker, not a journal, not a meditation app, and not a productivity tool, though it quietly replaces pieces of all four. It is a companion that builds a living model of who you are, holds a clear picture of who you are becoming, and walks you from one to the other a single day at a time.

The name is the promise: dawn-ward, moving toward the dawn. You start in the dark and the whole product carries you toward first light.

## Who it is for

People in a season of deliberate change: the person done with drifting, the one rebuilding after a hard year, the quiet ambitious one who reads growth books but has nowhere to put them into practice. They are tired of apps that gamify them like children or guilt them like drill sergeants. They want to be known, not scored.

## How the product works, start to finish

1. **The invitation.** First open is a dark, starlit screen with a single candle of a message. No feature tour, no signup wall. One door in.
2. **The consent door.** Before anything personal is asked, the app explains plainly what it will hold and the person chooses. They also give their name here, because a companion should know what to call you.
3. **Onboarding as a conversation, seven chapters.** Not a form. A warm back-and-forth across seven themed chapters (body, mind, heart, character, relationships, work, meaning). The chapter marker is seven small stars, never a progress bar, because it counts chapters of a conversation, not the person.
4. **The Personal Model.** From that conversation the app builds a structured model of the person across 12 life domains (physical, mental, emotional, character, relationships, career, wealth, creativity, adventure, meaning, environment, legacy). Every claim in the model carries evidence (what the person actually said or did) and a confidence level. Nothing is asserted about a person without receipts.
5. **The Future Self.** A vivid, specific portrait of who this person is becoming, written in warm second person. It lives on the "You" tab and evolves as the person does.
6. **The bottleneck.** The model identifies the single constraint most holding the person back right now. One, not ten.
7. **The 90-day campaign.** One meaningful mission aimed at that bottleneck, with a title, a why, and milestones. Not a goal list. A campaign.
8. **Today: the daily plan.** Each day offers up to five slots: train (body), build (craft), connect (people), reflect, and rest. Each card carries the task and the why. Rest days are honored as real days, never guilt.
9. **The evening debrief.** At night the person talks to the app, by voice or typing, about how the day actually went. The app listens, asks one good question, witnesses what happened, and says goodnight by name. Voice audio is transcribed and immediately discarded, never stored.
10. **The witnessed moment.** After a debrief, what the person lived becomes a star. Significant moments become gold stars. This is the emotional heart of the product.
11. **Nightly and weekly learning.** Overnight, the model updates from the day's evidence. Weekly, the person gets a reveal: the fortnight's constellation drawn from their own lived moments, with a closing line only when a real pattern was found.

## The intelligence, honestly

A language model powers the conversation, the model-building, the plan, and the debrief. The brand rule, called the Human Law: **the product never talks about itself as an AI, a model, or a system.** No "processing", no "analyzing", no robot voice. Everything it says sounds like a caring, perceptive person. Safety is engineered seriously: a triage layer recognizes crisis and distress in debriefs with a tested, certified pipeline (crisis recall is held at 100% on the evaluation suite) and responds like a human who cares, surfacing real help when needed.

## The visual world

The entire app lives at night, always. There is no light theme and never will be.

- **The Living Sky.** Every screen sits under a near-black sky. The ground knows what time it is: a faint indigo horizon glow before 10am (predawn), a faint amber glow after 5pm (dusk), stillness in between. The glow never exceeds the bottom 20% of the screen.
- **Real stars.** An ambient field of about 24 faint stars, seeded by the date, sits in the upper sky. Star rendering is astronomical, not decorative: true magnitude distribution (most faint, few bright), warm and cool color temperatures, soft halos on the bright ones, four-point diffraction crosses on the brightest, and up to three stars breathing slowly. Reduced motion stills everything.
- **The constellation.** On milestone screens only, the person's own lived moments are drawn as a constellation. Every point of light is something they lived. Gold stars are the moments that mattered most. The same life always draws the same sky.

### Exact design tokens

- Ground (background): `#0B0E12`. Surface: `#12161D`. Raised: `#171C25`. Hairline: `#232A34`.
- Ink (primary text): `#ECE9E2`. Dim: `#9AA0A9`. Faint: `#79818F`.
- Gold (the only accent): `#C9A96A`. Danger (muted, never alarmist): `#B4655F`.
- Sky-gradient-only colors, never on components: dawn `#E8A87C`, dusk amber `#2A1F14`, predawn indigo `#23283D`. Cool star white: `#C7D5EE`.
- Type: Cormorant Garamond (light/regular/italic) for display and titles, 34px titles; Albert Sans for body, 16px; IBM Plex Mono for small uppercase labels at 11px with wide letterspacing. Epigraphs are 24px italic gold serif.
- Spacing on an 8px grid. Card radius 14, sheet radius 22. Borders, never shadows, except one deep soft shadow reserved for floating elements.
- Buttons: a subtle gold-to-dawn gradient with an ember glow. Tab bar: dark glass with backdrop blur.

### Motion

Three sanctioned motion moments only: the constellation's slow 14-second drift, the listening indicator's pulse during voice debrief, and the star-birth after a debrief. Plus press physics on every touchable: scale to 0.97 in 110ms, back in 180ms. Nothing else moves. Reduced-motion users get a perfectly still, perfectly complete experience.

## The voice

Warm, plain, unhurried. Short sentences. It speaks like a wise friend who remembers everything and never judges. It says "I've been thinking about what you said" and never "Your data indicates." It uses the person's name at the start of the day and at goodnight. No exclamation marks of fake enthusiasm. No em-dashes in any user-facing copy.

## The forbidden list

These never appear, anywhere, in any form: streaks, badges, scores, points, levels, leaderboards, guilt copy ("you missed a day"), red notification dots, confetti, progress bars that measure the person, a light theme, AI-telling language. The absence of these is a core feature.

## Privacy posture

Device-level auth with a token, no social login. Voice audio transcribed and discarded immediately. One tap in settings erases everything, truly. Sensitive conversation territory is handled under explicit consent given at the door.

## What makes it different, in one paragraph

Every self-improvement app tracks what you do. Dawnward models who you are and who you are becoming, with evidence, and then treats every single day as one small move between those two points. The emotional engine is witness, not measurement: at the end of the day someone listens, and what you lived becomes a star in a sky that is yours alone. It feels less like software and more like being accompanied.

## Current status

The app is code-complete (React Native via Expo, Node/Fastify server, Postgres), safety-certified on its evaluation suite, store metadata drafted, and awaiting hosting and store submission. The design system lives as a token set and component library matching everything above.
