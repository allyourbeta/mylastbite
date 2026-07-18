export interface LogMealResult {
  day: string
  minutes: number | null
  isFast: boolean
}

interface LogResponseRow {
  day: string
  minutes: number | null
  is_fast: boolean
}

/** Thrown when the server rejects a slug — a bad link, or one revoked server-side. */
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

async function postLog(body: Record<string, unknown>): Promise<Response> {
  const response = await fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (response.status === 401) {
    throw new UnauthorizedError()
  }
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response
}

/** POSTs a day's meal entry to the write endpoint. Upserts; overwrites any existing value for that day. */
export async function logMeal(
  slug: string,
  day: string,
  minutes: number | null,
  isFast: boolean,
): Promise<LogMealResult> {
  const response = await postLog({ slug, day, minutes, is_fast: isFast })
  const row = (await response.json()) as LogResponseRow
  return { day: row.day, minutes: row.minutes, isFast: row.is_fast }
}

/** Verify-only request: checks the slug server-side without writing (server-verified slug design). */
export async function verifySlug(slug: string): Promise<void> {
  await postLog({ slug, verify: true })
}
