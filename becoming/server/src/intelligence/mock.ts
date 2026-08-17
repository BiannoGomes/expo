import type { Intelligence } from "@becoming/core";

/**
 * Deterministic Intelligence implementation. Behavior is driven by markers
 * in the input text so integration tests can steer every branch:
 *   "[crisis]" / "[distress]"  → safety triage levels
 *   "[tired]"                  → energy: low in the debrief extraction
 *   "[done]"                   → completes the current onboarding chapter
 * No network, no key, fully reproducible.
 */
export const mockIntelligence: Intelligence = {
  async triageSafety(text) {
    if (text.includes("[crisis]")) return { level: "crisis", category: "test" };
    if (text.includes("[distress]")) return { level: "distress", category: "test" };
    return { level: "none" };
  },

  async generatePlan(input) {
    const slots = [
      { slot: "build" as const, text: "Mock build task", because: "campaign" },
      { slot: "train" as const, text: "Mock training", because: "baseline" },
      // Always offered so tests can verify the deterministic confront gate
      // strips it when opt-in or safety rules say no.
      { slot: "confront" as const, text: "Mock confrontation", because: "fear" },
      { slot: "experience" as const, text: "Mock novelty", because: "novelty" },
    ];
    return {
      date: input.date,
      slots: input.reducedLoad ? slots.slice(0, 2) : slots,
      question: "What would make tonight feel like you actually lived today?",
      restDay: false,
    };
  },

  async extractDebrief(input) {
    return {
      extraction: {
        date: input.date,
        slotOutcomes: input.planSlots.map((s) => ({
          slot: s.slot,
          status: "done" as const,
        })),
        achievements: ["mock achievement"],
        emotions: [{ label: "steady", context: "mock" }],
        decisions: [],
        confrontations: [],
        relationships: [],
        energy: input.transcript.includes("[tired]") ? ("low" as const) : ("ok" as const),
        facetTags: ["character/discipline"],
        candidateAssertions: [
          {
            statement: "You keep commitments you write down.",
            kind: "pattern" as const,
            facetIds: ["character/discipline"],
            evidence: input.transcript.slice(0, 80),
          },
        ],
        unresolved: [],
      },
      reply: "Mock reflection reply. Tomorrow: one thing.",
    };
  },

  async integrateCandidates(input) {
    return input.candidates.map((candidate) => {
      const match = input.related.find((r) => r.statement === candidate.statement);
      if (match) {
        return {
          action: "confirm" as const,
          targetAssertionId: match.id,
          basis: "same statement observed again",
        };
      }
      return {
        action: "create" as const,
        statement: candidate.statement,
        kind: candidate.kind,
        facetIds: ["character/discipline"],
        basis: "new candidate",
      };
    });
  },

  async onboardingTurn(input) {
    return {
      reply: `Mock reply in ${input.chapterId}.`,
      chapterComplete: input.message.includes("[done]"),
    };
  },

  async extractChapter(input) {
    return [
      {
        statement: `Stated in ${input.chapterId}: values growth.`,
        kind: "value" as const,
        facetIds: ["meaning/purpose"],
        evidence: input.transcript.slice(0, 60),
      },
    ];
  },

  async synthesizeOnboarding(input) {
    return {
      futureSelf: { career: "You have built something of your own." },
      gaps: [{ domainId: "career", note: "evidence of shipped work" }],
      bottleneck: {
        classId: "focus-dilution",
        statement: "You start more than you finish.",
        basis: `thin data from ${input.candidates.length} candidates`,
        evidenceQuotes: ["mock quote"],
      },
      campaign: {
        title: "Ship One Thing",
        mission: "Finish and publish one project in 90 days.",
        why: "Concentrated force beats scattered ambition.",
        primaryDomain: "career",
        secondaryDomains: ["character"],
        milestones: [
          { day: 14, title: "Revise this diagnosis together" },
          { day: 30, title: "First working version" },
          { day: 60, title: "Feedback from three people" },
          { day: 90, title: "Shipped" },
        ],
      },
      reveal: "MOCK REVEAL: this is the person we are building.",
    };
  },

  async deepReview(input) {
    const all = input.extractions.flatMap((e) => e.achievements).join(" ");
    if (all.includes("[reject-bottleneck]")) {
      return {
        bottleneckVerdict: "rejected" as const,
        basis: "mock: evidence contradicts",
        notableChanges: ["mock rejection"],
      };
    }
    if (all.includes("[revise-bottleneck]")) {
      return {
        bottleneckVerdict: "revised" as const,
        revisedStatement: "Your energy, not your focus, is the constraint.",
        revisedClassId: "energy-deficit",
        basis: "mock: better fit",
        notableChanges: ["mock revision"],
      };
    }
    if (input.extractions.length === 0) {
      return {
        bottleneckVerdict: "insufficient-data" as const,
        basis: "mock: no reflections in window",
        notableChanges: [],
      };
    }
    return {
      bottleneckVerdict: "confirmed" as const,
      basis: "mock: window supports it",
      notableChanges: ["mock confirmation"],
    };
  },
};
