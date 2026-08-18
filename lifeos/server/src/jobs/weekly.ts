import type { DebriefExtraction } from "@lifeos/core";
import { TAXONOMY_VERSION } from "@lifeos/core";
import { pool, query } from "../db.js";
import { intelligence } from "../intelligence/index.js";
import { confirmAssertion, linkEvidence } from "../model/integrate.js";
import { rebuildModelSummary } from "../model/summary.js";

/**
 * Weekly deep pass (spec 02 §4 step 4) + campaign day-14 revision
 * (spec 01 §6). The model proposes a verdict; this code applies it with the
 * same discipline as everywhere else: dispute/supersede, never overwrite;
 * corrected assertions untouchable.
 */
export async function runWeekly() {
  const users = await query<{ id: string }>("select id from users");
  for (const user of users) {
    try {
      await reviewUser(user.id);
    } catch (err) {
      console.error(`weekly: ${user.id} failed`, err);
    }
  }
}

async function reviewUser(userId: string) {
  const [campaign] = await query<{
    id: string;
    title: string;
    mission: string;
    started_days_ago: number | null;
    day14_revision_done: boolean;
  }>(
    `select id, title, mission, day14_revision_done,
            (current_date - starts_on) as started_days_ago
       from campaigns
      where user_id = $1 and status = 'active'
      order by created_at limit 1`,
    [userId],
  );

  const extractionRows = await query<{
    id: string;
    payload: DebriefExtraction & { extractionOf: string };
  }>(
    `select id, payload from records
      where user_id = $1 and kind = 'action_event' and payload ? 'extractionOf'
        and occurred_at > now() - interval '14 days'
      order by occurred_at`,
    [userId],
  );

  const day14Due =
    campaign != null &&
    !campaign.day14_revision_done &&
    (campaign.started_days_ago ?? 0) >= 14;

  // Run when the day-14 revision is due, or there was a real week of life.
  if (!day14Due && extractionRows.length < 3) return;

  const [bottleneck] = await query<{
    id: string;
    statement: string;
    confidence_basis: string;
  }>(
    `select id, statement, confidence_basis from assertions
      where user_id = $1 and kind = 'bottleneck' and status = 'active'
      order by created_at desc limit 1`,
    [userId],
  );

  const [summary] = await query<{ content: string }>(
    "select content from model_summaries where user_id = $1",
    [userId],
  );

  const review = await intelligence.deepReview({
    summary: summary?.content ?? "",
    extractions: extractionRows.map((r) => r.payload),
    bottleneck: bottleneck
      ? { assertionId: bottleneck.id, statement: bottleneck.statement, basis: bottleneck.confidence_basis }
      : null,
    campaign: campaign
      ? {
          id: campaign.id,
          title: campaign.title,
          mission: campaign.mission,
          startedDaysAgo: campaign.started_days_ago ?? 0,
        }
      : null,
  });

  const latestReflectionId = extractionRows.at(-1)?.payload.extractionOf;

  if (bottleneck) {
    switch (review.bottleneckVerdict) {
      case "confirmed":
        if (latestReflectionId) {
          await confirmAssertion(bottleneck.id, latestReflectionId);
        }
        break;
      case "revised": {
        if (!review.revisedStatement) break;
        const [revised] = await query<{ id: string }>(
          `insert into assertions
             (user_id, kind, statement, domain_ids, facet_ids, source, method,
              confidence, confidence_basis, taxonomy_version)
           select user_id, 'bottleneck', $2, domain_ids, facet_ids, 'inferred',
                  'weekly-deep-review', 'hypothesis', $3, $4
             from assertions where id = $1
           returning id`,
          [
            bottleneck.id,
            review.revisedStatement,
            `revised at deep review (${review.revisedClassId ?? "unclassified"}): ${review.basis}`,
            TAXONOMY_VERSION,
          ],
        );
        if (revised) {
          await query(
            `update assertions set status = 'superseded', superseded_by = $2
              where id = $1 and source <> 'corrected'`,
            [bottleneck.id, revised.id],
          );
          for (const row of extractionRows) {
            await linkEvidence(revised.id, row.payload.extractionOf);
          }
        }
        break;
      }
      case "rejected":
        await query(
          `update assertions set status = 'retracted'
            where id = $1 and source <> 'corrected'`,
          [bottleneck.id],
        );
        break;
      case "insufficient-data":
        break; // honest non-answer; try again next week
    }
  }

  if (campaign && day14Due) {
    await query(
      "update campaigns set day14_revision_done = true where id = $1",
      [campaign.id],
    );
    await query(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'campaign_event', $2, now())`,
      [
        userId,
        JSON.stringify({
          campaignId: campaign.id,
          event: "day14-revision",
          verdict: review.bottleneckVerdict,
          basis: review.basis,
        }),
      ],
    );
  }

  await rebuildModelSummary(userId);
  console.log(`weekly: ${userId} → ${review.bottleneckVerdict}`);
}

if (process.argv[1]?.endsWith("jobs/weekly.ts")) {
  runWeekly()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
