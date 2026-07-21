create table if not exists meals (
  day date primary key,
  minutes smallint check (minutes between 0 and 1439),
  is_fast boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists daily_likes (
  day date not null,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (day, visitor_id)
);

