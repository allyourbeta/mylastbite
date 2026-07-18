// Pure validation for api/log.ts (spec §8). No React, no database. Slug
// authorization is excluded — that check stays in the serverless function.

export interface LogInput {
  day: string
  minutes: number | null
  is_fast: boolean
}

export interface ValidationResult {
  valid: boolean
  error: string | null
  minutes: number | null
}

const DAY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const MIN_MINUTES = 0
const MAX_MINUTES = 1439

/**
 * Validates day format and minutes/is_fast consistency, normalizing minutes
 * to null when is_fast is true (spec §5 constraint note: is_fast implies
 * minutes is null, enforced here rather than in the schema).
 */
export function validateLog(input: LogInput): ValidationResult {
  if (typeof input?.day !== 'string' || !DAY_PATTERN.test(input.day)) {
    return { valid: false, error: 'Invalid day format, expected YYYY-MM-DD', minutes: null }
  }

  if (typeof input.is_fast !== 'boolean') {
    return { valid: false, error: 'is_fast must be a boolean', minutes: null }
  }

  if (input.is_fast) {
    return { valid: true, error: null, minutes: null }
  }

  if (
    typeof input.minutes !== 'number' ||
    !Number.isInteger(input.minutes) ||
    input.minutes < MIN_MINUTES ||
    input.minutes > MAX_MINUTES
  ) {
    return { valid: false, error: 'minutes must be an integer between 0 and 1439', minutes: null }
  }

  return { valid: true, error: null, minutes: input.minutes }
}
