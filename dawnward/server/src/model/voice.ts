import type { } from "@dawnward/core";

/**
 * Turns internal bookkeeping bases into sentences a person would say.
 * The mechanical strings stay in the database for audit; only the words
 * shown to the user pass through here (the human law, design-direction).
 */
export function humanizeBasis(basis: string, evidenceCount?: number): string {
  const pattern = basis.match(/^(\d+) records across (\d+) days/);
  if (pattern) {
    const days = Number(pattern[2]);
    return days > 1
      ? `I have seen this in your days ${days} times now.`
      : "I noticed this in one of your days.";
  }
  if (basis.startsWith("single source")) {
    return "From one conversation so far.";
  }
  if (basis.startsWith("stated directly by the user")) {
    return "You told me this yourself.";
  }
  if (basis.startsWith("onboarding synthesis")) {
    return "From your first seven chapters. We check this together at day 14.";
  }
  if (basis.startsWith("revised at deep review")) {
    return "Rewritten after watching two real weeks.";
  }
  if (evidenceCount && evidenceCount > 0) {
    return `Built from ${evidenceCount} recorded ${evidenceCount === 1 ? "moment" : "moments"}.`;
  }
  return basis;
}
