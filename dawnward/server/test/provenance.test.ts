import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { attachSources, verifySource, type RecentWords } from "../src/model/provenance.js";

const words: RecentWords[] = [
  {
    recordId: "r1",
    date: "2026-10-29",
    transcript:
      "Work was loud again. I didn’t finish the  chapter, and honestly\nI keep avoiding the call with my sister.",
  },
  { recordId: "r2", date: "2026-10-30", transcript: "Slept badly. Walked at lunch and felt clearer." },
];

describe("verifySource: a quote is shown only if it is really the person's", () => {
  it("accepts an exact span and returns it as the person said it", () => {
    const s = verifySource({ sourceRecordId: "r2", quote: "Walked at lunch and felt clearer" }, words);
    assert.deepEqual(s, { recordId: "r2", date: "2026-10-30", quote: "Walked at lunch and felt clearer" });
  });

  it("tolerates whitespace, case and curly quotes, but keeps the original text", () => {
    const s = verifySource(
      { sourceRecordId: "r1", quote: "i didn't finish the chapter, and honestly i keep avoiding" },
      words,
    );
    assert.ok(s);
    assert.equal(s.quote, "I didn’t finish the  chapter, and honestly\nI keep avoiding");
  });

  it("drops paraphrase", () => {
    assert.equal(
      verifySource({ sourceRecordId: "r1", quote: "I have been avoiding calling my sister" }, words),
      undefined,
    );
  });

  it("drops words cited to the wrong evening", () => {
    assert.equal(
      verifySource({ sourceRecordId: "r2", quote: "keep avoiding the call with my sister" }, words),
      undefined,
    );
  });

  it("drops evenings that are not in the person's recent words (left out, or someone else's)", () => {
    assert.equal(verifySource({ sourceRecordId: "r9", quote: "Work was loud again" }, words), undefined);
  });

  it("drops quotes that start or stop inside a word", () => {
    assert.equal(verifySource({ sourceRecordId: "r2", quote: "Walked at lunch and felt clea" }, words), undefined);
    assert.equal(verifySource({ sourceRecordId: "r2", quote: "alked at lunch and felt clearer" }, words), undefined);
  });

  it("drops quotes too short to mean anything, and missing claims", () => {
    assert.equal(verifySource({ sourceRecordId: "r2", quote: "Slept" }, words), undefined);
    assert.equal(verifySource({ sourceRecordId: "r2" }, words), undefined);
    assert.equal(verifySource({ quote: "Walked at lunch" }, words), undefined);
  });
});

describe("attachSources", () => {
  it("keeps every step, attaches only verified sources, strips raw claims", () => {
    const plan = attachSources(
      {
        date: "2026-10-31",
        restDay: false,
        question: "What would you say to her first?",
        questionSourceRecordId: "r1",
        questionQuote: "keep avoiding the call with my sister",
        slots: [
          { slot: "build", text: "Finish the chapter", because: "you named it", sourceRecordId: "r1", quote: "I didn't finish the chapter" },
          { slot: "train", text: "Walk at lunch", because: "it helped", sourceRecordId: "r2", quote: "made up words entirely" },
          { slot: "learn", text: "Read ten pages", because: "baseline" },
        ],
      },
      words,
    );
    assert.equal(plan.slots.length, 3);
    assert.equal(plan.slots[0]!.source?.quote, "I didn’t finish the  chapter");
    assert.equal(plan.slots[1]!.source, undefined);
    assert.equal(plan.slots[2]!.source, undefined);
    assert.equal(plan.questionSource?.recordId, "r1");
    for (const slot of plan.slots) {
      assert.ok(!("quote" in slot) && !("sourceRecordId" in slot));
    }
    assert.ok(!("questionQuote" in plan));
  });
});

import { excerpt, seenIn } from "../src/routes/galaxy.js";

describe("galaxy excerpt", () => {
  it("keeps short evenings whole and cuts long ones on a word", () => {
    assert.equal(excerpt("  Short   and sweet. "), "Short and sweet.");
    const long = "word ".repeat(60).trim();
    const e = excerpt(long);
    assert.ok(e.endsWith("…"));
    assert.ok(e.length <= 161);
    assert.ok(!/wor…$/.test(e) && /word…$/.test(e));
  });
});

describe("galaxy why", () => {
  it("counts what is shown", () => {
    assert.equal(seenIn(1, 1), "Seen in one of your evenings so far.");
    assert.equal(seenIn(3, 1), "Seen in 3 of your evenings, across 1 day.");
    assert.equal(seenIn(7, 4), "Seen in 7 of your evenings, across 4 days.");
  });
});
