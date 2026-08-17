-- BECOMING — initial schema. Implements docs/specs/02-personal-model.md.
-- Records are immutable; assertions are derived and must cite records;
-- deletion of a record propagates into the assertions that cited it.

create extension if not exists pgcrypto;

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  display_name  text,
  timezone      text not null default 'UTC',
  -- Granular consent ledger (spec 04 §3): {category: {granted, at, policy_version}}
  consent       jsonb not null default '{}',
  -- Truth-Mode / challenge opt-in (spec 04 §2)
  challenge_opt_in boolean not null default false,
  available_minutes_daily integer not null default 90,
  created_at    timestamptz not null default now()
);

-- ---------- Records: immutable events ----------

create table records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  kind        text not null check (kind in (
                'onboarding_response','reflection','action_event',
                'campaign_event','evidence','user_edit')),
  payload     jsonb not null,
  occurred_at timestamptz not null,
  created_at  timestamptz not null default now()
);

create index records_user_kind_time on records (user_id, kind, occurred_at desc);

-- Records may be inserted and deleted (user data rights), never updated.
create function forbid_record_update() returns trigger as $$
begin
  raise exception 'records are immutable';
end $$ language plpgsql;

create trigger records_immutable
  before update on records
  for each row execute function forbid_record_update();

-- ---------- Assertions: the Personal Model ----------

create table assertions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  kind              text not null check (kind in (
                      'value','trait','pattern','belief','fear','preference',
                      'capability_level','relationship_fact','bottleneck',
                      'goal_intent','biographical_fact')),
  statement         text not null,
  domain_ids        text[] not null check (cardinality(domain_ids) >= 1),
  facet_ids         text[] not null default '{}',
  source            text not null check (source in ('stated','observed','inferred','corrected')),
  method            text,
  confidence        text not null check (confidence in ('hypothesis','probable','established')),
  confidence_basis  text not null,
  status            text not null default 'active'
                      check (status in ('active','disputed','retracted','superseded')),
  superseded_by     uuid references assertions(id),
  taxonomy_version  text not null,
  created_at        timestamptz not null default now(),
  last_confirmed_at timestamptz not null default now()
);

create index assertions_user_status on assertions (user_id, status);
create index assertions_facets on assertions using gin (facet_ids);

-- Citations: which records support which assertion.
create table assertion_evidence (
  assertion_id uuid not null references assertions(id) on delete cascade,
  record_id    uuid not null references records(id) on delete cascade,
  primary key (assertion_id, record_id)
);

-- Deletion propagation (spec 02 §7): after records are deleted, observed/
-- inferred assertions left with zero citations are removed; single-source
-- survivors demote to hypothesis. Call after any record deletion.
create function prune_orphan_assertions(p_user uuid) returns void as $$
begin
  delete from assertions a
   where a.user_id = p_user
     and a.source in ('observed','inferred')
     and not exists (select 1 from assertion_evidence e where e.assertion_id = a.id);

  update assertions a
     set confidence = 'hypothesis'
   where a.user_id = p_user
     and a.source in ('observed','inferred')
     and a.confidence <> 'hypothesis'
     and (select count(*) from assertion_evidence e where e.assertion_id = a.id) < 2;
end $$ language plpgsql;

-- ---------- People (third-party minimization, spec 04 §4) ----------

create table person_refs (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label   text not null,
  unique (user_id, label)
);

-- ---------- Future Self, campaigns, daily loop ----------

create table future_selves (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  horizon_year integer not null,
  -- Per-domain narrative statements keyed by domain id (spec 01 §3)
  narrative    jsonb not null,
  created_at   timestamptz not null default now()
);

create table campaigns (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references users(id) on delete cascade,
  title              text not null,
  mission            text not null,
  why                text not null,
  primary_domain     text not null,
  secondary_domains  text[] not null default '{}',
  status             text not null default 'draft'
                       check (status in ('draft','active','paused','abandoned','completed')),
  starts_on          date,
  paused_at          timestamptz,
  day14_revision_done boolean not null default false,
  created_at         timestamptz not null default now()
);

create index campaigns_user_status on campaigns (user_id, status);

create table daily_plans (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references users(id) on delete cascade,
  plan_date date not null,
  -- {slots: PlanSlot[], question, restDay}
  plan      jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, plan_date)
);

-- The maintained model summary artifact (spec 02 §5.1). Byte-stable between
-- assertion changes so the LLM prompt prefix caches.
create table model_summaries (
  user_id    uuid primary key references users(id) on delete cascade,
  content    text not null,
  updated_at timestamptz not null default now()
);

-- Minimal safety log (spec 04 §2): level + time only, never content.
create table safety_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  level      text not null check (level in ('distress','crisis')),
  created_at timestamptz not null default now()
);
