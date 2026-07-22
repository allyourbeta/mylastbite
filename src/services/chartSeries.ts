// Pure day-bucket/tick logic for the meal-time chart (spec §7). No React, no database.

import { formatDateKey, formatShortDate, formatMinutesAsTime } from './dayLogic'
import { rangeCutoffDay, type MealEntry, type RangeOption } from './stats'

export interface DayBucket {
  day: string
  /** Last-meal time in minutes-after-midnight. Null on a fasting day or a day with no entry — leaves a gap in the line rather than a flat/interpolated value. */
  minutes: number | null
  /** yDomainMin on a fasting day, else null. Plotted as a separate marker, never joined into the meal-time line. */
  fastY: number | null
}

function addDays(day: string, delta: number): string {
  const date = new Date(`${day}T00:00:00`)
  date.setDate(date.getDate() + delta)
  return formatDateKey(date)
}

/**
 * One bucket per calendar day from the window start through today, so a day
 * with no entry still gets a column (a visible gap) instead of being
 * skipped. The window starts at the range cutoff, or the earliest entry if
 * that's more recent — so a log younger than the selected range doesn't pad
 * out empty days before it existed.
 */
export function buildDayBuckets(
  entries: MealEntry[],
  range: RangeOption,
  now: Date,
  yDomainMin: number,
): DayBucket[] {
  const todayKey = formatDateKey(now)
  const cutoffKey = rangeCutoffDay(range, now)
  const earliestEntryDay = entries.reduce<string | null>(
    (min, e) => (min === null || e.day < min ? e.day : min),
    null,
  )
  const bounds = [cutoffKey, earliestEntryDay].filter((d): d is string => d !== null)
  let start = bounds.length ? bounds.sort().pop()! : todayKey
  if (start > todayKey) start = todayKey

  const byDay = new Map(entries.map((e) => [e.day, e]))
  const buckets: DayBucket[] = []
  for (let day = start; day <= todayKey; day = addDays(day, 1)) {
    const entry = byDay.get(day)
    buckets.push({
      day,
      minutes: entry && !entry.isFast ? entry.minutes : null,
      fastY: entry?.isFast ? yDomainMin : null,
    })
  }
  return buckets
}

const NICE_TICK_INTERVALS = [1, 2, 3, 7, 14, 21, 30, 60, 90, 180, 365]
const TARGET_TICK_COUNT = 6

/** Day-interval between axis labels, chosen so the label count stays roughly constant as the window grows. */
export function pickDayLabelInterval(totalDays: number): number {
  const raw = totalDays / TARGET_TICK_COUNT
  return (
    NICE_TICK_INTERVALS.find((step) => step >= raw) ?? NICE_TICK_INTERVALS[NICE_TICK_INTERVALS.length - 1]
  )
}

/** Which bucket days get an axis label/gridline: today, then every Nth day working backward. */
export function selectTickDays(buckets: DayBucket[]): string[] {
  const interval = pickDayLabelInterval(buckets.length)
  const lastIndex = buckets.length - 1
  return buckets.filter((_, i) => (lastIndex - i) % interval === 0).map((b) => b.day)
}

/** Short axis/tooltip label for a bucket's day, e.g. "Jul 17". */
export function formatBucketLabel(day: string): string {
  return formatShortDate(new Date(`${day}T00:00:00`))
}

/** Tooltip line for a bucket: the logged time, "Fasted", or "No entry logged". */
export function describeBucketValue(bucket: DayBucket): string {
  if (bucket.fastY !== null) return 'Fasted'
  if (bucket.minutes !== null) return formatMinutesAsTime(bucket.minutes)
  return 'No entry logged'
}
