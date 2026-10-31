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
import { modelCallLimit, requireConsent } from "./guard.js";
import { ZodError } from "zod";
import { registerEveningRoutes } from "./routes/evenings.js";
import { registerGalaxyRoutes } from "./routes/galaxy.js";
import { notExcluded } from "./model/exclusions.js";
import { attachSources, type ClaimedPlan, type RecentWords } from "./model/provenance.js";

export function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "test",
    // Small by default; only /transcribe accepts voice notes (base64 JSON).
    bodyLimit: 1_048_576,
  });

  // Clients get a plain sentence, never a stack, a Postgres message or a
  // model provider's error text. Details stay in the server log.
  app.setErrorHandler((error, request, reply) => {
    const pgCode = (error as { code?: string }).code;
    if (error instanceof ZodError || pgCode === "22007" || pgCode === "22008" || pgCode === "22P02") {
      return reply.code(400).send({ error: "That request isn't quite right." });
    }
    const status = (error as { statusCode?: number }).statusCode;
    if (status && status >= 400 && status < 500) {
      return reply.code(status).send({ error: "That request isn't quite right." });
    }
    request.log.error({ err: error }, "unhandled error");
    return reply.code(500).send({ error: "Something went wrong on our side." });
  });

  // Browser clients (Expo web) call cross-origin in development.
  // @fastify/cors allows only GET, HEAD and POST unless told otherwise, which
  // silently broke every PATCH and DELETE from the web build.
  // In production only the listed origins may call from a browser.
  const origins = process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean);
  app.register(cors, {
    origin: process.env.NODE_ENV === "production" ? (origins ?? false) : true,
    methods: ["GET", "HEAD", "POST", "PATCH", "DELETE"],
  });

  registerAuthRoutes(app);
  registerAccountRoutes(app);
  registerOnboardingRoutes(app);
  registerAssertionRoutes(app);
  registerCampaignRoutes(app);
  registerEventRoutes(app);
  registerConstellationRoutes(app);
  registerEveningRoutes(app);
  registerGalaxyRoutes(app);

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

async function recentWords(userId: string, limit: number): Promise<RecentWords[]> {
  const rows = await query<{ id: string; payload: { date?: string; transcript?: string } }>(
    `select id, payload from records r
      where user_id = $1 and kind = 'reflection' and ${notExcluded("r.id")}
      order by occurred_at desc limit $2`,
    [userId, limit],
  );
  return rows
    .filter((r) => typeof r.payload.transcript === "string")
    .map((r) => ({
      recordId: r.id,
      date: r.payload.date ?? "",
      transcript: r.payload.transcript!,
    }));
}

async function recentExtractions(
  userId: string,
  limit: number,
): Promise<DebriefExtraction[]> {
  const rows = await query<{ payload: DebriefExtraction & { extractionOf: string } }>(
    `select payload from records
      where user_id = $1 and kind = 'action_event' and payload ? 'extractionOf'
        and ${notExcluded("(payload->>'extractionOf')::uuid")}
      order by occurred_at desc limit $2`,
    [userId, limit],
  );
  return rows.map((r) => r.payload);
}

/** Morning plan: stored plan, or generate with load guard + re-entry (spec 03 §1, §4). */
app.get("/plan/:date", { onRequest: requireAuth, preHandler: modelCallLimit }, async (request, reply) => {
  const userId = request.userId;
  const { date } = z
    .object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
    .parse(request.params);

  const existing = await query<{ plan: DailyPlan }>(
    "select plan from daily_plans where user_id = $1 and plan_date = $2",
    [userId, date],
  );
  if (existing[0]) {
    // A plan made before an evening was left out must stop quoting it.
    const plan = existing[0].plan;
    const cited = [plan.questionSource?.recordId, ...plan.slots.map((s) => s.source?.recordId)]
      .filter((id): id is string => Boolean(id));
    if (!cited.length) return plan;
    const out = new Set(
      (
        await query<{ record_id: string }>(
          "select record_id::text from record_exclusions where user_id = $1 and record_id = any($2::uuid[])",
          [userId, cited],
        )
      ).map((r) => r.record_id),
    );
    if (!out.size) return plan;
    const { questionSource, ...rest } = plan;
    return {
      ...rest,
      ...(questionSource && !out.has(questionSource.recordId) ? { questionSource } : {}),
      slots: plan.slots.map(({ source, ...slot }) =>
        source && !out.has(source.recordId) ? { ...slot, source } : slot,
      ),
    };
  }

  const [user] = await query<{
    available_minutes_daily: number;
    challenge_opt_in: boolean;
    personalization: boolean;
  }>(
    "select available_minutes_daily, challenge_opt_in, personalization from users where id = $1",
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

  // The person's own recent evenings, minus any they left out. Steps may
  // quote them; attachSources keeps a quote only if it is really theirs.
  // Paused personalization: a sensible plan that draws on nothing personal.
  const learning = user.personalization;
  const words = learning ? await recentWords(userId, 5) : [];

  const plan = await intelligence.generatePlan({
    date,
    summary:
      (learning ? summary?.content : null) ??
      (learning
        ? "New user; model not yet built. Keep the plan generic but sensible."
        : "The person has paused personalization. Use nothing personal; keep the plan generic but sensible."),
    availableMinutes: user.available_minutes_daily,
    activeCampaign: campaign ? `${campaign.title} — ${campaign.mission}` : null,
    recentDebriefs: learning ? extractions : [],
    yesterdayOutcome: learning ? yesterdayOutcome : null,
    reducedLoad,
    recentWords: words,
  });

  // Deterministic guardrails on top of whatever the model produced:
  // confront requires opt-in and no recent distress (spec 04 §2).
  const confrontAllowed = user.challenge_opt_in && !distressRecently;
  const sourced = attachSources(plan as ClaimedPlan, words);
  const finalPlan: DailyPlan = {
    ...sourced,
    slots: sourced.slots.filter((s) => s.slot !== "confront" || confrontAllowed),
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
app.post(
  "/transcribe",
  {
    onRequest: requireAuth,
    preHandler: [requireConsent, modelCallLimit],
    bodyLimit: 26_214_400, // voice notes arrive as base64 JSON
  },
  async (request, reply) => {
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
  },
);

/** Marking a slot done survives restarts; the plan document carries it. */
app.patch("/plan/:date/slot", { onRequest: requireAuth }, async (request, reply) => {
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
app.post("/debrief", { onRequest: requireAuth, preHandler: [requireConsent, modelCallLimit] }, async (request, reply) => {
  const userId = request.userId;
  const body = z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      transcript: z.string().min(1).max(20000),
      // Said from inside a world: the star is born there, by the person's choice.
      world: z.enum(["mind", "body", "soul", "future"]).optional(),
      // One per composed reflection, so a retry never makes a second evening.
      clientKey: z.string().min(8).max(64).optional(),
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

  // 2. Capture the record verbatim. With personalization paused it is left
  // out in the same statement, so no crash can leave it learnable.
  const [record] = await query<{ id: string; paused: boolean }>(
    `with r as (
       insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'reflection', $2, now())
       on conflict (user_id, (payload->>'clientKey'))
         where kind = 'reflection' and payload ? 'clientKey' do nothing
       returning id, user_id
     ), x as (
       insert into record_exclusions (record_id, user_id)
       select r.id, r.user_id from r join users u on u.id = r.user_id
        where not u.personalization
       returning record_id
     )
     select r.id, exists (select 1 from x) as paused from r`,
    [
      userId,
      JSON.stringify({
        date: body.date,
        transcript: body.transcript,
        ...(body.world ? { world: body.world } : {}),
        ...(body.clientKey ? { clientKey: body.clientKey } : {}),
      }),
    ],
  );
  // Nothing inserted with a key: this exact reflection already landed.
  if (!record && body.clientKey) {
    return { crisis: false, reply: "Already kept, word for word." };
  }
  if (!record) return reply.code(500).send({ error: "capture failed" });

  // Paused: keep the words, send nothing further to the model.
  if (record.paused) {
    return {
      crisis: false,
      reply: "Kept, word for word. Learning is paused, so I won't draw on this evening.",
    };
  }

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
