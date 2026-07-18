import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../state/store'
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

  useEffect(() => {
    rememberSlug(slug)
    loadEntries()
    verifySlug(slug)
  }, [slug, rememberSlug, loadEntries, verifySlug])

  useEffect(() => {
    if (existing && saved === null) {
      setTimeValue(minutesToTimeInputValue(existing.minutes ?? attribution.minutes))
      setSaved({ minutes: existing.minutes, isFast: existing.isFast })
    }
  }, [existing, saved, attribution.minutes])

  async function handleLog() {
    setSubmitting(true)
    const { hours, minutes } = parseTimeInputValue(timeValue)
    const clamped = clampManualMinutes(hours, minutes)
    await logEntry(slug, attribution.day, clamped, false)
    setTimeValue(minutesToTimeInputValue(clamped))
    setSaved({ minutes: clamped, isFast: false })
    setSubmitting(false)
  }

  async function handleFast() {
    setSubmitting(true)
    await logEntry(slug, attribution.day, null, true)
    setSaved({ minutes: null, isFast: true })
    setSubmitting(false)
  }

  const hasExisting = existing != null || saved != null

  if (authorized === false) {
    return (
      <main
        style={{ padding: 24, maxWidth: 420, margin: '0 auto', width: '100%', textAlign: 'center' }}
      >
        <h1 style={{ fontSize: 20 }}>Not authorized</h1>
        <p>Not authorized — check your link.</p>
      </main>
    )
  }

  return (
    <main
      style={{ padding: 24, maxWidth: 420, margin: '0 auto', width: '100%', textAlign: 'center' }}
    >
      <h1 style={{ fontSize: 20 }}>Log last meal</h1>

      <input
        type="time"
        value={timeValue}
        onChange={(e) => setTimeValue(e.target.value)}
        style={{ fontSize: 32, padding: 12, width: '100%', margin: '24px 0' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={handleLog}
          disabled={submitting}
          style={{
            padding: 14,
            fontSize: 18,
            borderRadius: 8,
            border: 'none',
            background: '#E5199A',
            color: '#fff',
          }}
        >
          {hasExisting ? 'Update' : 'Log last meal'}
        </button>
        <button
          onClick={handleFast}
          disabled={submitting}
          style={{
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: '1px solid #E5199A',
            background: '#fff',
            color: '#E5199A',
          }}
        >
          Fasted today
        </button>
      </div>

      {saved && (
        <p style={{ marginTop: 24 }}>
          {saved.isFast
            ? 'Logged: Fasted today'
            : `Logged: ${formatMinutesAsTime(saved.minutes as number)}`}
        </p>
      )}
    </main>
  )
}
