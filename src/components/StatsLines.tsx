import { formatMinutesAsTime } from '../services/dayLogic'

interface StatsLinesProps {
  medianMinutes: number | null
  daysAtOrBeforeGoal: number
}

export function StatsLines({ medianMinutes, daysAtOrBeforeGoal }: StatsLinesProps) {
  return (
    <div className="stats-summary">
      <span>
        <strong>Median:</strong>{' '}
        {medianMinutes == null ? '—' : formatMinutesAsTime(medianMinutes)}
      </span>
      <span>
        <strong>Days ≤ 9 PM:</strong> {daysAtOrBeforeGoal}
      </span>
    </div>
  )
}
