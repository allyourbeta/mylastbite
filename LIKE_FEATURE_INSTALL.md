# Daily Like feature

Unzip this archive into the existing `mylastbite` project root, allowing the listed files to overwrite their older versions.

Then add the new database table to the deployed Neon database:

```bash
psql "$DATABASE_URL" -f db/add_daily_likes.sql
```

Deploy normally to Vercel. No new environment variables or npm packages are required.

Behavior:

- Public page: `Today · <status>` and `♡ Like`; after clicking, it becomes `♥ Liked` for that browser and Pacific calendar day.
- Public users never see like counts.
- Private `/log/<slug>` page: today's count, with a collapsible 14-day history.
- Anonymous identity is a random browser-local UUID. The database primary key enforces one like per browser per day.
