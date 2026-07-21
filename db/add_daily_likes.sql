-- Run this once on an existing mylastbite database when adding the Like feature.
create table if not exists daily_likes (
  day date not null,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (day, visitor_id)
);
