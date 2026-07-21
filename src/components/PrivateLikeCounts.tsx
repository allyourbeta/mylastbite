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
  if (loading) {
    return <p style={{ marginTop: 28, color: '#666' }}>Loading likes…</p>
  }

  if (error) {
    return <p style={{ marginTop: 28, color: '#B00020' }}>Couldn't load likes.</p>
  }

  const todayCount = counts[0]?.count ?? 0

  return (
    <details
      style={{
        marginTop: 28,
        padding: '12px 0',
        borderTop: '1px solid #ececec',
        borderBottom: '1px solid #ececec',
        textAlign: 'left',
      }}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>♥ {likeLabel(todayCount)}</summary>
      <div style={{ marginTop: 12 }}>
        {counts.slice(1).map((item, index) => (
          <div
            key={item.day}
            style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}
          >
            <span style={{ color: '#666' }}>
              {index === 0 ? 'Yesterday' : formatShortDate(dateFromKey(item.day))}
            </span>
            <span>{item.count}</span>
          </div>
        ))}
      </div>
    </details>
  )
}
