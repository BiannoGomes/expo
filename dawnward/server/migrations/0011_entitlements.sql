-- Membership (docs/monetisation-plan.md). Additive only. One row per person;
-- no row, or one that has run out, means the free plan. Written only by a
-- payment webhook (not built yet) or by tests. Goes with the account.
create table entitlements (
  user_id       uuid primary key references users(id) on delete cascade,
  plan          text not null check (plan in ('free', 'plus', 'pro')),
  source        text not null check (source in ('apple', 'google', 'stripe', 'grant')),
  active_until  timestamptz,
  updated_at    timestamptz not null default now()
);
