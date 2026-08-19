import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../auth.js";

/**
 * Consent, preferences, and data rights (roadmap B2–B3, spec 04 §3/§5).
 * Consent is granular, versioned, and recorded; export is complete and
 * self-serve; deletion is total and immediate — the cascade defined in the
 * schema does the erasing, code just asks for it.
 */

export const CONSENT_POLICY_VERSION = "2026-08-18";

export function registerAccountRoutes(app: FastifyInstance) {
  app.get("/me", { preHandler: requireAuth }, async (request) => {
    const [user] = await query<{
      consent: Record<string, unknown>;
      challenge_opt_in: boolean;
      available_minutes_daily: number;
      touchpoints: Record<string, unknown>;
      preferred_name: string | null;
    }>(
      `select consent, challenge_opt_in, available_minutes_daily, touchpoints,
              preferred_name
         from users where id = $1`,
      [request.userId],
    );
    const [onboarding] = await query<{ completed_at: string | null }>(
      "select completed_at from onboarding_state where user_id = $1",
      [request.userId],
    );
    return {
      consent: user?.consent ?? {},
      challengeOptIn: user?.challenge_opt_in ?? false,
      availableMinutesDaily: user?.available_minutes_daily ?? 90,
      touchpoints: user?.touchpoints ?? {},
      preferredName: user?.preferred_name ?? null,
      onboardingComplete: Boolean(onboarding?.completed_at),
    };
  });

  app.patch("/me", { preHandler: requireAuth }, async (request) => {
    const body = z
      .object({
        challengeOptIn: z.boolean().optional(),
        preferredName: z.string().trim().max(40).nullable().optional(),
        availableMinutesDaily: z.number().int().min(15).max(600).optional(),
        touchpoints: z
          .object({
            morning: z.string().regex(/^\d{2}:\d{2}$/),
            evening: z.string().regex(/^\d{2}:\d{2}$/),
            weeklyDigest: z.boolean(),
          })
          .optional(),
      })
      .parse(request.body);
    if (body.challengeOptIn !== undefined) {
      await query("update users set challenge_opt_in = $2 where id = $1", [
        request.userId,
        body.challengeOptIn,
      ]);
    }
    if (body.preferredName !== undefined) {
      // Empty string clears, same as null: no one is forced to be named.
      await query("update users set preferred_name = $2 where id = $1", [
        request.userId,
        body.preferredName || null,
      ]);
    }
    if (body.availableMinutesDaily !== undefined) {
      await query("update users set available_minutes_daily = $2 where id = $1", [
        request.userId,
        body.availableMinutesDaily,
      ]);
    }
    if (body.touchpoints) {
      await query("update users set touchpoints = $2 where id = $1", [
        request.userId,
        JSON.stringify(body.touchpoints),
      ]);
    }
    return { ok: true };
  });

  /** Unbundled Article-9 consent (spec 04 §3): recorded with time + version. */
  app.post("/consent", { preHandler: requireAuth }, async (request) => {
    const body = z
      .object({
        reflections: z.boolean(),
        challengeOptIn: z.boolean(),
      })
      .parse(request.body);
    await query(
      `update users
          set consent = consent || $2::jsonb,
              challenge_opt_in = $3
        where id = $1`,
      [
        request.userId,
        JSON.stringify({
          reflections: {
            granted: body.reflections,
            at: new Date().toISOString(),
            policyVersion: CONSENT_POLICY_VERSION,
          },
        }),
        body.challengeOptIn,
      ],
    );
    return { ok: true };
  });

  /**
   * The Future Self, re-readable. Onboarding synthesis writes this once and
   * people deserve to return to it — especially on the days it feels far.
   */
  app.get("/future-self", { preHandler: requireAuth }, async (request, reply) => {
    const [row] = await query<{
      horizon_year: number;
      narrative: { domains?: Record<string, string> };
    }>(
      `select horizon_year, narrative from future_selves
        where user_id = $1 order by created_at desc limit 1`,
      [request.userId],
    );
    if (!row) return reply.code(404).send({ error: "not written yet" });
    return {
      horizonYear: row.horizon_year,
      domains: row.narrative?.domains ?? {},
    };
  });

  /** Complete, self-serve export (spec 04 §5): everything, with provenance. */
  app.get("/export", { preHandler: requireAuth }, async (request) => {
    const userId = request.userId;
    const [user] = await query(
      `select id, email, timezone, consent, challenge_opt_in,
              available_minutes_daily, touchpoints, created_at
         from users where id = $1`,
      [userId],
    );
    const records = await query(
      "select id, kind, payload, occurred_at from records where user_id = $1 order by occurred_at",
      [userId],
    );
    const assertions = await query(
      `select a.*, coalesce(json_agg(e.record_id) filter (where e.record_id is not null), '[]') as evidence_record_ids
         from assertions a
         left join assertion_evidence e on e.assertion_id = a.id
        where a.user_id = $1 group by a.id order by a.created_at`,
      [userId],
    );
    const campaigns = await query(
      "select * from campaigns where user_id = $1 order by created_at",
      [userId],
    );
    const futureSelves = await query(
      "select * from future_selves where user_id = $1 order by created_at",
      [userId],
    );
    const plans = await query(
      "select plan_date, plan from daily_plans where user_id = $1 order by plan_date",
      [userId],
    );
    return {
      exportedAt: new Date().toISOString(),
      format: "dawnward-export-v1",
      user,
      records,
      assertions,
      campaigns,
      futureSelves,
      dailyPlans: plans,
    };
  });

  /** Total deletion (spec 02 §7): one statement; the schema's cascades erase
   * records, assertions, evidence, campaigns, plans, events, and tokens. */
  app.delete("/account", { preHandler: requireAuth }, async (request) => {
    await query("delete from users where id = $1", [request.userId]);
    return { ok: true, gone: true };
  });
}
