-- "How did it go?" accepts five outcomes, all counting the same (2 Nov 2026 review: adapting,
-- declining and stopping are valid outcomes): did, partly, didnt (kept for older rows), notyet, changed.
-- The note is optional, so a review can be just the outcome.
alter table experiments drop constraint if exists experiments_outcome_check;
alter table experiments add constraint experiments_outcome_check check (outcome in ('did','partly','didnt','notyet','changed'));
