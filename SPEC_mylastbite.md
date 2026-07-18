# SPEC: mylastbite

A minimal PWA + public website that tracks the time of the last meal of each day and graphs it over time. Purpose: make late eating visible so it declines.

## 1. Stack

- Vite + React + TypeScript
- Recharts (graph)
- Supabase (Postgres, anon read via RLS)
- Vercel (hosting + serverless function for writes)
- vite-plugin-pwa (manifest, service worker, installability)
- Vitest (unit tests for services layer)

No other dependencies without asking.

## 2. Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | public | Graph of last-meal times |
| `/log/<SLUG>` | secret | Entry page. `<SLUG>` must equal env `VITE_LOG_SLUG`. Wrong slug → redirect to `/`. |

The PWA start_url is `/log/<SLUG>` is NOT possible (slug is secret, manifest is public). Instead: start_url is `/`, and the entry page is reached via a bookmark/home-screen link the owner adds once. Simpler alternative implemented: the entry page, once visited with the correct slug, stores the slug in localStorage; thereafter opening `/` shows a small "Log" button that routes to the entry view using the stored slug. Public visitors without the stored slug never see the button.

## 3. Data model

Supabase table `meals`:

```sql
create table meals (
  day date primary key,
  minutes smallint,          -- minutes after midnight, 0..1439; null = fasting day
  is_fast boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table meals enable row level security;
create policy "public read" on meals for select using (true);
-- no insert/update policies: writes go through the serverless function with service role key
```

One row per day. Re-logging the same day upserts (overwrites). `is_fast = true` ⇒ `minutes` is null.

## 4. Time rules

- All times are device-local. Stored as minutes-after-midnight; no timezones in the data.
- Day = local calendar date, with one exception:
  - If the device clock is between 00:00 and 03:59 at the moment of logging, the entry is attributed to the PREVIOUS calendar date and the time is clamped to 23:59 (1439 minutes). Rationale: a post-midnight log is the tail of yesterday's evening; owner states this will be rare.
- Times entered manually are also clamped: any value representing after-midnight resolves to 23:59.
- Default value in the entry form: current device time, rounded to nearest 5 minutes.

All of this logic lives in `services/dayLogic.ts` as pure functions, fully unit-tested (see §8).

## 5. Entry page (`/log/<SLUG>`)

Single screen, thumb-friendly:

- Large time input (native `<input type="time">`) prefilled per §4.
- Primary button: "Log last meal" → POST `/api/log`.
- Secondary button: "Fasted today" → POST with `is_fast: true`.
- After success: show today's stored value ("Logged: 9:42 PM") and a confirmation state. Re-submitting overwrites.
- If today already has a value on load, show it, with the button reading "Update".

## 6. Write path

Vercel serverless function `api/log.ts`:

- POST body: `{ slug, day, minutes, is_fast }`.
- Rejects unless `slug === process.env.LOG_SLUG` (server-side env, not VITE_-prefixed).
- Upserts into `meals` using `SUPABASE_SERVICE_ROLE_KEY` (server-side env only — never shipped to client).
- Returns the stored row.

Client never holds the service role key. Client reads use `@supabase/supabase-js` with the anon key (RLS: select only).

## 7. Graph page (`/`)

- Recharts ScatterChart.
- X axis: date. Y axis: time of day, domain 17:00–24:00 (5 PM–midnight), ticks hourly. Points outside the domain still render (domain auto-expands if any point is earlier than 5 PM).
- One dot per day.
- Fasting days: distinct marker pinned at the bottom of the plot area (e.g., diamond at the axis floor) — visually a "win".
- Horizontal ReferenceLine at 21:00 (9 PM) labeled "goal", in the icon magenta `#E5199A`.
- Range toggle: 30d / 90d / all. Default 90d.
- Missing days (no entry, no fast) are simply absent — no dot.
- Below the chart: two small stat lines — median last-meal time over the visible range, and count of days ≤ 9 PM.

## 8. Architecture (mandatory)

```
src/
  components/   UI only, no business logic
  state/        Zustand store (entries, range toggle, slug presence)
  services/     pure functions: dayLogic.ts (clamping, day attribution), stats.ts (median, goal count)
  api/          all network calls: supabaseRead.ts, logMeal.ts
api/
  log.ts        Vercel serverless write endpoint
```

- No file over 300 lines.
- Services import neither React nor supabase-js.
- Vitest covers `dayLogic.ts` exhaustively: normal evening time, 00:00–03:59 attribution to previous day, 23:59 clamp, fasting flag, 5-minute rounding. Also `stats.ts`.

## 9. PWA

- vite-plugin-pwa, `registerType: 'autoUpdate'`.
- Manifest: name "mylastbite", short_name "lastbite", display "standalone", theme_color `#E5199A`, background_color `#E5199A`.
- Icons generated from `assets/icon.svg` (provided) via a one-time node script using `sharp` (devDependency):
  - `icon-192.png`, `icon-512.png` (full art)
  - `icon-512-maskable.png` (same art scaled to 78% on the magenta field, `purpose: maskable`)
  - `apple-touch-icon.png` 180px (full art)
- App shell cached; data always network-first (graph must be fresh).

## 10. Visual style

- Follow the icon: white/near-white surfaces, magenta `#E5199A` as the single accent, pale pink `#FFD1EC` for secondary marks. Dark text `#1E1E1E`.
- Minimal chrome. Two screens only. No settings page.

## 11. Env vars

| Var | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | client | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client | anon key (read-only via RLS) |
| `VITE_LOG_SLUG` | client | slug for the entry route (obscurity for routing UX) |
| `LOG_SLUG` | server | authoritative write check in `api/log.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | server | write access |
| `SUPABASE_URL` | server | Supabase project URL for the function |

`VITE_LOG_SLUG` and `LOG_SLUG` hold the same value. Generate once: `openssl rand -hex 12`.

## 12. Acceptance checklist

- [ ] `npm run build` passes; no file over 300 lines
- [ ] `npm run test` passes (dayLogic + stats fully covered)
- [ ] `/` renders graph from Supabase with goal line and fasting markers
- [ ] `/log/<good-slug>` logs and updates today's entry; `/log/<bad-slug>` redirects to `/`
- [ ] Write rejected server-side without correct slug (curl test)
- [ ] Installs as PWA on iPhone with the magenta icon
- [ ] Post-midnight rule verified by unit test, not manually
