// Pure day/time logic for meal logging (spec §4). No React, no database.

/** Minutes-after-midnight representing 23:59, the after-midnight clamp target. */
export const CLAMP_MINUTES = 1439

/** Hours 0-3 (00:00-03:59) count as "after midnight" for attribution/clamping. */
const AFTER_MIDNIGHT_END_HOUR = 4

export function isAfterMidnightHour(hour: number): boolean {
  return hour >= 0 && hour < AFTER_MIDNIGHT_END_HOUR
}

export function minutesAfterMidnight(hours: number, minutes: number): number {
  return hours * 60 + minutes
}

/** Rounds to the nearest 5 minutes, capped at 23:59 (never rolls into the next day). */
export function roundToNearest5(minutes: number): number {
  const rounded = Math.round(minutes / 5) * 5
  return Math.min(rounded, CLAMP_MINUTES)
}

export const PACIFIC_TIME_ZONE = 'America/Los_Angeles'

/** Calendar date in a named IANA time zone, formatted as YYYY-MM-DD. */
export function formatDateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error(`Unable to format date in time zone: ${timeZone}`)
  }

  return `${year}-${month}-${day}`
}

/** Local calendar date as YYYY-MM-DD. */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function previousDateKey(date: Date): string {
  const prev = new Date(date)
  prev.setDate(prev.getDate() - 1)
  return formatDateKey(prev)
}

export interface LogAttribution {
  day: string
  minutes: number
}

/**
 * Determines which calendar day a "log now" action attributes to, and the
 * default minutes value, from the device clock (spec §4):
 * - 00:00-03:59 -> attributed to the PREVIOUS day, clamped to 23:59.
 * - otherwise -> attributed to today, rounded to the nearest 5 minutes.
 */
export function resolveLogAttribution(now: Date): LogAttribution {
  const hour = now.getHours()
  if (isAfterMidnightHour(hour)) {
    return { day: previousDateKey(now), minutes: CLAMP_MINUTES }
  }
  const raw = minutesAfterMidnight(hour, now.getMinutes())
  return { day: formatDateKey(now), minutes: roundToNearest5(raw) }
}

/**
 * Clamps a manually-entered time (from <input type="time">): any value
 * representing after-midnight (00:00-03:59) resolves to 23:59 (spec §4).
 */
export function clampManualMinutes(hours: number, minutes: number): number {
  if (isAfterMidnightHour(hours)) {
    return CLAMP_MINUTES
  }
  return minutesAfterMidnight(hours, minutes)
}

/** Formats minutes-after-midnight as a 12-hour display string, e.g. 1439 -> "11:59 PM". */
export function formatMinutesAsTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/** Converts minutes-after-midnight to "HH:MM" for an <input type="time"> value. */
export function minutesToTimeInputValue(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Parses an <input type="time"> value "HH:MM" into hours/minutes. */
export function parseTimeInputValue(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(':').map(Number)
  return { hours, minutes }
}

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Formats a date as a short label, e.g. "Jul 17", for chart axis ticks. */
export function formatShortDate(date: Date): string {
  return `${MONTH_ABBR[date.getMonth()]} ${date.getDate()}`
}
