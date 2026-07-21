# Database

`migration.sql` creates the `meals` and `daily_likes` tables this app reads and writes. Run it once against your Neon database (production, or a dev branch for local work) with `psql "$DATABASE_URL" -f db/migration.sql`.


For an existing deployment that already has the `meals` table, you can run only the new feature migration: `psql "$DATABASE_URL" -f db/add_daily_likes.sql`.
