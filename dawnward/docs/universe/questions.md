# Questions: the five gateways and Reflect’s question bank

**Content revision: 2 November 2026.** Replaces the wording in the 1 November draft following an editorial review of assumptions, repetition and foreseeable distress. This is a content specification, not clinical validation or evidence that the questions improve wellbeing.

**Implementation status:** The original author reported a built, undeployed implementation and 32 checks in `docs/galactic/test/e2e-questions.cjs`. Those claims, safety notes, storage behaviour and test results are **UNVERIFIED** in this review. No app source was supplied or changed. Existing gateway wording attributed to Bianno has been revised in this document at his request; the revised wording should not be described as his original words.

## The loop

UnifyMind asks a question; Dawnward offers space to explore it. Reflection and action are choices, not tests of whether someone is growing correctly.

| Stage | Intended experience |
|---|---|
| Discover | An optional gateway question |
| Reflect | One manageable follow-up; uncertainty and no answer are valid |
| Choose | A small action, an information-gathering step, or a decision to pause |
| Act | An optional experiment in real life; adapt or stop if unsuitable |
| Integrate | Ask “How did it go?” without assuming an action happened or helped |

**Required implementation behaviour, not verified as built:** Keep Skip and Stop available. Accept “not sure”, “nothing comes to mind”, “not today”, “I changed my mind” and “I stopped”. Treat these as equally valid outcomes for completion and rewards. Do not award extra points for disclosure, emotional intensity, positive answers, claiming transformation or persisting through distress. An action, streak or private disclosure must not be required to retain progress.

## The five guided questions

| World | Mission | Discover | Reflect | Choose |
|---|---|---|---|---|
| Mind | The Mirror of Thought | Is there one everyday thought you would like to examine more closely? | What supports this thought, what—if anything—points another way, and what remains uncertain? | Choose a low-stakes way to gather more information. You do not need to act on an uncertain interpretation. |
| Body | The Temple of Vitality | What do you notice in your body today, and is there any care or support you would like? | What would make caring for yourself easier? | Choose one manageable act of care and when you might try it over the next week. Adapt or stop if it does not suit you. |
| Soul | The Garden of Becoming | What matters to you when you are not thinking about other people’s approval? | Which value would you like to make more room for? | Choose one small action that expresses it, if that feels useful this week. |
| Spirit | The Observatory of Being | What remains meaningful when achievement, status and comparison fall silent? | Does a moment connected with that meaning come to mind? | Choose a brief pause: sit, walk, listen to something gentle or notice your surroundings. Stop whenever you want. |
| Future | The Horizon of Possibility | Imagine yourself a year from now. What might you appreciate about today, and what might you want to change? | If useful, write a letter from that imagined perspective. It is imagination, not a prediction, and has no special authority. | Choose one realistic step this week—or identify what information or support you need first. |

### Safeguards for these missions

These are requirements for the implementation, not guarantees about what is currently built:

- Keep reflection about thoughts focused on a manageable everyday situation. Do not suggest all strongly held beliefs are unreliable, invent hidden motives or instruct users to disregard a threat.
- Body prompts invite noticing, not diagnosis or an assumption that sensations reveal a specific medical need. Do not prescribe exercise, fasting, breath-holding or changing treatment through this question loop.
- Offer external sights or sounds, movement and stopping as alternatives to breath attention or silence. Do not force eyes-closed practice or ten minutes of stillness.
- Do not ask users to recover old memories or identify a hidden childhood cause. Present events, needs and boundaries may be sufficient topics.
- Keep disclosure, contact with another person and confrontation optional. Private writing is a complete option.
- The original document says Mind and Future reuse existing safety notes and a crisis check runs on every written answer. Both are **UNVERIFIED**. Review the actual copy and behaviour; an automated check cannot be treated as a guarantee that distress will be detected.

## Reflect: Another question

Keep the everyday opening “What’s on your mind?” and an optional Another question control. Associate each answer with the question actually shown. The original document reports that this association appears in the saved star, Journey and unsent draft; this behaviour remains **UNVERIFIED**.

The following 26 prompts replace the bank copy. Their order is a content list, not a required sequence.

### Mind

1. Is there one everyday thought you would like to examine more closely?
2. Is there a belief about yourself that might leave room for change?
3. What happened today, and what interpretation did you make? Are there other possible explanations?
4. Is there a manageable topic you would like to explore today? You can leave difficult topics for another time.
5. If something worried you today, what could you act on, influence or leave for now?
6. What would help you make this decision with enough confidence, while taking the risks seriously?

### Body

1. What do you notice in your body today, and is there any care or support you would like?
2. Was there a moment this week when your body felt comfortable, supported or energised? “Not this week” is an answer too.
3. What would rest look like if you didn’t have to earn it?
4. What gives you energy, and what quietly drains it?
5. If you notice physical signs of stress, what are they?

### Soul

1. What matters to you when you are not thinking about other people’s approval?
2. Which value would you like to make more room for?
3. Who would you like to understand better?
4. Where, with whom or during what activity have you felt some belonging? If nowhere comes to mind, what might make connection easier?
5. Is there something you would like to express honestly? You can write it privately without sharing it.

### Spirit

1. What remains meaningful when achievement, status and comparison fall silent?
2. Did anything give you a welcome sense of wonder or connection to something larger?
3. What question do you keep coming back to?
4. Is there a place, activity or moment where you feel a little more at ease?
5. Is there anything you appreciate today? It is fine if nothing comes to mind.

### Future

1. Imagine yourself a year from now. What might you appreciate about today, and what might you want to change?
2. What would you like to explore next, given your experience, circumstances and available support?
3. What do you want to be true a year from now?
4. Is there a commitment you would like to reconsider? What options are realistic and safe?
5. Is there a small step you want to take, and what would help you take it?

## Repetition and rotation requirements

- Gateways deliberately also appear in the bank. Exclude the just-completed gateway from the next-question rotation.
- Mind 1–3 should serve different purposes: choose a thought, examine a self-belief, distinguish an event from an interpretation. Avoid consecutive prompts on the same theme.
- Distinguish exploring a topic (Mind 4) from planning practical support (Future 5).
- Soul focuses on values and expression; Spirit focuses on meaning, wonder and ease. Avoid a run of approval/status questions.
- Future 3 chooses a direction; Future 1 balances appreciation with change. Do not repeat both immediately.
- Use recent prompt history across worlds and the Wisdom Library where available. Do not claim this filtering exists until implemented and checked.
- Reflection prompts are invitations, not factual findings about the user. Never infer neglect, avoidance, trauma or a hidden flaw from a question or its answer.

## Previously reported implementation and bug history

The 1 November draft reports the gateways appearing one tap below Begin reflection and in Learn, with The Bridge preceding the Garden of Becoming in Soul. These placements are **UNVERIFIED** here.

It also reports an autosave race: saving within 0.4 seconds could let a pending draft write restore an old reflection and associate a later save with the wrong world. It says Save now cancels that pending autosave and regression checks exist in `e2e-questions.cjs`. The fix and tests are **UNVERIFIED** without app code and execution.

## Still to implement or verify

- Copy changes in this file must be transferred to `experience/src/questions.js` and the guided-mission definitions; those files were not supplied.
- Opening narration (“Before you were told who to be…”): the original says it is not built. Require an optional, skippable, reduced-motion-compatible first visit.
- Living Mirror AI: the original says it is not built. Require no diagnosis, invented motives or unsupported claims, and Bianno’s approval of model use.
- Storage: the original claims answers stay on-device and the server does not yet store them. **UNVERIFIED and version-dependent.** Confirm current account and guest flows, network traffic, analytics and model-service use before making privacy promises.
- Verify crisis-check coverage, actual safety wording, Skip/Stop controls, neutral reward handling and question/answer association.
- Measure perceived usefulness, real-world follow-through, completion and return separately. Helpfulness and behavioural benefit remain **UNVERIFIED**; engagement does not establish either.

## Change log — 2 November 2026

Reviewed all 26 prompts, five guided follow-ups and five action instructions. Preserved the five worlds, mission names and Discover → Reflect → Choose → Act → Integrate structure. Removed presumptions of neglect, mistaken belief, avoidance and self-imposed limitation; softened exclusionary prompts; made disclosure and stillness optional; removed the seven-day daily requirement; added rotation requirements and explicitly separated proposed behaviour from unverified implementation claims.

## Implementation in the app (Claude, 2 Nov 2026): what was built and checked
Applied from this document. The commit with these changes lists the files.
- **The 26 prompts** replace the bank in `experience/src/questions.js`, word for word.
- **Five later questions of Bianno's were not in the version this review saw:**
  - "What are you discovering about yourself…";
  - "Who would you be if you no longer needed to prove your worth?";
  - "Do the people you love experience the love you believe you give?";
  - "If your time were limited…";
  - "What would you attempt if you no longer needed certainty…".

  They're kept as `UNREVIEWED_QUESTIONS` and offered after the reviewed ones. **Decision for Bianno:** two of them presume a gap ("prove your worth", "the love you believe you give"), which this review's rules advise against.
- **The five guided missions** use the Discover / Reflect / Choose wording above. Mission names are unchanged; objectives were reworded to match. The words are no longer described as Bianno's originals.
- **Optionality, built and tested** (`e2e-questions.cjs`, the server catalog test):
  - Discover is the only required step, and **"I'm not sure"** is a complete one-tap answer.
  - The follow-up and the action have **Not this time**.
  - Back leaves at any point and resumes later.
  - Done says "Whatever you chose, including nothing for now, counts", and shows no action card when none was chosen.
  - Home doesn't ask "How did it go?" about a skipped action.
  - Journey keeps the practice exactly like a fully answered one.
- **The same optionality in the constellations:** in Becoming Consistent and Feeling Closer, the seven-day experiment is now optional.
- **Reward handling (checked in code):** the practice is complete whatever was answered. One difference remains: an action you come back to review also earns that world's trail marker; skipping the action doesn't. Nothing is given for disclosure, intensity, positive answers or streaks; there are none.
- **Rotation:** questions answered in your last 8 reflections, and gateway questions whose mission you've completed, move to the end of "Another question". Never removed.
- **Old answers keep their question:** each saved reflection stores the question shown at the time, so changing the bank doesn't rewrite old ones.
- **Checked, not changed:**
  - The autosave race fix (`clearTimeout(autosave)` in save) and its regression checks in `e2e-questions.cjs` exist and pass.
  - The crisis check runs on every written expedition answer through `distress` in `explore.js`. It's a keyword check, so it can miss things. It is no guarantee.
  - Reflections stay on the device in the web preview. The server stores expedition answers only for signed-in accounts, which aren't live.
- **Still not done:** the opening narration, the Living Mirror (AI), and measurement.
