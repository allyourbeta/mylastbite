// Pure stats/range logic for the graph page (spec §7). No React, no supabase.

import { formatDateKey } from './dayLogic'

export interface MealEntry {
  day: string
  minutes: number | null
  isFast: boolean
}

/** 21:00 (9:00 PM), the goal line from spec §7. */
export const GOAL_MINUTES = 21 * 60

export type RangeOption = '30d' | '90d' | 'all'

/** Filters entries to those on or after (now - range days). 'all' passes through. */
export function filterEntriesByRange(
  entries: MealEntry[],
  range: RangeOption,
  now: Date,
): MealEntry[] {
  if (range === 'all') return entries
  const days = range === '30d' ? 30 : 90
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffKey = formatDateKey(cutoff)
  return entries.filter((e) => e.day >= cutoffKey)
}

/** Median last-meal time (minutes-after-midnight) across entries with a logged time. Fasting/missing days are excluded. */
export function medianMinutes(entries: MealEntry[]): number | null {
  const values = entries
    .filter((e) => !e.isFast && e.minutes != null)
    .map((e) => e.minutes as number)
    .sort((a, b) => a - b)

  if (values.length === 0) return null

  const mid = Math.floor(values.length / 2)
  if (values.length % 2 === 0) {
    return (values[mid - 1] + values[mid]) / 2
  }
  return values[mid]
}

/** Count of days with a last-meal time at or before the goal. Fasting/missing days are excluded. */
export function countDaysAtOrBeforeGoal(
  entries: MealEntry[],
  goalMinutes: number = GOAL_MINUTES,
): number {
  return entries.filter((e) => !e.isFast && e.minutes != null && e.minutes <= goalMinutes).length
}

/** Chart Y axis: 24:00 (midnight), the fixed top of the plot (spec §7). */
export const CHART_Y_MAX = 24 * 60

/** Chart Y axis: 17:00 (5 PM), the default bottom of the plot (spec §7). */
export const CHART_Y_DEFAULT_MIN = 17 * 60

/** Hourly tick values from 17:00 through 24:00. */
export const CHART_Y_TICKS = Array.from({ length: 8 }, (_, i) => (17 + i) * 60)

/**
 * The Y axis floor: 17:00, unless a timed entry is earlier, in which case the
 * domain expands downward to include it (spec §7). Fasting markers are also
 * pinned at this value so they sit at the axis floor.
 */
export function computeChartYDomainMin(entries: MealEntry[]): number {
  const timed = entries.filter((e) => !e.isFast && e.minutes != null).map((e) => e.minutes as number)
  if (timed.length === 0) return CHART_Y_DEFAULT_MIN
  return Math.min(CHART_Y_DEFAULT_MIN, ...timed)
}
