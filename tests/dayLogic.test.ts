import { describe, it, expect } from 'vitest'
import {
  CLAMP_MINUTES,
  isAfterMidnightHour,
  minutesAfterMidnight,
  roundToNearest5,
  formatDateKey,
  previousDateKey,
  resolveLogAttribution,
  clampManualMinutes,
  formatMinutesAsTime,
  minutesToTimeInputValue,
  parseTimeInputValue,
  formatShortDate,
} from '../src/services/dayLogic'

describe('isAfterMidnightHour', () => {
  it('is true for hours 0-3', () => {
    expect(isAfterMidnightHour(0)).toBe(true)
    expect(isAfterMidnightHour(1)).toBe(true)
    expect(isAfterMidnightHour(2)).toBe(true)
    expect(isAfterMidnightHour(3)).toBe(true)
  })

  it('is false from hour 4 onward and all daytime/evening hours', () => {
    expect(isAfterMidnightHour(4)).toBe(false)
    expect(isAfterMidnightHour(12)).toBe(false)
    expect(isAfterMidnightHour(21)).toBe(false)
    expect(isAfterMidnightHour(23)).toBe(false)
  })
})

describe('minutesAfterMidnight', () => {
  it('converts hours/minutes to minutes-after-midnight', () => {
    expect(minutesAfterMidnight(0, 0)).toBe(0)
    expect(minutesAfterMidnight(9, 42)).toBe(582)
    expect(minutesAfterMidnight(23, 59)).toBe(1439)
  })
})

describe('roundToNearest5', () => {
  it('rounds down when closer to the lower multiple of 5', () => {
    expect(roundToNearest5(582)).toBe(580)
  })

  it('rounds up when closer to the upper multiple of 5', () => {
    expect(roundToNearest5(583)).toBe(585)
  })

  it('rounds .5 minutes up', () => {
    expect(roundToNearest5(582.5)).toBe(585)
  })

  it('leaves exact multiples of 5 unchanged', () => {
    expect(roundToNearest5(600)).toBe(600)
  })

  it('caps the result at 23:59 instead of rolling into the next day', () => {
    // 23:58 (1438) rounds up to 1440 (would be 24:00) — must clamp to 1439.
    expect(roundToNearest5(1438)).toBe(1439)
    expect(roundToNearest5(1439)).toBe(1439)
  })
})

describe('formatDateKey / previousDateKey', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(formatDateKey(new Date(2026, 6, 17, 21, 30))).toBe('2026-07-17')
  })

  it('pads single-digit month and day', () => {
    expect(formatDateKey(new Date(2026, 0, 5, 8, 0))).toBe('2026-01-05')
  })

  it('returns the previous calendar date', () => {
    expect(previousDateKey(new Date(2026, 6, 17, 1, 30))).toBe('2026-07-16')
  })

  it('rolls back across a month boundary', () => {
    expect(previousDateKey(new Date(2026, 6, 1, 1, 30))).toBe('2026-06-30')
  })

  it('rolls back across a year boundary', () => {
    expect(previousDateKey(new Date(2026, 0, 1, 1, 30))).toBe('2025-12-31')
  })
})

describe('resolveLogAttribution', () => {
  it('attributes a normal evening time to today, rounded to nearest 5', () => {
    const now = new Date(2026, 6, 17, 21, 42) // 9:42 PM
    const result = resolveLogAttribution(now)
    expect(result.day).toBe('2026-07-17')
    expect(result.minutes).toBe(1300) // 21:40
  })

  it('attributes 00:00 to the previous day, clamped to 23:59', () => {
    const now = new Date(2026, 6, 17, 0, 0)
    const result = resolveLogAttribution(now)
    expect(result.day).toBe('2026-07-16')
    expect(result.minutes).toBe(CLAMP_MINUTES)
  })

  it('attributes 02:30 (inside 00:00-03:59) to the previous day, clamped', () => {
    const now = new Date(2026, 6, 17, 2, 30)
    const result = resolveLogAttribution(now)
    expect(result.day).toBe('2026-07-16')
    expect(result.minutes).toBe(1439)
  })

  it('attributes 03:59 (last minute of the window) to the previous day, clamped', () => {
    const now = new Date(2026, 6, 17, 3, 59)
    const result = resolveLogAttribution(now)
    expect(result.day).toBe('2026-07-16')
    expect(result.minutes).toBe(1439)
  })

  it('attributes 04:00 (just outside the window) to today, not clamped', () => {
    const now = new Date(2026, 6, 17, 4, 0)
    const result = resolveLogAttribution(now)
    expect(result.day).toBe('2026-07-17')
    expect(result.minutes).toBe(240)
  })

  it('rolls the previous-day attribution back across a month boundary', () => {
    const now = new Date(2026, 6, 1, 1, 0) // July 1st, 1:00 AM
    const result = resolveLogAttribution(now)
    expect(result.day).toBe('2026-06-30')
    expect(result.minutes).toBe(CLAMP_MINUTES)
  })
})

describe('clampManualMinutes', () => {
  it('passes through a normal evening entry unchanged', () => {
    expect(clampManualMinutes(21, 42)).toBe(1302)
  })

  it('clamps a manually-entered after-midnight time to 23:59', () => {
    expect(clampManualMinutes(1, 15)).toBe(CLAMP_MINUTES)
  })

  it('clamps the boundary hour 3:59 to 23:59', () => {
    expect(clampManualMinutes(3, 59)).toBe(CLAMP_MINUTES)
  })

  it('does not clamp hour 4:00', () => {
    expect(clampManualMinutes(4, 0)).toBe(240)
  })

  it('does not clamp midday or evening entries', () => {
    expect(clampManualMinutes(12, 0)).toBe(720)
    expect(clampManualMinutes(23, 59)).toBe(1439)
  })
})

describe('formatMinutesAsTime', () => {
  it('formats an evening time as 12-hour PM', () => {
    expect(formatMinutesAsTime(1302)).toBe('9:42 PM')
  })

  it('formats a morning time as 12-hour AM', () => {
    expect(formatMinutesAsTime(30)).toBe('12:30 AM')
  })

  it('formats noon as 12:00 PM', () => {
    expect(formatMinutesAsTime(720)).toBe('12:00 PM')
  })

  it('formats midnight as 12:00 AM', () => {
    expect(formatMinutesAsTime(0)).toBe('12:00 AM')
  })

  it('formats 23:59 as 11:59 PM', () => {
    expect(formatMinutesAsTime(1439)).toBe('11:59 PM')
  })
})

describe('minutesToTimeInputValue / parseTimeInputValue', () => {
  it('round-trips through an HH:MM string', () => {
    const value = minutesToTimeInputValue(1302)
    expect(value).toBe('21:42')
    expect(parseTimeInputValue(value)).toEqual({ hours: 21, minutes: 42 })
  })

  it('pads single-digit hours and minutes', () => {
    expect(minutesToTimeInputValue(65)).toBe('01:05')
  })
})

describe('formatShortDate', () => {
  it('formats a date as "Mon D"', () => {
    expect(formatShortDate(new Date(2026, 6, 17))).toBe('Jul 17')
  })

  it('does not zero-pad the day', () => {
    expect(formatShortDate(new Date(2026, 0, 5))).toBe('Jan 5')
  })
})
