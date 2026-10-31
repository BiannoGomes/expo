// Expedition catalog: hand-written, reviewed content. Never generated freely.
// The server validates it at startup; the web preview bundles the same file.

export type WorldId = "mind" | "body" | "soul" | "spirit" | "future";
export type StepType = "intro" | "choice" | "lens" | "rehearse" | "plan" | "reflect" | "close";

export interface ChoiceOption {
  id: string;
  text: string;
  /** What tends to happen. Never "right" or "wrong": every choice teaches. */
  outcome: string;
  why: string;
}

/** A reading of an event (Mind's lens mechanic), rated against what you actually know. */
export interface Lens {
  id: string;
  text: string;
}

export interface Step {
  id: string;
  type: StepType;
  title: string;
  body?: string;
  prompt?: string;
  options?: ChoiceOption[];
  lenses?: Lens[];
  /** Shown once every lens is rated. */
  feedback?: string;
  /** Example wording, offered as a starting point, never prefilled. */
  examples?: string[];
  required: boolean;
}

export interface Mission {
  id: string;
  version: number;
  systemId: string;
  world: WorldId;
  title: string;
  part: string;
  objective: string;
  minutes: number;
  safetyNote?: string;
  steps: Step[];
}

export interface SolarSystem {
  id: string;
  world: WorldId;
  title: string;
  objective: string;
  missionIds: string[];
}

const SOUL_SAFETY =
  "If a relationship feels unsafe, this isn't the right practice. findahelpline.com lists free, confidential support lines for your country.";

export const MISSIONS: Mission[] = [
  {
    id: "labyrinth-1",
    version: 1,
    systemId: "mind-thought-patterns",
    world: "mind",
    title: "The Thought Labyrinth",
    part: "Part 1: One event, three readings",
    objective: "See an event from more than one angle before deciding what it means.",
    minutes: 6,
    steps: [
      {
        id: "intro",
        type: "intro",
        title: "One event, many readings",
        body: "Something small happened, and your mind has already decided what it means. Here you'll look at it through three lenses, weigh what you actually know, and find a second reading of something from your own life. Nothing here is scored.",
        required: false,
      },
      {
        id: "readings",
        type: "lens",
        title: "A message left on read",
        body: "This morning you sent a friend a long, careful message. It's evening now. It says \"read\", and they haven't replied.",
        prompt: "For each reading, how well does it fit what you actually know?",
        lenses: [
          { id: "annoyed", text: "They're annoyed with me." },
          { id: "busy", text: "They're busy and want to reply properly when they have time." },
          { id: "forgot", text: "They read it on the go and forgot to come back to it." },
        ],
        feedback: "You know one thing for certain: they read it. Every reading beyond that is a guess. The guess that feels most true often says more about how your day has been than about them.",
        required: true,
      },
      {
        id: "facts",
        type: "rehearse",
        title: "Your own labyrinth",
        prompt: "Think of something recent that your mind decided the meaning of quickly. Write only what happened, just the facts.",
        examples: ["My manager moved our one-to-one without saying why."],
        required: true,
      },
      {
        id: "second-reading",
        type: "reflect",
        title: "A second reading",
        prompt: "Write one other way of reading it that also fits those facts.",
        required: true,
      },
      {
        id: "learn-more",
        type: "plan",
        title: "If you want to know more",
        prompt: "Choose one small thing that would tell you more, like asking, or waiting a day before deciding. You can also leave this for now.",
        examples: ["Ask her on Friday whether everything's okay"],
        required: false,
      },
      {
        id: "close",
        type: "close",
        title: "Return to Earth",
        body: "You practised finding a second reading before deciding. Next time your mind decides fast, look for one more way the facts could fit.",
        required: false,
      },
    ],
  },
  {
    id: "bridge-1",
    version: 1,
    systemId: "soul-communication",
    world: "soul",
    title: "The Bridge",
    part: "Part 1: Opening",
    objective: "Begin a difficult conversation without blame.",
    minutes: 6,
    safetyNote: SOUL_SAFETY,
    steps: [
      {
        id: "intro",
        type: "intro",
        title: "The conversation you've been putting off",
        body: "Someone close to you did something that upset you, and you haven't said so yet. Here you'll try three ways to begin, write your own first sentence, and choose a real moment to say it. Nothing here is scored.",
        required: false,
      },
      {
        id: "opening",
        type: "choice",
        title: "How do you begin?",
        body: "You've decided to bring it up. What's your first sentence?",
        options: [
          {
            id: "blame",
            text: "\"You always do this. You never listen.\"",
            outcome: "They're likely to defend themselves before they hear you.",
            why: "Words like always and never turn one moment into a verdict on the whole person. It's understandable when you're hurt, and it usually starts an argument instead of a conversation.",
          },
          {
            id: "avoid",
            text: "Say nothing and hope it gets better.",
            outcome: "Peace for now, but the feeling tends to come back stronger.",
            why: "Waiting for a better moment can be wise. Waiting forever usually isn't, because the other person can't change what they don't know about.",
          },
          {
            id: "invite",
            text: "\"Something has been on my mind. Can we talk about it?\"",
            outcome: "They're likely to be curious rather than defensive.",
            why: "It says something matters without blaming anyone, and it asks for their attention rather than taking it.",
          },
        ],
        required: true,
      },
      {
        id: "first-sentence",
        type: "rehearse",
        title: "Your first sentence",
        prompt: "Write the first sentence you'd actually say, in your own words. Keep it to what happened and how it felt.",
        examples: ["When you cancelled on Friday, I felt let down. Can we talk about it?"],
        required: true,
      },
      {
        id: "moment",
        type: "plan",
        title: "When will you say it?",
        prompt: "Choose one real moment this week. Small and specific works best.",
        examples: ["Ask Sam for ten minutes on Thursday evening"],
        required: true,
      },
      {
        id: "hardest",
        type: "reflect",
        title: "Before you go",
        prompt: "What feels hardest about saying it?",
        required: true,
      },
      {
        id: "close",
        type: "close",
        title: "Return to Earth",
        body: "You practised opening without blame, wrote your own words and chose a moment. When you've had the conversation, come back and say how it went. However it went, it counts.",
        required: false,
      },
    ],
  },
  {
    id: "bridge-2",
    version: 1,
    systemId: "soul-communication",
    world: "soul",
    title: "The Bridge",
    part: "Part 2: Listening back",
    objective: "Show you've heard someone before you reply.",
    minutes: 6,
    safetyNote: SOUL_SAFETY,
    steps: [
      {
        id: "intro",
        type: "intro",
        title: "The next ten seconds",
        body: "The conversation has started, and they say something that stings. This practice is about what you do next: showing you heard them before you answer.",
        required: false,
      },
      {
        id: "reply",
        type: "choice",
        title: "What do you say next?",
        body: "They say: \"I only cancelled because work has been crushing me, and you never ask how I am.\"",
        options: [
          {
            id: "correct",
            text: "\"That's not fair, I ask all the time.\"",
            outcome: "The conversation becomes about who is right.",
            why: "Correcting them first tells them they weren't heard, even if you're right. There's time to correct it later.",
          },
          {
            id: "close-down",
            text: "\"Okay. Sorry.\"",
            outcome: "The tension ends, but nothing is understood.",
            why: "A quick apology can close the door it was meant to open, because neither of you has said what matters.",
          },
          {
            id: "reflect-back",
            text: "\"So work has been crushing you, and it felt like I didn't notice. Is that right?\"",
            outcome: "They feel heard, and usually soften.",
            why: "Saying back what you heard, and checking, shows you listened. It doesn't mean you agree.",
          },
          {
            id: "pause",
            text: "\"Can we pick this up tomorrow evening? I want to get it right.\"",
            outcome: "Sometimes the right call, when you're both too upset.",
            why: "A pause helps when you name a time to come back. Without one it can feel like a door closing.",
          },
        ],
        required: true,
      },
      {
        id: "say-back",
        type: "rehearse",
        title: "Say back what you heard",
        prompt: "Think of something someone said to you recently that stung. Write how you'd say back what you heard, without agreeing or arguing.",
        examples: ["It sounds like you felt left out when I made plans without asking. Did I get that right?"],
        required: true,
      },
      {
        id: "hard-part",
        type: "reflect",
        title: "Before you go",
        prompt: "What makes listening back hard for you?",
        required: true,
      },
      {
        id: "close",
        type: "close",
        title: "Return to Earth",
        body: "You practised hearing someone before answering them. Next time a conversation stings, try saying back what you heard first.",
        required: false,
      },
    ],
  },
  {
    id: "bridge-3",
    version: 1,
    systemId: "soul-communication",
    world: "soul",
    title: "The Bridge",
    part: "Part 3: Repair",
    objective: "Apologise or repair without over-explaining.",
    minutes: 7,
    safetyNote: SOUL_SAFETY,
    steps: [
      {
        id: "intro",
        type: "intro",
        title: "When you got it wrong",
        body: "Everyone gets it wrong sometimes. Repair is a skill: naming what happened, owning your part, and asking what would help.",
        required: false,
      },
      {
        id: "apology",
        type: "choice",
        title: "Which apology repairs it?",
        body: "You snapped at a friend yesterday.",
        options: [
          {
            id: "if",
            text: "\"Sorry if you were upset.\"",
            outcome: "It can sound as if the problem is their feelings.",
            why: "\"If\" and \"you were upset\" move the focus away from what you did.",
          },
          {
            id: "but",
            text: "\"Sorry, but I'd had a terrible day and you kept pushing.\"",
            outcome: "The \"but\" tends to erase the \"sorry\".",
            why: "Context can help later. Straight after an apology it sounds like a defence.",
          },
          {
            id: "own",
            text: "\"I snapped at you yesterday and that wasn't fair. I'm sorry. Is there anything you need from me?\"",
            outcome: "Clear, owned, and it invites them back in.",
            why: "It names what happened, owns it without excuses, and asks rather than assumes.",
          },
        ],
        required: true,
      },
      {
        id: "your-apology",
        type: "rehearse",
        title: "Your words",
        prompt: "Is there something you'd like to repair? Write the apology you'd give, naming what happened and owning your part. You don't have to send it.",
        examples: ["I was short with you on the phone and that wasn't fair. I'm sorry."],
        required: true,
      },
      {
        id: "when",
        type: "plan",
        title: "If you want to say it",
        prompt: "If you'd like to, choose when you'll say it. You can also leave this for now.",
        examples: ["Call Mum on Sunday morning"],
        required: false,
      },
      {
        id: "notice",
        type: "reflect",
        title: "Before you go",
        prompt: "What did you notice about how you apologise?",
        required: true,
      },
      {
        id: "close",
        type: "close",
        title: "Return to Earth",
        body: "You practised repair: naming it, owning it, and asking. That finishes The Bridge.",
        required: false,
      },
    ],
  },
];

export const SYSTEMS: SolarSystem[] = [
  {
    id: "mind-thought-patterns",
    world: "mind",
    title: "Thought Patterns",
    objective: "Notice how quickly meaning is decided, and find more than one reading.",
    missionIds: ["labyrinth-1"],
  },
  {
    id: "soul-communication",
    world: "soul",
    title: "Communication",
    objective: "Say hard things with clarity and care.",
    missionIds: ["bridge-1", "bridge-2", "bridge-3"],
  },
];

export const missionById = (id: string): Mission | undefined => MISSIONS.find((m) => m.id === id);
export const systemById = (id: string): SolarSystem | undefined => SYSTEMS.find((s) => s.id === id);

/** Structural checks run at server start and in tests. Returns problems, empty when sound. */
export function checkCatalog(): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const m of MISSIONS) {
    if (ids.has(m.id)) problems.push(`duplicate mission ${m.id}`);
    ids.add(m.id);
    if (!systemById(m.systemId)) problems.push(`${m.id}: unknown system ${m.systemId}`);
    if (!m.steps.some((s) => s.required)) problems.push(`${m.id}: no required step, so no completion state`);
    if (m.steps[m.steps.length - 1]?.type !== "close") problems.push(`${m.id}: must end with a close step`);
    const stepIds = new Set<string>();
    for (const s of m.steps) {
      if (stepIds.has(s.id)) problems.push(`${m.id}: duplicate step ${s.id}`);
      stepIds.add(s.id);
      if (s.type === "choice") {
        const opts = s.options ?? [];
        if (opts.length < 2 || opts.length > 4) problems.push(`${m.id}/${s.id}: 2 to 4 options`);
        if (new Set(opts.map((o) => o.id)).size !== opts.length) problems.push(`${m.id}/${s.id}: duplicate option ids`);
      }
      if (s.type === "lens") {
        const ls = s.lenses ?? [];
        if (ls.length < 2 || ls.length > 4) problems.push(`${m.id}/${s.id}: 2 to 4 lenses`);
        if (new Set(ls.map((l) => l.id)).size !== ls.length) problems.push(`${m.id}/${s.id}: duplicate lens ids`);
        if (!s.prompt) problems.push(`${m.id}/${s.id}: needs a prompt`);
      }
      if ((s.type === "rehearse" || s.type === "reflect" || s.type === "plan") && !s.prompt) problems.push(`${m.id}/${s.id}: needs a prompt`);
    }
  }
  for (const sys of SYSTEMS) for (const id of sys.missionIds) if (!missionById(id)) problems.push(`${sys.id}: unknown mission ${id}`);
  return problems;
}

/** Each world plays differently. What it offers now, and what is planned (shown as planned, never as available). */
export const WORLD_PLAY: Record<WorldId, { mechanic: string; planned: string[] }> = {
  mind: { mechanic: "Lenses: one event, seen through several readings, weighed against what you know.", planned: ["Focus", "Emotional Awareness", "Decisions"] },
  body: { mechanic: "Experiments: a small habit tried for a week, and what you noticed.", planned: ["Energy", "Recovery", "Sleep", "Movement"] },
  soul: { mechanic: "Dialogue: conversations to practise, with what tends to happen and why.", planned: ["Values", "Gratitude", "Compassion"] },
  spirit: { mechanic: "Stillness: short practices of awe, attention and the big questions.", planned: ["Awe", "Contemplation", "Questions"] },
  future: { mechanic: "Crossroads: paths compared by their assumptions and trade-offs, then one first step.", planned: ["Decisions", "Goals", "Skills", "Purpose"] },
};
