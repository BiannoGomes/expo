process.env.DATABASE_URL ??= "postgres://becoming@127.0.0.1:5433/becoming";
process.env.MOCK_INTELLIGENCE = "1";
process.env.NODE_ENV = "test";

const { pool, query } = await import("../../src/db.js");
const { runMigrations } = await import("../../src/migrate.js");
const { buildApp } = await import("../../src/index.js");
const { runNightly } = await import("../../src/jobs/nightly.js");
const { runWeekly } = await import("../../src/jobs/weekly.js");

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * End-to-end integration of the MVP loop against a real Postgres, with the
 * deterministic mock intelligence. Covers: onboarding → synthesis → plan →
 * debrief → nightly integration → correction loop → re-entry → safety →
 * weekly deep review.
 */

const app = buildApp();

async function createUser(email: string): Promise<string> {
  const res = await app.inject({ method: "POST", url: "/users", payload: { email } });
  assert.equal(res.statusCode, 200);
  return res.json().id;
}

async function completeOnboarding(userId: string) {
  for (let i = 0; i < 7; i++) {
    const res = await app.inject({
      method: "POST",
      url: `/onboarding/${userId}/message`,
      payload: { text: `[done] chapter ${i} answer` },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().chapterComplete, true);
    if (i === 6) return res.json();
  }
}

let user1: string;

before(async () => {
  await query("drop schema public cascade");
  await query("create schema public");
  await runMigrations();
  user1 = await createUser("one@test.dev");
});

after(async () => {
  await app.close();
  await pool.end();
});

describe("onboarding", () => {
  it("holds conversation state until a chapter completes", async () => {
    const state = await app.inject({ method: "GET", url: `/onboarding/${user1}` });
    assert.equal(state.json().chapterIndex, 0);
    assert.ok(state.json().opening);

    const mid = await app.inject({
      method: "POST",
      url: `/onboarding/${user1}/message`,
      payload: { text: "just talking, not done yet" },
    });
    assert.equal(mid.json().chapterComplete, false);

    const again = await app.inject({ method: "GET", url: `/onboarding/${user1}` });
    assert.equal(again.json().messages.length, 2);
    assert.equal(again.json().chapterIndex, 0);
  });

  it("completes all chapters and synthesizes the finale", async () => {
    const finale = await completeOnboarding(user1);
    assert.equal(finale.onboardingComplete, true);
    assert.match(finale.reveal, /MOCK REVEAL/);

    const records = await query<{ n: string }>(
      "select count(*) as n from records where user_id = $1 and kind = 'onboarding_response'",
      [user1],
    );
    assert.equal(Number(records[0]?.n), 7);

    const stated = await query<{ n: string }>(
      "select count(*) as n from assertions where user_id = $1 and source = 'stated'",
      [user1],
    );
    assert.equal(Number(stated[0]?.n), 7);

    const [bottleneck] = await query<{ confidence: string; statement: string }>(
      "select confidence, statement from assertions where user_id = $1 and kind = 'bottleneck'",
      [user1],
    );
    assert.equal(bottleneck?.confidence, "hypothesis");

    const [campaign] = await query<{ status: string; title: string }>(
      "select status, title from campaigns where user_id = $1",
      [user1],
    );
    assert.equal(campaign?.status, "active");
    assert.equal(campaign?.title, "Ship One Thing");

    const [summary] = await query<{ content: string }>(
      "select content from model_summaries where user_id = $1",
      [user1],
    );
    // All assertions are hypotheses → excluded; unknown domains named.
    assert.ok(summary?.content.includes("unknown domains"));
    assert.ok(summary?.content.includes("Ship One Thing"));
  });

  it("crisis input stops the pipeline with the hand-written response", async () => {
    const user2 = await createUser("two@test.dev");
    const res = await app.inject({
      method: "POST",
      url: `/onboarding/${user2}/message`,
      payload: { text: "[crisis] I can't do this anymore" },
    });
    assert.equal(res.json().crisis, true);
    assert.match(res.json().reply, /emergency services/i);

    const events = await query<{ level: string }>(
      "select level from safety_events where user_id = $1",
      [user2],
    );
    assert.deepEqual(events.map((e) => e.level), ["crisis"]);

    // The message never entered conversation state.
    const state = await app.inject({ method: "GET", url: `/onboarding/${user2}` });
    assert.equal(state.json().messages.length, 0);
  });
});

describe("daily loop", () => {
  it("plan strips confront without opt-in and is stored idempotently", async () => {
    const res = await app.inject({ method: "GET", url: `/plan/${user1}/2026-08-17` });
    const plan = res.json();
    const slots = plan.slots.map((s: { slot: string }) => s.slot);
    assert.ok(slots.includes("build"));
    assert.ok(!slots.includes("confront"), "confront requires opt-in");
    assert.equal(plan.reentryGapDays, undefined);

    const second = await app.inject({ method: "GET", url: `/plan/${user1}/2026-08-17` });
    assert.deepEqual(second.json(), plan);
  });

  it("debrief captures a record and an extraction", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/debrief/${user1}`,
      payload: { date: "2026-08-17", transcript: "I finished the proposal and ran." },
    });
    assert.equal(res.json().crisis, false);
    assert.match(res.json().reply, /Mock reflection/);

    const kinds = await query<{ kind: string; n: string }>(
      `select kind, count(*) as n from records where user_id = $1 group by kind`,
      [user1],
    );
    const byKind = Object.fromEntries(kinds.map((k) => [k.kind, Number(k.n)]));
    assert.equal(byKind["reflection"], 1);
    assert.equal(byKind["action_event"], 1);
  });

  it("crisis debrief captures nothing", async () => {
    const beforeCount = await query<{ n: string }>(
      "select count(*) as n from records where user_id = $1",
      [user1],
    );
    const res = await app.inject({
      method: "POST",
      url: `/debrief/${user1}`,
      payload: { date: "2026-08-17", transcript: "[crisis] it's all pointless" },
    });
    assert.equal(res.json().crisis, true);
    const afterCount = await query<{ n: string }>(
      "select count(*) as n from records where user_id = $1",
      [user1],
    );
    assert.equal(beforeCount[0]?.n, afterCount[0]?.n);
  });

  it("records are immutable at the database level", async () => {
    await assert.rejects(
      query("update records set payload = '{}' where user_id = $1", [user1]),
      /immutable/,
    );
  });
});

describe("nightly integration", () => {
  it("creates a hypothesis from one source, promotes to probable on two days", async () => {
    await runNightly();
    const [created] = await query<{ id: string; confidence: string }>(
      `select id, confidence from assertions
        where user_id = $1 and statement = 'You keep commitments you write down.'`,
      [user1],
    );
    assert.equal(created?.confidence, "hypothesis");

    // A second reflection on a different day → mock confirms the same
    // statement → deterministic promotion to probable.
    const [reflection] = await query<{ id: string }>(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'reflection', '{"transcript":"day two"}', now() - interval '1 day')
       returning id`,
      [user1],
    );
    await query(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'action_event', $2, now() - interval '1 day')`,
      [
        user1,
        JSON.stringify({
          extractionOf: reflection?.id,
          achievements: [],
          energy: "ok",
          facetTags: ["character/discipline"],
          candidateAssertions: [
            {
              statement: "You keep commitments you write down.",
              kind: "pattern",
              facetIds: ["character/discipline"],
              evidence: "day two",
            },
          ],
        }),
      ],
    );
    await runNightly();

    const [after2] = await query<{ confidence: string }>(
      `select confidence from assertions
        where user_id = $1 and statement = 'You keep commitments you write down.'
          and status = 'active'`,
      [user1],
    );
    assert.equal(after2?.confidence, "probable");

    const [summary] = await query<{ content: string }>(
      "select content from model_summaries where user_id = $1",
      [user1],
    );
    assert.match(summary?.content ?? "", /It looks like you keep commitments/);
  });
});

describe("correction loop", () => {
  it("a correction supersedes and becomes established", async () => {
    const [target] = await query<{ id: string }>(
      `select id from assertions
        where user_id = $1 and statement = 'You keep commitments you write down.'
          and status = 'active'`,
      [user1],
    );
    const res = await app.inject({
      method: "POST",
      url: `/assertions/${user1}/${target?.id}/dispute`,
      payload: { correction: "I keep commitments I say out loud, not written ones." },
    });
    assert.equal(res.statusCode, 200);

    const [old] = await query<{ status: string; superseded_by: string }>(
      "select status, superseded_by from assertions where id = $1",
      [target?.id],
    );
    assert.equal(old?.status, "superseded");

    const [corrected] = await query<{ source: string; confidence: string }>(
      "select source, confidence from assertions where id = $1",
      [old?.superseded_by],
    );
    assert.equal(corrected?.source, "corrected");
    assert.equal(corrected?.confidence, "established");

    // The corrected statement now appears unhedged in the summary.
    const [summary] = await query<{ content: string }>(
      "select content from model_summaries where user_id = $1",
      [user1],
    );
    assert.match(summary?.content ?? "", /I keep commitments I say out loud/);
  });
});

describe("re-entry and load guard", () => {
  it("3+ silent days pauses campaigns and lightens the plan", async () => {
    const user3 = await createUser("three@test.dev");
    await query(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'reflection', '{"transcript":"old"}', now() - interval '5 days')`,
      [user3],
    );
    await query(
      `insert into campaigns (user_id, title, mission, why, primary_domain, status, starts_on)
       values ($1, 'Old Campaign', 'm', 'w', 'career', 'active', current_date - 5)`,
      [user3],
    );

    const res = await app.inject({ method: "GET", url: `/plan/${user3}/2026-08-17` });
    const plan = res.json();
    assert.ok(plan.reentryGapDays >= 4, String(plan.reentryGapDays));
    assert.equal(plan.slots.length, 2, "reduced load");

    const [campaign] = await query<{ status: string }>(
      "select status from campaigns where user_id = $1",
      [user3],
    );
    assert.equal(campaign?.status, "paused");
  });

  it("recent distress strips confront even with opt-in", async () => {
    await query("update users set challenge_opt_in = true where id = $1", [user1]);
    await app.inject({
      method: "POST",
      url: `/debrief/${user1}`,
      payload: { date: "2026-08-18", transcript: "[distress] [tired] rough day" },
    });
    const res = await app.inject({ method: "GET", url: `/plan/${user1}/2026-08-19` });
    const slots = res.json().slots.map((s: { slot: string }) => s.slot);
    assert.ok(!slots.includes("confront"));
    assert.equal(res.json().slots.length, 2, "distress reduces load");
  });
});

describe("weekly deep review", () => {
  it("day-14 revision confirms the bottleneck and records the event", async () => {
    await query(
      "update campaigns set starts_on = current_date - 15 where user_id = $1",
      [user1],
    );
    await runWeekly();

    const [campaign] = await query<{ day14_revision_done: boolean }>(
      "select day14_revision_done from campaigns where user_id = $1",
      [user1],
    );
    assert.equal(campaign?.day14_revision_done, true);

    const events = await query<{ payload: { event: string; verdict: string } }>(
      "select payload from records where user_id = $1 and kind = 'campaign_event'",
      [user1],
    );
    assert.equal(events[0]?.payload.event, "day14-revision");
    assert.equal(events[0]?.payload.verdict, "confirmed");

    const [bottleneck] = await query<{ confidence_basis: string }>(
      "select confidence_basis from assertions where user_id = $1 and kind = 'bottleneck' and status = 'active'",
      [user1],
    );
    assert.match(bottleneck?.confidence_basis ?? "", /records across/);
  });

  it("a revised verdict supersedes the bottleneck, never overwrites", async () => {
    const user4 = await createUser("four@test.dev");
    const [old] = await query<{ id: string }>(
      `insert into assertions
         (user_id, kind, statement, domain_ids, facet_ids, source, method,
          confidence, confidence_basis, taxonomy_version)
       values ($1, 'bottleneck', 'Old bottleneck.', '{career}', '{}', 'inferred',
               'onboarding-synthesis', 'hypothesis', 'test', '1.0.0')
       returning id`,
      [user4],
    );
    for (let day = 1; day <= 3; day++) {
      const [reflection] = await query<{ id: string }>(
        `insert into records (user_id, kind, payload, occurred_at)
         values ($1, 'reflection', '{"transcript":"t"}', now() - ($2 || ' days')::interval)
         returning id`,
        [user4, String(day)],
      );
      await query(
        `insert into records (user_id, kind, payload, occurred_at)
         values ($1, 'action_event', $2, now() - ($3 || ' days')::interval)`,
        [
          user4,
          JSON.stringify({
            extractionOf: reflection?.id,
            achievements: ["[revise-bottleneck]"],
            energy: "ok",
            facetTags: [],
            candidateAssertions: [],
          }),
          String(day),
        ],
      );
    }
    await runWeekly();

    const [oldRow] = await query<{ status: string }>(
      "select status from assertions where id = $1",
      [old?.id],
    );
    assert.equal(oldRow?.status, "superseded");

    const [revised] = await query<{ statement: string; confidence: string }>(
      `select statement, confidence from assertions
        where user_id = $1 and kind = 'bottleneck' and status = 'active'`,
      [user4],
    );
    assert.match(revised?.statement ?? "", /energy/i);
    assert.equal(revised?.confidence, "hypothesis");
  });
});

describe("deletion propagation", () => {
  it("deleting the only evidence record removes the derived assertion", async () => {
    const user5 = await createUser("five@test.dev");
    const [reflection] = await query<{ id: string }>(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'reflection', '{"transcript":"only source"}', now())
       returning id`,
      [user5],
    );
    const [assertion] = await query<{ id: string }>(
      `insert into assertions
         (user_id, kind, statement, domain_ids, facet_ids, source, method,
          confidence, confidence_basis, taxonomy_version)
       values ($1, 'trait', 'Derived only from one record.', '{mental}', '{}',
               'inferred', 'test', 'hypothesis', 'test', '1.0.0')
       returning id`,
      [user5],
    );
    await query(
      "insert into assertion_evidence (assertion_id, record_id) values ($1, $2)",
      [assertion?.id, reflection?.id],
    );

    await query("delete from records where id = $1", [reflection?.id]);
    await query("select prune_orphan_assertions($1)", [user5]);

    const remaining = await query(
      "select 1 from assertions where id = $1",
      [assertion?.id],
    );
    assert.equal(remaining.length, 0);
  });
});
