import { sql } from './_db.js'
import { validateLog } from '../src/services/validateLog'
import { isSlugAuthorized } from '../src/services/verifySlug'

interface VerifyBody {
  slug: string
  verify: true
}

interface LogBody {
  slug: string
  day: string
  minutes: number | null
  is_fast: boolean
}

type RequestBody = VerifyBody | LogBody

function isVerifyRequest(body: RequestBody): body is VerifyBody {
  return 'verify' in body && body.verify === true
}

// Vercel serverless function. The write secret (LOG_SLUG) is checked only
// here — the client never holds it. A { verify: true } request checks the
// slug without writing, for the entry page's on-load check.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body: RequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

  if (!isSlugAuthorized(body?.slug, process.env.LOG_SLUG)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (isVerifyRequest(body)) {
    res.status(200).json({ ok: true })
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
