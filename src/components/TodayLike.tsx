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
    <section className="today-status" aria-label="Today's status">
      <div className="today-status-copy">
        <strong>Today</strong>
        <span className="muted-text"> · {todayStatus(entry)}</span>
      </div>

      <div className="like-action">
        <button
          className={`like-button${liked ? ' is-liked' : ''}`}
          type="button"
          onClick={handleLike}
          disabled={loading || submitting || liked}
          aria-pressed={liked}
          style={{ opacity: loading ? 0.55 : 1 }}
        >
          {liked ? '♥ Liked' : '♡ Like'}
        </button>
        {error && (
          <div className="small-error" role="alert">
            Couldn't save
          </div>
        )}
      </div>
    </section>
  )
}
