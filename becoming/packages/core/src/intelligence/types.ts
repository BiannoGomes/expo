import type {
  Assertion,
  DailyPlan,
  DebriefExtraction,
  SafetyTriage,
} from "../model/types.js";

/**
 * The intelligence-layer interface (spec 02 §8, spec 05 §2).
 * The application depends on this interface only — the AI provider behind it
 * is swappable. Deterministic logic (persistence, promotion rules, dates,
 * permissions) lives OUTSIDE implementations of this interface.
 */

export interface ModelSummaryInput {
  /** The maintained ~1.5–3k token model summary artifact (spec 02 §5.1). */
  summary: string;
}

export interface GeneratePlanInput extends ModelSummaryInput {
  date: string;
  availableMinutes: number;
  activeCampaign: string | null;
  recentDebriefs: DebriefExtraction[];
  yesterdayOutcome: DebriefExtraction | null;
  /** Set by the load guard when yesterday flagged exhaustion/overload. */
  reducedLoad: boolean;
}

export interface ExtractDebriefInput {
  date: string;
  transcript: string;
  /** Today's plan for slot matching. Deliberately NOT the model summary —
   * extraction must not be biased into confirming existing beliefs. */
  planSlots: DailyPlan["slots"];
}

export interface IntegrateCandidatesInput {
  candidates: DebriefExtraction["candidateAssertions"];
  /** Existing assertions matched by facet, for confirm/contradict/create. */
  related: Assertion[];
}

export interface IntegrationProposal {
  action: "confirm" | "contradict" | "create";
  targetAssertionId?: string;
  statement?: string;
  kind?: Assertion["kind"];
  facetIds?: string[];
  basis: string;
}

export interface Intelligence {
  /** Haiku-tier. Runs on every free-text input BEFORE anything else (spec 04 §2). */
  triageSafety(text: string): Promise<SafetyTriage>;

  /** Sonnet-tier. Morning plan generation (spec 03 §1). */
  generatePlan(input: GeneratePlanInput): Promise<DailyPlan>;

  /** Sonnet-tier. Debrief extraction + user-facing reply (spec 03 §3). */
  extractDebrief(
    input: ExtractDebriefInput,
  ): Promise<{ extraction: Omit<DebriefExtraction, "recordId">; reply: string }>;

  /** Sonnet-tier, nightly batch. Proposes model changes; code persists them. */
  integrateCandidates(
    input: IntegrateCandidatesInput,
  ): Promise<IntegrationProposal[]>;
}
