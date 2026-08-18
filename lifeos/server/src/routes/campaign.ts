import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { rebuildModelSummary } from "../model/summary.js";

/**
 * The campaign surface (roadmap A1). One campaign at a time; the day-14
 * revision is shown as a promise; stepping away is a first-class, guilt-free
 * action with an invited (never required) exit reflection.
 */
export function registerCampaignRoutes(app: FastifyInstance) {
  app.get("/campaign/:userId", async (request, reply) => {
    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
    const [campaign] = await query<{
      id: string;
      title: string;
      mission: string;
      why: string;
      primary_domain: string;
      status: string;
      starts_on: string | null;
      day14_revision_done: boolean;
      milestones: { day: number; title: string }[];
      day_number: number | null;
    }>(
      `select id, title, mission, why, primary_domain, status, starts_on,
              day14_revision_done, milestones,
              (current_date - starts_on + 1) as day_number
         from campaigns
        where user_id = $1 and status in ('active','paused')
        order by created_at desc limit 1`,
      [userId],
    );
    if (!campaign) return reply.code(404).send({ error: "no campaign" });
    return {
      id: campaign.id,
      title: campaign.title,
      mission: campaign.mission,
      why: campaign.why,
      primaryDomain: campaign.primary_domain,
      status: campaign.status,
      dayNumber: campaign.day_number,
      day14RevisionDone: campaign.day14_revision_done,
      milestones: campaign.milestones,
    };
  });

  app.post("/campaign/:userId/:campaignId/abandon", async (request, reply) => {
    const params = z
      .object({ userId: z.string().uuid(), campaignId: z.string().uuid() })
      .parse(request.params);
    const body = z
      .object({ reflection: z.string().max(4000).optional() })
      .parse(request.body ?? {});

    const [campaign] = await query<{ id: string; title: string }>(
      `update campaigns set status = 'abandoned'
        where id = $1 and user_id = $2 and status in ('active','paused')
        returning id, title`,
      [params.campaignId, params.userId],
    );
    if (!campaign) return reply.code(404).send({ error: "campaign not found or already closed" });

    if (body.reflection?.trim()) {
      // The exit reflection is a record like any other — it feeds the model.
      await query(
        `insert into records (user_id, kind, payload, occurred_at)
         values ($1, 'reflection', $2, now())`,
        [
          params.userId,
          JSON.stringify({
            context: "campaign-exit",
            campaignId: campaign.id,
            transcript: body.reflection.trim(),
          }),
        ],
      );
    }
    await query(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'campaign_event', $2, now())`,
      [
        params.userId,
        JSON.stringify({ campaignId: campaign.id, event: "abandoned" }),
      ],
    );
    await rebuildModelSummary(params.userId);
    return { ok: true };
  });
}
