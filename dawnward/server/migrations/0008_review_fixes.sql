-- Fixes from the database review (2026-10-31).

-- Evidence is looked up by record (evenings, constellation, galaxy, and the
-- delete cascade); the primary key (assertion_id, record_id) cannot serve that.
create index assertion_evidence_record on assertion_evidence (record_id);

-- Finding a reflection's extraction without reading every action_event.
create index records_extraction_of on records (user_id, (payload->>'extractionOf'))
  where kind = 'action_event';

-- Stable keyset paging for Your evenings: (occurred_at, id).
create index records_user_kind_time_id on records (user_id, kind, occurred_at desc, id desc);

-- A superseded assertion must not block deleting the one that replaced it.
alter table assertions drop constraint assertions_superseded_by_fkey;
alter table assertions
  add constraint assertions_superseded_by_fkey
  foreign key (superseded_by) references assertions(id) on delete set null;
create index assertions_superseded_by on assertions (superseded_by) where superseded_by is not null;

-- Read on every plan and on account deletion.
create index safety_events_user_time on safety_events (user_id, created_at desc);
create index future_selves_user on future_selves (user_id);

-- A retried send (timeout, flaky network) must not create a second evening.
-- The app sends one clientKey per composed reflection.
create unique index records_reflection_client_key
  on records (user_id, (payload->>'clientKey'))
  where kind = 'reflection' and payload ? 'clientKey';
