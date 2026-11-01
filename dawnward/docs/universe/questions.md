# Questions: the five gateway questions and Reflect's question bank

**Status:** 2026-11-01. Built and tested (`docs/galactic/test/e2e-questions.cjs`, 32 checks). Nothing deployed.
Bianno's gateway questions and missions are used word for word. Everything else here (the follow-up
questions, the bank, the examples) is a **draft for Bianno's review**; the guided missions show "draft" until he approves them.

## The loop
UnifyMind asks the question; Dawnward lets you explore the answer. Each world's guided question runs the same loop,
using the expedition engine that already keeps progress, resumes, and asks "How did it go?":

| Stage | Where it happens |
|---|---|
| **Discover** | The gateway question, as the step's heading |
| **Reflect** | One follow-up that looks at the pattern |
| **Choose** | One small, real action, with roughly when |
| **Act** | Back on Earth, in your real life |
| **Integrate** | Home asks "How did it go?"; any outcome counts and earns a trail marker in that world |

Points are never given for saying you're transformed: the star comes from finishing, the trail marker from coming back to say how the real action went.

## The five guided questions
| World | Mission | Discover (Bianno) | Reflect (draft) | Choose (Bianno's mission, draft wording) |
|---|---|---|---|---|
| Mind | The Mirror of Thought | What if the thoughts you believe most strongly are the ones you need to question? | What do you actually know? (one thing for, one against, a fairer version) | Test it: one small thing this week, as if the fairer version were true |
| Body | The Temple of Vitality | If your body could tell you what it needs, what have you been ignoring? | What gets in the way? | Seven days: one small practice, every day |
| Soul | The Garden of Becoming | Who are you when there is nobody left to impress? | Which value have you set aside? | Live it once: one action this week |
| Spirit | The Observatory of Being | What remains meaningful when achievement, status and comparison fall silent? | When did you last feel it? | Ten quiet minutes, no phone, music or tasks |
| Future | The Horizon of Possibility | If your future self could observe your decisions today, what would they ask you to change? | A letter from ahead (imagination, not a prediction) | One concrete step this week |

Safety: Mind and Future reuse their existing safety notes; Body says it isn't medical advice. The crisis check runs on every written answer, as it does in every expedition.

**Where they appear:** in each world, one tap below "Begin reflection" (for Body and Spirit, which had no expedition before, this is now their first). In Learn, under each world. Soul still offers The Bridge first; the Garden of Becoming follows it.

## Reflect: "Another question"
Reflect opens on the world's everyday question ("What's on your mind?"). A quiet **Another question** link moves through that world's bank (`experience/src/questions.js`). The question you answered is kept with your words, shown above them on the new star and in Journey, and kept in an unsent draft. Everyday questions add no label.

★ = Bianno's words.

- **Mind:** What if the thoughts you believe most strongly are the ones you need to question? ★ · What belief about yourself have you mistaken for a permanent truth? ★ · What story did you tell yourself today that might not be true? · What are you avoiding thinking about? · Which worry today was about something you can't control? · What would you decide if you weren't afraid of getting it wrong?
- **Body:** If your body could tell you what it needs, what have you been ignoring? ★ · When did you feel most alive in your body this week? · What would rest look like if you didn't have to earn it? · What gives you energy, and what quietly drains it? · What does your body do when you're stressed?
- **Soul:** Who are you when there is nobody left to impress? ★ · Which value have you set aside lately? · Who would you like to understand better? · When did you last feel you belonged? · What would you say if you weren't trying to be liked?
- **Spirit:** What remains meaningful when achievement, status and comparison fall silent? ★ · What made you feel small, in a good way? · What question do you keep coming back to? · Where do you feel most at peace? · What are you grateful for that you rarely say?
- **Future:** If your future self could observe your decisions today, what would they ask you to change? ★ · Who could you become if you stopped living by the limits of who you've been? ★ · What do you want to be true a year from now? · What are you saying yes to that you'd like to say no to? · What small step have you been putting off?

## A bug found on the way, and fixed
Typing and pressing Save within 0.4 s left a draft autosave pending; it fired after the save and wrote the words back as a draft. The next reflection, even in another world, then opened as that old draft and was saved to the old world. Save now cancels the pending autosave. Regression checks are in `e2e-questions.cjs`.

## Not done yet (from the same brief)
- **The opening narration** ("Before you were told who to be…"): needs a skippable, reduced-motion-safe first visit. Not built; it should never be forced.
- **The Living Mirror (AI)**: not built. It would need the same rules as everything else here: no diagnosis, no hidden motives, no claims presented as fact, and Bianno's approval of any model use.
- **Connected accounts:** the question you answered is kept on this device; the Dawnward server doesn't store it yet.
- **Real users:** whether these questions actually help people act differently hasn't been measured. Engagement, completion, perceived usefulness and follow-through should be measured separately.
