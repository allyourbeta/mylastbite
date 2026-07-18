import { describe, it, expect } from 'vitest'
import {
  GOAL_MINUTES,
  CHART_Y_DEFAULT_MIN,
  CHART_Y_TICKS,
  filterEntriesByRange,
  medianMinutes,
  countDaysAtOrBeforeGoal,
  computeChartYDomainMin,
  type MealEntry,
} from '../src/services/stats'

const entry = (day: string, minutes: number | null, isFast = false): MealEntry => ({
  day,
  minutes,
  isFast,
})

describe('GOAL_MINUTES', () => {
  it('is 21:00 (9:00 PM)', () => {
    expect(GOAL_MINUTES).toBe(1260)
  })
})

describe('medianMinutes', () => {
  it('returns null when there are no timed entries', () => {
    expect(medianMinutes([])).toBeNull()
    expect(medianMinutes([entry('2026-07-01', null, true)])).toBeNull()
  })

  it('returns the middle value for an odd count', () => {
    const entries = [entry('2026-07-01', 1300), entry('2026-07-02', 1200), entry('2026-07-03', 1400)]
    expect(medianMinutes(entries)).toBe(1300)
  })

  it('averages the two middle values for an even count', () => {
    const entries = [
      entry('2026-07-01', 1200),
      entry('2026-07-02', 1300),
      entry('2026-07-03', 1250),
      entry('2026-07-04', 1350),
    ]
    // sorted: 1200, 1250, 1300, 1350 -> mid avg of 1250/1300
    expect(medianMinutes(entries)).toBe(1275)
  })

  it('excludes fasting days and missing entries', () => {
    const entries = [
      entry('2026-07-01', 1300),
      entry('2026-07-02', null, true),
      entry('2026-07-03', 1200),
    ]
    expect(medianMinutes(entries)).toBe(1250)
  })
})

describe('countDaysAtOrBeforeGoal', () => {
  it('counts days with a last-meal time at or before 9 PM', () => {
    const entries = [
      entry('2026-07-01', 1260), // exactly 9 PM
      entry('2026-07-02', 1200), // before 9 PM
      entry('2026-07-03', 1300), // after 9 PM
    ]
    expect(countDaysAtOrBeforeGoal(entries)).toBe(2)
  })

  it('excludes fasting days and missing entries', () => {
    const entries = [entry('2026-07-01', null, true), entry('2026-07-02', 1000)]
    expect(countDaysAtOrBeforeGoal(entries)).toBe(1)
  })

  it('accepts a custom goal threshold', () => {
    const entries = [entry('2026-07-01', 1100), entry('2026-07-02', 1200)]
    expect(countDaysAtOrBeforeGoal(entries, 1150)).toBe(1)
  })
})

describe('CHART_Y_TICKS', () => {
  it('has hourly ticks from 17:00 through 24:00', () => {
    expect(CHART_Y_TICKS).toEqual([1020, 1080, 1140, 1200, 1260, 1320, 1380, 1440])
  })
})

describe('computeChartYDomainMin', () => {
  it('defaults to 17:00 when there are no timed entries', () => {
    expect(computeChartYDomainMin([])).toBe(CHART_Y_DEFAULT_MIN)
    expect(computeChartYDomainMin([entry('2026-07-01', null, true)])).toBe(CHART_Y_DEFAULT_MIN)
  })

  it('stays at 17:00 when all entries are later than 17:00', () => {
    const entries = [entry('2026-07-01', 1300), entry('2026-07-02', 1100)]
    expect(computeChartYDomainMin(entries)).toBe(CHART_Y_DEFAULT_MIN)
  })

  it('expands downward when an entry is earlier than 17:00', () => {
    const entries = [entry('2026-07-01', 900), entry('2026-07-02', 1300)]
    expect(computeChartYDomainMin(entries)).toBe(900)
  })
})

describe('filterEntriesByRange', () => {
  const now = new Date(2026, 6, 17) // July 17, 2026

  it('returns everything for "all"', () => {
    const entries = [entry('2020-01-01', 1200), entry('2026-07-17', 1300)]
    expect(filterEntriesByRange(entries, 'all', now)).toEqual(entries)
  })

  it('keeps entries within the last 30 days', () => {
    const entries = [
      entry('2026-07-17', 1300), // today
      entry('2026-06-20', 1300), // 27 days ago, in range
      entry('2026-06-01', 1300), // 46 days ago, out of range
    ]
    const result = filterEntriesByRange(entries, '30d', now)
    expect(result.map((e) => e.day)).toEqual(['2026-07-17', '2026-06-20'])
  })

  it('keeps entries within the last 90 days', () => {
    const entries = [
      entry('2026-07-17', 1300),
      entry('2026-05-01', 1300), // 77 days ago, in range
      entry('2026-01-01', 1300), // out of range
    ]
    const result = filterEntriesByRange(entries, '90d', now)
    expect(result.map((e) => e.day)).toEqual(['2026-07-17', '2026-05-01'])
  })
})
