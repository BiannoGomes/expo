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

  it("marking a slot done survives across fetches", async () => {
    const res = await inject(s1, {
      method: "PATCH",
      url: "/plan/2026-08-18/slot",
      payload: { slot: "train", done: true },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().done.train, true);
    const again = await inject(s1, { method: "GET", url: "/plan/2026-08-18" });
    assert.equal(again.json().done.train, true);
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

describe("voice", () => {
  it("turns audio into words and stores nothing of the sound", async () => {
    const res = await inject(s1, {
      method: "POST",
      url: "/transcribe",
      payload: { audio: Buffer.from("fake-audio").toString("base64") },
    });
    assert.equal(res.statusCode, 200);
    assert.match(res.json().text, /kept the promise/);
  });
});

describe("the person", () => {
  it("keeps a chosen name, and lets it be cleared", async () => {
    const set = await inject(s1, {
      method: "PATCH",
      url: "/me",
      payload: { preferredName: "Bianno" },
    });
    assert.equal(set.statusCode, 200);
    let me = await inject(s1, { method: "GET", url: "/me" });
    assert.equal(me.json().preferredName, "Bianno");

    const clear = await inject(s1, {
      method: "PATCH",
      url: "/me",
      payload: { preferredName: null },
    });
    assert.equal(clear.statusCode, 200);
    me = await inject(s1, { method: "GET", url: "/me" });
    assert.equal(me.json().preferredName, null);
  });

  it("the future self stays re-readable after the reveal", async () => {
    const res = await inject(s1, { method: "GET", url: "/future-self" });
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().horizonYear >= new Date().getFullYear());
    assert.ok(Object.keys(res.json().domains).length > 0);

    const fresh = await createSession();
    const none = await inject(fresh, { method: "GET", url: "/future-self" });
    assert.equal(none.statusCode, 404);
  });
});

describe("constellation", () => {
  it("stars are real records, weighted by what they came to mean", async () => {
    const res = await inject(s1, { method: "GET", url: "/constellation" });
    const stars = res.json();
    assert.ok(stars.length >= 9, String(stars.length));
    for (const star of stars) {
      assert.ok(star.id && star.occurredAt);
      assert.ok(star.weight > 0 && star.weight <= 1);
    }
    // A record cited by an active probable belief burns brighter.
    const [bright] = await query<{ id: string }>(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'evidence', '{"description":"finished the talk"}', now())
       returning id`,
      [s1.userId],
    );
    const [belief] = await query<{ id: string }>(
      `insert into assertions
         (user_id, kind, statement, domain_ids, facet_ids, source, method,
          confidence, confidence_basis, taxonomy_version)
       values ($1, 'capability_level', 'You can hold a room.', '{career}', '{}',
               'observed', 'test', 'probable', 'test', '1.0.0')
       returning id`,
      [s1.userId],
    );
    await query(
      "insert into assertion_evidence (assertion_id, record_id) values ($1, $2)",
      [belief?.id, bright?.id],
    );
    const again = await inject(s1, { method: "GET", url: "/constellation" });
    const star = again.json().find((x: { id: string }) => x.id === bright?.id);
    assert.equal(star?.weight, 0.7);
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

describe("your evenings: own words, quoted, and any evening can be left out", () => {
  let me: Session;
  const older = "Walked at lunch and felt clearer. The team call went fine.";
  const latest = "I keep avoiding the call with my sister and it sits with me.";
  let olderId = "";
  let latestId = "";

  before(async () => {
    me = await createSession();
    for (const [date, transcript] of [["2026-09-01", older], ["2026-09-02", latest]] as const) {
      const res = await inject(me, { method: "POST", url: "/debrief", payload: { date, transcript } });
      assert.equal(res.statusCode, 200);
    }
    const list = (await inject(me, { method: "GET", url: "/evenings" })).json();
    latestId = list[0].id;
    olderId = list[1].id;
  });

  it("lists the person's evenings newest first, in their words", async () => {
    const list = (await inject(me, { method: "GET", url: "/evenings" })).json();
    assert.equal(list.length, 2);
    assert.equal(list[0].text, latest);
    assert.equal(list[0].date, "2026-09-02");
    assert.equal(list[0].excluded, false);
  });

  it("searches literally, so % and _ are just characters", async () => {
    const hit = (await inject(me, { method: "GET", url: "/evenings?q=SISTER" })).json();
    assert.deepEqual(hit.map((e: { id: string }) => e.id), [latestId]);
    const pct = (await inject(me, { method: "GET", url: "/evenings?q=%25" })).json();
    assert.equal(pct.length, 0);
  });

  it("never shows or touches another person's evenings", async () => {
    const other = await createSession();
    const list = (await inject(other, { method: "GET", url: "/evenings" })).json();
    assert.deepEqual(list, []);
    const res = await inject(other, { method: "POST", url: `/evenings/${latestId}/exclude` });
    assert.equal(res.statusCode, 404);
    const undo = await inject(other, { method: "DELETE", url: `/evenings/${latestId}/exclude` });
    assert.equal(undo.statusCode, 404);
  });

  it("morning steps quote the evening they came from, and only verified words", async () => {
    const plan = (await inject(me, { method: "GET", url: "/plan/2026-09-03" })).json();
    const build = plan.slots.find((s: { slot: string }) => s.slot === "build");
    const train = plan.slots.find((s: { slot: string }) => s.slot === "train");
    assert.deepEqual(build.source, { recordId: latestId, date: "2026-09-02", quote: "I keep avoiding the call with my sister and it sits with me" });
    assert.equal(train.source, undefined, "invented words are dropped, the step stays");
    assert.equal(plan.questionSource.recordId, latestId);
    assert.ok(!("quote" in build) && !("sourceRecordId" in build));
  });

  it("a left-out evening is never quoted, and it can be brought back", async () => {
    const out = await inject(me, { method: "POST", url: `/evenings/${latestId}/exclude` });
    assert.equal(out.statusCode, 200);
    const list = (await inject(me, { method: "GET", url: "/evenings" })).json();
    assert.equal(list[0].excluded, true, "still listed, marked as left out");

    const plan = (await inject(me, { method: "GET", url: "/plan/2026-09-04" })).json();
    const build = plan.slots.find((s: { slot: string }) => s.slot === "build");
    assert.equal(build.source.recordId, olderId);
    assert.equal(plan.questionSource.recordId, olderId);

    const back = await inject(me, { method: "DELETE", url: `/evenings/${latestId}/exclude` });
    assert.equal(back.statusCode, 200);
    const plan2 = (await inject(me, { method: "GET", url: "/plan/2026-09-05" })).json();
    assert.equal(plan2.questionSource.recordId, latestId);
  });

  it("beliefs resting only on a left-out evening are hidden, not destroyed", async () => {
    const solo = await createSession();
    await inject(solo, {
      method: "POST",
      url: "/debrief",
      payload: { date: "2026-09-10", transcript: "I wrote the plan down and kept to it all day." },
    });
    await runNightly();
    const statement = "You keep commitments you write down.";
    const before = (await inject(solo, { method: "GET", url: "/assertions" })).json();
    assert.ok(before.some((a: { statement: string }) => a.statement === statement));

    const [evening] = (await inject(solo, { method: "GET", url: "/evenings" })).json();
    assert.equal(evening.beliefCount, 1);
    await inject(solo, { method: "POST", url: `/evenings/${evening.id}/exclude` });
    const hidden = (await inject(solo, { method: "GET", url: "/assertions" })).json();
    assert.ok(!hidden.some((a: { statement: string }) => a.statement === statement));
    const [summary] = await query<{ content: string }>(
      "select content from model_summaries where user_id = $1",
      [solo.userId],
    );
    assert.ok(!summary?.content.includes(statement));

    await runNightly(); // the nightly pass must not prune it while it is left out
    await inject(solo, { method: "DELETE", url: `/evenings/${evening.id}/exclude` });
    const restored = (await inject(solo, { method: "GET", url: "/assertions" })).json();
    assert.ok(restored.some((a: { statement: string }) => a.statement === statement));
  });

  it("the constellation leaves out the evening too", async () => {
    await inject(me, { method: "POST", url: `/evenings/${olderId}/exclude` });
    const stars = (await inject(me, { method: "GET", url: "/constellation" })).json();
    assert.ok(!stars.some((s: { id: string }) => s.id === olderId));
    assert.ok(stars.some((s: { id: string }) => s.id === latestId));
  });
});

describe("web clients", () => {
  it("CORS preflight allows the PATCH and DELETE routes the app uses", async () => {
    for (const method of ["PATCH", "DELETE"]) {
      const res = await app.inject({
        method: "OPTIONS",
        url: "/evenings/00000000-0000-0000-0000-000000000000/exclude",
        headers: {
          origin: "http://localhost:8081",
          "access-control-request-method": method,
        },
      });
      assert.ok(res.statusCode < 300, `${method} preflight status ${res.statusCode}`);
      assert.match(String(res.headers["access-control-allow-methods"]), new RegExp(method));
    }
  });
});

describe("memory galaxy: real evenings, explained links, shared by every view", () => {
  let g: Session;
  before(async () => {
    g = await createSession();
    for (const [date, transcript] of [
      ["2026-09-20", "I wrote the list on paper and did every item before lunch."],
      ["2026-09-21", "Wrote tomorrow down again and kept to it, even the hard call."],
    ] as const) {
      await inject(g, { method: "POST", url: "/debrief", payload: { date, transcript } });
      await runNightly(); // first evening creates the belief, the second confirms it
    }
  });

  it("stars are the person's own evenings, oldest first, as whole-word excerpts", async () => {
    const res = await inject(g, { method: "GET", url: "/galaxy" });
    assert.equal(res.statusCode, 200);
    const { stars } = res.json();
    assert.equal(stars.length, 2);
    assert.equal(stars[0].date, "2026-09-20");
    assert.equal(stars[0].excerpt, "I wrote the list on paper and did every item before lunch.");
  });

  it("every link carries the theme that explains it, with its why", async () => {
    const { stars, themes, links } = (await inject(g, { method: "GET", url: "/galaxy" })).json();
    assert.equal(themes.length, 1);
    assert.equal(themes[0].statement, "You keep commitments you write down.");
    assert.deepEqual(themes[0].starIds, stars.map((s: { id: string }) => s.id));
    assert.equal(themes[0].why, "Seen in 2 of your evenings, across 2 days.");
    assert.equal(links.length, 1);
    assert.deepEqual(links[0], { from: stars[0].id, to: stars[1].id, themeId: themes[0].id });
  });

  it("filters by world: the character belief lives in Soul, not Mind", async () => {
    const soul = (await inject(g, { method: "GET", url: "/galaxy?world=soul" })).json();
    assert.equal(soul.stars.length, 2);
    const mind = (await inject(g, { method: "GET", url: "/galaxy?world=mind" })).json();
    assert.equal(mind.stars.length, 0);
    assert.equal(mind.themes.length, 0);
  });

  it("a left-out evening leaves the galaxy, and its links go with it", async () => {
    const { stars } = (await inject(g, { method: "GET", url: "/galaxy" })).json();
    await inject(g, { method: "POST", url: `/evenings/${stars[1].id}/exclude` });
    const after = (await inject(g, { method: "GET", url: "/galaxy" })).json();
    assert.equal(after.stars.length, 1);
    assert.equal(after.links.length, 0);
    assert.equal(after.themes[0].forming, true, "one evening is still forming, not a pattern");
    await inject(g, { method: "DELETE", url: `/evenings/${stars[1].id}/exclude` });
    assert.equal((await inject(g, { method: "GET", url: "/galaxy" })).json().links.length, 1);
  });

  it("another person sees an empty galaxy", async () => {
    const other = await createSession();
    const res = (await inject(other, { method: "GET", url: "/galaxy" })).json();
    assert.deepEqual(res, { world: "all", stars: [], themes: [], links: [] });
  });
});

describe("learn from my evenings: pausing personalization", () => {
  it("keeps new evenings but leaves them out, and plans stop quoting them", async () => {
    const p = await createSession();
    await inject(p, { method: "POST", url: "/debrief", payload: { date: "2026-09-25", transcript: "Before the pause I ran by the canal at dawn." } });
    const off = await inject(p, { method: "PATCH", url: "/me", payload: { personalization: false } });
    assert.equal(off.statusCode, 200);
    assert.equal((await inject(p, { method: "GET", url: "/me" })).json().personalization, false);

    await inject(p, { method: "POST", url: "/debrief", payload: { date: "2026-09-26", transcript: "During the pause I sat with the hard letter." } });
    const evenings = (await inject(p, { method: "GET", url: "/evenings" })).json();
    assert.equal(evenings[0].excluded, true, "the paused evening is kept but left out");
    assert.equal(evenings[1].excluded, false, "earlier evenings are untouched");

    const plan = (await inject(p, { method: "GET", url: "/plan/2026-09-27" })).json();
    assert.ok(plan.slots.every((s: { source?: unknown }) => !s.source));
    assert.equal(plan.questionSource, undefined);

    await inject(p, { method: "PATCH", url: "/me", payload: { personalization: true } });
    const plan2 = (await inject(p, { method: "GET", url: "/plan/2026-09-28" })).json();
    assert.ok(plan2.questionSource, "back on: quotes return, from evenings not left out");
    assert.notEqual(plan2.questionSource.recordId, evenings[0].id);
  });
});

describe("one thought, said inside a world", () => {
  it("is born as a star in that world straight away", async () => {
    const w = await createSession();
    const res = await inject(w, {
      method: "POST",
      url: "/debrief",
      payload: { date: "2026-09-30", transcript: "An idea for the studio: smaller batches.", world: "mind" },
    });
    assert.equal(res.statusCode, 200);
    const mind = (await inject(w, { method: "GET", url: "/galaxy?world=mind" })).json();
    assert.equal(mind.stars.length, 1);
    assert.equal(mind.stars[0].excerpt, "An idea for the studio: smaller batches.");
    const body = (await inject(w, { method: "GET", url: "/galaxy?world=body" })).json();
    assert.equal(body.stars.length, 0);
  });
});

describe("review fixes", () => {
  it("a retried reflection with the same key is kept once", async () => {
    const k = await createSession();
    const payload = { date: "2026-10-01", transcript: "Sent twice by a shaky network.", clientKey: "key-0123456789" };
    const a = await inject(k, { method: "POST", url: "/debrief", payload });
    const b = await inject(k, { method: "POST", url: "/debrief", payload });
    assert.equal(a.statusCode, 200);
    assert.equal(b.json().reply, "Already kept, word for word.");
    assert.equal((await inject(k, { method: "GET", url: "/evenings" })).json().length, 1);
  });

  it("a debrief without consent is refused and nothing is stored", async () => {
    const n = await createSession(false);
    const res = await inject(n, { method: "POST", url: "/debrief", payload: { date: "2026-10-01", transcript: "No consent yet." } });
    assert.equal(res.statusCode, 403);
    const rows = await query("select 1 from records where user_id = $1", [n.userId]);
    assert.equal(rows.length, 0);
  });

  it("bad input gets a plain 400, never a stack or a database message", async () => {
    const res = await inject(s1, { method: "GET", url: "/plan/2026-02-31" });
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.json(), { error: "That request isn't quite right." });
    const bad = await inject(s1, { method: "POST", url: "/debrief", payload: { date: "nope" } });
    assert.equal(bad.statusCode, 400);
    assert.ok(!JSON.stringify(bad.json()).includes("Zod"));
  });

  it("a request body over 1 MB is refused before it reaches a route", async () => {
    const res = await inject(s1, { method: "POST", url: "/debrief", payload: { date: "2026-10-01", transcript: "x".repeat(1_200_000) } });
    assert.equal(res.statusCode, 413);
  });

  it("left-out evenings stop counting toward a belief's confidence, and count again on return", async () => {
    const c = await createSession();
    const ids: string[] = [];
    for (const d of ["2026-10-02", "2026-10-03", "2026-10-04"]) {
      await inject(c, { method: "POST", url: "/debrief", payload: { date: d, transcript: `I wrote it down on ${d} and did it.` } });
      await runNightly();
    }
    for (const e of (await inject(c, { method: "GET", url: "/evenings" })).json()) ids.push(e.id);
    const belief = () => (inject(c, { method: "GET", url: "/assertions" }) as Promise<{ json(): { confidence: string }[] }>).then((r) => r.json()[0]);
    // Test data lands on one real day, so promote by hand to make the
    // check meaningful: stored "probable", three evenings behind it.
    await query("update assertions set confidence = 'probable' where user_id = $1", [c.userId]);
    const stored = (await belief())!.confidence;
    assert.equal(stored, "probable");
    await inject(c, { method: "POST", url: `/evenings/${ids[0]}/exclude` });
    await inject(c, { method: "POST", url: `/evenings/${ids[1]}/exclude` });
    assert.equal((await belief())!.confidence, "hypothesis", "one evening left: a guess");
    await inject(c, { method: "DELETE", url: `/evenings/${ids[0]}/exclude` });
    await inject(c, { method: "DELETE", url: `/evenings/${ids[1]}/exclude` });
    assert.equal((await belief())!.confidence, stored, "all back: as before");
  });

  it("the export includes everything held about the person", async () => {
    const res = (await inject(s1, { method: "GET", url: "/export" })).json();
    for (const key of ["onboarding", "modelSummary", "modelEvents", "safetyEvents", "people", "leftOutEvenings"]) {
      assert.ok(key in res, key);
    }
    assert.ok("personalization" in res.user && "preferred_name" in res.user);
  });

  it("rate limits new devices per address", async () => {
    const { rateLimit } = await import("../../src/guard.js");
    const limiter = rateLimit({ name: "t", limit: 2, windowMs: 60_000, key: () => "same" });
    const codes: number[] = [];
    for (let i = 0; i < 3; i++) {
      let code = 200;
      const reply = { code(c: number) { code = c; return reply; }, header() { return reply; }, send() { return reply; } };
      await limiter({} as never, reply as never);
      codes.push(code);
    }
    assert.deepEqual(codes, [200, 200, 429]);
  });
});

describe("paging your evenings", () => {
  it("never skips evenings saved in the same instant", async () => {
    const pg = await createSession();
    // Five evenings with one identical timestamp, inserted directly.
    for (let i = 0; i < 5; i++) {
      await query(
        `insert into records (user_id, kind, payload, occurred_at)
         values ($1, 'reflection', $2, '2026-10-05T20:00:00.123456Z')`,
        [pg.userId, JSON.stringify({ date: "2026-10-05", transcript: `Same instant ${i}` })],
      );
    }
    const seen: string[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 5; page++) {
      const url = `/evenings?limit=2${cursor ? `&before=${encodeURIComponent(cursor)}` : ""}`;
      const rows = (await inject(pg, { method: "GET", url })).json() as { id: string; cursor: string }[];
      if (!rows.length) break;
      seen.push(...rows.map((r) => r.id));
      cursor = rows[rows.length - 1]!.cursor;
    }
    assert.equal(seen.length, 5);
    assert.equal(new Set(seen).size, 5);
  });
});

describe("a stored plan and a left-out evening", () => {
  it("stops quoting an evening left out after the plan was made", async () => {
    const q = await createSession();
    await inject(q, { method: "POST", url: "/debrief", payload: { date: "2026-10-06", transcript: "An earlier evening about the garden. Long and quiet." } });
    await inject(q, { method: "POST", url: "/debrief", payload: { date: "2026-10-07", transcript: "The newest evening, about the sea. Cold and bright." } });
    const first = (await inject(q, { method: "GET", url: "/plan/2026-10-08" })).json();
    const build = first.slots.find((s: { slot: string }) => s.slot === "build");
    assert.ok(build.source, "quoted when made");
    await inject(q, { method: "POST", url: `/evenings/${build.source.recordId}/exclude` });
    const again = (await inject(q, { method: "GET", url: "/plan/2026-10-08" })).json();
    const build2 = again.slots.find((s: { slot: string }) => s.slot === "build");
    assert.equal(build2.source, undefined);
    assert.equal(again.questionSource, undefined);
    assert.equal(build2.text, build.text, "the step itself stays");
  });
});
