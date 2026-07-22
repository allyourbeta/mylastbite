import { describe, it, expect } from 'vitest'
import {
  buildDayBuckets,
  pickDayLabelInterval,
  selectTickDays,
  describeBucketValue,
  formatBucketLabel,
  type DayBucket,
} from '../src/services/chartSeries'
import type { MealEntry } from '../src/services/stats'

const entry = (day: string, minutes: number | null, isFast = false): MealEntry => ({
  day,
  minutes,
  isFast,
})

const bucket = (day: string, minutes: number | null = null, fastY: number | null = null): DayBucket => ({
  day,
  minutes,
  fastY,
})

describe('buildDayBuckets', () => {
  it('fills gaps between entries with empty buckets', () => {
    const entries = [entry('2026-07-17', 1300), entry('2026-07-19', 1200)]
    const now = new Date(2026, 6, 19)
    const buckets = buildDayBuckets(entries, 'all', now, 1020)
    expect(buckets).toEqual([
      bucket('2026-07-17', 1300),
      bucket('2026-07-18'),
      bucket('2026-07-19', 1200),
    ])
  })

  it('marks a fasting day with fastY and no minutes', () => {
    const entries = [entry('2026-07-17', null, true)]
    const now = new Date(2026, 6, 17)
    const buckets = buildDayBuckets(entries, 'all', now, 1020)
    expect(buckets).toEqual([bucket('2026-07-17', null, 1020)])
  })

  it('starts at the range cutoff when the log predates the range', () => {
    const entries = [entry('2026-01-01', 1300), entry('2026-07-17', 1200)]
    const now = new Date(2026, 6, 17)
    const buckets = buildDayBuckets(entries, '30d', now, 1020)
    expect(buckets[0].day).toBe('2026-06-17')
    expect(buckets[buckets.length - 1].day).toBe('2026-07-17')
    expect(buckets.length).toBe(31)
  })

  it('starts at the earliest entry when the log is younger than the range', () => {
    const entries = [entry('2026-07-15', 1300), entry('2026-07-17', 1200)]
    const now = new Date(2026, 6, 17)
    const buckets = buildDayBuckets(entries, '90d', now, 1020)
    expect(buckets.map((b) => b.day)).toEqual(['2026-07-15', '2026-07-16', '2026-07-17'])
  })

  it('starts at the earliest entry for "all"', () => {
    const entries = [entry('2020-01-01', 1300), entry('2026-07-17', 1200)]
    const now = new Date(2026, 6, 17)
    const buckets = buildDayBuckets(entries, 'all', now, 1020)
    expect(buckets[0].day).toBe('2020-01-01')
    expect(buckets[buckets.length - 1].day).toBe('2026-07-17')
  })

  it('returns a single bucket for today when there are no entries', () => {
    const now = new Date(2026, 6, 17)
    const buckets = buildDayBuckets([], 'all', now, 1020)
    expect(buckets).toEqual([bucket('2026-07-17')])
  })
})

describe('pickDayLabelInterval', () => {
  it('labels every day for a short window', () => {
    expect(pickDayLabelInterval(5)).toBe(1)
  })

  it('spaces labels out for a month-long window', () => {
    expect(pickDayLabelInterval(31)).toBe(7)
  })

  it('caps the interval for a very long window', () => {
    expect(pickDayLabelInterval(4000)).toBe(365)
  })
})

describe('selectTickDays', () => {
  it('always includes the most recent day and thins evenly backward', () => {
    const buckets = Array.from({ length: 10 }, (_, i) => bucket(`2026-07-${String(i + 1).padStart(2, '0')}`))
    const ticks = selectTickDays(buckets)
    expect(ticks).toEqual(['2026-07-02', '2026-07-04', '2026-07-06', '2026-07-08', '2026-07-10'])
  })
})

describe('describeBucketValue', () => {
  it('reports a fasting day', () => {
    expect(describeBucketValue(bucket('2026-07-17', null, 1020))).toBe('Fasted')
  })

  it('reports a logged time', () => {
    expect(describeBucketValue(bucket('2026-07-17', 1260))).toBe('9:00 PM')
  })

  it('reports a day with no entry', () => {
    expect(describeBucketValue(bucket('2026-07-17'))).toBe('No entry logged')
  })
})

describe('formatBucketLabel', () => {
  it('formats a day key as a short date', () => {
    expect(formatBucketLabel('2026-07-17')).toBe('Jul 17')
  })
})
