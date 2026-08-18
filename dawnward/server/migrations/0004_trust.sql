-- Phase B: trust infrastructure (roadmap B1–B3).

-- Accounts start anonymous on a device; email attaches later via magic-codes
-- (owner checklist item 4). Tokens are stored hashed — a leaked database
-- never yields a usable credential.
alter table users alter column email drop not null;

create table device_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  token_hash   text not null unique,
  device_name  text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

create index device_tokens_user on device_tokens (user_id);

-- Presence controls (spec 03 §2): two user-scheduled touchpoints, a weekly
-- digest opt-in, and nothing else. Stored as explicit preferences.
alter table users add column touchpoints jsonb not null default
  '{"morning": "07:30", "evening": "21:00", "weeklyDigest": false}';
