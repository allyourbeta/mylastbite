import { describe, it, expect } from 'vitest'
import { isSlugAuthorized } from '../src/services/verifySlug'

describe('isSlugAuthorized', () => {
  it('accepts a matching slug', () => {
    expect(isSlugAuthorized('abc123', 'abc123')).toBe(true)
  })

  it('rejects a mismatched slug', () => {
    expect(isSlugAuthorized('abc123', 'other')).toBe(false)
  })

  it('rejects when the expected slug (env var) is unset', () => {
    expect(isSlugAuthorized('abc123', undefined)).toBe(false)
  })

  it('rejects an empty expected slug', () => {
    expect(isSlugAuthorized('abc123', '')).toBe(false)
  })

  it('rejects an empty slug', () => {
    expect(isSlugAuthorized('', 'abc123')).toBe(false)
  })

  it('rejects a non-string slug', () => {
    expect(isSlugAuthorized(undefined, 'abc123')).toBe(false)
    expect(isSlugAuthorized(null, 'abc123')).toBe(false)
    expect(isSlugAuthorized(123, 'abc123')).toBe(false)
  })

  it('rejects when both are empty', () => {
    expect(isSlugAuthorized('', '')).toBe(false)
  })
})
