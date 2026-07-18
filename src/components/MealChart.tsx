import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { MealEntry } from '../services/stats'
import { GOAL_MINUTES, CHART_Y_MAX, CHART_Y_TICKS, computeChartYDomainMin } from '../services/stats'
import { formatMinutesAsTime, formatShortDate } from '../services/dayLogic'

interface MealChartProps {
  entries: MealEntry[]
}

function dayToTimestamp(day: string): number {
  return new Date(`${day}T00:00:00`).getTime()
}

export function MealChart({ entries }: MealChartProps) {
  const yDomainMin = computeChartYDomainMin(entries)

  const timedPoints = entries
    .filter((e) => !e.isFast && e.minutes != null)
    .map((e) => ({ x: dayToTimestamp(e.day), y: e.minutes as number, day: e.day }))

  const fastPoints = entries
    .filter((e) => e.isFast)
    .map((e) => ({ x: dayToTimestamp(e.day), y: yDomainMin, day: e.day }))

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(ts) => formatShortDate(new Date(ts))}
          name="date"
        />
        <YAxis
          dataKey="y"
          type="number"
          domain={[() => yDomainMin, CHART_Y_MAX]}
          ticks={CHART_Y_TICKS}
          tickFormatter={(m) => formatMinutesAsTime(m).replace(':00', '')}
          name="time"
        />
        <Tooltip
          labelFormatter={() => ''}
          formatter={
            ((value: number, _name: string, item: { payload: { x: number; day: string } }) => [
              fastPoints.some((f) => f.day === item.payload.day)
                ? 'Fasted'
                : formatMinutesAsTime(value),
              formatShortDate(new Date(item.payload.x)),
            ]) as never
          }
        />
        <ReferenceLine
          y={GOAL_MINUTES}
          stroke="#E5199A"
          strokeDasharray="4 4"
          label={{ value: 'goal', position: 'insideTopRight', fill: '#E5199A' }}
        />
        <Scatter data={timedPoints} fill="#E5199A" />
        <Scatter data={fastPoints} fill="#FFD1EC" shape="diamond" />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
