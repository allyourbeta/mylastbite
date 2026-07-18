import { neon } from '@neondatabase/serverless'

// Shared Neon client for api/meals.ts and api/log.ts (spec §3). Underscore
// prefix keeps Vercel from exposing this file as a route.
export const sql = neon(process.env.DATABASE_URL as string)
