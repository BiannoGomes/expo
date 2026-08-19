import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import type { DailyPlan, DebriefExtraction } from "@dawnward/core";
import { query } from "./db.js";
import { intelligence } from "./intelligence/index.js";
import { crisisResponse } from "./safety/crisis.js";
import { registerOnboardingRoutes } from "./routes/onboarding.js";
import { registerAssertionRoutes } from "./routes/assertions.js";
import { registerCampaignRoutes } from "./routes/campaign.js";
import { registerEventRoutes } from "./routes/events.js";
import { registerAccountRoutes } from "./routes/account.js";
import { registerConstellationRoutes } from "./routes/constellation.js";
import { registerAuthRoutes, requireAuth } from "./auth.js";
import { transcription } from "./intelligence/transcription.js";

export function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "test",
    bodyLimit: 26_214_400, // voice notes arrive as base64 JSON
  });

  // Browser clients (Expo web) call cross-origin in development.
  app.register(cors, { origin: true });

  registerAuthRoutes(app);
  registerAccountRoutes(app);
  registerOnboardingRoutes(app);
  registerAssertionRoutes(app);
  registerCampaignRoutes(app);
  registerEventRoutes(app);
  registerConstellationRoutes(app);

  app.get("/health", async () => ({ ok: true }));

async function hadSafetyEvent(userId: string, hours: number): Promise<boolean> {
  const rows = await query(
    `select 1 from safety_events
      where user_id = $1 and created_at > now() - ($2 || ' hours')::interval
      limit 1`,
    [userId, String(hours)],
  );
  return rows.length > 0;
}

async function recentExtractions(
  userId: string,
  limit: number,
): Promise<DebriefExtraction[]> {
  const rows = await query<{ payload: DebriefExtraction & { extractionOf: string } }>(
    `select payload from records
      where user_id = $1 and kind = 'action_event' and payload ? 'extractionOf'
      order by occurred_at desc limit $2`,
    [userId, limit],
  );
  return rows.map((r) => r.payload);
}

/** Morning plan: stored plan, or generate with load guard + re-entry (spec 03 §1, §4). */
app.get("/plan/:date", { preHandler: requireAuth }, async (request, reply) => {
  const userId = request.userId;
  const { date } = z
    .object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
    .parse(request.params);

  const existing = await query<{ plan: DailyPlan }>(
    "select plan from daily_plans where user_id = $1 and plan_date = $2",
    [userId, date],
  );
  if (existing[0]) return existing[0].plan;

  const [user] = await query<{
    available_minutes_daily: number;
    challenge_opt_in: boolean;
  }>(
    "select available_minutes_daily, challenge_opt_in from users where id = $1",
    [userId],
  );
  if (!user) return reply.code(404).send({ error: "unknown user" });

  // Re-entry tiers (spec 03 §4): ≥3 silent days pauses campaigns; the plan
  // comes back lighter. Missed days are never listed.
  const [activity] = await query<{ gap_days: number | null }>(
    `select extract(day from now() - max(occurred_at))::int as gap_days
       from records where user_id = $1`,
    [userId],
  );
  const gapDays = activity?.gap_days ?? 0;
  if (gapDays >= 3) {
    await query(
      `update campaigns set status = 'paused', paused_at = now()
        where user_id = $1 and status = 'active'`,
      [userId],
    );
  }

  const extractions = await recentExtractions(userId, 3);
  const yesterdayOutcome = extractions[0] ?? null;

  // Load guard (spec 03 §1): exhaustion, distress, or a long gap shrinks today.
  const distressRecently = await hadSafetyEvent(userId, 72);
  const reducedLoad =
    gapDays >= 3 || distressRecently || yesterdayOutcome?.energy === "low";

  const [summary] = await query<{ content: string }>(
    "select content from model_summaries where user_id = $1",
    [userId],
  );
  const [campaign] = await query<{ title: string; mission: string }>(
    `select title, mission from campaigns
      where user_id = $1 and status = 'active' order by created_at limit 1`,
    [userId],
  );

  const plan = await intelligence.generatePlan({
    date,
    summary:
      summary?.content ??
      "New user; model not yet built. Keep the plan generic but sensible.",
    availableMinutes: user.available_minutes_daily,
    activeCampaign: campaign ? `${campaign.title} — ${campaign.mission}` : null,
    recentDebriefs: extractions,
    yesterdayOutcome,
    reducedLoad,
  });

  // Deterministic guardrails on top of whatever the model produced:
  // confront requires opt-in and no recent distress (spec 04 §2).
  const confrontAllowed = user.challenge_opt_in && !distressRecently;
  const finalPlan: DailyPlan = {
    ...plan,
    slots: plan.slots.filter((s) => s.slot !== "confront" || confrontAllowed),
    ...(gapDays >= 3 ? { reentryGapDays: gapDays } : {}),
  };

  await query(
    `insert into daily_plans (user_id, plan_date, plan) values ($1, $2, $3)
     on conflict (user_id, plan_date) do nothing`,
    [userId, date, JSON.stringify(finalPlan)],
  );
  return finalPlan;
});

/** Voice becomes words; the audio itself is never stored (spec 04 §5). */
app.post("/transcribe", { preHandler: requireAuth }, async (request, reply) => {
  const body = z
    .object({
      audio: z.string().min(1),
      mimeType: z.string().default("audio/m4a"),
    })
    .parse(request.body);
  try {
    const text = await transcription.transcribe(
      Buffer.from(body.audio, "base64"),
      body.mimeType,
    );
    return { text };
  } catch (err) {
    request.log.error({ err }, "transcription unavailable");
    return reply
      .code(503)
      .send({ error: "I couldn't hear that just now. Typing still works." });
  }
});

/** Marking a slot done survives restarts; the plan document carries it. */
app.patch("/plan/:date/slot", { preHandler: requireAuth }, async (request, reply) => {
  const userId = request.userId;
  const { date } = z
    .object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
    .parse(request.params);
  const body = z
    .object({
      slot: z.enum(["build", "train", "learn", "confront", "experience"]),
      done: z.boolean(),
    })
    .parse(request.body);
  const [row] = await query<{ plan: DailyPlan }>(
    `update daily_plans
        set plan = jsonb_set(
              jsonb_set(plan, '{done}', coalesce(plan->'done', '{}'::jsonb)),
              array['done', $3], to_jsonb($4::boolean), true)
      where user_id = $1 and plan_date = $2
      returning plan`,
    [userId, date, body.slot, body.done],
  );
  if (!row) return reply.code(404).send({ error: "no plan for that day yet" });
  return row.plan;
});

/** Evening debrief: safety triage FIRST, then extraction (spec 04 §2, 03 §3). */
app.post("/debrief", { preHandler: requireAuth }, async (request, reply) => {
  const userId = request.userId;
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
    // Processing continues; tomorrow's plan route reads safety_events and
    // softens (reduced load, no confront slot).
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
      reply: "Noted. I've saved everything you said and will make sense of it tonight.",
    };
  }
});

  return app;
}

// Started directly (npm run dev/start) → listen; imported by tests → don't.
if (process.argv[1]?.endsWith("src/index.ts")) {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 3000);
  app.listen({ port, host: "0.0.0.0" }).catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}
