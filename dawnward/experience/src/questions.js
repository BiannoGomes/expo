// Questions for Reflect, one world at a time. "Another question" moves through them.
// "Another question" starts from the world's everyday question (registry META.q), then these.
// Wording: editorial review of 2 Nov 2026 (docs/universe/questions.md, run in ChatGPT for Bianno), which
// removed presumptions of neglect, mistaken belief, avoidance and self-imposed limits. Questions are
// invitations, never findings about the person. The first of each world is also its guided mission's Discover.
export const QUESTIONS = {
  mind: [
    "Is there one everyday thought you would like to examine more closely?",
    "Is there a belief about yourself that might leave room for change?",
    "What happened today, and what interpretation did you make? Are there other possible explanations?",
    "Is there a manageable topic you would like to explore today? You can leave difficult topics for another time.",
    "If something worried you today, what could you act on, influence or leave for now?",
    "What would help you make this decision with enough confidence, while taking the risks seriously?",
  ],
  body: [
    "What do you notice in your body today, and is there any care or support you would like?",
    "Was there a moment this week when your body felt comfortable, supported or energised? “Not this week” is an answer too.",
    "What would rest look like if you didn't have to earn it?",
    "What gives you energy, and what quietly drains it?",
    "If you notice physical signs of stress, what are they?",
  ],
  soul: [
    "What matters to you when you are not thinking about other people's approval?",
    "Which value would you like to make more room for?",
    "Who would you like to understand better?",
    "Where, with whom or during what activity have you felt some belonging? If nowhere comes to mind, what might make connection easier?",
    "Is there something you would like to express honestly? You can write it privately without sharing it.",
  ],
  spirit: [
    "What remains meaningful when achievement, status and comparison fall silent?",
    "Did anything give you a welcome sense of wonder or connection to something larger?",
    "What question do you keep coming back to?",
    "Is there a place, activity or moment where you feel a little more at ease?",
    "Is there anything you appreciate today? It is fine if nothing comes to mind.",
  ],
  future: [
    "Imagine yourself a year from now. What might you appreciate about today, and what might you want to change?",
    "What would you like to explore next, given your experience, circumstances and available support?",
    "What do you want to be true a year from now?",
    "Is there a commitment you would like to reconsider? What options are realistic and safe?",
    "Is there a small step you want to take, and what would help you take it?",
  ],
};

/** Bianno's later gateway questions, added after the version the 2 Nov review saw. Kept, offered after
 *  the reviewed ones, and waiting for his decision (two of them presume a gap; see docs/universe/questions.md). */
export const UNREVIEWED_QUESTIONS = {
  mind: ["What are you discovering about yourself, and what will you do differently because of it?"],
  soul: ["Who would you be if you no longer needed to prove your worth?", "Do the people you love experience the love you believe you give?"],
  spirit: ["If your time were limited, which parts of your life would suddenly become important?"],
  future: ["What would you attempt if you no longer needed certainty before beginning?"],
};

/** The bank for one world, with questions answered recently moved to the end (never removed), so
 *  "Another question" doesn't keep offering what you've just written about. */
export function bank(world, recent = []) {
  const all = [...(QUESTIONS[world] ?? []), ...(UNREVIEWED_QUESTIONS[world] ?? [])];
  const used = new Set(recent);
  return [...all.filter((q) => !used.has(q)), ...all.filter((q) => used.has(q))];
}
