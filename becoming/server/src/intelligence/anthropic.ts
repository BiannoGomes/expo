import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  TAXONOMY,
  type DailyPlan,
  type Intelligence,
  type IntegrationProposal,
  type SafetyTriage,
} from "@becoming/core";

/**
 * Anthropic-backed implementation of the Intelligence interface.
 * Model tiering per docs/specs/05-cost-model-acceptance.md §2:
 * frontier reasoning only where judgment is the product.
 */
const MODELS = {
  triage: "claude-haiku-4-5",
  workhorse: "claude-sonnet-5",
  deep: "claude-opus-5",
} as const;

const client = new Anthropic();

const assertionKindEnum = z.enum([
  "value", "trait", "pattern", "belief", "fear", "preference",
  "capability_level", "relationship_fact", "bottleneck",
  "goal_intent", "biographical_fact",
]);

const triageSchema = z.object({
  level: z.enum(["none", "distress", "crisis"]),
  category: z.string().optional(),
});

const planSchema = z.object({
  slots: z
    .array(
      z.object({
        slot: z.enum(["build", "train", "learn", "confront", "experience"]),
        text: z.string(),
        because: z.string(),
      }),
    )
    .max(5),
  question: z.string(),
  restDay: z.boolean(),
});

const extractionSchema = z.object({
  slotOutcomes: z.array(
    z.object({
      slot: z.enum(["build", "train", "learn", "confront", "experience"]),
      status: z.enum(["done", "partial", "skipped", "not_mentioned"]),
      note: z.string().optional(),
    }),
  ),
  achievements: z.array(z.string()),
  emotions: z.array(z.object({ label: z.string(), context: z.string() })),
  decisions: z.array(
    z.object({
      decision: z.string(),
      status: z.enum(["made", "avoided", "pending"]),
    }),
  ),
  confrontations: z.array(
    z.object({ what: z.string(), happened: z.enum(["yes", "no", "partial"]) }),
  ),
  relationships: z.array(z.object({ personRef: z.string(), note: z.string() })),
  energy: z.enum(["low", "ok", "high", "unknown"]),
  facetTags: z.array(z.string()),
  candidateAssertions: z.array(
    z.object({
      statement: z.string(),
      kind: assertionKindEnum,
      facetIds: z.array(z.string()),
      evidence: z.string(),
    }),
  ),
  unresolved: z.array(z.string()),
  reply: z.string(),
});

const onboardingTurnSchema = z.object({
  reply: z.string(),
  chapterComplete: z.boolean(),
});

const chapterExtractionSchema = z.array(
  z.object({
    statement: z.string(),
    kind: assertionKindEnum,
    facetIds: z.array(z.string()),
    evidence: z.string(),
  }),
);

const synthesisSchema = z.object({
  futureSelf: z.record(z.string(), z.string()),
  gaps: z.array(z.object({ domainId: z.string(), note: z.string() })),
  bottleneck: z.object({
    classId: z.string(),
    statement: z.string(),
    basis: z.string(),
    evidenceQuotes: z.array(z.string()),
  }),
  campaign: z.object({
    title: z.string(),
    mission: z.string(),
    why: z.string(),
    primaryDomain: z.string(),
    secondaryDomains: z.array(z.string()),
    milestones: z.array(z.object({ day: z.number(), title: z.string() })),
  }),
  reveal: z.string(),
});

const deepReviewSchema = z.object({
  bottleneckVerdict: z.enum(["confirmed", "revised", "rejected", "insufficient-data"]),
  revisedStatement: z.string().optional(),
  revisedClassId: z.string().optional(),
  basis: z.string(),
  notableChanges: z.array(z.string()),
});

const integrationSchema = z.array(
  z.object({
    action: z.enum(["confirm", "contradict", "create"]),
    targetAssertionId: z.string().optional(),
    statement: z.string().optional(),
    kind: z.string().optional(),
    facetIds: z.array(z.string()).optional(),
    basis: z.string(),
  }),
);

/** Call, parse the first text block as JSON, validate; one retry, then throw
 * so the caller can park the record as `unprocessed` (spec 02 §4). */
async function jsonCall<T>(
  params: Anthropic.MessageCreateParamsNonStreaming,
  schema: z.ZodType<T>,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.messages.create(params);
    const text = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    )?.text;
    try {
      const parsed = schema.safeParse(JSON.parse(extractJson(text ?? "")));
      if (parsed.success) return parsed.data;
      lastError = parsed.error;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`intelligence output failed validation: ${String(lastError)}`);
}

function extractJson(text: string): string {
  const start = text.search(/[[{]/);
  if (start === -1) return text;
  return text.slice(start);
}

const FACET_LIST = TAXONOMY.domains
  .map((d) => `${d.label}: ${d.facets.map((f) => `${d.id}/${f}`).join(", ")}`)
  .join("\n");

export const intelligence: Intelligence = {
  async triageSafety(text): Promise<SafetyTriage> {
    return jsonCall(
      {
        model: MODELS.triage,
        max_tokens: 128,
        system:
          "You are a safety triage classifier for a personal-development app. " +
          "Classify the user text. Respond with JSON only: " +
          '{"level": "none"|"distress"|"crisis", "category"?: string}. ' +
          "crisis = self-harm or suicide signal, harm to others, abuse disclosure, medical emergency. " +
          "distress = acute stress, hopeless language, harmful coping below crisis level. " +
          "When uncertain between levels, choose the higher one.",
        messages: [{ role: "user", content: text }],
      },
      triageSchema,
    );
  },

  async generatePlan(input): Promise<DailyPlan> {
    const result = await jsonCall(
      {
        model: MODELS.workhorse,
        max_tokens: 1500,
        system:
          "You generate the BECOMING morning plan: at most five slots " +
          "(build, train, learn, confront, experience) plus one question. " +
          "Rules: leave out any slot you cannot fill well — three good slots beat five mediocre ones. " +
          "Never two builds. confront only from probable+ assertions, phrased as invitation. " +
          "The total plan must fit the user's available minutes. " +
          `If reducedLoad is true, shrink to build plus one other slot, or set restDay true. ` +
          "Respond with JSON only matching " +
          '{"slots":[{"slot","text","because"}],"question":string,"restDay":boolean}.',
        messages: [{ role: "user", content: JSON.stringify(input) }],
      },
      planSchema,
    );
    return { date: input.date, ...result };
  },

  async extractDebrief(input) {
    const { reply, ...extraction } = await jsonCall(
      {
        model: MODELS.workhorse,
        max_tokens: 2500,
        system:
          "You process the BECOMING evening debrief. Extract structured data from the " +
          "user's reflection and write a short user-facing reply. " +
          "The reply cites today only; never claim a multi-day pattern. " +
          "End the reply with tomorrow's single highest-leverage move. " +
          "candidateAssertions must each quote verbatim supporting text in `evidence` " +
          "and carry facetIds. facetTags and facetIds must come from this taxonomy:\n" +
          FACET_LIST +
          "\nRespond with JSON only: the DebriefExtraction fields plus a `reply` string.",
        messages: [{ role: "user", content: JSON.stringify(input) }],
      },
      extractionSchema,
    );
    return { extraction: { ...extraction, date: input.date }, reply };
  },

  async integrateCandidates(input): Promise<IntegrationProposal[]> {
    const proposals = await jsonCall(
      {
        model: MODELS.workhorse,
        max_tokens: 2000,
        system:
          "You integrate candidate assertions into a personal model. For each candidate, " +
          "compare against the related existing assertions and propose exactly one action: " +
          "confirm (matches an existing assertion), contradict (conflicts with one — never overwrite), " +
          "or create (genuinely new, starts at hypothesis confidence). " +
          "You propose; application code decides confidence promotions. " +
          'Respond with JSON only: [{"action","targetAssertionId"?,"statement"?,"kind"?,"facetIds"?,"basis"}].',
        messages: [{ role: "user", content: JSON.stringify(input) }],
      },
      integrationSchema,
    );
    return proposals as IntegrationProposal[];
  },

  async onboardingTurn(input) {
    return jsonCall(
      {
        model: MODELS.workhorse,
        max_tokens: 800,
        system:
          "You are guiding one chapter of the BECOMING onboarding — a conversation, never a form. " +
          `Chapter: "${input.chapterTitle}". Aims (internal, never listed to the user): ${input.aims.join("; ")}. ` +
          "Ask one question at a time. Follow what the user actually says rather than a script. " +
          "Warm, direct, unhurried; no flattery, no therapy-speak, no bullet lists. " +
          "Set chapterComplete true once the aims are substantially met or the user signals they're done — " +
          "aim for 10-15 minutes of conversation, never drag it out. When completing, close with a short " +
          "reflected-back insight: something true you heard underneath their answers, framed tentatively. " +
          (input.soften
            ? "The user may be under strain: keep it gentle, do not probe fears or push. "
            : "") +
          'Respond with JSON only: {"reply": string, "chapterComplete": boolean}.',
        messages: [
          ...input.history.map((m) => ({
            role: m.role === "user" ? ("user" as const) : ("assistant" as const),
            content: m.text,
          })),
          { role: "user", content: input.message },
        ],
      },
      onboardingTurnSchema,
    );
  },

  async extractChapter(input) {
    return jsonCall(
      {
        model: MODELS.workhorse,
        max_tokens: 2000,
        system:
          "Extract candidate assertions from this completed BECOMING onboarding chapter transcript. " +
          "Each assertion: one plain-language sentence about the user, a kind, facetIds from the taxonomy, " +
          "and a verbatim supporting quote in `evidence`. Only what the transcript supports — no guessing. " +
          "Taxonomy:\n" +
          FACET_LIST +
          '\nRespond with JSON only: [{"statement","kind","facetIds","evidence"}].',
        messages: [{ role: "user", content: JSON.stringify(input) }],
      },
      chapterExtractionSchema,
    );
  },

  async synthesizeOnboarding(input) {
    const bottleneckList = TAXONOMY.bottleneckClasses
      .map((b) => `${b.id}: ${b.signal}`)
      .join("\n");
    return jsonCall(
      {
        model: MODELS.deep,
        max_tokens: 4000,
        system:
          "You are the BECOMING onboarding synthesis. From the candidate assertions, produce:\n" +
          "1. futureSelf — per-domain narrative statements in second person, only for domains with signal. " +
          "Domains listed in uncoveredDomains are UNKNOWN: omit them entirely, never invent.\n" +
          "2. gaps — per-domain notes on missing capabilities, evidence, experiences. Never scores or percentages.\n" +
          "3. bottleneck — choose 1 class from this fixed list (never invent a class):\n" +
          bottleneckList +
          "\nCite evidenceQuotes verbatim from the candidates. This is a hypothesis from thin data — " +
          "the basis must say so.\n" +
          "4. campaign — a 90-day campaign aimed at the bottleneck, milestones at days 14/30/60/90, " +
          "day 14 is always 'Revise this diagnosis together'. Fit the user's availableMinutesDaily.\n" +
          "5. reveal — the message shown to the user: the person being built, the bottleneck (hedged, with its " +
          "evidence), and the campaign. Explicitly frame everything as a first draft to be revised at day 14. " +
          "Cinematic but plain; no hype.\n" +
          "Respond with JSON only matching the OnboardingSynthesis shape.",
        messages: [{ role: "user", content: JSON.stringify(input) }],
      },
      synthesisSchema,
    );
  },

  async deepReview(input) {
    return jsonCall(
      {
        model: MODELS.deep,
        max_tokens: 2500,
        system:
          "You are the BECOMING weekly deep review. Re-test the current bottleneck hypothesis " +
          "against the recent reflections — real behaviour outranks onboarding self-report. " +
          "Verdicts: confirmed (the window's evidence supports it), revised (a different constraint " +
          "fits the evidence better — provide revisedStatement and revisedClassId from the known " +
          "bottleneck classes), rejected (the evidence contradicts it), insufficient-data (fewer " +
          "than ~5 meaningful reflections — say so honestly rather than guessing). " +
          "notableChanges: up to 3 plain-language observations from the window worth surfacing. " +
          "Cite reflection content in `basis`. Respond with JSON only: " +
          '{"bottleneckVerdict","revisedStatement"?,"revisedClassId"?,"basis","notableChanges"}.',
        messages: [{ role: "user", content: JSON.stringify(input) }],
      },
      deepReviewSchema,
    );
  },
};
