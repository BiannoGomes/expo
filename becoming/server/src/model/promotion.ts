import type { AssertionConfidence, AssertionKind } from "@becoming/core";

/**
 * Deterministic confidence rules (spec 02 §2). The model proposes; THIS code
 * decides. No LLM judgment is involved in promotion, demotion, or decay.
 */

export interface EvidenceStats {
  /** Distinct records citing the assertion. */
  evidenceCount: number;
  /** Distinct calendar days those records span. */
  distinctDays: number;
  /** Days between first and latest confirmation. */
  spanDays: number;
  /** User explicitly confirmed the statement. */
  userConfirmed: boolean;
}

export function decideConfidence(stats: EvidenceStats): AssertionConfidence {
  if (stats.userConfirmed) return "established";
  if (stats.evidenceCount >= 2 && stats.distinctDays >= 2) {
    return stats.spanDays >= 14 ? "established" : "probable";
  }
  return "hypothesis";
}

/** Kinds whose assertions decay without reconfirmation (spec 02 §2). */
const DECAYING_KINDS: AssertionKind[] = [
  "pattern",
  "bottleneck",
  "capability_level",
];

export const DECAY_AFTER_DAYS = 90;

export function isDecayable(kind: AssertionKind): boolean {
  return DECAYING_KINDS.includes(kind);
}

export function demoteOneLevel(
  confidence: AssertionConfidence,
): AssertionConfidence {
  if (confidence === "established") return "probable";
  return "hypothesis";
}

/**
 * Presentation hedging is driven mechanically by confidence (spec 02 §2):
 * this is the single place that decides how sure the system may sound.
 */
export function hedgePrefix(confidence: AssertionConfidence): string {
  switch (confidence) {
    case "hypothesis":
      return "I might be wrong about this, but ";
    case "probable":
      return "It looks like ";
    case "established":
      return "";
  }
}
