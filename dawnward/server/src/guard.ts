import type { FastifyReply, FastifyRequest } from "fastify";
import { query } from "./db.js";

/**
 * Abuse guards without a new dependency (security review 2026-10-31).
 * The limiter is a fixed window per key, held in memory: right for one
 * server process. Behind several instances, move it to Postgres or Redis.
 */
export function rateLimit(opts: {
  name: string;
  limit: number;
  windowMs: number;
  key: (request: FastifyRequest) => string;
}) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return async function limiter(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const now = Date.now();
    if (hits.size > 50_000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    const key = `${opts.name}:${opts.key(request)}`;
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + opts.windowMs });
      return;
    }
    entry.count += 1;
    if (entry.count > opts.limit) {
      reply
        .code(429)
        .header("retry-after", String(Math.ceil((entry.resetAt - now) / 1000)))
        .send({ error: "too many requests, try again shortly" });
    }
  };
}

/** Reflections are Article-9 data: nothing is processed before consent. */
export async function requireConsent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const [row] = await query<{ granted: boolean | null }>(
    `select (consent->'reflections'->>'granted')::boolean as granted from users where id = $1`,
    [request.userId],
  );
  if (!row?.granted) reply.code(403).send({ error: "consent required" });
}

const MINUTE = 60_000;

/** New accounts per address: generous for a household, useless for a farm. */
export const deviceSignupLimit = rateLimit({
  name: "auth-device",
  limit: Number(process.env.RATE_AUTH_PER_MIN ?? 60),
  windowMs: MINUTE,
  key: (r) => r.ip,
});

/** Calls that reach a paid model or transcription, per person. */
export const modelCallLimit = rateLimit({
  name: "model",
  limit: Number(process.env.RATE_MODEL_PER_MIN ?? 30),
  windowMs: MINUTE,
  key: (r) => r.userId,
});
