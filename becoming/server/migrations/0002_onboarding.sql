-- Onboarding conversation state (spec 03 §5). Chapters are self-paced;
-- messages within the active chapter are held here until the chapter
-- completes, at which point the transcript becomes an immutable record.

create table onboarding_state (
  user_id        uuid primary key references users(id) on delete cascade,
  chapter_index  integer not null default 0,
  -- [{role: "user"|"assistant", text}] for the ACTIVE chapter only
  messages       jsonb not null default '[]',
  horizon_year   integer,
  completed_at   timestamptz,
  updated_at     timestamptz not null default now()
);

-- Bottleneck hypotheses and campaign synthesis land in existing tables
-- (assertions, campaigns, future_selves); no new tables needed for them.

-- Records are immutable (0001 trigger), so pipeline progress is tracked
-- beside them, never on them.
create table record_processing (
  record_id    uuid primary key references records(id) on delete cascade,
  processed_at timestamptz not null default now()
);
