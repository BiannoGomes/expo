import type { FastifyInstance } from "fastify";
import { domainOfFacet } from "@dawnward/core";
import { query } from "../db.js";
import { requireAuth } from "../auth.js";

/**
 * The constellation (roadmap C1, design-direction: THE LIVING SKY).
 * Every star is a real recorded moment. Weight comes from what the moment
 * turned out to mean: a record cited by an established belief burns
 * brightest. Nothing decorative is ever added.
 */
const CONFIDENCE_WEIGHT: Record<string, number> = {
  established: 1,
  probable: 0.7,
  hypothesis: 0.45,
};

export function registerConstellationRoutes(app: FastifyInstance) {
  app.get("/constellation", { preHandler: requireAuth }, async (request) => {
    const rows = await query<{
      id: string;
      kind: string;
      occurred_at: string;
      payload: { facetTags?: string[]; chapterId?: string };
      best_confidence: string | null;
      domain_ids: string[] | null;
    }>(
      `select r.id, r.kind, r.occurred_at, r.payload,
              (select a.confidence
                 from assertion_evidence e
                 join assertions a on a.id = e.assertion_id
                where e.record_id = r.id and a.status = 'active'
                order by case a.confidence
                           when 'established' then 0
                           when 'probable' then 1
                           else 2 end
                limit 1) as best_confidence,
              (select a.domain_ids
                 from assertion_evidence e
                 join assertions a on a.id = e.assertion_id
                where e.record_id = r.id and a.status = 'active'
                limit 1) as domain_ids
         from records r
        where r.user_id = $1
          and r.kind in ('reflection','evidence','onboarding_response','campaign_event')
        order by r.occurred_at desc
        limit 72`,
      [request.userId],
    );
    return rows.map((r) => ({
      id: r.id,
      occurredAt: r.occurred_at,
      domain:
        r.domain_ids?.[0] ??
        (r.payload.facetTags?.[0] ? domainOfFacet(r.payload.facetTags[0]) : null) ??
        null,
      weight: CONFIDENCE_WEIGHT[r.best_confidence ?? ""] ?? 0.4,
    }));
  });
}
