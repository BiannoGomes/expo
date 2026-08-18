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
 * deterministic mock intelligence, behind real device auth. Covers:
 * auth → consent → onboarding → synthesis → plan → debrief → nightly
 * integration → correction loop → re-entry → safety → weekly review →
 * export → deletion.
 */

const app = buildApp();

interface Session {
  token: string;
  userId: string;
}

async function createSession(consent = true): Promise<Session> {
  const res = await app.inject({
    method: "POST",
    url: "/auth/device",
    payload: { deviceName: "test-device" },
  });
  assert.equal(res.statusCode, 200);
  const session = res.json() as Session;
  if (consent) {
    const c = await app.inject({
      method: "POST",
      url: "/consent",
      headers: { authorization: `Bearer ${session.token}` },
      payload: { reflections: true, challengeOptIn: false },
    });
    assert.equal(c.statusCode, 200);
  }
  return session;
}

function inject(
  session: Session,
  opts: { method: "GET" | "POST" | "PATCH" | "DELETE"; url: string; payload?: unknown },
) {
  return app.inject({
    ...opts,
    headers: { authorization: `Bearer ${session.token}` },
  });
}

async function completeOnboarding(session: Session) {
  for (let i = 0; i < 7; i++) {
    const res = await inject(session, {
      method: "POST",
      url: "/onboarding/message",
      payload: { text: `[done] chapter ${i} answer` },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().chapterComplete, true);
    if (i === 6) return res.json();
  }
}

let s1: Session;

before(async () => {
  await query("drop schema public cascade");
  await query("create schema public");
  await runMigrations();
  s1 = await createSession();
});

after(async () => {
  await app.close();
  await pool.end();
});

describe("auth", () => {
  it("rejects missing and bogus tokens", async () => {
    const bare = await app.inject({ method: "GET", url: "/assertions" });
    assert.equal(bare.statusCode, 401);
    const bogus = await app.inject({
      method: "GET",
      url: "/assertions",
      headers: { authorization: "Bearer not-a-real-token" },
    });
    assert.equal(bogus.statusCode, 401);
  });

  it("tokens are stored hashed, never raw", async () => {
    const rows = await query<{ token_hash: string }>(
      "select token_hash from device_tokens",
    );
    assert.ok(rows.length >= 1);
    for (const row of rows) {
      assert.match(row.token_hash, /^[0-9a-f]{64}$/);
    }
  });

  it("scopes data to the token's user", async () => {
    const other = await createSession();
    const res = await inject(other, { method: "GET", url: "/assertions" });
    assert.deepEqual(res.json(), []); // sees nothing of s1's world
  });
});

describe("consent", () => {
  it("onboarding is gated until consent is on record", async () => {
    const unconsented = await createSession(false);
    const res = await inject(unconsented, {
      method: "POST",
      url: "/onboarding/message",
      payload: { text: "hello" },
    });
    assert.equal(res.statusCode, 403);
    assert.match(res.json().error, /consent/);
  });

  it("consent is recorded with time and policy version", async () => {
    const me = await inject(s1, { method: "GET", url: "/me" });
    const consent = me.json().consent.reflections;
    assert.equal(consent.granted, true);
    assert.ok(consent.at);
    assert.match(consent.policyVersion, /^\d{4}-\d{2}-\d{2}$/);
  });

  it("preferences update via PATCH /me", async () => {
    const res = await inject(s1, {
      method: "PATCH",
      url: "/me",
      payload: {
        touchpoints: { morning: "06:45", evening: "21:30", weeklyDigest: true },
      },
    });
    assert.equal(res.statusCode, 200);
    const me = await inject(s1, { method: "GET", url: "/me" });
    assert.equal(me.json().touchpoints.morning, "06:45");
  });
});

describe("onboarding", () => {
  it("holds conversation state until a chapter completes", async () => {
    const state = await inject(s1, { method: "GET", url: "/onboarding" });
    assert.equal(state.json().chapterIndex, 0);
    assert.ok(state.json().opening);

    const mid = await inject(s1, {
      method: "POST",
      url: "/onboarding/message",
      payload: { text: "just talking, not done yet" },
    });
    assert.equal(mid.json().chapterComplete, false);

    const again = await inject(s1, { method: "GET", url: "/onboarding" });
    assert.equal(again.json().messages.length, 2);
  });

  it("completes all chapters and synthesizes the finale", async () => {
    const finale = await completeOnboarding(s1);
    assert.equal(finale.onboardingComplete, true);
    assert.match(finale.reveal, /MOCK REVEAL/);

    const stated = await query<{ n: string }>(
      "select count(*) as n from assertions where user_id = $1 and source = 'stated'",
      [s1.userId],
    );
    assert.equal(Number(stated[0]?.n), 7);

    const [campaign] = await query<{ status: string; milestones: { day: number }[] }>(
      "select status, milestones from campaigns where user_id = $1",
      [s1.userId],
    );
    assert.equal(campaign?.status, "active");
    assert.equal(campaign?.milestones.length, 4);
  });

  it("crisis input stops the pipeline with the hand-written response", async () => {
    const s2 = await createSession();
    const res = await inject(s2, {
      method: "POST",
      url: "/onboarding/message",
      payload: { text: "[crisis] I can't do this anymore" },
    });
    assert.equal(res.json().crisis, true);
    assert.match(res.json().reply, /emergency services/i);
    const events = await query<{ level: string }>(
      "select level from safety_events where user_id = $1",
      [s2.userId],
    );
    assert.deepEqual(events.map((e) => e.level), ["crisis"]);
  });
});

describe("daily loop", () => {
  it("plan strips confront without opt-in and is stored idempotently", async () => {
    const res = await inject(s1, { method: "GET", url: "/plan/2026-08-18" });
    const plan = res.json();
    const slots = plan.slots.map((s: { slot: string }) => s.slot);
    assert.ok(slots.includes("build"));
    assert.ok(!slots.includes("confront"), "confront requires opt-in");

    const second = await inject(s1, { method: "GET", url: "/plan/2026-08-18" });
    assert.deepEqual(second.json(), plan);
  });

  it("debrief captures a record and an extraction", async () => {
    const res = await inject(s1, {
      method: "POST",
      url: "/debrief",
      payload: { date: "2026-08-18", transcript: "I finished the proposal and ran." },
    });
    assert.equal(res.json().crisis, false);
    const kinds = await query<{ kind: string; n: string }>(
      `select kind, count(*) as n from records where user_id = $1 group by kind`,
      [s1.userId],
    );
    const byKind = Object.fromEntries(kinds.map((k) => [k.kind, Number(k.n)]));
    assert.equal(byKind["reflection"], 1);
    assert.equal(byKind["action_event"], 1);
  });

  it("crisis debrief captures nothing", async () => {
    const beforeCount = await query<{ n: string }>(
      "select count(*) as n from records where user_id = $1",
      [s1.userId],
    );
    const res = await inject(s1, {
      method: "POST",
      url: "/debrief",
      payload: { date: "2026-08-18", transcript: "[crisis] it's all pointless" },
    });
    assert.equal(res.json().crisis, true);
    const afterCount = await query<{ n: string }>(
      "select count(*) as n from records where user_id = $1",
      [s1.userId],
    );
    assert.equal(beforeCount[0]?.n, afterCount[0]?.n);
  });

  it("records are immutable at the database level", async () => {
    await assert.rejects(
      query("update records set payload = '{}' where user_id = $1", [s1.userId]),
      /immutable/,
    );
  });
});

describe("nightly integration", () => {
  it("creates a hypothesis, promotes on two days, emits one promotion event", async () => {
    await runNightly();
    const [created] = await query<{ confidence: string }>(
      `select confidence from assertions
        where user_id = $1 and statement = 'You keep commitments you write down.'`,
      [s1.userId],
    );
    assert.equal(created?.confidence, "hypothesis");

    const [reflection] = await query<{ id: string }>(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'reflection', '{"transcript":"day two"}', now() - interval '1 day')
       returning id`,
      [s1.userId],
    );
    await query(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'action_event', $2, now() - interval '1 day')`,
      [
        s1.userId,
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
      [s1.userId],
    );
    assert.equal(after2?.confidence, "probable");

    const events = await inject(s1, { method: "GET", url: "/events" });
    const promotions = events
      .json()
      .filter((e: { kind: string }) => e.kind === "promotion");
    assert.equal(promotions.length, 1);

    const seen = await inject(s1, {
      method: "POST",
      url: `/events/${promotions[0].id}/seen`,
    });
    assert.equal(seen.statusCode, 200);
  });
});

describe("correction loop", () => {
  it("a correction supersedes and becomes established", async () => {
    const [target] = await query<{ id: string }>(
      `select id from assertions
        where user_id = $1 and statement = 'You keep commitments you write down.'
          and status = 'active'`,
      [s1.userId],
    );
    const res = await inject(s1, {
      method: "POST",
      url: `/assertions/${target?.id}/dispute`,
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
  });
});

describe("re-entry, campaigns, weekly review", () => {
  it("3+ silent days pauses campaigns and lightens the plan", async () => {
    const s3 = await createSession();
    await query(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'reflection', '{"transcript":"old"}', now() - interval '5 days')`,
      [s3.userId],
    );
    await query(
      `insert into campaigns (user_id, title, mission, why, primary_domain, status, starts_on)
       values ($1, 'Old Campaign', 'm', 'w', 'career', 'active', current_date - 5)`,
      [s3.userId],
    );
    const res = await inject(s3, { method: "GET", url: "/plan/2026-08-18" });
    assert.ok(res.json().reentryGapDays >= 4);
    assert.equal(res.json().slots.length, 2);
    const [campaign] = await query<{ status: string }>(
      "select status from campaigns where user_id = $1",
      [s3.userId],
    );
    assert.equal(campaign?.status, "paused");
  });

  it("campaign surface serves milestones; abandon is graceful and recorded", async () => {
    const res = await inject(s1, { method: "GET", url: "/campaign" });
    assert.equal(res.json().title, "Ship One Thing");
    assert.equal(res.json().milestones.length, 4);

    const sX = await createSession();
    const [c] = await query<{ id: string }>(
      `insert into campaigns (user_id, title, mission, why, primary_domain, status, starts_on)
       values ($1, 'Short-lived', 'm', 'w', 'career', 'active', current_date)
       returning id`,
      [sX.userId],
    );
    const abandon = await inject(sX, {
      method: "POST",
      url: `/campaign/${c?.id}/abandon`,
      payload: { reflection: "It stopped mattering once I started the new job." },
    });
    assert.equal(abandon.statusCode, 200);
    const [afterC] = await query<{ status: string }>(
      "select status from campaigns where id = $1",
      [c?.id],
    );
    assert.equal(afterC?.status, "abandoned");
  });

  it("day-14 revision confirms the bottleneck and emits the reveal", async () => {
    await query(
      "update campaigns set starts_on = current_date - 15 where user_id = $1",
      [s1.userId],
    );
    await runWeekly();
    const [campaign] = await query<{ day14_revision_done: boolean }>(
      "select day14_revision_done from campaigns where user_id = $1",
      [s1.userId],
    );
    assert.equal(campaign?.day14_revision_done, true);

    const events = await inject(s1, { method: "GET", url: "/events" });
    const reviews = events
      .json()
      .filter((e: { kind: string }) => e.kind === "weekly_review");
    assert.equal(reviews.length, 1);
    assert.equal(reviews[0].payload.verdict, "confirmed");
  });
});

describe("data rights", () => {
  it("export is complete and carries provenance", async () => {
    const res = await inject(s1, { method: "GET", url: "/export" });
    const dump = res.json();
    assert.equal(dump.format, "dawnward-export-v1");
    assert.ok(dump.records.length >= 9); // 7 chapters + reflections
    assert.ok(dump.assertions.length >= 8);
    assert.ok(dump.assertions.every((a: { source: string }) => a.source));
    assert.equal(dump.campaigns.length, 1);
    assert.equal(dump.futureSelves.length, 1);
  });

  it("account deletion erases everything and revokes the token", async () => {
    const doomed = await createSession();
    await inject(doomed, {
      method: "POST",
      url: "/onboarding/message",
      payload: { text: "[done] one chapter of a life" },
    });
    const del = await inject(doomed, { method: "DELETE", url: "/account" });
    assert.equal(del.statusCode, 200);

    for (const table of ["records", "assertions", "onboarding_state", "device_tokens"]) {
      const rows = await query(
        `select 1 from ${table} where user_id = $1`,
        [doomed.userId],
      );
      assert.equal(rows.length, 0, table);
    }
    const ghost = await inject(doomed, { method: "GET", url: "/me" });
    assert.equal(ghost.statusCode, 401);
  });
});
