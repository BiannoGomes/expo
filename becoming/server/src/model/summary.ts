import { DOMAIN_IDS, TAXONOMY, type AssertionConfidence } from "@becoming/core";
import { query } from "../db.js";
import { hedgePrefix } from "./promotion.js";

/**
 * The maintained model summary artifact (spec 02 §5.1). Deterministic
 * assembly — no LLM. Only probable+ active assertions appear: the summary is
 * what the system is ALLOWED to act on. Byte-stable between assertion
 * changes so the LLM prompt prefix caches.
 */
export async function rebuildModelSummary(userId: string): Promise<string> {
  const assertions = await query<{
    kind: string;
    statement: string;
    domain_ids: string[];
    confidence: AssertionConfidence;
  }>(
    `select kind, statement, domain_ids, confidence
       from assertions
      where user_id = $1 and status = 'active'
        and confidence in ('probable','established')
      order by kind, created_at`,
    [userId],
  );

  const campaigns = await query<{ title: string; mission: string }>(
    `select title, mission from campaigns
      where user_id = $1 and status = 'active' order by created_at limit 1`,
    [userId],
  );

  const coveredDomains = new Set(assertions.flatMap((a) => a.domain_ids));
  const uncovered = DOMAIN_IDS.filter((d) => !coveredDomains.has(d));

  const byKind = new Map<string, string[]>();
  for (const a of assertions) {
    const line = `${hedgePrefix(a.confidence)}${lowerFirstIfHedged(a.statement, a.confidence)}`;
    const list = byKind.get(a.kind) ?? [];
    list.push(line);
    byKind.set(a.kind, list);
  }

  const sections: string[] = [`PERSONAL MODEL (taxonomy v${TAXONOMY.version})`];
  const kindOrder = [
    "value", "biographical_fact", "trait", "belief", "fear", "preference",
    "goal_intent", "pattern", "capability_level", "relationship_fact", "bottleneck",
  ];
  for (const kind of kindOrder) {
    const lines = byKind.get(kind);
    if (!lines?.length) continue;
    sections.push(`\n${kind.replace("_", " ")}:\n- ${lines.join("\n- ")}`);
  }

  if (campaigns[0]) {
    sections.push(`\nactive campaign: ${campaigns[0].title} — ${campaigns[0].mission}`);
  }
  if (uncovered.length) {
    sections.push(
      `\nunknown domains (no signal — treat as unknown, never as weak): ${uncovered.join(", ")}`,
    );
  }

  const content = sections.join("\n");
  await query(
    `insert into model_summaries (user_id, content, updated_at)
     values ($1, $2, now())
     on conflict (user_id) do update set content = $2, updated_at = now()
     where model_summaries.content is distinct from $2`,
    [userId, content],
  );
  return content;
}

function lowerFirstIfHedged(statement: string, confidence: AssertionConfidence): string {
  if (confidence === "established") return statement;
  return statement.charAt(0).toLowerCase() + statement.slice(1);
}
