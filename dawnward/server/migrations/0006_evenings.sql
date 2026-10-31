-- Your evenings: leave one out of what Dawnward understands, and bring it
-- back. Records stay immutable; an exclusion is a separate, reversible row.
-- Excluded reflections are skipped by plans, quotes, nightly integration,
-- the weekly review and the constellation. Beliefs whose only evidence is
-- excluded are hidden, not deleted, so bringing the evening back restores them.

create table record_exclusions (
  record_id  uuid primary key references records(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index record_exclusions_user on record_exclusions (user_id);
