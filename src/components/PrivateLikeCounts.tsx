import { useId, useState } from 'react'
import type { DailyLikeCount } from '../api/likes'
import { formatShortDate } from '../services/dayLogic'

interface PrivateLikeCountsProps {
  counts: DailyLikeCount[]
  loading: boolean
  error: boolean
}

function likeLabel(count: number): string {
  return `${count} ${count === 1 ? 'like' : 'likes'} today`
}

function dateFromKey(day: string): Date {
  return new Date(`${day}T12:00:00`)
}

export function PrivateLikeCounts({ counts, loading, error }: PrivateLikeCountsProps) {
  const [open, setOpen] = useState(false)
  const historyId = useId()

  if (loading) {
    return <p className="status-message">Loading likes…</p>
  }

  if (error) {
    return <p className="status-message error-message">Couldn't load likes.</p>
  }

  const todayCount = counts[0]?.count ?? 0
  const history = counts.slice(1)

  return (
    <section className="likes-disclosure">
      <button
        className="likes-disclosure-button"
        type="button"
        aria-expanded={open}
        aria-controls={historyId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="likes-disclosure-label">♥ {likeLabel(todayCount)}</span>
        <span className={`likes-chevron${open ? ' is-open' : ''}`} aria-hidden="true">
          ⌄
        </span>
      </button>

      {open && (
        <div className="likes-history" id={historyId}>
          {history.map((item, index) => (
            <div className="likes-history-row" key={item.day}>
              <span className="likes-history-date">
                {index === 0 ? 'Yesterday' : formatShortDate(dateFromKey(item.day))}
              </span>
              <span>{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
