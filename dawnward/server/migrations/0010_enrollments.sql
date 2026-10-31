-- Following an expedition (owner decision 2026-10-31: the Daily Compass is
-- built around the journey a person chooses). Additive only. One row per
-- person and expedition; stopping deletes the row. Goes with the account.
create table enrollments (
  user_id     uuid not null references users(id) on delete cascade,
  system_id   text not null,
  started_at  timestamptz not null default now(),
  primary key (user_id, system_id)
);
