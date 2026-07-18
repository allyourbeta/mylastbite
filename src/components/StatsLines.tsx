import { formatMinutesAsTime } from '../services/dayLogic'

interface StatsLinesProps {
  medianMinutes: number | null
  daysAtOrBeforeGoal: number
}

export function StatsLines({ medianMinutes, daysAtOrBeforeGoal }: StatsLinesProps) {
  return (
    <div style={{ fontSize: 14, color: '#1E1E1E', marginTop: 8 }}>
      <p>Median last-meal time: {medianMinutes == null ? '—' : formatMinutesAsTime(medianMinutes)}</p>
      <p>Days ≤ 9 PM: {daysAtOrBeforeGoal}</p>
    </div>
  )
}
