import { sql } from './_db.js'
import { isSlugAuthorized } from '../src/services/verifySlug.js'

const MAX_COUNT_DAYS = 90
const DEFAULT_COUNT_DAYS = 14
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface LikeBody {
  action: 'like'
  visitor_id: string
}

interface CountsBody {
  action: 'counts'
  slug: string
  days?: number
}

function parseBody(req: any): unknown {
  if (typeof req.body !== 'string') return req.body
  try {
    return JSON.parse(req.body)
  } catch {
    return null
  }
}

function validVisitorId(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

function parseDays(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) return DEFAULT_COUNT_DAYS
  return Math.min(Math.max(value, 1), MAX_COUNT_DAYS)
}

async function currentPacificDay(): Promise<string> {
  const rows = await sql`
    select (now() at time zone 'America/Los_Angeles')::date::text as day
  `
  return rows[0].day as string
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    const visitorIdParam = Array.isArray(req.query?.visitor_id)
      ? req.query.visitor_id[0]
      : req.query?.visitor_id

    if (!validVisitorId(visitorIdParam)) {
      res.status(400).json({ error: 'Invalid visitor ID' })
      return
    }

    const day = await currentPacificDay()
    const rows = await sql`
      select exists(
        select 1
        from daily_likes
        where day = ${day}::date
          and visitor_id = ${visitorIdParam}::uuid
      ) as liked
    `

    res.status(200).json({ day, liked: Boolean(rows[0].liked) })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = parseBody(req) as LikeBody | CountsBody | null

  if (body?.action === 'counts') {
    if (!isSlugAuthorized(body.slug, process.env.LOG_SLUG)) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const days = parseDays(body.days)
    const rows = await sql`
      with requested_days as (
        select generate_series(
          (now() at time zone 'America/Los_Angeles')::date - (${days}::int - 1),
          (now() at time zone 'America/Los_Angeles')::date,
          interval '1 day'
        )::date as day
      )
      select requested_days.day::text as day,
             count(daily_likes.visitor_id)::int as count
      from requested_days
      left join daily_likes using (day)
      group by requested_days.day
      order by requested_days.day desc
    `

    res.status(200).json(rows)
    return
  }

  if (body?.action !== 'like' || !validVisitorId(body.visitor_id)) {
    res.status(400).json({ error: 'Invalid request' })
    return
  }

  const rows = await sql`
    insert into daily_likes (day, visitor_id)
    values ((now() at time zone 'America/Los_Angeles')::date, ${body.visitor_id}::uuid)
    on conflict (day, visitor_id) do nothing
    returning day::text as day
  `

  const day = rows[0]?.day ?? (await currentPacificDay())
  res.status(200).json({ day, liked: true })
}
