import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { MealEntry, RangeOption } from '../services/stats'
import { GOAL_MINUTES, CHART_Y_MAX, CHART_Y_TICKS, computeChartYDomainMin } from '../services/stats'
import { formatMinutesAsTime } from '../services/dayLogic'
import {
  buildDayBuckets,
  selectTickDays,
  describeBucketValue,
  formatBucketLabel,
  type DayBucket,
} from '../services/chartSeries'

interface MealChartProps {
  entries: MealEntry[]
  range: RangeOption
  now: Date
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ payload: DayBucket }>
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const bucket = payload[0].payload
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ececec',
        borderRadius: 6,
        padding: '6px 10px',
        fontSize: 13,
      }}
    >
      <div style={{ color: '#666' }}>{formatBucketLabel(bucket.day)}</div>
      <div>{describeBucketValue(bucket)}</div>
    </div>
  )
}

export function MealChart({ entries, range, now }: MealChartProps) {
  const yDomainMin = computeChartYDomainMin(entries)
  const buckets = buildDayBuckets(entries, range, now, yDomainMin)
  const tickDays = selectTickDays(buckets)

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={buckets} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" ticks={tickDays} tickFormatter={formatBucketLabel} />
        <YAxis
          type="number"
          domain={[yDomainMin, CHART_Y_MAX]}
          ticks={CHART_Y_TICKS}
          tickFormatter={(m) => formatMinutesAsTime(m).replace(':00', '')}
        />
        <Tooltip content={<ChartTooltip />} />
        <ReferenceLine y={GOAL_MINUTES} stroke="#1A1AE6" strokeDasharray="4 4" />
        <Line
          dataKey="minutes"
          stroke="#F2A9D6"
          strokeWidth={1.5}
          dot={{ r: 5, fill: '#E5199A', stroke: '#fff', strokeWidth: 1 }}
          activeDot={{ r: 6 }}
          connectNulls={false}
          isAnimationActive={false}
        />
        <Scatter dataKey="fastY" fill="#FFD1EC" shape="diamond" isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
