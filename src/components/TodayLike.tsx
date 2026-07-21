import { useEffect, useMemo, useState } from 'react'
import { fetchLikeStatus, getLikeVisitorId, likeToday } from '../api/likes'
import {
  formatDateKeyInTimeZone,
  formatMinutesAsTime,
  PACIFIC_TIME_ZONE,
} from '../services/dayLogic'
import type { MealEntry } from '../services/stats'

interface TodayLikeProps {
  entries: MealEntry[]
}

function todayStatus(entry: MealEntry | undefined): string {
  if (!entry) return 'Not recorded yet'
  if (entry.isFast) return 'Fasted'
  if (entry.minutes == null) return 'Not recorded yet'
  return formatMinutesAsTime(entry.minutes)
}

export function TodayLike({ entries }: TodayLikeProps) {
  const visitorId = useMemo(() => getLikeVisitorId(), [])
  const fallbackDay = formatDateKeyInTimeZone(new Date(), PACIFIC_TIME_ZONE)
  const [day, setDay] = useState(fallbackDay)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    fetchLikeStatus(visitorId)
      .then((status) => {
        if (!active) return
        setDay(status.day)
        setLiked(status.liked)
      })
      .catch(() => {
        // A failed status check should not solicit attention. The idempotent
        // POST still safely handles a visitor who already liked today.
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [visitorId])

  async function handleLike() {
    if (liked || submitting) return

    setSubmitting(true)
    setError(false)
    try {
      const status = await likeToday(visitorId)
      setDay(status.day)
      setLiked(true)
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const entry = entries.find((item) => item.day === day)

  return (
    <section
      aria-label="Today's status"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 0',
        borderBottom: '1px solid #ececec',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <strong>Today</strong>
        <span style={{ color: '#666' }}> · {todayStatus(entry)}</span>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <button
          type="button"
          onClick={handleLike}
          disabled={loading || submitting || liked}
          aria-pressed={liked}
          style={{
            border: 'none',
            background: 'transparent',
            color: liked ? '#E5199A' : '#333',
            padding: '6px 2px',
            fontWeight: 600,
            opacity: loading ? 0.55 : 1,
          }}
        >
          {liked ? '♥ Liked' : '♡ Like'}
        </button>
        {error && (
          <div role="alert" style={{ fontSize: 12, color: '#B00020' }}>
            Couldn't save
          </div>
        )}
      </div>
    </section>
  )
}
