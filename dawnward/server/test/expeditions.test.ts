import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MISSIONS,
  SYSTEMS,
  answerStep,
  beginAttempt,
  checkCatalog,
  completeAttempt,
  discoveriesFrom,
  missionById,
  missingSteps,
  plannedAction,
  validateAnswer,
  type Attempt,
} from "@dawnward/core";

const bridge1 = missionById("bridge-1")!;
function play(mission = bridge1): Attempt {
  let a = beginAttempt(mission, "a1");
  for (const [i, s] of mission.steps.entries()) {
    const answer =
      s.type === "choice" ? { choice: s.options![0]!.id }
      : s.type === "plan" ? { action: "Ask Sam for ten minutes", when: "Thursday evening" }
      : s.type === "rehearse" || s.type === "reflect" ? { text: "My own words." }
      : { ack: true as const };
    const r = answerStep(mission, a, i, answer);
    assert.ok("attempt" in r, `step ${s.id}`);
    a = r.attempt;
  }
  return a;
}

describe("expedition catalog", () => {
  it("is sound: every mission has a completion state, valid options and a close step", () => {
    assert.deepEqual(checkCatalog(), []);
    assert.equal(MISSIONS.length, 3);
    assert.equal(SYSTEMS[0]!.missionIds.length, 3);
  });
  it("contains no scoring or forbidden words", () => {
    const text = JSON.stringify(MISSIONS).toLowerCase();
    for (const w of [/\bstreaks?\b/, /\bscores?\b/, /\bpoints\b/, /level up/, /\bxp\b/, /wrong answer/, /correct answer/, /\u2014/]) assert.ok(!w.test(text), String(w));
  });
});

describe("expedition engine", () => {
  it("moves forward one step at a time and refuses skipping ahead", () => {
    const a = beginAttempt(bridge1, "a1");
    const skip = answerStep(bridge1, a, 2, { text: "hi" });
    assert.ok("error" in skip && skip.status === 409);
    const ok = answerStep(bridge1, a, 0, { ack: true });
    assert.ok("attempt" in ok && ok.attempt.step === 1);
  });
  it("lets an earlier answer be revised without moving the pointer", () => {
    const a = play();
    const r = answerStep(bridge1, { ...a, status: "in_progress" }, 1, { choice: "invite" });
    assert.ok("attempt" in r);
    assert.equal(r.attempt.step, a.step);
    assert.deepEqual(r.attempt.answers.opening, { choice: "invite" });
  });
  it("validates every answer type", () => {
    const choice = bridge1.steps[1]!, plan = bridge1.steps[3]!, text = bridge1.steps[2]!;
    assert.match(validateAnswer(choice, { choice: "nope" })!, /Choose one/);
    assert.match(validateAnswer(text, { text: "   " })!, /few words/);
    assert.match(validateAnswer(text, { text: "x".repeat(2001) })!, /longer/);
    assert.match(validateAnswer(plan, { action: "", when: "today" })!, /action and roughly when/);
    assert.match(validateAnswer(plan, { action: "get back at him", when: "today" })!, /smaller and safer/);
    assert.equal(validateAnswer(plan, { action: "Ask for ten minutes", when: "Thursday" }), null);
  });
  it("completes only when every required step is answered", () => {
    const partial = answerStep(bridge1, beginAttempt(bridge1, "x"), 0, { ack: true });
    assert.ok("attempt" in partial);
    assert.ok(missingSteps(bridge1, partial.attempt).length > 0);
    const early = completeAttempt(bridge1, partial.attempt);
    assert.ok("error" in early && early.status === 409);
    const done = completeAttempt(bridge1, play());
    assert.ok("attempt" in done);
    assert.equal(done.attempt.status, "completed");
    assert.deepEqual(done.events, [{ kind: "mission_completed", ref: "mission:bridge-1:v1" }]);
    // completing again emits nothing
    const again = completeAttempt(bridge1, done.attempt);
    assert.ok("attempt" in again && again.events.length === 0);
  });
  it("finds the planned real action", () => {
    assert.deepEqual(plannedAction(bridge1, play()), { action: "Ask Sam for ten minutes", when: "Thursday evening" });
  });
  it("an optional plan can be left out (Bridge 3)", () => {
    const m = missionById("bridge-3")!;
    let a = beginAttempt(m, "b3");
    for (const [i, s] of m.steps.entries()) {
      if (s.type === "plan") { a = { ...a, step: i + 1 }; continue; }
      const ans = s.type === "choice" ? { choice: s.options![2]!.id } : s.type === "rehearse" || s.type === "reflect" ? { text: "Words." } : { ack: true as const };
      const r = answerStep(m, a, i, ans); assert.ok("attempt" in r); a = r.attempt;
    }
    assert.ok("attempt" in completeAttempt(m, a));
    assert.equal(plannedAction(m, a), null);
  });
});

describe("discoveries (deterministic, idempotent)", () => {
  it("one star per mission, however often it is completed", () => {
    const d = discoveriesFrom([
      { kind: "mission_completed", ref: "mission:bridge-1:v1" },
      { kind: "mission_completed", ref: "mission:bridge-1:v1" },
    ]);
    assert.deepEqual(d.map((x) => x.key), ["star:bridge-1"]);
  });
  it("a moon only when every mission in the system is done", () => {
    const two = discoveriesFrom([{ kind: "mission_completed", ref: "mission:bridge-1:v1" }, { kind: "mission_completed", ref: "mission:bridge-2:v1" }]);
    assert.ok(!two.some((x) => x.key.startsWith("moon")));
    const three = discoveriesFrom([{ kind: "mission_completed", ref: "mission:bridge-1:v1" }, { kind: "mission_completed", ref: "mission:bridge-2:v1" }, { kind: "mission_completed", ref: "mission:bridge-3:v1" }]);
    assert.ok(three.some((x) => x.key === "moon:soul-communication"));
  });
  it("a landmark per reviewed experiment, numbered in order; first light once", () => {
    const d = discoveriesFrom([
      { kind: "reflection_saved", ref: "record:1" },
      { kind: "reflection_saved", ref: "record:2" },
      { kind: "experiment_reviewed", ref: "experiment:soul:e1:reviewed" },
      { kind: "experiment_reviewed", ref: "experiment:soul:e2:reviewed" },
    ]);
    assert.deepEqual(d.map((x) => x.key), ["first-light", "landmark:soul:1", "landmark:soul:2"]);
  });
  it("ignores unknown missions and worlds", () => {
    assert.deepEqual(discoveriesFrom([{ kind: "mission_completed", ref: "mission:nope:v1" }, { kind: "experiment_reviewed", ref: "experiment:mars:x:reviewed" }]), []);
  });
});
