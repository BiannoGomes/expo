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
      kind: z.enum([
        "value", "trait", "pattern", "belief", "fear", "preference",
        "capability_level", "relationship_fact", "bottleneck",
        "goal_intent", "biographical_fact",
      ]),
      evidence: z.string(),
    }),
  ),
  unresolved: z.array(z.string()),
  reply: z.string(),
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
          "candidateAssertions must each quote verbatim supporting text in `evidence`. " +
          "facetTags must come from this taxonomy:\n" +
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
};
