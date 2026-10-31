/**
 * SQL fragments for evenings the person left out (migration 0006).
 * Read-time filters only: nothing is deleted, so "Bring it back" restores
 * every belief and star exactly as it was.
 */

/** True when the record in `column` has not been left out. */
export function notExcluded(column: string): string {
  return `not exists (select 1 from record_exclusions x where x.record_id = ${column})`;
}

/**
 * The confidence a belief has on the evenings still in. An inferred belief
 * resting on fewer than two of them reads as a guess, whatever was stored,
 * so leaving evenings out lowers it and bringing them back restores it.
 */
export function effectiveConfidence(a: string): string {
  return `(case when ${a}.source in ('observed','inferred')
                 and (select count(*) from assertion_evidence ce
                       where ce.assertion_id = ${a}.id and ${notExcluded("ce.record_id")}) < 2
            then 'hypothesis' else ${a}.confidence end)`;
}

/**
 * True when the assertion aliased `a` still rests on at least one evening
 * the person has not left out. Stated and corrected beliefs are the
 * person's own words about themselves and always stay.
 */
export function stillSupported(a: string): string {
  return `(${a}.source in ('stated','corrected')
    or exists (select 1 from assertion_evidence se
                where se.assertion_id = ${a}.id and ${notExcluded("se.record_id")}))`;
}
