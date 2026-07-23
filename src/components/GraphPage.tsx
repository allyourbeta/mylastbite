import { useEffect } from 'react'
import { useAppStore } from '../state/store'
import { filterEntriesByRange, medianMinutes, countDaysAtOrBeforeGoal } from '../services/stats'
import { MealChart } from './MealChart'
import { RangeToggle } from './RangeToggle'
import { StatsLines } from './StatsLines'
import { TodayLike } from './TodayLike'
import { navigate } from '../navigation'

export function GraphPage() {
  const entries = useAppStore((s) => s.entries)
  const entriesLoading = useAppStore((s) => s.entriesLoading)
  const entriesError = useAppStore((s) => s.entriesError)
  const range = useAppStore((s) => s.range)
  const setRange = useAppStore((s) => s.setRange)
  const loadEntries = useAppStore((s) => s.loadEntries)
  const storedSlug = useAppStore((s) => s.storedSlug)

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const now = new Date()
  const visibleEntries = filterEntriesByRange(entries, range, now)

  return (
    <div className="app-page">
      <main className="app-shell graph-shell">
        <header className="graph-header">
          <h1 className="page-title">mylastbite</h1>
          {storedSlug && (
            <button className="log-button" onClick={() => navigate(`/log/${storedSlug}`)}>
              Log
            </button>
          )}
        </header>

        {!entriesLoading && !entriesError && <TodayLike entries={entries} />}

        <div className="range-row">
          <RangeToggle value={range} onChange={setRange} />
        </div>

        {entriesLoading && <p className="loading-copy">Loading…</p>}
        {entriesError && <p className="error-message">Couldn't load data: {entriesError}</p>}
        {!entriesLoading && !entriesError && (
          <MealChart entries={visibleEntries} range={range} now={now} />
        )}

        <StatsLines
          medianMinutes={medianMinutes(visibleEntries)}
          daysAtOrBeforeGoal={countDaysAtOrBeforeGoal(visibleEntries)}
        />
      </main>
    </div>
  )
}
