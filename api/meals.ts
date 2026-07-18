import { sql } from './_db.js'

// Vercel serverless function (spec §3). Public read, no auth — mirrors the
// old anon-key read.
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const daysParam = Array.isArray(req.query?.days) ? req.query.days[0] : req.query?.days
  const days = daysParam ? parseInt(daysParam, 10) : null

  const rows =
    days && Number.isFinite(days)
      ? await sql`
          select day::text as day, minutes, is_fast
          from meals
          where day >= (current_date - ${days}::int * interval '1 day')
          order by day asc
        `
      : await sql`
          select day::text as day, minutes, is_fast
          from meals
          order by day asc
        `

  res.status(200).json(rows)
}
