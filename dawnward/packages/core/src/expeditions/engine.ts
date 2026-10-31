// The expedition engine: pure functions, no I/O. The server persists what it
// returns in one transaction; the web preview keeps it on the device. The
// same rules run in both, so progress can never depend on where it happened.
//
// Progress here means places discovered and things done, never a measure of
// the person (owner decision, 2026-10-31: discoveries only, no XP or levels).
import { MISSIONS, SYSTEMS, missionById, type Mission, type Step, type WorldId } from "./catalog.js";

export type AttemptStatus = "in_progress" | "paused" | "completed" | "abandoned";
export type Answer =
  | { ack: true }
  | { skip: true }
  | { choice: string }
  | { text: string }
  | { action: string; when: string }
  | { ratings: Record<string, number> };

export interface Attempt {
  id: string;
  missionId: string;
  version: number;
  status: AttemptStatus;
  /** Index of the furthest step reached. */
  step: number;
  answers: Record<string, Answer>;
}

export interface ProgressEvent {
  kind: "mission_completed" | "experiment_planned" | "experiment_reviewed" | "reflection_saved";
  ref: string;
  at?: string;
}

export interface Discovery {
  key: string;
  causeKind: ProgressEvent["kind"];
  causeRef: string;
}

/** Real actions that are never set as a challenge: harm, danger or retaliation. */
export const UNSAFE_ACTION = /\b(hurt|hit|punch|slap|kill|weapon|gun|knife|revenge|get back at|stalk|threaten|scare|humiliate|drunk|steal|break in|spy on)\b/i;

export const TEXT_MAX = 2000;

export function beginAttempt(mission: Mission, id: string): Attempt {
  return { id, missionId: mission.id, version: mission.version, status: "in_progress", step: 0, answers: {} };
}

/** A plain-language problem with an answer, or null when it's acceptable. */
export function validateAnswer(step: Step, answer: unknown): string | null {
  const a = answer as Record<string, unknown> | null;
  if (!a || typeof a !== "object") return "Nothing was given for this step.";
  if (a.skip === true) return step.required ? "This step needs an answer." : null;
  switch (step.type) {
    case "intro":
    case "close":
      return a.ack === true ? null : "Nothing to answer here.";
    case "choice":
      return typeof a.choice === "string" && (step.options ?? []).some((o) => o.id === a.choice) ? null : "Choose one of the options.";
    case "lens": {
      const r = a.ratings as Record<string, unknown> | undefined;
      if (!r || typeof r !== "object") return "Rate each reading first.";
      for (const l of step.lenses ?? []) if (![1, 2, 3].includes(r[l.id] as number)) return "Rate each reading first.";
      if (Object.keys(r).some((k) => !(step.lenses ?? []).some((l) => l.id === k))) return "Rate each reading first.";
      return null;
    }
    case "rehearse":
    case "reflect": {
      const t = typeof a.text === "string" ? a.text.trim() : "";
      if (!t) return "Write a few words first.";
      if (t.length > TEXT_MAX) return "That's longer than this step can keep. Try saying it more briefly.";
      return null;
    }
    case "plan": {
      const action = typeof a.action === "string" ? a.action.trim() : "";
      const when = typeof a.when === "string" ? a.when.trim() : "";
      if (!action || !when) return "Write the action and roughly when.";
      if (action.length > 200 || when.length > 60) return "Keep the action and the time short.";
      if (UNSAFE_ACTION.test(action)) return "Let's choose something smaller and safer, something you'd be glad to have done whatever happens.";
      return null;
    }
  }
}

/**
 * Records an answer. Answering the current step moves on; answering an
 * earlier step revises it. Skipping ahead is refused.
 */
export function answerStep(mission: Mission, attempt: Attempt, stepIndex: number, answer: Answer): { attempt: Attempt } | { error: string; status: number } {
  if (attempt.status === "completed" || attempt.status === "abandoned") return { error: "This mission is already finished.", status: 409 };
  const step = mission.steps[stepIndex];
  if (!step) return { error: "No such step.", status: 404 };
  if (stepIndex > attempt.step) return { error: "That step isn't open yet.", status: 409 };
  const problem = validateAnswer(step, answer);
  if (problem) return { error: problem, status: 422 };
  const clean = normalise(step, answer);
  const next: Attempt = {
    ...attempt,
    status: "in_progress",
    answers: { ...attempt.answers, [step.id]: clean },
    step: stepIndex === attempt.step ? Math.min(stepIndex + 1, mission.steps.length - 1) : attempt.step,
  };
  return { attempt: next };
}

function normalise(step: Step, answer: Answer): Answer {
  if ("skip" in answer) return { skip: true };
  if ("ratings" in answer) return { ratings: { ...answer.ratings } };
  if ("text" in answer) return { text: answer.text.trim() };
  if ("action" in answer) return { action: answer.action.trim(), when: answer.when.trim() };
  if ("choice" in answer) return { choice: answer.choice };
  return { ack: true };
}

export const missingSteps = (mission: Mission, attempt: Attempt): string[] =>
  mission.steps.filter((s) => s.required && !attempt.answers[s.id]).map((s) => s.id);

/** The plan answer, if the person chose a real action. */
export function plannedAction(mission: Mission, attempt: Attempt): { action: string; when: string } | null {
  for (const s of mission.steps) {
    const a = attempt.answers[s.id];
    if (s.type === "plan" && a && "action" in a) return a;
  }
  return null;
}

/** Completion is decided here, never by the client: every required step answered. */
export function completeAttempt(mission: Mission, attempt: Attempt): { attempt: Attempt; events: ProgressEvent[] } | { error: string; status: number } {
  if (attempt.status === "completed") return { attempt, events: [] };
  const missing = missingSteps(mission, attempt);
  if (missing.length) return { error: "Some steps still need an answer.", status: 409 };
  return {
    attempt: { ...attempt, status: "completed", step: mission.steps.length - 1 },
    events: [{ kind: "mission_completed", ref: `mission:${mission.id}:v${mission.version}` }],
  };
}

const LANDMARK: Record<WorldId, string> = { mind: "crystal", body: "trail marker", soul: "lantern", spirit: "standing stone", future: "spire" };

/**
 * Discoveries are a pure function of the event history: the same events
 * always give the same discoveries, and replaying an event changes nothing.
 * Experiment events carry their world in the ref: experiment:<world>:<id>:<state>.
 */
export function discoveriesFrom(events: ProgressEvent[]): Discovery[] {
  const out = new Map<string, Discovery>();
  const add = (d: Discovery) => { if (!out.has(d.key)) out.set(d.key, d); };
  const done = new Set<string>();
  const landmarks: Record<string, number> = {};
  let firstLight = false;
  for (const e of events) {
    if (e.kind === "reflection_saved" && !firstLight) { firstLight = true; add({ key: "first-light", causeKind: e.kind, causeRef: e.ref }); }
    if (e.kind === "mission_completed") {
      const id = e.ref.split(":")[1] ?? "";
      if (!missionById(id) || done.has(id)) continue;
      done.add(id);
      add({ key: `star:${id}`, causeKind: e.kind, causeRef: e.ref });
      for (const sys of SYSTEMS) if (sys.missionIds.includes(id) && sys.missionIds.every((m) => done.has(m))) add({ key: `moon:${sys.id}`, causeKind: e.kind, causeRef: e.ref });
    }
    if (e.kind === "experiment_reviewed") {
      const world = e.ref.split(":")[1] as WorldId;
      if (!(world in LANDMARK)) continue;
      landmarks[world] = (landmarks[world] ?? 0) + 1;
      add({ key: `landmark:${world}:${landmarks[world]}`, causeKind: e.kind, causeRef: e.ref });
    }
  }
  return [...out.values()];
}

/** Plain words for the journey log: what appeared, and why. */
export function describeDiscovery(d: Discovery): { title: string; why: string; world: WorldId | null } {
  if (d.key === "first-light") return { title: "First light", why: "Your first reflection.", world: null };
  const [kind, a, b] = d.key.split(":");
  if (kind === "star") { const m = missionById(a ?? ""); return { title: `A star: ${m?.title ?? "a mission"}, ${m?.part ?? ""}`.replace(/, $/, ""), why: `You finished ${m?.title ?? "a mission"} (${m?.part ?? ""}).`, world: m?.world ?? null }; }
  if (kind === "moon") { const s = SYSTEMS.find((x) => x.id === a); return { title: `A moon over ${s?.title ?? "a system"}`, why: `You finished every mission in ${s?.title ?? "it"}.`, world: s?.world ?? null }; }
  if (kind === "landmark") { const w = a as WorldId; return { title: `A ${LANDMARK[w]} in ${w[0]!.toUpperCase()}${w.slice(1)}`, why: `You came back and said how a real action went (number ${b}).`, world: w }; }
  return { title: d.key, why: "", world: null };
}

export { MISSIONS };
