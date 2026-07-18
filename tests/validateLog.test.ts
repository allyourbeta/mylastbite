import { describe, it, expect } from 'vitest'
import { validateLog, type LogInput } from '../src/services/validateLog'

const input = (overrides: Partial<LogInput>): LogInput => ({
  day: '2026-07-17',
  minutes: 1260,
  is_fast: false,
  ...overrides,
})

describe('validateLog', () => {
  it('accepts a valid timed entry', () => {
    const result = validateLog(input({}))
    expect(result).toEqual({ valid: true, error: null, minutes: 1260 })
  })

  it('accepts a valid fast entry and normalizes minutes to null', () => {
    const result = validateLog(input({ is_fast: true, minutes: 500 }))
    expect(result).toEqual({ valid: true, error: null, minutes: null })
  })

  it('accepts a fast entry with minutes already null', () => {
    const result = validateLog(input({ is_fast: true, minutes: null }))
    expect(result.valid).toBe(true)
    expect(result.minutes).toBeNull()
  })

  it('rejects a non-string day', () => {
    const result = validateLog(input({ day: undefined as unknown as string }))
    expect(result.valid).toBe(false)
  })

  it('rejects a malformed day string', () => {
    expect(validateLog(input({ day: '2026-7-17' })).valid).toBe(false)
    expect(validateLog(input({ day: '07-17-2026' })).valid).toBe(false)
    expect(validateLog(input({ day: '2026-13-01' })).valid).toBe(false)
    expect(validateLog(input({ day: '2026-01-32' })).valid).toBe(false)
    expect(validateLog(input({ day: 'not-a-day' })).valid).toBe(false)
  })

  it('accepts boundary day values', () => {
    expect(validateLog(input({ day: '2026-01-01' })).valid).toBe(true)
    expect(validateLog(input({ day: '2026-12-31' })).valid).toBe(true)
  })

  it('rejects a non-boolean is_fast', () => {
    const result = validateLog(input({ is_fast: 'false' as unknown as boolean }))
    expect(result.valid).toBe(false)
  })

  it('rejects minutes below the valid range', () => {
    expect(validateLog(input({ minutes: -1 })).valid).toBe(false)
  })

  it('rejects minutes above the valid range', () => {
    expect(validateLog(input({ minutes: 1440 })).valid).toBe(false)
  })

  it('accepts boundary minutes values', () => {
    expect(validateLog(input({ minutes: 0 })).valid).toBe(true)
    expect(validateLog(input({ minutes: 1439 })).valid).toBe(true)
  })

  it('rejects a non-integer minutes value', () => {
    expect(validateLog(input({ minutes: 12.5 })).valid).toBe(false)
  })

  it('rejects null minutes when not fasting', () => {
    expect(validateLog(input({ minutes: null })).valid).toBe(false)
  })

  it('rejects a non-number minutes value', () => {
    expect(validateLog(input({ minutes: '1260' as unknown as number })).valid).toBe(false)
  })
})
