// Expedition catalog: hand-written, reviewed content. Never generated freely.
// The server validates it at startup; the web preview bundles the same file.

export type WorldId = "mind" | "body" | "soul" | "spirit" | "future";
export type StepType = "intro" | "lesson" | "choice" | "lens" | "sort" | "rehearse" | "plan" | "reflect" | "close";

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

/** A sort step: each item goes into one bin. Not scored: afterwards the player shows one reading of each, with its reason. */
export interface SortBin {
  id: string;
  label: string;
}
export interface SortItem {
  id: string;
  text: string;
  /** The bin this item is usually read as. Offered as a view, never marked right or wrong. */
  bin: string;
  why: string;
}

/** A printable worksheet: useful on paper, without the app. */
export interface Worksheet {
  title: string;
  intro: string;
  sections: { heading: string; lines?: number; columns?: string[]; rows?: number }[];
}

export interface Step {
  id: string;
  type: StepType;
  title: string;
  body?: string;
  prompt?: string;
  options?: ChoiceOption[];
  lenses?: Lens[];
  /** A lesson: short paragraphs, read or listened to. */
  paragraphs?: string[];
  bins?: SortBin[];
  items?: SortItem[];
  /** Shown once every lens is rated or every item sorted. */
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
  /** Chapters of an expedition carry their number. */
  chapter?: number;
  /** "draft" until Bianno (and, for anything touching mental health, a qualified reviewer) has approved it. */
  status?: "draft" | "reviewed";
  worksheet?: Worksheet;
  steps: Step[];
}

export interface SolarSystem {
  id: string;
  world: WorldId;
  title: string;
  objective: string;
  missionIds: string[];
  /** An expedition: chapters in order. Chapters not yet written are listed as planned, never as available. */
  kind?: "expedition";
  planned?: { title: string; line: string }[];
}

const MIND_SAFETY =
  "If overthinking comes with low mood or anxiety that's affecting your sleep, work or relationships, please talk to a doctor or a mental health professional. findahelpline.com lists free, confidential support lines for your country.";

const SOUL_SAFETY =
  "If a relationship feels unsafe, this isn't the right practice. findahelpline.com lists free, confidential support lines for your country.";

export const MISSIONS: Mission[] = [
  // ----- Beyond Overthinking (Mind). DRAFT: chapters 1 and 2, written 2026-10-31 for Bianno's review. -----
  {
    id: "overthinking-1",
    version: 1,
    systemId: "mind-beyond-overthinking",
    world: "mind",
    title: "Beyond Overthinking",
    part: "Chapter 1: Understand the loop",
    chapter: 1,
    status: "draft",
    objective: "Tell the difference between thinking something through and going round in a loop.",
    minutes: 8,
    safetyNote: MIND_SAFETY,
    worksheet: {
      title: "The Loop Check",
      intro: "For any thought that keeps coming back. Write it down, then ask it three questions.",
      sections: [
        { heading: "Thoughts that keep coming back", columns: ["The thought", "New information?", "A next step?", "Would more thinking change my decision?"], rows: 4 },
        { heading: "If all three answers are no: name it (\"loop\"), and choose a time to come back to it", lines: 2 },
        { heading: "The next step I found, and when I'll take it", lines: 2 },
      ],
    },
    steps: [
      {
        id: "intro",
        type: "intro",
        title: "Understand the loop",
        body: "Overthinking isn't a flaw in you. It's your mind trying to make something uncertain feel certain before you act. In this chapter you'll learn to spot the moment useful thinking turns into a loop, sort some thoughts, and look at one of your own. Nothing here is scored.",
        required: false,
      },
      {
        id: "lesson",
        type: "lesson",
        title: "The loop",
        paragraphs: [
          "Some thinking moves you forward. You find a fact, weigh two options, notice what matters to you, and a next step appears. Other thinking goes round. The same question comes back, nothing new is added, and you end up more tired than when you started.",
          "The loop usually begins with a question that has no answer yet. What if I choose wrong? What will they think? Your mind replays the situation and rehearses what might happen, looking for certainty. For a moment that feels like progress. Then the doubt returns, and the circle starts again.",
          "Researchers who study repetitive thinking describe two styles. One is concrete and asks how: what exactly happened, and what could I do next? The other is abstract and asks why: why am I like this, why does this always happen? The first tends to help people solve problems. The second tends to keep them stuck.",
          "Some uncertainty can't be removed by thinking. You can't know how a choice will turn out before you make it. When thinking stops adding anything, more of it won't bring the certainty you're looking for. That's the moment to notice the loop and step out of it.",
          "Three questions help you tell which kind of thinking you're in. Is there new information here? Is there a next step I can take? Would thinking about this longer change what I decide? If all three answers are no, you're probably in the loop.",
        ],
        required: false,
      },
      {
        id: "sort",
        type: "sort",
        title: "Forward or round?",
        body: "Six thoughts someone had while deciding whether to apply for a new job.",
        prompt: "Sort each one: does it move them forward, or go round?",
        bins: [
          { id: "forward", label: "Moves forward" },
          { id: "round", label: "Goes round" },
        ],
        items: [
          { id: "deadline", text: "When does the application close?", bin: "forward", why: "A question with an answer. Once it's found, it's done." },
          { id: "good-enough", text: "What if they think I'm not good enough?", bin: "round", why: "Nobody can answer this before applying, so thinking about it longer won't settle it." },
          { id: "enjoy", text: "Which parts of the role would I actually enjoy?", bin: "forward", why: "It asks about you, and you can answer it. It adds information." },
          { id: "always", text: "Why do I always do this to myself?", bin: "round", why: "An abstract why. It tends to bring a judgement, not a next step." },
          { id: "ask", text: "Who could I ask what the team is like?", bin: "forward", why: "It leads to an action that brings in something new." },
          { id: "wrong", text: "But what if it all goes wrong anyway?", bin: "round", why: "The loop's favourite question. It comes back however often it's answered." },
        ],
        feedback: "The thoughts that move forward can be answered or acted on. The ones that go round ask for a certainty nobody has yet. Your sorting doesn't need to match this. What matters is noticing the difference.",
        required: true,
      },
      {
        id: "your-loop",
        type: "rehearse",
        title: "Your loop",
        prompt: "What's a question your mind keeps coming back to at the moment? Write it the way it sounds in your head.",
        examples: ["What if I've already left it too late to change careers?"],
        required: true,
      },
      {
        id: "three-questions",
        type: "reflect",
        title: "The three questions",
        prompt: "Look at what you wrote. Is there new information in it, a next step, or anything more thinking would change? Write what you notice.",
        examples: ["No new information. The one step I can take is to look at two courses this week."],
        required: true,
      },
      {
        id: "apply",
        type: "plan",
        title: "Try it for real",
        prompt: "If you want: the next time the loop starts, name it quietly (\"loop\") and ask the three questions. What will you do, and when?",
        examples: ["Tonight, if I start replaying the meeting: say \"loop\" and ask the three questions."],
        required: false,
      },
      {
        id: "close",
        type: "close",
        title: "Return to Earth",
        body: "You've learned to notice the loop. Next in Beyond Overthinking: separating facts from assumptions. Your worksheet, The Loop Check, stays in this chapter whenever you want it.",
        required: false,
      },
    ],
  },
  {
    id: "overthinking-2",
    version: 1,
    systemId: "mind-beyond-overthinking",
    world: "mind",
    title: "Beyond Overthinking",
    part: "Chapter 2: Separate facts from assumptions",
    chapter: 2,
    status: "draft",
    objective: "Separate what you know from what you're guessing before you decide.",
    minutes: 8,
    safetyNote: MIND_SAFETY,
    worksheet: {
      title: "Facts and Assumptions",
      intro: "For a decision that's been going round. Split what you know from what you're guessing.",
      sections: [
        { heading: "The decision", lines: 1 },
        { heading: "Split it", columns: ["Facts: what I know, or could check", "Assumptions: what I'm guessing"], rows: 6 },
        { heading: "The guess carrying the most weight", lines: 1 },
        { heading: "One small way to check it, and when", lines: 2 },
        { heading: "The real trade-off that no amount of thinking will remove", lines: 2 },
      ],
    },
    steps: [
      {
        id: "intro",
        type: "intro",
        title: "Separate facts from assumptions",
        body: "Decisions feel heavier than they need to when guesses pass for facts. In this chapter you'll learn a simple split, practise it on someone else's decision, then use it on one of yours. Nothing here is scored.",
        required: false,
      },
      {
        id: "lesson",
        type: "lesson",
        title: "What you know, and what you're guessing",
        paragraphs: [
          "When a decision has been going round for a while, facts and guesses blur together. \"The job pays more\" and \"I'd hate it there\" start to feel equally true, though only one of them can be checked.",
          "A fact is something you could check, or that someone else would agree happened: a date, a number, something that was said. An assumption is a prediction, a guess at what someone else thinks, or a story about what something means. Assumptions aren't bad. You need them to decide anything. They just aren't known yet.",
          "Splitting the two doesn't make the decision for you. It shows you which assumptions you could test, even a little, and which part of the decision is a real trade-off that no amount of thinking will remove.",
          "Often one assumption carries most of the weight. \"My manager would see it as disloyal.\" \"I won't make friends there.\" Finding that one, and asking how you could check it, is usually worth more than another night of turning the whole thing over.",
        ],
        required: false,
      },
      {
        id: "sort",
        type: "sort",
        title: "Fact or assumption?",
        body: "Maya is deciding whether to move to another city for a job. This is what's on her mind.",
        prompt: "Sort each one: something she knows, or something she's guessing?",
        bins: [
          { id: "fact", label: "Fact" },
          { id: "assumption", label: "Assumption" },
        ],
        items: [
          { id: "pay", text: "The new job pays 15% more.", bin: "fact", why: "She has the offer in writing. It can be checked." },
          { id: "lonely", text: "I'd be lonely there.", bin: "assumption", why: "A prediction. It might be true, but it isn't known yet. She could find out who she already knows in that city." },
          { id: "lease", text: "My lease ends in March.", bin: "fact", why: "A date in a contract." },
          { id: "family", text: "My family would feel I'd abandoned them.", bin: "assumption", why: "A guess at what other people feel. She could ask them." },
          { id: "walk", text: "The office is a 20-minute walk from the flat I viewed.", bin: "fact", why: "Measurable, and she's measured it." },
          { id: "ability", text: "I won't be good at the new work.", bin: "assumption", why: "A prediction about herself. She could look at what the role involves, or talk to someone who does it." },
        ],
        feedback: "Half of what's on her mind can be checked, and it's mostly settled. The other half, the part that feels heaviest, is guesses about loneliness, family and ability. That doesn't make the guesses wrong. It means they're where she could find out more.",
        required: true,
      },
      {
        id: "decision",
        type: "rehearse",
        title: "Your decision",
        prompt: "Name a decision you've been turning over. Then write the facts: only what you know, or could check.",
        examples: ["Whether to take the team-lead role. Facts: it starts in May, it's a 10% raise, I'd manage four people."],
        required: true,
      },
      {
        id: "heaviest",
        type: "reflect",
        title: "The heaviest guess",
        prompt: "Now the assumptions. Which guess is carrying most of the weight, and how could you check it, even a little?",
        examples: ["That I'd be bad at managing people. I could ask Sam, who led the team last year, what it's really like."],
        required: true,
      },
      {
        id: "test",
        type: "plan",
        title: "Test one assumption",
        prompt: "If you want, choose one small way to check that guess, and when you'll do it.",
        examples: ["Ask Sam for twenty minutes on Thursday."],
        required: false,
      },
      {
        id: "close",
        type: "close",
        title: "Return to Earth",
        body: "You've separated what you know from what you're guessing. Chapter 3, Practise a pause, is still being written. Your worksheet, Facts and Assumptions, stays in this chapter whenever you want it.",
        required: false,
      },
    ],
  },
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
    id: "mind-beyond-overthinking",
    world: "mind",
    title: "Beyond Overthinking",
    objective: "Stop going round in circles on important decisions, and find a clearer next step.",
    kind: "expedition",
    missionIds: ["overthinking-1", "overthinking-2"],
    // Titles from Bianno's outline (2026-10-31). Shown as planned until written and reviewed.
    planned: [
      { title: "Practise a pause", line: "A short attention exercise for when the loop speeds up." },
      { title: "Enter the Decision Lab", line: "Explore alternative choices and their trade-offs." },
      { title: "Choose one small action", line: "Test a realistic decision-making strategy." },
      { title: "Reflect on the outcome", line: "Record what happened without judging success or failure." },
      { title: "Build your personal toolkit", line: "Save a printable worksheet and a reusable decision framework." },
    ],
  },
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
      if (s.type === "lesson" && !(s.paragraphs ?? []).length) problems.push(`${m.id}/${s.id}: a lesson needs paragraphs`);
      if (s.type === "sort") {
        const bins = new Set((s.bins ?? []).map((b) => b.id)), items = s.items ?? [];
        if (bins.size < 2 || bins.size > 3) problems.push(`${m.id}/${s.id}: 2 or 3 bins`);
        if (items.length < 3 || items.length > 8) problems.push(`${m.id}/${s.id}: 3 to 8 items`);
        if (new Set(items.map((x) => x.id)).size !== items.length) problems.push(`${m.id}/${s.id}: duplicate item ids`);
        for (const x of items) if (!bins.has(x.bin)) problems.push(`${m.id}/${s.id}: ${x.id} has an unknown bin`);
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
