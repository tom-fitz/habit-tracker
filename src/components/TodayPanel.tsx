import type { Dispatch } from 'react'
import type { Completions, Action } from '../reducer'
import { HABITS } from '../habits'
import { GoalCard } from './GoalCard'

interface TodayPanelProps {
  completions: Completions
  today: string
  dispatch: Dispatch<Action>
}

export function TodayPanel({ completions, today, dispatch }: TodayPanelProps) {
  return (
    <section className="mb-10">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        Today
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HABITS.map((habit) => (
          <GoalCard
            key={habit.id}
            label={habit.label}
            completed={completions[habit.id][today] ?? false}
            onToggle={() => dispatch({ type: 'TOGGLE_HABIT', habitId: habit.id, date: today })}
          />
        ))}
      </div>
    </section>
  )
}
