import { createClient } from '@supabase/supabase-js'

interface LogRequestBody {
  slug: string
  day: string
  minutes: number | null
  is_fast: boolean
}

// Vercel serverless function (spec §6). Writes are only reachable through
// here — the client never holds the service role key.
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

  const { day, minutes, is_fast } = body

  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  )

  const { data, error } = await supabase
    .from('meals')
    .upsert({
      day,
      minutes: is_fast ? null : minutes,
      is_fast,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.status(200).json(data)
}
