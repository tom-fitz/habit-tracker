import type { Dispatch } from 'react'
import type { MonthlyCompletions, Action } from '../reducer'
import { MONTHLY_GOALS } from '../habits'
import { GoalCard } from './GoalCard'

interface MonthlyPanelProps {
  monthlyCompletions: MonthlyCompletions
  monthKey: string
  dispatch: Dispatch<Action>
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

const RADIUS = 48
const STROKE = 8
const SIZE = (RADIUS + STROKE) * 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface ProgressRingProps {
  completed: number
  total: number
}

function ProgressRing({ completed, total }: ProgressRingProps) {
  const pct = total === 0 ? 0 : completed / total
  const offset = CIRCUMFERENCE * (1 - pct)
  const allDone = completed === total

  return (
    <div className="flex flex-col items-center mb-10">
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#374151"
          strokeWidth={STROKE}
        />
        {/* Progress arc */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={allDone ? '#22c55e' : '#16a34a'}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
        />
      </svg>
      {/* Center label — counter-rotate so text reads upright */}
      <div
        style={{
          marginTop: -(SIZE / 2 + 20),
          width: SIZE,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <span className="text-3xl font-bold text-white">{completed}</span>
        <span className="text-lg text-gray-500">/{total}</span>
      </div>
      <p className="text-sm text-gray-400 mt-12">
        {allDone ? 'All done this month!' : `${total - completed} remaining`}
      </p>
    </div>
  )
}

export function MonthlyPanel({ monthlyCompletions, monthKey, dispatch }: MonthlyPanelProps) {
  const completed = MONTHLY_GOALS.filter(
    g => monthlyCompletions[g.id][monthKey] === true,
  ).length

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 px-4 py-8 max-w-3xl mx-auto pb-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Monthly Goals</h1>
        <p className="text-gray-400 text-sm mt-1">{formatMonth(monthKey)}</p>
      </header>
      <ProgressRing completed={completed} total={MONTHLY_GOALS.length} />
      <div className="flex flex-col gap-3">
        {MONTHLY_GOALS.map((goal) => (
          <GoalCard
            key={goal.id}
            label={goal.label}
            completed={monthlyCompletions[goal.id][monthKey] ?? false}
            onToggle={() =>
              dispatch({ type: 'TOGGLE_MONTHLY_GOAL', goalId: goal.id, monthKey })
            }
          />
        ))}
      </div>
    </div>
  )
}
