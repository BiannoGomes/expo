import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { rebuildModelSummary } from "../model/summary.js";
import { requireAuth } from "../auth.js";

/**
 * Your evenings: every reflection in the person's own words, searchable,
 * and any one of them can be left out of what Dawnward understands and
 * brought back. Own records only; another person's id is a 404.
 */
export function registerEveningRoutes(app: FastifyInstance) {
  app.get("/evenings", { preHandler: requireAuth }, async (request) => {
    const { q, before, limit } = z
      .object({
        q: z.string().trim().max(200).optional(),
        before: z.string().datetime({ offset: true }).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(30),
      })
      .parse(request.query);

    const params: unknown[] = [request.userId];
    let filter = "";
    if (q) {
      // Literal search: the person's words, not a pattern language.
      params.push(`%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
      filter += ` and r.payload->>'transcript' ilike $${params.length}`;
    }
    if (before) {
      params.push(before);
      filter += ` and r.occurred_at < $${params.length}`;
    }
    params.push(limit);

    const rows = await query<{
      id: string;
      occurred_at: Date;
      payload: { date?: string; transcript?: string };
      excluded: boolean;
      beliefs: string;
    }>(
      `select r.id, r.occurred_at, r.payload,
              exists (select 1 from record_exclusions x where x.record_id = r.id) as excluded,
              (select count(*) from assertion_evidence e
                 join assertions a on a.id = e.assertion_id
                where e.record_id = r.id and a.status = 'active') as beliefs
         from records r
        where r.user_id = $1 and r.kind = 'reflection'${filter}
        order by r.occurred_at desc
        limit $${params.length}`,
      params,
    );
    return rows.map((r) => ({
      id: r.id,
      date: r.payload.date ?? r.occurred_at.toISOString().slice(0, 10),
      occurredAt: r.occurred_at.toISOString(),
      text: r.payload.transcript ?? "",
      excluded: r.excluded,
      beliefCount: Number(r.beliefs),
    }));
  });

  app.post("/evenings/:id/exclude", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const own = await query(
      "select 1 from records where id = $1 and user_id = $2 and kind = 'reflection'",
      [id, request.userId],
    );
    if (!own.length) return reply.code(404).send({ error: "not found" });
    await query(
      `insert into record_exclusions (record_id, user_id) values ($1, $2)
       on conflict (record_id) do nothing`,
      [id, request.userId],
    );
    await rebuildModelSummary(request.userId);
    return { id, excluded: true };
  });

  app.delete("/evenings/:id/exclude", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const removed = await query(
      "delete from record_exclusions where record_id = $1 and user_id = $2 returning record_id",
      [id, request.userId],
    );
    if (!removed.length) return reply.code(404).send({ error: "not found" });
    await rebuildModelSummary(request.userId);
    return { id, excluded: false };
  });
}
