import type { Completions } from '../reducer'
import { HABITS } from '../habits'
import { HeatmapGrid } from './HeatmapGrid'

interface StreaksPanelProps {
  completions: Completions
  today: string
}

export function StreaksPanel({ completions, today }: StreaksPanelProps) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
        Streaks
      </h2>
      {HABITS.map((habit) => (
        <HeatmapGrid
          key={habit.id}
          label={habit.label}
          completions={completions[habit.id]}
          today={today}
        />
      ))}
    </section>
  )
}
