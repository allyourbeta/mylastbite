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
    <div className="chart-tooltip">
      <div className="chart-tooltip-date">{formatBucketLabel(bucket.day)}</div>
      <div>{describeBucketValue(bucket)}</div>
    </div>
  )
}

export function MealChart({ entries, range, now }: MealChartProps) {
  const yDomainMin = computeChartYDomainMin(entries)
  const buckets = buildDayBuckets(entries, range, now, yDomainMin)
  const tickDays = selectTickDays(buckets)
  const tickStyle = { fill: '#746d72', fontSize: 11 }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={buckets} margin={{ top: 14, right: 12, bottom: 4, left: 2 }}>
        <CartesianGrid stroke="#eadfe5" strokeDasharray="3 4" vertical={false} />
        <XAxis
          dataKey="day"
          ticks={tickDays}
          tickFormatter={formatBucketLabel}
          tick={tickStyle}
          tickLine={false}
          axisLine={{ stroke: '#eadfe5' }}
          minTickGap={16}
        />
        <YAxis
          type="number"
          domain={[yDomainMin, CHART_Y_MAX]}
          ticks={CHART_Y_TICKS}
          tickFormatter={(m) => formatMinutesAsTime(m).replace(':00', '')}
          tick={tickStyle}
          tickLine={false}
          axisLine={false}
          width={34}
        />
        <Tooltip content={<ChartTooltip />} />
        <ReferenceLine y={GOAL_MINUTES} stroke="#1A1AE6" strokeDasharray="4 4" />
        <Line
          dataKey="minutes"
          stroke="#EE8FC9"
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
