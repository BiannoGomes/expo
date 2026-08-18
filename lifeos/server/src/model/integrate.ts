import {
  TAXONOMY_VERSION,
  domainOfFacet,
  type Assertion,
  type CandidateAssertion,
} from "@lifeos/core";
import { query } from "../db.js";
import { decideConfidence, type EvidenceStats } from "./promotion.js";

/**
 * Nightly integration (spec 02 §4 step 3): merge candidate assertions into
 * the Personal Model. The intelligence layer proposes matches; THIS code
 * persists, links evidence, and decides confidence deterministically.
 * Corrected assertions are untouchable; contradictions dispute, never overwrite.
 */

interface ExtractionRow {
  id: string;
  payload: {
    extractionOf: string;
    candidateAssertions?: CandidateAssertion[];
  };
}

export async function pendingExtractions(userId: string): Promise<ExtractionRow[]> {
  return query<ExtractionRow>(
    `select r.id, r.payload from records r
      where r.user_id = $1 and r.kind = 'action_event'
        and r.payload ? 'extractionOf'
        and not exists (select 1 from record_processing p where p.record_id = r.id)
      order by r.occurred_at`,
    [userId],
  );
}

export async function relatedAssertions(
  userId: string,
  facetIds: string[],
): Promise<Assertion[]> {
  const rows = await query<{
    id: string; kind: Assertion["kind"]; statement: string;
    domain_ids: string[]; facet_ids: string[]; source: Assertion["source"];
    method: string | null; confidence: Assertion["confidence"];
    confidence_basis: string; status: Assertion["status"];
    superseded_by: string | null; taxonomy_version: string;
    created_at: string; last_confirmed_at: string;
  }>(
    `select id, kind, statement, domain_ids, facet_ids, source, method,
            confidence, confidence_basis, status, superseded_by,
            taxonomy_version, created_at, last_confirmed_at
       from assertions
      where user_id = $1 and status in ('active','disputed')
        and facet_ids && $2::text[]`,
    [userId, facetIds],
  );
  return rows.map((r) => ({
    id: r.id,
    userId,
    kind: r.kind,
    statement: r.statement,
    domainIds: r.domain_ids,
    facetIds: r.facet_ids,
    source: r.source,
    method: r.method,
    evidenceRefs: [],
    confidence: r.confidence,
    confidenceBasis: r.confidence_basis,
    status: r.status,
    supersededBy: r.superseded_by,
    taxonomyVersion: r.taxonomy_version,
    createdAt: r.created_at,
    lastConfirmedAt: r.last_confirmed_at,
  }));
}

export async function createHypothesis(
  userId: string,
  candidate: { statement: string; kind: Assertion["kind"]; facetIds: string[] },
  sourceRecordId: string,
  method: string,
  source: "stated" | "inferred" = "inferred",
): Promise<string | null> {
  const domainIds = [
    ...new Set(
      candidate.facetIds
        .map((f) => domainOfFacet(f))
        .filter((d): d is string => Boolean(d)),
    ),
  ];
  if (!domainIds.length) return null; // invalid facets → skip, never guess

  const [row] = await query<{ id: string }>(
    `insert into assertions
       (user_id, kind, statement, domain_ids, facet_ids, source, method,
        confidence, confidence_basis, taxonomy_version)
     values ($1, $2, $3, $4, $5, $6, $7,
             'hypothesis', 'single source', $8)
     returning id`,
    [
      userId, candidate.kind, candidate.statement, domainIds,
      candidate.facetIds, source, method, TAXONOMY_VERSION,
    ],
  );
  if (row) await linkEvidence(row.id, sourceRecordId);
  return row?.id ?? null;
}

export async function linkEvidence(assertionId: string, recordId: string): Promise<void> {
  await query(
    `insert into assertion_evidence (assertion_id, record_id)
     values ($1, $2) on conflict do nothing`,
    [assertionId, recordId],
  );
}

/** Confirm: link evidence, then recompute confidence from actual stats.
 * Returns promotion info so callers can surface "the model visibly learns"
 * (roadmap A3) — a promotion is worth exactly one gentle mention. */
export async function confirmAssertion(
  assertionId: string,
  recordId: string,
): Promise<{ promoted: boolean; statement?: string; basis?: string }> {
  await linkEvidence(assertionId, recordId);
  const [stats] = await query<{
    evidence_count: string;
    distinct_days: string;
    span_days: string;
    source: string;
    status: string;
    confidence: string;
    statement: string;
  }>(
    `select count(distinct e.record_id) as evidence_count,
            count(distinct date(r.occurred_at)) as distinct_days,
            coalesce(extract(day from max(r.occurred_at) - min(r.occurred_at)), 0) as span_days,
            a.source, a.status, a.confidence, a.statement
       from assertions a
       join assertion_evidence e on e.assertion_id = a.id
       join records r on r.id = e.record_id
      where a.id = $1
      group by a.source, a.status, a.confidence, a.statement`,
    [assertionId],
  );
  if (!stats || stats.source === "corrected" || stats.status !== "active") {
    // Corrected assertions only change via user correction (spec 02 §6);
    // disputed ones wait for resolution.
    return { promoted: false };
  }
  const evidence: EvidenceStats = {
    evidenceCount: Number(stats.evidence_count),
    distinctDays: Number(stats.distinct_days),
    spanDays: Number(stats.span_days),
    userConfirmed: false,
  };
  const confidence = decideConfidence(evidence);
  const basis = `${evidence.evidenceCount} records across ${evidence.distinctDays} days (span ${evidence.spanDays}d)`;
  await query(
    `update assertions
        set confidence = $2,
            confidence_basis = $3,
            last_confirmed_at = now()
      where id = $1`,
    [assertionId, confidence, basis],
  );
  return {
    promoted: stats.confidence === "hypothesis" && confidence !== "hypothesis",
    statement: stats.statement,
    basis,
  };
}

/** Contradict: dispute, never overwrite. Corrected assertions are untouchable. */
export async function disputeAssertion(assertionId: string): Promise<void> {
  await query(
    `update assertions set status = 'disputed'
      where id = $1 and status = 'active' and source <> 'corrected'`,
    [assertionId],
  );
}

export async function markProcessed(recordId: string): Promise<void> {
  await query(
    `insert into record_processing (record_id) values ($1) on conflict do nothing`,
    [recordId],
  );
}
