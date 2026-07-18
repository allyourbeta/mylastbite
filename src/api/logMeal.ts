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

/** POSTs a day's meal entry to the write endpoint (spec §6). Upserts; overwrites any existing value for that day. */
export async function logMeal(
  day: string,
  minutes: number | null,
  isFast: boolean,
): Promise<LogMealResult> {
  const response = await fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: import.meta.env.VITE_LOG_SLUG,
      day,
      minutes,
      is_fast: isFast,
    }),
  })

  if (!response.ok) {
    throw new Error(`logMeal failed: ${response.status}`)
  }

  const row = (await response.json()) as LogResponseRow
  return { day: row.day, minutes: row.minutes, isFast: row.is_fast }
}
