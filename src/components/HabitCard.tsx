import type { Dispatch } from 'react'
import type { Action } from '../reducer'
import type { HabitId } from '../habits'

interface HabitCardProps {
  id: HabitId
  label: string
  completed: boolean
  today: string
  dispatch: Dispatch<Action>
}

export function HabitCard({ id, label, completed, today, dispatch }: HabitCardProps) {
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'TOGGLE_HABIT', habitId: id, date: today })}
      className={`flex items-center gap-3 p-4 rounded-xl border w-full text-left transition-all ${
        completed
          ? 'bg-green-950 border-green-700 text-green-300'
          : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          completed ? 'bg-green-500 border-green-500' : 'border-gray-500'
        }`}
      >
        {completed && (
          <svg
            className="w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </button>
  )
}
