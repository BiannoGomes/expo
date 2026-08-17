import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DECAY_AFTER_DAYS,
  decideConfidence,
  demoteOneLevel,
  hedgePrefix,
  isDecayable,
} from "../src/model/promotion.js";

describe("decideConfidence (spec 02 §2)", () => {
  it("single source stays hypothesis", () => {
    assert.equal(
      decideConfidence({ evidenceCount: 1, distinctDays: 1, spanDays: 0, userConfirmed: false }),
      "hypothesis",
    );
  });

  it("two records on the same day stay hypothesis (not independent)", () => {
    assert.equal(
      decideConfidence({ evidenceCount: 2, distinctDays: 1, spanDays: 0, userConfirmed: false }),
      "hypothesis",
    );
  });

  it("two independent sources reach probable", () => {
    assert.equal(
      decideConfidence({ evidenceCount: 2, distinctDays: 2, spanDays: 3, userConfirmed: false }),
      "probable",
    );
  });

  it("14-day span reaches established", () => {
    assert.equal(
      decideConfidence({ evidenceCount: 3, distinctDays: 3, spanDays: 14, userConfirmed: false }),
      "established",
    );
  });

  it("user confirmation is established regardless of records", () => {
    assert.equal(
      decideConfidence({ evidenceCount: 0, distinctDays: 0, spanDays: 0, userConfirmed: true }),
      "established",
    );
  });
});

describe("decay", () => {
  it("only pattern/bottleneck/capability_level decay", () => {
    assert.ok(isDecayable("pattern"));
    assert.ok(isDecayable("bottleneck"));
    assert.ok(isDecayable("capability_level"));
    assert.ok(!isDecayable("value"));
    assert.ok(!isDecayable("biographical_fact"));
  });

  it("demotes one level at a time", () => {
    assert.equal(demoteOneLevel("established"), "probable");
    assert.equal(demoteOneLevel("probable"), "hypothesis");
    assert.equal(demoteOneLevel("hypothesis"), "hypothesis");
  });

  it("decay window is 90 days per spec", () => {
    assert.equal(DECAY_AFTER_DAYS, 90);
  });
});

describe("hedging is mechanical (never present inference as fact)", () => {
  it("hypothesis and probable hedge; established does not", () => {
    assert.match(hedgePrefix("hypothesis"), /might be wrong/);
    assert.match(hedgePrefix("probable"), /looks like/i);
    assert.equal(hedgePrefix("established"), "");
  });
});
