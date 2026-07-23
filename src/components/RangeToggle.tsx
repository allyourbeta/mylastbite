import type { RangeOption } from '../services/stats'

const OPTIONS: { value: RangeOption; label: string }[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All' },
]

interface RangeToggleProps {
  value: RangeOption
  onChange: (range: RangeOption) => void
}

export function RangeToggle({ value, onChange }: RangeToggleProps) {
  return (
    <div className="range-toggle" role="group" aria-label="Graph range">
      {OPTIONS.map((opt) => (
        <button
          className={`range-option${value === opt.value ? ' is-selected' : ''}`}
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
