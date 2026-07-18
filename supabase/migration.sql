create table meals (
  day date primary key,
  minutes smallint,          -- minutes after midnight, 0..1439; null = fasting day
  is_fast boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table meals enable row level security;
create policy "public read" on meals for select using (true);
-- no insert/update policies: writes go through the serverless function with service role key
