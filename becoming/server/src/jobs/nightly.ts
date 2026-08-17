import { query, pool } from "../db.js";
import { intelligence } from "../intelligence/anthropic.js";
import {
  confirmAssertion,
  createHypothesis,
  disputeAssertion,
  markProcessed,
  pendingExtractions,
  relatedAssertions,
} from "../model/integrate.js";
import { DECAY_AFTER_DAYS } from "../model/promotion.js";
import { rebuildModelSummary } from "../model/summary.js";

/**
 * The nightly pass (spec 02 §4 step 3): integration → decay → prune →
 * summary rebuild. Run via `npm run nightly` (cron / scheduler in deployment).
 * Emits at most quiet bookkeeping — user-notable change surfacing is a
 * follow-up (morning plan reads the updated summary).
 */
async function runNightly() {
  const users = await query<{ id: string }>("select id from users");
  for (const user of users) {
    try {
      await integrateUser(user.id);
      await decayUser(user.id);
      await query("select prune_orphan_assertions($1)", [user.id]);
      await rebuildModelSummary(user.id);
      console.log(`nightly: ${user.id} done`);
    } catch (err) {
      // One user's failure never blocks the rest; their records stay pending.
      console.error(`nightly: ${user.id} failed`, err);
    }
  }
  await pool.end();
}

async function integrateUser(userId: string) {
  const extractions = await pendingExtractions(userId);
  for (const extraction of extractions) {
    const candidates = extraction.payload.candidateAssertions ?? [];
    const sourceRecordId = extraction.payload.extractionOf;
    if (!candidates.length) {
      await markProcessed(extraction.id);
      continue;
    }

    const facetIds = [...new Set(candidates.flatMap((c) => c.facetIds ?? []))];
    const related = await relatedAssertions(userId, facetIds);
    const proposals = await intelligence.integrateCandidates({
      candidates,
      related,
    });

    for (const [i, proposal] of proposals.entries()) {
      const candidate = candidates[i];
      switch (proposal.action) {
        case "create":
          if (candidate) {
            await createHypothesis(
              userId,
              {
                statement: proposal.statement ?? candidate.statement,
                kind: (proposal.kind as never) ?? candidate.kind,
                facetIds: proposal.facetIds ?? candidate.facetIds ?? [],
              },
              sourceRecordId,
              "nightly-integration",
            );
          }
          break;
        case "confirm":
          if (proposal.targetAssertionId) {
            await confirmAssertion(proposal.targetAssertionId, sourceRecordId);
          }
          break;
        case "contradict":
          if (proposal.targetAssertionId) {
            await disputeAssertion(proposal.targetAssertionId);
          }
          break;
      }
    }
    await markProcessed(extraction.id);
  }
}

/** Decay (spec 02 §2): stale decayable assertions demote one level. */
async function decayUser(userId: string) {
  await query(
    `update assertions
        set confidence = case confidence
                           when 'established' then 'probable'
                           else 'hypothesis'
                         end,
            confidence_basis = confidence_basis || '; decayed after ' || $2 || ' days without reconfirmation'
      where user_id = $1
        and status = 'active'
        and source <> 'corrected'
        and kind in ('pattern','bottleneck','capability_level')
        and confidence <> 'hypothesis'
        and last_confirmed_at < now() - ($2 || ' days')::interval`,
    [userId, String(DECAY_AFTER_DAYS)],
  );
}

runNightly().catch((err) => {
  console.error(err);
  process.exit(1);
});
