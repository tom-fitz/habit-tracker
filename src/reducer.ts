import type { HabitId } from './habits'

export type Completions = Record<HabitId, Record<string, boolean>>

export interface AppState {
  completions: Completions
}

export type Action = {
  type: 'TOGGLE_HABIT'
  habitId: HabitId
  date: string // 'YYYY-MM-DD' local time
}

const STORAGE_KEY = 'habit-tracker-state'

const emptyCompletions: Completions = {
  alcohol: {},
  exercise: {},
  reading: {},
  produce: {},
}

export function reducer(state: AppState, action: Action): AppState {
  if (action.type === 'TOGGLE_HABIT') {
    const current = state.completions[action.habitId][action.date] ?? false
    return {
      ...state,
      completions: {
        ...state.completions,
        [action.habitId]: {
          ...state.completions[action.habitId],
          [action.date]: !current,
        },
      },
    }
  }
  return state
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completions: emptyCompletions }
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      completions: { ...emptyCompletions, ...parsed.completions },
    }
  } catch {
    return { completions: emptyCompletions }
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
