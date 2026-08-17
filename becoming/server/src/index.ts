import Fastify from "fastify";
import { z } from "zod";
import type { DailyPlan } from "@becoming/core";
import { query } from "./db.js";
import { intelligence } from "./intelligence/anthropic.js";
import { crisisResponse } from "./safety/crisis.js";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));

/** Dev bootstrap — replace with real auth before any external user. */
app.post("/users", async (request) => {
  const body = z
    .object({ email: z.string().email(), displayName: z.string().optional() })
    .parse(request.body);
  const [user] = await query<{ id: string }>(
    `insert into users (email, display_name) values ($1, $2)
     on conflict (email) do update set display_name = excluded.display_name
     returning id`,
    [body.email, body.displayName ?? null],
  );
  return user;
});

/** Morning plan: return today's stored plan or generate one (spec 03 §1). */
app.get("/plan/:userId/:date", async (request, reply) => {
  const { userId, date } = z
    .object({ userId: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
    .parse(request.params);

  const existing = await query<{ plan: DailyPlan }>(
    "select plan from daily_plans where user_id = $1 and plan_date = $2",
    [userId, date],
  );
  if (existing[0]) return existing[0].plan;

  const [user] = await query<{ available_minutes_daily: number }>(
    "select available_minutes_daily from users where id = $1",
    [userId],
  );
  if (!user) return reply.code(404).send({ error: "unknown user" });

  const [summary] = await query<{ content: string }>(
    "select content from model_summaries where user_id = $1",
    [userId],
  );

  const plan = await intelligence.generatePlan({
    date,
    summary: summary?.content ?? "New user; model not yet built. Keep the plan generic but sensible.",
    availableMinutes: user.available_minutes_daily,
    activeCampaign: null, // TODO: load active campaign mission
    recentDebriefs: [], // TODO: last 3 extractions (spec 02 §5 recipe)
    yesterdayOutcome: null,
    reducedLoad: false, // TODO: load guard from yesterday's energy flag
  });

  await query(
    `insert into daily_plans (user_id, plan_date, plan) values ($1, $2, $3)
     on conflict (user_id, plan_date) do nothing`,
    [userId, date, JSON.stringify(plan)],
  );
  return plan;
});

/** Evening debrief: safety triage FIRST, then extraction (spec 04 §2, 03 §3). */
app.post("/debrief/:userId", async (request, reply) => {
  const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
  const body = z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      transcript: z.string().min(1).max(20000),
    })
    .parse(request.body);

  // 1. Safety triage before any other processing.
  const triage = await intelligence.triageSafety(body.transcript);

  if (triage.level === "crisis") {
    // Pipeline stops. Log level + time only — a crisis is not "evidence".
    await query(
      "insert into safety_events (user_id, level) values ($1, 'crisis')",
      [userId],
    );
    return reply.code(200).send({ crisis: true, reply: crisisResponse(null) });
  }

  if (triage.level === "distress") {
    await query(
      "insert into safety_events (user_id, level) values ($1, 'distress')",
      [userId],
    );
    // Processing continues, softened: TODO thread a `soften` flag into
    // extraction reply + tomorrow's load guard (no confront slot).
  }

  // 2. Capture the record verbatim.
  const [record] = await query<{ id: string }>(
    `insert into records (user_id, kind, payload, occurred_at)
     values ($1, 'reflection', $2, now()) returning id`,
    [userId, JSON.stringify({ date: body.date, transcript: body.transcript })],
  );
  if (!record) return reply.code(500).send({ error: "capture failed" });

  // 3. Extraction. On failure the record parks as unprocessed — never dropped.
  const todaysPlan = await query<{ plan: DailyPlan }>(
    "select plan from daily_plans where user_id = $1 and plan_date = $2",
    [userId, body.date],
  );
  try {
    const { extraction, reply: userReply } = await intelligence.extractDebrief({
      date: body.date,
      transcript: body.transcript,
      planSlots: todaysPlan[0]?.plan.slots ?? [],
    });
    await query(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'action_event', $2, now())`,
      [userId, JSON.stringify({ extractionOf: record.id, ...extraction })],
    );
    return { crisis: false, reply: userReply };
  } catch (err) {
    request.log.error({ err }, "extraction failed; record parked unprocessed");
    return {
      crisis: false,
      reply: "Noted — I've saved everything you said and will make sense of it tonight.",
    };
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
