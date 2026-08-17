/**
 * Personal Model types — the shared vocabulary of the system.
 * Mirrors docs/specs/02-personal-model.md; the SQL schema in
 * server/migrations is the storage of these shapes.
 */

// ---------- Records (immutable events) ----------

export type RecordKind =
  | "onboarding_response"
  | "reflection"
  | "action_event"
  | "campaign_event"
  | "evidence"
  | "user_edit";

export interface UserRecord {
  id: string;
  userId: string;
  kind: RecordKind;
  /** Verbatim captured content; shape varies by kind. Never rewritten. */
  payload: unknown;
  occurredAt: string; // ISO timestamp
  createdAt: string;
}

// ---------- Assertions (derived interpretation) ----------

export type AssertionKind =
  | "value"
  | "trait"
  | "pattern"
  | "belief"
  | "fear"
  | "preference"
  | "capability_level"
  | "relationship_fact"
  | "bottleneck"
  | "goal_intent"
  | "biographical_fact";

export type AssertionSource = "stated" | "observed" | "inferred" | "corrected";

/**
 * hypothesis: single source — internal only, or clearly framed as a guess.
 * probable:   ≥2 independent sources, no contradicting record — hedged framing.
 * established: repeatedly confirmed (≥14 days) or user-confirmed — plain statement.
 * Promotion/demotion is decided by application code, never by the model.
 */
export type AssertionConfidence = "hypothesis" | "probable" | "established";

export type AssertionStatus = "active" | "disputed" | "retracted" | "superseded";

export interface Assertion {
  id: string;
  userId: string;
  kind: AssertionKind;
  /** One sentence, plain language, user-visible. */
  statement: string;
  domainIds: string[];
  facetIds: string[];
  source: AssertionSource;
  /** For inferred: which pass produced it. */
  method: string | null;
  /** Record ids cited as evidence. ≥1 required for observed/inferred. */
  evidenceRefs: string[];
  confidence: AssertionConfidence;
  /** One sentence: why this confidence level. */
  confidenceBasis: string;
  status: AssertionStatus;
  supersededBy: string | null;
  taxonomyVersion: string;
  createdAt: string;
  lastConfirmedAt: string;
}

// ---------- Daily loop ----------

export type SlotName = "build" | "train" | "learn" | "confront" | "experience";

export interface PlanSlot {
  slot: SlotName;
  text: string;
  /** Why this item today — user-visible, one clause. */
  because: string;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  /** 1–5 slots. Empty slots are omitted, never padded. */
  slots: PlanSlot[];
  question: string;
  /** Rest-day mode replaces slots with a recovery instruction. */
  restDay: boolean;
}

export type SlotStatus = "done" | "partial" | "skipped" | "not_mentioned";

export interface DebriefExtraction {
  recordId: string;
  date: string;
  slotOutcomes: { slot: SlotName; status: SlotStatus; note?: string }[];
  achievements: string[];
  emotions: { label: string; context: string }[];
  decisions: { decision: string; status: "made" | "avoided" | "pending" }[];
  confrontations: { what: string; happened: "yes" | "no" | "partial" }[];
  relationships: { personRef: string; note: string }[];
  energy: "low" | "ok" | "high" | "unknown";
  facetTags: string[];
  candidateAssertions: {
    statement: string;
    kind: AssertionKind;
    /** Verbatim quote from the reflection supporting it. */
    evidence: string;
  }[];
  unresolved: string[];
}

// ---------- Safety ----------

export type SafetyLevel = "none" | "distress" | "crisis";

export interface SafetyTriage {
  level: SafetyLevel;
  /** Only for distress/crisis; category label, never quoted content. */
  category?: string;
}

// ---------- Campaigns ----------

export type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "abandoned"
  | "completed";

export interface Campaign {
  id: string;
  userId: string;
  title: string;
  mission: string;
  why: string;
  primaryDomain: string;
  secondaryDomains: string[];
  status: CampaignStatus;
  startsOn: string | null;
  pausedAt: string | null;
  /** Scheduled at generation time; onboarding data never fixes a diagnosis. */
  day14RevisionDone: boolean;
  createdAt: string;
}
