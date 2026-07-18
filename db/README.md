# Database

`migration.sql` creates the `meals` table this app reads and writes. Run it once against your Neon database (production, or a dev branch for local work) with `psql "$DATABASE_URL" -f db/migration.sql`.
