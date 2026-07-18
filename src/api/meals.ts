import type { MealEntry } from '../services/stats'

interface MealRow {
  day: string
  minutes: number | null
  is_fast: boolean
}

/** Reads all meal rows from the /api/meals serverless function (spec §4). Fresh network fetch every call. */
export async function fetchMeals(): Promise<MealEntry[]> {
  const response = await fetch('/api/meals')
  if (!response.ok) {
    throw new Error(`fetchMeals failed: ${response.status}`)
  }

  const rows = (await response.json()) as MealRow[]
  return rows.map((row) => ({
    day: row.day,
    minutes: row.minutes,
    isFast: row.is_fast,
  }))
}
