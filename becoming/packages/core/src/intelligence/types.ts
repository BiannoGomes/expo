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

export interface CandidateAssertion {
  statement: string;
  kind: Assertion["kind"];
  facetIds: string[];
  /** Verbatim quote supporting it. */
  evidence: string;
}

export interface OnboardingTurnInput {
  chapterId: string;
  chapterTitle: string;
  aims: string[];
  /** Prior turns in this chapter: [role, text]. */
  history: { role: "user" | "assistant"; text: string }[];
  message: string;
  /** True when the debrief-style softening applies (spec 04 §2). */
  soften: boolean;
}

export interface ExtractChapterInput {
  chapterId: string;
  transcript: string;
}

export interface SynthesizeOnboardingInput {
  /** All candidate assertions accumulated across chapters. */
  candidates: CandidateAssertion[];
  /** Domains with no signal — must be treated as unknown, not weak (spec 01 §7). */
  uncoveredDomains: string[];
  horizonYear: number;
  availableMinutesDaily: number;
}

export interface OnboardingSynthesis {
  /** Per-domain narrative statements, keyed by domain id. */
  futureSelf: Record<string, string>;
  /** Per-domain gap notes: missing capabilities/evidence/experiences — never scores. */
  gaps: { domainId: string; note: string }[];
  bottleneck: {
    classId: string;
    statement: string;
    basis: string;
    evidenceQuotes: string[];
  };
  campaign: {
    title: string;
    mission: string;
    why: string;
    primaryDomain: string;
    secondaryDomains: string[];
    milestones: { day: number; title: string }[];
  };
  /** The reveal message shown to the user — hedged as a first draft with a day-14 revision. */
  reveal: string;
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

  /** Sonnet-tier. One conversational turn of an onboarding chapter. */
  onboardingTurn(
    input: OnboardingTurnInput,
  ): Promise<{ reply: string; chapterComplete: boolean }>;

  /** Sonnet-tier. Candidate assertions from a completed chapter transcript. */
  extractChapter(input: ExtractChapterInput): Promise<CandidateAssertion[]>;

  /** Opus-tier. The onboarding finale: Future Self, gaps, bottleneck, campaign. */
  synthesizeOnboarding(
    input: SynthesizeOnboardingInput,
  ): Promise<OnboardingSynthesis>;
}
