import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";

/**
 * Model events (roadmap A3/A4): moments the model earned the right to
 * surface. Shown once; marking seen is permanent — nothing nags twice.
 */
export function registerEventRoutes(app: FastifyInstance) {
  app.get("/events/:userId", async (request) => {
    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
    const rows = await query<{
      id: string;
      kind: "promotion" | "weekly_review";
      payload: unknown;
      created_at: string;
    }>(
      `select id, kind, payload, created_at from model_events
        where user_id = $1 and seen_at is null
        order by created_at asc`,
      [userId],
    );
    return rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      payload: r.payload,
      createdAt: r.created_at,
    }));
  });

  app.post("/events/:userId/:eventId/seen", async (request, reply) => {
    const params = z
      .object({ userId: z.string().uuid(), eventId: z.string().uuid() })
      .parse(request.params);
    const [row] = await query<{ id: string }>(
      `update model_events set seen_at = now()
        where id = $1 and user_id = $2 and seen_at is null
        returning id`,
      [params.eventId, params.userId],
    );
    if (!row) return reply.code(404).send({ error: "event not found or already seen" });
    return { ok: true };
  });
}
