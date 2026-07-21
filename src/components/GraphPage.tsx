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

  const visibleEntries = filterEntriesByRange(entries, range, new Date())

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>mylastbite</h1>
        {storedSlug && (
          <button
            onClick={() => navigate(`/log/${storedSlug}`)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: 'none',
              background: '#E5199A',
              color: '#fff',
            }}
          >
            Log
          </button>
        )}
      </div>

      {!entriesLoading && !entriesError && <TodayLike entries={entries} />}

      <div style={{ margin: '16px 0' }}>
        <RangeToggle value={range} onChange={setRange} />
      </div>

      {entriesLoading && <p>Loading…</p>}
      {entriesError && <p>Couldn't load data: {entriesError}</p>}
      {!entriesLoading && !entriesError && <MealChart entries={visibleEntries} />}

      <StatsLines
        medianMinutes={medianMinutes(visibleEntries)}
        daysAtOrBeforeGoal={countDaysAtOrBeforeGoal(visibleEntries)}
      />
    </main>
  )
}
