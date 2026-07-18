import { supabase } from './supabaseClient'
import type { MealEntry } from '../services/stats'

interface MealRow {
  day: string
  minutes: number | null
  is_fast: boolean
}

/** Reads all meal rows (anon key, RLS select-only). Fresh network fetch every call. */
export async function fetchMeals(): Promise<MealEntry[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('day, minutes, is_fast')
    .order('day', { ascending: true })

  if (error) throw error

  return (data as MealRow[]).map((row) => ({
    day: row.day,
    minutes: row.minutes,
    isFast: row.is_fast,
  }))
}
