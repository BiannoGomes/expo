import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { TAXONOMY_VERSION } from "@lifeos/core";
import { query } from "../db.js";
import { rebuildModelSummary } from "../model/summary.js";

/**
 * The correction loop (spec 02 §6): inspect, dispute, correct.
 * A dispute immediately removes the assertion from the acting summary;
 * a correction outranks all inference and is never silently reverted.
 */
export function registerAssertionRoutes(app: FastifyInstance) {
  app.get("/assertions/:userId", async (request) => {
    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
    const rows = await query<{
      id: string;
      kind: string;
      statement: string;
      domain_ids: string[];
      source: string;
      confidence: string;
      confidence_basis: string;
      status: string;
      evidence_count: string;
      last_confirmed_at: string;
    }>(
      `select a.id, a.kind, a.statement, a.domain_ids, a.source,
              a.confidence, a.confidence_basis, a.status, a.last_confirmed_at,
              count(e.record_id) as evidence_count
         from assertions a
         left join assertion_evidence e on e.assertion_id = a.id
        where a.user_id = $1 and a.status in ('active','disputed')
        group by a.id
        order by a.confidence desc, a.last_confirmed_at desc`,
      [userId],
    );
    return rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      statement: r.statement,
      domainIds: r.domain_ids,
      source: r.source,
      confidence: r.confidence,
      status: r.status,
      // "Why I think this" — the inspectability surface.
      why: `${r.confidence_basis} (${r.evidence_count} supporting records)`,
      lastConfirmedAt: r.last_confirmed_at,
    }));
  });

  app.post("/assertions/:userId/:assertionId/dispute", async (request, reply) => {
    const params = z
      .object({ userId: z.string().uuid(), assertionId: z.string().uuid() })
      .parse(request.params);
    const body = z
      .object({ correction: z.string().max(2000).optional() })
      .parse(request.body ?? {});

    const [assertion] = await query<{ id: string; kind: string; domain_ids: string[]; facet_ids: string[] }>(
      `update assertions set status = 'disputed'
        where id = $1 and user_id = $2 and status = 'active'
        returning id, kind, domain_ids, facet_ids`,
      [params.assertionId, params.userId],
    );
    if (!assertion) return reply.code(404).send({ error: "assertion not found or not active" });

    if (body.correction) {
      // The correction is captured verbatim as a record, and becomes a
      // corrected assertion superseding the disputed one.
      const [record] = await query<{ id: string }>(
        `insert into records (user_id, kind, payload, occurred_at)
         values ($1, 'user_edit', $2, now()) returning id`,
        [
          params.userId,
          JSON.stringify({ disputes: params.assertionId, correction: body.correction }),
        ],
      );
      const [corrected] = await query<{ id: string }>(
        `insert into assertions
           (user_id, kind, statement, domain_ids, facet_ids, source, method,
            confidence, confidence_basis, taxonomy_version)
         values ($1, $2, $3, $4, $5, 'corrected', 'user-correction',
                 'established', 'stated directly by the user as a correction', $6)
         returning id`,
        [
          params.userId, assertion.kind, body.correction,
          assertion.domain_ids, assertion.facet_ids, TAXONOMY_VERSION,
        ],
      );
      if (corrected) {
        await query(
          `update assertions set status = 'superseded', superseded_by = $2 where id = $1`,
          [params.assertionId, corrected.id],
        );
        if (record) {
          await query(
            `insert into assertion_evidence (assertion_id, record_id)
             values ($1, $2) on conflict do nothing`,
            [corrected.id, record.id],
          );
        }
      }
    }

    // Disputed content leaves the acting summary immediately.
    await rebuildModelSummary(params.userId);
    return { ok: true };
  });
}
