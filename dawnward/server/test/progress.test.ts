// The galaxy path's rules (experience/src/progress.js): what counts as a practice and a creation.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
// @ts-ignore: plain JS module shared with the web app
import { facts, standing, isPractice } from "../../experience/src/progress.js";
import { MISSIONS } from "../../packages/core/src/expeditions/index.ts";

const done = (...ids: string[]) => ids.map((missionId) => ({ missionId, status: "completed" }));
const open = (id: string, f: any) => standing(id, f, { unlocked: {} }).open;

describe("galaxy path", () => {
  it("a practice is a mission with a required step you do; every current mission is one", () => {
    for (const m of MISSIONS) assert.ok(isPractice(m), m.id);
    assert.equal(isPractice({ steps: [{ type: "intro", required: false }, { type: "lesson", required: true }, { type: "close", required: false }] }), false);
  });
  it("Knowledge opens with one finished practice; repeats and unfinished ones don't count twice", () => {
    assert.equal(open("knowledge", facts({ attempts: [] })), false);
    assert.equal(open("knowledge", facts({ attempts: done("vitality-1") })), true);
    assert.equal(facts({ attempts: [...done("vitality-1"), ...done("vitality-1"), { missionId: "bridge-1", status: "in_progress" }] }).done.length, 1);
  });
  it("Creative Worlds needs three practices in at least two worlds", () => {
    assert.equal(open("creative", facts({ attempts: done("overthinking-1", "overthinking-2", "labyrinth-1") })), false); // all Mind
    assert.equal(open("creative", facts({ attempts: done("overthinking-1", "labyrinth-1", "bridge-1") })), true);
  });
  it("AI Creation opens with a saved creation, not by lighting lanterns", () => {
    const lanterns = { lit: { kingdom: [0, 1, 2, 3, 4], forest: [0, 1, 2, 3, 4] }, places: [], moments: [] };
    assert.equal(open("ai", facts({ attempts: [], creative: lanterns })), false);
    assert.equal(open("ai", facts({ attempts: [], creative: { ...lanterns, places: [{ id: "p" }] } })), true);
    assert.equal(open("ai", facts({ attempts: [], creative: { moments: [{ id: "m" }] } })), true);
  });
  it("the Gateway needs a Future practice other than itself, and a direction", () => {
    assert.equal(open("gateway", facts({ attempts: done("gateway-1"), direction: { text: "x" } })), false);
    assert.equal(open("gateway", facts({ attempts: done("horizon-1") })), false);
    assert.equal(open("gateway", facts({ attempts: done("horizon-1"), direction: { text: "x" } })), true);
  });
  it("an opened galaxy stays open", () => {
    assert.equal(standing("ai", facts({ attempts: [] }), { unlocked: { ai: "2026-11-01" } }).open, true);
  });
});
