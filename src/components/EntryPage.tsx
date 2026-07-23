import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../state/store'
import { navigate } from '../navigation'
import { fetchDailyLikeCounts, LikesUnauthorizedError } from '../api/likes'
import type { DailyLikeCount } from '../api/likes'
import { PrivateLikeCounts } from './PrivateLikeCounts'
import {
  resolveLogAttribution,
  clampManualMinutes,
  parseTimeInputValue,
  minutesToTimeInputValue,
  formatMinutesAsTime,
} from '../services/dayLogic'

interface EntryPageProps {
  slug: string
}

interface SavedValue {
  minutes: number | null
  isFast: boolean
}

export function EntryPage({ slug }: EntryPageProps) {
  const entries = useAppStore((s) => s.entries)
  const authorized = useAppStore((s) => s.authorized)
  const loadEntries = useAppStore((s) => s.loadEntries)
  const logEntry = useAppStore((s) => s.logEntry)
  const rememberSlug = useAppStore((s) => s.rememberSlug)
  const verifySlug = useAppStore((s) => s.verifySlug)

  const attribution = useMemo(() => resolveLogAttribution(new Date()), [])
  const existing = entries.find((e) => e.day === attribution.day)

  const [timeValue, setTimeValue] = useState(
    minutesToTimeInputValue(existing?.minutes ?? attribution.minutes),
  )
  const [saved, setSaved] = useState<SavedValue | null>(
    existing ? { minutes: existing.minutes, isFast: existing.isFast } : null,
  )
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [likeCounts, setLikeCounts] = useState<DailyLikeCount[]>([])
  const [likeCountsLoading, setLikeCountsLoading] = useState(true)
  const [likeCountsError, setLikeCountsError] = useState(false)

  useEffect(() => {
    rememberSlug(slug)
    loadEntries()
    verifySlug(slug)
  }, [slug, rememberSlug, loadEntries, verifySlug])

  useEffect(() => {
    if (authorized !== true) return

    let active = true
    setLikeCountsLoading(true)
    setLikeCountsError(false)

    fetchDailyLikeCounts(slug)
      .then((counts) => {
        if (active) setLikeCounts(counts)
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof LikesUnauthorizedError) {
          return
        }
        setLikeCountsError(true)
      })
      .finally(() => {
        if (active) setLikeCountsLoading(false)
      })

    return () => {
      active = false
    }
  }, [authorized, slug])

  useEffect(() => {
    if (existing && saved === null) {
      setTimeValue(minutesToTimeInputValue(existing.minutes ?? attribution.minutes))
      setSaved({ minutes: existing.minutes, isFast: existing.isFast })
    }
  }, [existing, saved, attribution.minutes])

  async function handleLog() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const { hours, minutes } = parseTimeInputValue(timeValue)
      const clamped = clampManualMinutes(hours, minutes)
      await logEntry(slug, attribution.day, clamped, false)
      setTimeValue(minutesToTimeInputValue(clamped))
      setSaved({ minutes: clamped, isFast: false })
    } catch {
      setSubmitError('Saving failed — check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFast() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await logEntry(slug, attribution.day, null, true)
      setSaved({ minutes: null, isFast: true })
    } catch {
      setSubmitError('Saving failed — check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const hasExisting = existing != null || saved != null

  if (authorized === false) {
    return (
      <div className="app-page">
        <main className="app-shell entry-shell">
          <h1 className="page-title">Not authorized</h1>
          <p>Not authorized — check your link.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app-page">
      <main className="app-shell entry-shell">
        <h1 className="page-title">Log last meal</h1>

        <input
          className="entry-time"
          type="time"
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
        />

        <div className="entry-actions">
          <button
            className="primary-button"
            onClick={handleLog}
            disabled={submitting}
          >
            {hasExisting ? 'Update' : 'Log last meal'}
          </button>
          <button
            className="secondary-button"
            onClick={handleFast}
            disabled={submitting}
          >
            Fasted today
          </button>
        </div>

        {submitError && (
          <p className="status-message error-message" role="alert">
            {submitError}
          </p>
        )}

        {saved && (
          <p className="status-message">
            {saved.isFast
              ? 'Logged: Fasted today'
              : `Logged: ${formatMinutesAsTime(saved.minutes as number)}`}
          </p>
        )}

        {authorized === true && (
          <PrivateLikeCounts
            counts={likeCounts}
            loading={likeCountsLoading}
            error={likeCountsError}
          />
        )}

        <p className="page-link-row">
          <a
            className="page-link"
            href="/"
            onClick={(e) => {
              e.preventDefault()
              navigate('/')
            }}
          >
            View graph →
          </a>
        </p>
      </main>
    </div>
  )
}
