# mylastbite

A minimal PWA + public website that tracks the time of your last meal each day and graphs it over time — so late eating becomes visible, and declines.

- `/` — public graph of last-meal times, with a 9 PM goal line and fasting-day markers.
- `/log/<slug>` — a private entry screen for logging today's last meal (or a fast). The slug is a secret shared only via a bookmarked link.

## Local dev

```bash
npm install
cp .env.example .env   # fill in your Supabase project + a generated slug
npm run dev
```

Run the test suite (services layer — day/time logic and stats):

```bash
npm run test
```

## Deploy

1. Create a Supabase project and run `supabase/migration.sql` against it (creates the `meals` table with read-only RLS).
2. Generate a secret slug: `openssl rand -hex 12`. Use the same value for both `VITE_LOG_SLUG` and `LOG_SLUG`.
3. Deploy to Vercel and set the six env vars from `.env.example` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_LOG_SLUG` as client vars; `LOG_SLUG`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` as server-only vars). `api/log.ts` deploys automatically as a Vercel serverless function.
4. Visit `/log/<your-slug>` once on your phone and add it to your home screen — after that, the public `/` page will show a small "Log" button for you (stored locally; nobody else sees it).

## Icons

`public/*.png` are generated from `src/assets/icon.svg` via:

```bash
npm run generate-icons
```
