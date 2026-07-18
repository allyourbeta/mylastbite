# mylastbite

A minimal PWA + public website that tracks the time of your last meal each day and graphs it over time — so late eating becomes visible, and declines.

- `/` — public graph of last-meal times, with a 9 PM goal line and fasting-day markers.
- `/log/<slug>` — a private entry screen for logging today's last meal (or a fast). The slug is a secret shared only via a bookmarked link; the route itself accepts any slug and only the server (`api/log.ts`, checked against `LOG_SLUG`) decides whether it's authorized.

## Local dev

`npm run dev` (Vite alone) serves the frontend only — it cannot run the `api/` serverless functions. For a full-stack local run, use the Vercel CLI instead:

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and LOG_SLUG
vercel dev
```

Point `DATABASE_URL` at your Neon dev branch (or the same database as production) so `/api/meals` and `/api/log` have something to read and write.

Run the test suite (services layer — day/time logic, stats, and log validation):

```bash
npm run test
```

## Deploy

1. Provision a Neon Postgres database via the Vercel Marketplace integration — this sets `DATABASE_URL` automatically. Run the migration once against it: `psql "$DATABASE_URL" -f db/migration.sql` (see `db/README.md`).
2. Generate a secret slug: `openssl rand -hex 12`. Set it as `LOG_SLUG` — the only place it's checked.
3. Deploy to Vercel and set `DATABASE_URL` and `LOG_SLUG` from `.env.example`, both server-side only. `api/meals.ts` and `api/log.ts` deploy automatically as Vercel serverless functions.
4. Visit `/log/<your-slug>` once on your phone and add it to your home screen — after that, the public `/` page will show a small "Log" button for you (stored locally; nobody else sees it). The entry page verifies the slug against the server on load and shows "Not authorized" if it's wrong.

## Icons

`public/*.png` are generated from `src/assets/icon.svg` via:

```bash
npm run generate-icons
```
