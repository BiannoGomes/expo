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
    assert.equal(MISSIONS.length, 6);
    assert.deepEqual(SYSTEMS.map((x) => [x.id, x.missionIds.length]), [["mind-beyond-overthinking", 2], ["mind-thought-patterns", 1], ["soul-communication", 3]]);
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
  it("only optional steps can be skipped", () => {
    assert.match(validateAnswer(bridge1.steps[3]!, { skip: true })!, /needs an answer/);
    assert.equal(validateAnswer(missionById("bridge-3")!.steps[3]!, { skip: true }), null);
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
      if (s.type === "plan") { const sk = answerStep(m, a, i, { skip: true }); assert.ok("attempt" in sk); a = sk.attempt; continue; }
      const ans = s.type === "choice" ? { choice: s.options![2]!.id } : s.type === "rehearse" || s.type === "reflect" ? { text: "Words." } : { ack: true as const };
      const r = answerStep(m, a, i, ans); assert.ok("attempt" in r); a = r.attempt;
    }
    assert.ok("attempt" in completeAttempt(m, a));
    assert.equal(plannedAction(m, a), null);
  });
});

describe("the Mind lens step", () => {
  const lab = missionById("labyrinth-1")!;
  const lens = lab.steps.find((x) => x.type === "lens")!;
  it("needs every reading rated 1 to 3, and nothing else", () => {
    assert.match(validateAnswer(lens, { ratings: { annoyed: 3 } })!, /Rate each/);
    assert.match(validateAnswer(lens, { ratings: { annoyed: 3, busy: 2, forgot: 5 } })!, /Rate each/);
    assert.match(validateAnswer(lens, { ratings: { annoyed: 3, busy: 2, forgot: 1, extra: 2 } })!, /Rate each/);
    assert.equal(validateAnswer(lens, { ratings: { annoyed: 3, busy: 2, forgot: 1 } }), null);
  });
  it("a full Thought Labyrinth completes and finds its star and moon", () => {
    let a = beginAttempt(lab, "l1");
    for (const [i, s] of lab.steps.entries()) {
      const ans = s.type === "lens" ? { ratings: { annoyed: 3, busy: 2, forgot: 2 } } : s.type === "plan" ? { skip: true as const } : s.type === "rehearse" || s.type === "reflect" ? { text: "Words." } : { ack: true as const };
      const r = answerStep(lab, a, i, ans); assert.ok("attempt" in r, s.id); a = r.attempt;
    }
    const done = completeAttempt(lab, a);
    assert.ok("attempt" in done);
    assert.deepEqual(discoveriesFrom(done.events).map((d) => d.key), ["star:labyrinth-1", "moon:mind-thought-patterns"]);
  });
});

describe("Beyond Overthinking: lesson and sort steps (drafts)", () => {
  const c1 = missionById("overthinking-1")!, c2 = missionById("overthinking-2")!;
  const sort1 = c1.steps.find((x) => x.type === "sort")!;
  const all = (st: typeof sort1, bin?: string) => Object.fromEntries(st.items!.map((x) => [x.id, bin ?? x.bin]));
  it("both chapters are marked draft and carry a worksheet", () => {
    for (const m of [c1, c2]) { assert.equal(m.status, "draft"); assert.ok(m.worksheet && m.worksheet.sections.length >= 2); assert.ok(m.safetyNote); }
  });
  it("a sort needs every item in a known bin, and nothing extra", () => {
    assert.match(validateAnswer(sort1, { sorted: { deadline: "forward" } })!, /Sort each/);
    assert.match(validateAnswer(sort1, { sorted: { ...all(sort1), deadline: "sideways" } })!, /Sort each/);
    assert.match(validateAnswer(sort1, { sorted: { ...all(sort1), extra: "round" } })!, /Sort each/);
    assert.equal(validateAnswer(sort1, { sorted: all(sort1) }), null);
  });
  it("a sort that differs from the suggested reading is still accepted: nothing is scored", () => {
    assert.equal(validateAnswer(sort1, { sorted: all(sort1, "round") }), null);
  });
  it("a lesson is acknowledged like an intro", () => {
    const lesson = c1.steps.find((x) => x.type === "lesson")!;
    assert.equal(validateAnswer(lesson, { ack: true }), null);
    assert.match(validateAnswer(lesson, { text: "hi" })!, /Nothing to answer/);
  });
  it("finishing both written chapters gives two stars and no moon while chapters remain planned", () => {
    const events = [];
    for (const m of [c1, c2]) {
      let a = beginAttempt(m, `a-${m.id}`);
      for (const [i, s] of m.steps.entries()) {
        const ans = s.type === "sort" ? { sorted: all(s) } : s.type === "plan" ? { skip: true as const } : s.type === "rehearse" || s.type === "reflect" ? { text: "Words." } : { ack: true as const };
        const r = answerStep(m, a, i, ans); assert.ok("attempt" in r, s.id); a = r.attempt;
      }
      const done = completeAttempt(m, a); assert.ok("attempt" in done); events.push(...done.events);
    }
    assert.deepEqual(discoveriesFrom(events).map((d) => d.key), ["star:overthinking-1", "star:overthinking-2"]);
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
