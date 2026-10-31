-- Learn from my evenings (on by default). While off, every new reflection is
-- left out automatically (record_exclusions), so Dawnward keeps the words
-- but learns nothing from them, and the morning plan stops quoting or
-- drawing on the personal model. Each paused evening can be brought back
-- one by one from Your evenings.
alter table users add column personalization boolean not null default true;
