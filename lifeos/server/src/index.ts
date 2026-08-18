import Fastify from "fastify";
import { z } from "zod";
import type { DailyPlan, DebriefExtraction } from "@lifeos/core";
import { query } from "./db.js";
import { intelligence } from "./intelligence/index.js";
import { crisisResponse } from "./safety/crisis.js";
import { registerOnboardingRoutes } from "./routes/onboarding.js";
import { registerAssertionRoutes } from "./routes/assertions.js";
import { registerCampaignRoutes } from "./routes/campaign.js";
import { registerEventRoutes } from "./routes/events.js";

export function buildApp() {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });

  registerOnboardingRoutes(app);
  registerAssertionRoutes(app);
  registerCampaignRoutes(app);
  registerEventRoutes(app);

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
app.get("/plan/:userId/:date", async (request, reply) => {
  const { userId, date } = z
    .object({ userId: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
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
      reply: "Noted — I've saved everything you said and will make sense of it tonight.",
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
