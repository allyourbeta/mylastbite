import { sql } from './_db'
import { validateLog } from '../src/services/validateLog'

interface LogRequestBody {
  slug: string
  day: string
  minutes: number | null
  is_fast: boolean
}

// Vercel serverless function (spec §3). Writes are only reachable through
// here — the client never holds a database credential.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body: LogRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

  if (!body || body.slug !== process.env.LOG_SLUG) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const validation = validateLog(body)
  if (!validation.valid) {
    res.status(400).json({ error: validation.error })
    return
  }

  const rows = await sql`
    insert into meals (day, minutes, is_fast, updated_at)
    values (${body.day}, ${validation.minutes}, ${body.is_fast}, now())
    on conflict (day) do update
      set minutes = excluded.minutes,
          is_fast = excluded.is_fast,
          updated_at = excluded.updated_at
    returning day::text as day, minutes, is_fast
  `

  res.status(200).json(rows[0])
}
