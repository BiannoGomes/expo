-- Phase A: campaign surface + the model visibly learning (roadmap.md A1, A3, A4).

alter table campaigns add column milestones jsonb not null default '[]';

-- Moments the model earned the right to surface, shown once, dismissible
-- forever. promotion = an assertion reached 'probable' (spec 02 §2);
-- weekly_review = the deep pass has a verdict worth a reveal.
create table model_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  kind       text not null check (kind in ('promotion','weekly_review')),
  payload    jsonb not null,
  seen_at    timestamptz,
  created_at timestamptz not null default now()
);

create index model_events_unseen on model_events (user_id) where seen_at is null;
