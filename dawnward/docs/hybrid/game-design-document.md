# Game design document: Dawnward Hybrid Growth Adventure

**Status:** proposal. Read with `hybrid-product-architecture.md`.

## Core loop

DISCOVER → PRACTISE → ACT → REFLECT → LEARN → EXPLORE.

| Step | What happens |
|---|---|
| Discover | You find a mission in the Expedition Galaxy, or get one suggested, with the reason why |
| Practise | A short interactive scenario |
| Act | You choose one small real-world action |
| Reflect | You write or say what happened, in your own words |
| Learn | Your words become evidence, as with any evening |
| Explore | A new place appears in your galaxy, explained |

Reflection alone is always enough. The loop is optional at every step.

## 1. The universe and its levels (shallow on purpose)

| Level | What it is | How you reach it |
|---|---|---|
| **Universe (Spirit)** | Above space and time: two galaxies in one field. "We are the universe experiencing itself." | Pinch out from any galaxy, or the Universe button |
| **Your Galaxy (the realm of now)** | Today's Galaxy Home: four worlds, your evenings as stars | Home tab (the default) |
| **Expedition Galaxy** | Where you practise: solar systems grouped by world | Explore tab |
| **Solar system** | One skill: 3 missions that build on each other | Tap a system |
| **Mission** | 5 to 8 minutes. Objective and time shown before you begin. | Tap a mission, then Begin |
| **Future self** | A step forward in time, from the Future world | Future world, then "Step forward" |

**Shortcuts:**
- Explore lists "Continue" (an open mission) and "Suggested" (with the reason) at the top. You can start a mission in three taps without touching the map.
- Back always returns one level. Home always returns to Your Galaxy.

## 2. The four worlds play differently

| World | Feel | Mechanic | Systems (first three bold) | Signature mission |
|---|---|---|---|---|
| **Mind** (Realm of Clarity) | Cool, still, precise | **Lenses**: one event, seen through several interpretations; you weigh the evidence for each | **Thought Patterns**, Focus, Emotional Awareness, Decisions | The Thought Labyrinth |
| **Body** (Realm of Vitality) | Living, rhythmic | **Experiments**: choose a small habit, run it for 7 days, observe. No calories, weight or medical claims. | **Energy**, Recovery, Sleep, Movement | The Energy Expedition |
| **Soul** (Realm of Meaning) | Warm, relational | **Dialogue**: branching conversations with consequences and explanations, then rehearsal in your own words | **Communication**, Values, Gratitude, Compassion | The Bridge |
| **Future** (Realm of Becoming) | Golden, forward | **Crossroads**: two or three paths, assumptions and trade-offs made explicit; plus the step to your future self | **Decisions**, Goals, Skills, Purpose | The Crossroads |

Shared everywhere: navigation, timing, the quest player shell, accessibility, and how progress shows.

## 3. Mission categories (step types)

| Type | Purpose | Example |
|---|---|---|
| `intro` | The objective, time and why it matters | "Practise opening a difficult conversation. About 6 minutes." |
| `choice` | A situation with 2 to 4 responses. Each shows **what tends to happen and why**; none is scored. | Three ways to begin |
| `rehearse` | Say it your way (typed or spoken) | "Write the first sentence you'd actually say." |
| `lens` (Mind) | Rate how well each interpretation fits the evidence you have | Three readings of a friend's silence |
| `plan` | Choose or write one small real action, and roughly when | "Message Sam on Thursday evening" |
| `reflect` | A focused question about the mission | "What felt hardest to say?" |
| `checkin` (later) | What happened when you tried it | "How did it go? What surprised you?" |
| `close` | What you practised, and what appears in your galaxy | |

**Every mission has:**
- a learning objective;
- a completion state, meaning every required step answered;
- an exit at any step, which keeps your place.

## 4. The first solar system: Soul · Communication

| Mission | Objective | Steps |
|---|---|---|
| **The Bridge 1: Opening** | Begin a difficult conversation without blame | intro, choice (3 openings), rehearse, plan, reflect, close |
| **The Bridge 2: Listening back** | Show you heard before replying | intro, choice (4 replies), rehearse (reflect back what they said), reflect, close |
| **The Bridge 3: Repair** | Apologise or repair without over-explaining | intro, choice, rehearse, plan, reflect, close |

**How the choices teach:**
- **"You always do this. You never listen."** Absolutes like "always" and "never" tend to start a defence, not a conversation. It's understandable when you're hurt; here's a version that keeps the door open.
- **Say nothing and hope it improves.** Avoiding it can keep the peace for a while, but the feeling usually comes back stronger. It's fine to wait for a better moment; choosing that moment is part of the skill.
- **"Something has been bothering me. Can we talk about it?"** This names that something matters, without blame, and invites them in.

Nothing is "wrong", so nobody is shamed. Every choice teaches something.

**Content rules:**
- Written and reviewed by people.
- No clinical advice and no diagnosis.
- No coercive or unsafe real-world challenges: nothing involving danger, confrontation with someone who has harmed you, money or health changes.
- A visible line on every Soul mission: "If a relationship feels unsafe, this isn't the right exercise; findahelpline.com lists free support."

## 5. Progression (see `xp-progression-spec.md`)

- **Discoveries:**
  - finishing a mission adds a star to that system;
  - finishing a system's three missions reveals a moon;
  - completing a reviewed experiment adds a landmark to the world (Soul: a lantern in the sanctuary).
- **A journey log**, in You, lists every discovery with its date and cause.
- **XP and levels:** only if decision D-H1 says so (option B or C).
- **Never:** streaks, loss, decay, countdowns, leaderboards, or anything that dims for inactivity.

## 6. Real-world experiments

- You choose the action, or edit a suggested one. It must be small, legal, safe and within your control.
- You set a rough time ("this week"). The check-in appears in Explore under "Waiting to hear how it went". There's no notification unless you turn one on.
- "I didn't do it" is a valid outcome and is welcomed: "What got in the way?" It still counts as a reviewed experiment, because the learning is the point.

## 7. Reflection and memory integration

- Mission answers are your words. They are kept as records like evenings, can be left out, and are exported and deleted with everything else.
- Evidence drawn from a mission is labelled as such ("from The Bridge 1"), so a practice answer is never mistaken for something that happened.
- Experiment reviews are real events. They can support beliefs like any evening, with the same "Seen in N" and correction.

## 8. Optional non-gamified mode

**You → Display → "Show the game layer"** (on by default if D-H1 is A, otherwise per the decision). When it's off:
- Explore stays as a plain list of practices;
- discoveries are kept but not animated;
- nothing is lost, and turning it back on shows everything.

## 9. The future-self step (Future world)

1. "Step forward": a short, skippable transition (the camera moves through the Future world's ring toward dawn).
2. You meet the future self you described in onboarding (your `future_selves` words), quoted, never invented.
3. You can write a short letter from them to you now, or a question to them.
4. You bring back one small action for this week. It becomes an experiment.

This is a reflective exercise, not a prediction. The copy never claims to show the future.

## 10. Consent, privacy and safety

See `privacy-security-model.md`. In short:
- **Same privacy as evenings:** game data follows the same promise, private and never sold.
- **Safety runs first:** every free-text answer goes through safety triage before anything else.
- **Nothing is unlocked by sharing more.** Disclosing more never earns anything.
