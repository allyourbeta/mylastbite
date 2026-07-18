# SPEC: mylastbite refactor — Supabase → Neon Postgres

Amends SPEC_mylastbite.md. Everything not mentioned here is unchanged (UI, dayLogic, stats, PWA, icon, architecture rules, 300-line limit).

## 1. What changes and why

Supabase is removed entirely. Data moves to Neon Postgres (provisioned via Vercel Marketplace). All database access — reads and writes — happens in Vercel serverless functions. The client ships zero keys.

## 2. Dependencies

- Remove: `@supabase/supabase-js`
- Add: `@neondatabase/serverless` (Neon's HTTP driver, suited to serverless functions)

No other dependency changes.

## 3. Serverless functions (api/ directory, Vercel)

### `api/meals.ts` (new)
- GET. No auth — public read, mirrors the old anon-key read.
- Query params: optional `days` (integer; 30/90; absent = all).
- Returns JSON array: `[{ day: 'YYYY-MM-DD', minutes: number|null, is_fast: boolean }]`, ordered by day ascending.

### `api/log.ts` (rewrite)
- POST. Same contract as before: `{ slug, day, minutes, is_fast }`.
- Rejects with 401 unless `slug === process.env.LOG_SLUG`.
- Upserts one row keyed on `day`.

Both functions share a single db helper `api/_db.ts` (underscore prefix so Vercel does not expose it as a route) that creates the Neon client from `process.env.DATABASE_URL`. Use parameterized queries only.

## 4. Client changes

- `src/api/supabaseRead.ts` → replace with `src/api/meals.ts`: `fetch('/api/meals?days=N')`.
- `src/api/logMeal.ts`: unchanged contract, still POSTs to `/api/log`.
- Delete all supabase client code and env references.

## 5. Schema

`db/migration.sql` (moved from supabase/migration.sql, RLS bits removed):

```sql
create table if not exists meals (
  day date primary key,
  minutes smallint check (minutes between 0 and 1439),
  is_fast boolean not null default false,
  updated_at timestamptz not null default now()
);
```

Constraint note: `is_fast = true` implies `minutes is null`; enforce in api/log.ts (set minutes null when is_fast), not in the schema.

Also write `db/README.md`: one paragraph explaining the migration is run once against Neon with `psql "$DATABASE_URL" -f db/migration.sql`.

Delete the `supabase/` directory.

## 6. Env vars (full new set)

| Var | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | server | Neon connection string (set automatically by Vercel Marketplace integration) |
| `LOG_SLUG` | server | write authorization |
| `VITE_LOG_SLUG` | client | entry-route slug (routing UX only; server check is authoritative) |

Removed: all four SUPABASE_* / VITE_SUPABASE_* vars. Update .env.example accordingly.

## 7. Local development

- `npm run dev` (Vite alone) cannot serve api/ functions. Use `vercel dev` for full-stack local runs. Add a README section covering: `vercel dev` with a `.env.local` containing the three vars, pointing DATABASE_URL at the Neon dev branch or the same database.

## 8. Tests

- dayLogic and stats tests: untouched, must still pass (48/48).
- Add a Vitest suite for the upsert/validation logic in api/log.ts by extracting its pure validation into `services/validateLog.ts` (slug check excluded — that stays in the function; validate day format, minutes range, is_fast/minutes consistency). Test that.

## 9. Acceptance checklist

- [ ] `npm run test` passes (48 original + new validateLog tests)
- [ ] `npm run build` passes; no file over 300 lines
- [ ] Zero occurrences of "supabase" anywhere in the repo (grep proof)
- [ ] Client bundle contains no database credentials (only VITE_LOG_SLUG)
- [ ] api/meals.ts and api/log.ts use parameterized queries via api/_db.ts
