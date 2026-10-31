-- Expeditions (hybrid growth adventure, first slice). Additive only: new
-- tables, two new record kinds, one preference column. Every new row belongs
-- to a user and goes with them on account deletion.

-- Mission answers and experiment reviews are the person's words: kept as
-- immutable records like evenings, so they export, delete and can be left out.
alter table records drop constraint records_kind_check;
alter table records add constraint records_kind_check check (kind in (
  'onboarding_response','reflection','action_event',
  'campaign_event','evidence','user_edit',
  'mission_response','experiment_review'));

create table mission_attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  mission_id      text not null,
  mission_version integer not null,
  status          text not null default 'in_progress'
                  check (status in ('in_progress','paused','completed','abandoned')),
  step            integer not null default 0,
  answers         jsonb not null default '{}',
  started_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz
);
-- One open attempt per mission: beginning again resumes it.
create unique index mission_attempts_open on mission_attempts (user_id, mission_id)
  where status in ('in_progress','paused');
create index mission_attempts_user on mission_attempts (user_id, updated_at desc);

create table experiments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  attempt_id  uuid not null references mission_attempts(id) on delete cascade,
  world       text not null,
  action      text not null,
  when_text   text not null,
  status      text not null default 'planned' check (status in ('planned','reviewed')),
  outcome     text check (outcome in ('did','partly','didnt')),
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);
create unique index experiments_attempt on experiments (attempt_id);
create index experiments_user on experiments (user_id, created_at desc);

-- The progress ledger: append-only, one row per thing that happened.
create table progress_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  kind       text not null check (kind in ('mission_completed','experiment_planned','experiment_reviewed','reflection_saved')),
  ref        text not null,
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref)
);

-- What appears in the galaxy, and why. Derived from the ledger by fixed rules.
create table discoveries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  key           text not null,
  cause_kind    text not null,
  cause_ref     text not null,
  discovered_at timestamptz not null default now(),
  unique (user_id, key)
);

-- The game layer can be switched off without losing anything.
alter table users add column game_layer boolean not null default true;
