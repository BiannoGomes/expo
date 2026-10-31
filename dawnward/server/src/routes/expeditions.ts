import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import {
  MISSIONS,
  SYSTEMS,
  answerStep,
  checkCatalog,
  completeAttempt,
  describeDiscovery,
  discoveriesFrom,
  missionById,
  plannedAction,
  type Answer,
  type Attempt,
  type Mission,
  type ProgressEvent,
} from "@dawnward/core";
import { pool, query } from "../db.js";
import { requireAuth } from "../auth.js";
import { modelCallLimit, rateLimit, requireConsent } from "../guard.js";
import { intelligence } from "../intelligence/index.js";
import { crisisResponse } from "../safety/crisis.js";

/**
 * Expeditions: hand-written missions, a pure engine (@dawnward/core) and an
 * append-only progress ledger. Completion and discoveries are decided here,
 * never by the client or the model. Every write is per user, idempotent, and
 * runs in one transaction with the events it causes.
 */

const problems = checkCatalog();
if (problems.length) throw new Error(`expedition catalog is unsound: ${problems.join("; ")}`);

const stepWriteLimit = rateLimit({ name: "expedition-writes", limit: 120, windowMs: 60_000, key: (r) => r.userId ?? r.ip });

interface AttemptRow {
  id: string;
  mission_id: string;
  mission_version: number;
  status: Attempt["status"];
  step: number;
  answers: Record<string, Answer>;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}
const toAttempt = (r: AttemptRow): Attempt => ({ id: r.id, missionId: r.mission_id, version: r.mission_version, status: r.status, step: r.step, answers: r.answers });
const view = (r: AttemptRow) => ({ ...toAttempt(r), startedAt: r.started_at, updatedAt: r.updated_at, completedAt: r.completed_at });

/** Inserts events, then any discoveries they newly cause. Returns the new ones. */
async function recordProgress(client: { query: typeof pool.query }, userId: string, events: ProgressEvent[]) {
  for (const e of events) {
    await client.query("insert into progress_events (user_id, kind, ref) values ($1, $2, $3) on conflict do nothing", [userId, e.kind, e.ref]);
  }
  const { rows } = await client.query<{ kind: ProgressEvent["kind"]; ref: string }>(
    "select kind, ref from progress_events where user_id = $1 order by created_at, id",
    [userId],
  );
  const fresh = [];
  for (const d of discoveriesFrom(rows)) {
    const ins = await client.query<{ key: string; discovered_at: string }>(
      `insert into discoveries (user_id, key, cause_kind, cause_ref) values ($1, $2, $3, $4)
       on conflict do nothing returning key, discovered_at`,
      [userId, d.key, d.causeKind, d.causeRef],
    );
    if (ins.rows[0]) fresh.push({ ...d, ...describeDiscovery(d), discoveredAt: ins.rows[0].discovered_at });
  }
  return fresh;
}

async function inTransaction<T>(fn: (c: { query: typeof pool.query }) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const out = await fn(client as unknown as { query: typeof pool.query });
    await client.query("commit");
    return out;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

/** Safety triage on any free text. A crisis stops everything; only level and time are logged. */
async function triage(userId: string, texts: string[], reply: FastifyReply): Promise<boolean> {
  for (const t of texts) {
    const level = (await intelligence.triageSafety(t)).level;
    if (level === "crisis" || level === "distress") {
      await query("insert into safety_events (user_id, level) values ($1, $2)", [userId, level]);
      if (level === "crisis") {
        reply.code(200).send({ crisis: true, reply: crisisResponse(null) });
        return false;
      }
    }
  }
  return true;
}
const textsOf = (a: Answer) => ("text" in a ? [a.text] : "action" in a ? [a.action, a.when] : []);

const answerSchema = z.union([
  z.object({ ack: z.literal(true) }),
  z.object({ skip: z.literal(true) }),
  z.object({ choice: z.string().min(1).max(40) }),
  z.object({ text: z.string().max(4000) }),
  z.object({ action: z.string().max(400), when: z.string().max(200) }),
  z.object({ ratings: z.record(z.string().max(40), z.number().int().min(1).max(3)) }),
]);

export function registerExpeditionRoutes(app: FastifyInstance) {
  /** Everything the Explore screen needs, for this person only. */
  app.get("/expeditions", { onRequest: requireAuth }, async (request) => {
    const userId = request.userId;
    const attempts = await query<AttemptRow>("select * from mission_attempts where user_id = $1 order by updated_at desc", [userId]);
    const experiments = await query("select id, attempt_id, world, action, when_text, status, outcome, created_at, reviewed_at from experiments where user_id = $1 order by created_at desc", [userId]);
    const discoveries = await query<{ key: string; cause_kind: ProgressEvent["kind"]; cause_ref: string; discovered_at: string }>(
      "select key, cause_kind, cause_ref, discovered_at from discoveries where user_id = $1 order by discovered_at", [userId]);
    const [prefs] = await query<{ game_layer: boolean }>("select game_layer from users where id = $1", [userId]);
    return {
      systems: SYSTEMS,
      missions: MISSIONS.map(({ steps, ...m }) => ({ ...m, steps: steps.length })),
      attempts: attempts.map(view),
      experiments,
      discoveries: discoveries.map((d) => ({ key: d.key, discoveredAt: d.discovered_at, ...describeDiscovery({ key: d.key, causeKind: d.cause_kind, causeRef: d.cause_ref }) })),
      gameLayer: prefs?.game_layer ?? true,
    };
  });

  app.get("/expeditions/missions/:missionId", { onRequest: requireAuth }, async (request, reply) => {
    const { missionId } = z.object({ missionId: z.string().max(60) }).parse(request.params);
    const mission = missionById(missionId);
    if (!mission) return reply.code(404).send({ error: "no such mission" });
    return mission;
  });

  /** Begin, or resume the open attempt. Beginning twice never makes a second one. */
  app.post("/attempts", { onRequest: requireAuth, preHandler: [requireConsent, stepWriteLimit] }, async (request, reply) => {
    const userId = request.userId;
    const { missionId } = z.object({ missionId: z.string().max(60) }).parse(request.body);
    const mission = missionById(missionId);
    if (!mission) return reply.code(404).send({ error: "no such mission" });
    const [row] = await query<AttemptRow>(
      `with ins as (
         insert into mission_attempts (user_id, mission_id, mission_version)
         values ($1, $2, $3)
         on conflict (user_id, mission_id) where status in ('in_progress','paused') do nothing
         returning *)
       select * from ins
       union all
       select * from mission_attempts where user_id = $1 and mission_id = $2 and status in ('in_progress','paused')
       limit 1`,
      [userId, mission.id, mission.version],
    );
    if (row!.status === "paused") await query("update mission_attempts set status = 'in_progress', updated_at = now() where id = $1", [row!.id]);
    return view({ ...row!, status: "in_progress" });
  });

  async function loadAttempt(userId: string, id: string, reply: FastifyReply): Promise<{ row: AttemptRow; mission: Mission } | null> {
    const [row] = await query<AttemptRow>("select * from mission_attempts where id = $1 and user_id = $2", [id, userId]);
    const mission = row ? missionById(row.mission_id) : undefined;
    if (!row || !mission || mission.version !== row.mission_version) { reply.code(404).send({ error: "attempt not found" }); return null; }
    return { row, mission };
  }

  /** Answer the current step, or revise an earlier one. The expected step guards against stale writes. */
  app.post("/attempts/:attemptId/answer", { onRequest: requireAuth, preHandler: [requireConsent, stepWriteLimit, modelCallLimit] }, async (request, reply) => {
    const userId = request.userId;
    const { attemptId } = z.object({ attemptId: z.string().uuid() }).parse(request.params);
    const body = z.object({ stepIndex: z.number().int().min(0).max(50), answer: answerSchema }).parse(request.body);
    const found = await loadAttempt(userId, attemptId, reply);
    if (!found) return;
    const { row, mission } = found;
    const step = mission.steps[body.stepIndex];
    // The same answer again (a retry) changes nothing.
    if (step && JSON.stringify(row.answers[step.id]) === JSON.stringify(body.answer) && body.stepIndex < row.step) return view(row);
    const result = answerStep(mission, toAttempt(row), body.stepIndex, body.answer as Answer);
    if ("error" in result) return reply.code(result.status).send({ error: result.error, attempt: view(row) });
    if (!(await triage(userId, textsOf(body.answer as Answer), reply))) {
      await query("update mission_attempts set status = 'paused', updated_at = now() where id = $1", [row.id]);
      return;
    }
    const next = result.attempt;
    const saved = await inTransaction(async (c) => {
      const upd = await c.query<AttemptRow>(
        `update mission_attempts set answers = $1, step = $2, status = 'in_progress', updated_at = now()
          where id = $3 and user_id = $4 and step = $5 returning *`,
        [JSON.stringify(next.answers), next.step, row.id, userId, row.step],
      );
      if (!upd.rows[0]) return null; // someone else moved it on: stale
      if (step && ("text" in body.answer || "action" in body.answer)) {
        await c.query(
          "insert into records (user_id, kind, payload, occurred_at) values ($1, 'mission_response', $2, now())",
          [userId, JSON.stringify({ attemptId: row.id, missionId: mission.id, stepId: step.id, answer: body.answer })],
        );
      }
      return upd.rows[0];
    });
    if (!saved) {
      const [current] = await query<AttemptRow>("select * from mission_attempts where id = $1", [row.id]);
      return reply.code(409).send({ error: "This mission moved on elsewhere.", attempt: view(current!) });
    }
    return view(saved);
  });

  /** Completion is checked here. It records the action as an experiment and the discoveries it causes. */
  app.post("/attempts/:attemptId/complete", { onRequest: requireAuth, preHandler: [requireConsent, stepWriteLimit] }, async (request, reply) => {
    const userId = request.userId;
    const { attemptId } = z.object({ attemptId: z.string().uuid() }).parse(request.params);
    const found = await loadAttempt(userId, attemptId, reply);
    if (!found) return;
    const { row, mission } = found;
    if (row.status === "completed") return { attempt: view(row), discoveries: [], experiment: null };
    const result = completeAttempt(mission, toAttempt(row));
    if ("error" in result) return reply.code(result.status).send({ error: result.error, attempt: view(row) });
    const plan = plannedAction(mission, result.attempt);
    return inTransaction(async (c) => {
      const upd = await c.query<AttemptRow>(
        "update mission_attempts set status = 'completed', step = $1, completed_at = now(), updated_at = now() where id = $2 and status <> 'completed' returning *",
        [result.attempt.step, row.id],
      );
      if (!upd.rows[0]) return { attempt: view(row), discoveries: [], experiment: null };
      const events = [...result.events];
      let experiment = null;
      if (plan) {
        const ex = await c.query(
          `insert into experiments (user_id, attempt_id, world, action, when_text) values ($1, $2, $3, $4, $5)
           on conflict (attempt_id) do nothing returning id, world, action, when_text, status`,
          [userId, row.id, mission.world, plan.action, plan.when],
        );
        experiment = ex.rows[0] ?? null;
        if (experiment) events.push({ kind: "experiment_planned", ref: `experiment:${mission.world}:${experiment.id}:planned` });
      }
      const discoveries = await recordProgress(c, userId, events);
      return { attempt: view(upd.rows[0]), discoveries, experiment };
    });
  });

  /** Leave a mission and keep your place. */
  app.post("/attempts/:attemptId/exit", { onRequest: requireAuth }, async (request, reply) => {
    const { attemptId } = z.object({ attemptId: z.string().uuid() }).parse(request.params);
    const [row] = await query<AttemptRow>(
      "update mission_attempts set status = 'paused', updated_at = now() where id = $1 and user_id = $2 and status = 'in_progress' returning *",
      [attemptId, request.userId],
    );
    if (!row) return reply.code(404).send({ error: "no open attempt" });
    return view(row);
  });

  /** How a real action went. Any outcome counts, "I didn't" included. */
  app.post("/experiments/:experimentId/review", { onRequest: requireAuth, preHandler: [requireConsent, stepWriteLimit, modelCallLimit] }, async (request, reply) => {
    const userId = request.userId;
    const { experimentId } = z.object({ experimentId: z.string().uuid() }).parse(request.params);
    const body = z.object({ outcome: z.enum(["did", "partly", "didnt"]), text: z.string().trim().min(1).max(2000) }).parse(request.body);
    const [ex] = await query<{ id: string; world: string; status: string }>("select id, world, status from experiments where id = $1 and user_id = $2", [experimentId, userId]);
    if (!ex) return reply.code(404).send({ error: "experiment not found" });
    if (ex.status === "reviewed") return { reviewed: true, discoveries: [] };
    if (!(await triage(userId, [body.text], reply))) return;
    return inTransaction(async (c) => {
      const upd = await c.query("update experiments set status = 'reviewed', outcome = $1, reviewed_at = now() where id = $2 and status = 'planned' returning id", [body.outcome, ex.id]);
      if (!upd.rows[0]) return { reviewed: true, discoveries: [] };
      await c.query(
        "insert into records (user_id, kind, payload, occurred_at) values ($1, 'experiment_review', $2, now())",
        [userId, JSON.stringify({ experimentId: ex.id, outcome: body.outcome, text: body.text })],
      );
      const discoveries = await recordProgress(c, userId, [{ kind: "experiment_reviewed", ref: `experiment:${ex.world}:${ex.id}:reviewed` }]);
      return { reviewed: true, discoveries };
    });
  });

  app.put("/preferences/game-layer", { onRequest: requireAuth }, async (request) => {
    const { on } = z.object({ on: z.boolean() }).parse(request.body);
    await query("update users set game_layer = $1 where id = $2", [on, request.userId]);
    return { gameLayer: on };
  });
}

/** Called after a reflection is kept, so first light can appear. */
export async function noteReflectionSaved(userId: string, recordId: string) {
  await inTransaction((c) => recordProgress(c, userId, [{ kind: "reflection_saved", ref: `record:${recordId}` }]));
}
