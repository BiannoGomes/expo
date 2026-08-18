/**
 * The seven onboarding chapters (part-2 brief §51, spec 03 §5).
 * Self-paced: default one per day, but a user may complete several in one
 * sitting. Each chapter is 10–15 focused minutes with a same-session payoff.
 */

export interface OnboardingChapter {
  id: string;
  index: number;
  title: string;
  opening: string;
  /** What the conversation is trying to learn — steers the model, never shown as a form. */
  aims: string[];
  /** Domains this chapter should touch for coverage tracking (spec 01 §7). */
  coverageDomains: string[];
}

export const ONBOARDING_CHAPTERS: OnboardingChapter[] = [
  {
    id: "who-you-are",
    index: 0,
    title: "Who are you?",
    opening:
      "Not your job title. Not your CV. If someone who loved you described who you really are — what would they say?",
    aims: [
      "core identity and self-description",
      "values in the person's own words",
      "current life situation in broad strokes",
    ],
    coverageDomains: ["character", "meaning", "environment"],
  },
  {
    id: "what-shaped-you",
    index: 1,
    title: "What shaped you?",
    opening:
      "Everyone is built from a handful of moments. Which experiences made you who you are — the good ones and the hard ones?",
    aims: [
      "formative experiences with rough timeline",
      "lessons the person took from them",
      "recurring themes across experiences",
    ],
    coverageDomains: ["adventure", "relationships", "emotional"],
  },
  {
    id: "what-you-want",
    index: 2,
    title: "What do you want?",
    opening:
      "Forget what's realistic for a moment. What do you actually want — in your work, your body, your relationships, your life?",
    aims: [
      "ambitions across domains, not just career",
      "which wants are the person's own vs inherited",
      "priority among the wants",
    ],
    coverageDomains: ["career", "wealth", "physical", "creativity"],
  },
  {
    id: "what-you-fear",
    index: 3,
    title: "What are you afraid of?",
    opening:
      "Most lives are shaped more by what we avoid than what we pursue. What are you avoiding? What would hurt to admit you're afraid of?",
    aims: [
      "named fears and what they protect",
      "postponed confrontations and decisions",
      "the cost the fears are currently charging",
    ],
    coverageDomains: ["emotional", "character", "relationships"],
  },
  {
    id: "extraordinary",
    index: 4,
    title: "What would make your life extraordinary?",
    opening:
      "Picture yourself old, looking back, satisfied. What happened in that life? What did you experience, build, become?",
    aims: [
      "the person's definition of extraordinary — experiences, not only outcomes",
      "what they would regret never doing",
      "legacy in their own terms",
    ],
    coverageDomains: ["adventure", "legacy", "meaning", "creativity"],
  },
  {
    id: "what-must-change",
    index: 5,
    title: "What must change?",
    opening:
      "You already know some things can't stay as they are. Name them — habits, environments, relationships, stories you tell yourself.",
    aims: [
      "what the person already knows must change",
      "environment and routine friction",
      "energy drains and constraints (time, money, obligations)",
    ],
    coverageDomains: ["environment", "physical", "mental", "wealth"],
  },
  {
    id: "future-self",
    index: 6,
    title: "Meet your Future Self",
    opening:
      "Now we put it together. A few final questions, and then I'll show you the person we're building — and the first 90 days toward them.",
    aims: [
      "confirm the emerging picture with the user",
      "resolve the biggest open contradiction",
      "set the horizon year and time available per day",
    ],
    coverageDomains: [],
  },
];

export function chapterByIndex(index: number): OnboardingChapter | undefined {
  return ONBOARDING_CHAPTERS[index];
}

export const ONBOARDING_CHAPTER_COUNT = ONBOARDING_CHAPTERS.length;
