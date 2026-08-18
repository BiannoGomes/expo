import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { query } from "./db.js";

/**
 * Device auth (roadmap B1). An account begins as an anonymous device token —
 * the least data we can possibly hold. Email attaches later via magic-codes.
 * Tokens are 32 random bytes, stored as sha256; every protected route reads
 * the bearer token and scopes to its user. No cookies, no sessions to expire
 * server-side; revocation = delete the row.
 */

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    reply.code(401).send({ error: "sign in first" });
    return;
  }
  const [row] = await query<{ user_id: string }>(
    `update device_tokens set last_used_at = now()
      where token_hash = $1 returning user_id`,
    [hashToken(token)],
  );
  if (!row) {
    reply.code(401).send({ error: "sign in first" });
    return;
  }
  request.userId = row.user_id;
}

export function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/device", async (request) => {
    const body = z
      .object({ deviceName: z.string().max(120).optional() })
      .parse(request.body ?? {});
    const [user] = await query<{ id: string }>(
      "insert into users default values returning id",
    );
    const token = randomBytes(32).toString("base64url");
    await query(
      `insert into device_tokens (user_id, token_hash, device_name)
       values ($1, $2, $3)`,
      [user?.id, hashToken(token), body.deviceName ?? null],
    );
    return { token, userId: user?.id };
  });
}
