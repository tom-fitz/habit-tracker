import type { Dispatch } from 'react'
import type { WeeklyCompletions, Action } from '../reducer'
import { WEEKLY_GOALS } from '../habits'
import { GoalCard } from './GoalCard'
import { computeWeeklyStreak } from '../utils/habits'

interface WeeklyPanelProps {
  weeklyCompletions: WeeklyCompletions
  weekKey: string
  dispatch: Dispatch<Action>
}

function formatWeekRange(weekKey: string): string {
  const start = new Date(weekKey + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

// ── Petal Burst ──────────────────────────────────────────────────────────────

const OUTER_R = 58
const INNER_R = 20
const SVG_SIZE = (OUTER_R + 6) * 2   // 128
const CX = SVG_SIZE / 2
const CY = SVG_SIZE / 2
const GAP_DEG = 5
const SEGMENT_COUNT = 6

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function petalPath(index: number): string {
  const sliceDeg = 360 / SEGMENT_COUNT
  const startDeg = index * sliceDeg - 90 + GAP_DEG / 2
  const endDeg   = (index + 1) * sliceDeg - 90 - GAP_DEG / 2
  const sRad = toRad(startDeg)
  const eRad = toRad(endDeg)

  const ox1 = CX + OUTER_R * Math.cos(sRad)
  const oy1 = CY + OUTER_R * Math.sin(sRad)
  const ox2 = CX + OUTER_R * Math.cos(eRad)
  const oy2 = CY + OUTER_R * Math.sin(eRad)

  const ix1 = CX + INNER_R * Math.cos(sRad)
  const iy1 = CY + INNER_R * Math.sin(sRad)
  const ix2 = CX + INNER_R * Math.cos(eRad)
  const iy2 = CY + INNER_R * Math.sin(eRad)

  return [
    `M ${ix1} ${iy1}`,
    `L ${ox1} ${oy1}`,
    `A ${OUTER_R} ${OUTER_R} 0 0 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${INNER_R} ${INNER_R} 0 0 0 ${ix1} ${iy1}`,
    'Z',
  ].join(' ')
}

interface PetalBurstProps {
  completedCount: number
  total: number
  completedFlags: boolean[]
}

function PetalBurst({ completedCount, total, completedFlags }: PetalBurstProps) {
  const allDone = completedCount === total

  return (
    <div className="flex flex-col items-center mb-10">
      <svg width={SVG_SIZE} height={SVG_SIZE}>
        {completedFlags.map((done, i) => (
          <path
            key={i}
            d={petalPath(i)}
            fill={done ? (allDone ? '#4ade80' : '#22c55e') : '#374151'}
            style={{ transition: 'fill 300ms ease-out' }}
          />
        ))}
        {/* center count */}
        <text
          x={CX}
          y={CY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
          fontWeight="600"
          fill={allDone ? '#4ade80' : '#9ca3af'}
        >
          {completedCount}/{total}
        </text>
      </svg>
      <p className="text-sm text-gray-400 mt-2">
        {allDone ? 'Perfect week!' : `${total - completedCount} to go`}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export function WeeklyPanel({ weeklyCompletions, weekKey, dispatch }: WeeklyPanelProps) {
  const goalIds = WEEKLY_GOALS.map(g => g.id)
  const completedFlags = WEEKLY_GOALS.map(g => weeklyCompletions[g.id][weekKey] === true)
  const completedCount = completedFlags.filter(Boolean).length
  const streak = computeWeeklyStreak(weeklyCompletions, goalIds, weekKey)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 px-4 py-8 max-w-3xl mx-auto pb-16">
      <header className="mb-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-bold text-white tracking-tight">Weekly Goals</h1>
          <span className="text-xs text-gray-500">
            {streak > 0 ? `${streak} week streak` : 'No current streak'}
          </span>
        </div>
        <p className="text-gray-400 text-sm mt-1">{formatWeekRange(weekKey)}</p>
      </header>

      <PetalBurst
        completedCount={completedCount}
        total={WEEKLY_GOALS.length}
        completedFlags={completedFlags}
      />

      <div className="flex flex-col gap-3">
        {WEEKLY_GOALS.map((goal, i) => (
          <GoalCard
            key={goal.id}
            label={goal.label}
            completed={completedFlags[i]}
            onToggle={() =>
              dispatch({ type: 'TOGGLE_WEEKLY_GOAL', goalId: goal.id, weekKey })
            }
          />
        ))}
      </div>
    </div>
  )
}
