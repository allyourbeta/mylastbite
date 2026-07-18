import type { RangeOption } from '../services/stats'

const OPTIONS: { value: RangeOption; label: string }[] = [
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'all', label: 'All' },
]

interface RangeToggleProps {
  value: RangeOption
  onChange: (range: RangeOption) => void
}

export function RangeToggle({ value, onChange }: RangeToggleProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '6px 14px',
            borderRadius: 999,
            border: '1px solid #E5199A',
            background: value === opt.value ? '#E5199A' : '#fff',
            color: value === opt.value ? '#fff' : '#E5199A',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
