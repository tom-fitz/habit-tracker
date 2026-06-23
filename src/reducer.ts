import type { HabitId, WeeklyGoalId, MonthlyGoalId } from './habits'

export type Completions        = Record<HabitId,        Record<string, boolean>>
export type WeeklyCompletions  = Record<WeeklyGoalId,   Record<string, boolean>>
export type MonthlyCompletions = Record<MonthlyGoalId,  Record<string, boolean>>

export interface AppState {
  completions:        Completions
  weeklyCompletions:  WeeklyCompletions
  monthlyCompletions: MonthlyCompletions
}

export type Action =
  | { type: 'TOGGLE_HABIT';         habitId: HabitId;        date: string     }
  | { type: 'TOGGLE_WEEKLY_GOAL';   goalId:  WeeklyGoalId;   weekKey: string  }
  | { type: 'TOGGLE_MONTHLY_GOAL';  goalId:  MonthlyGoalId;  monthKey: string }

const STORAGE_KEY = 'habit-tracker-state'

const emptyCompletions: Completions = {
  alcohol: {}, exercise: {}, reading: {}, produce: {},
}

const emptyWeeklyCompletions: WeeklyCompletions = {
  water_plants: {}, cycle: {}, situps_pushups: {},
  vacuum: {}, sheets: {}, sweep: {},
}

const emptyMonthlyCompletions: MonthlyCompletions = {
  couch_cushions: {}, steam_rug: {}, stove_top: {},
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_HABIT': {
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
    case 'TOGGLE_WEEKLY_GOAL': {
      const current = state.weeklyCompletions[action.goalId][action.weekKey] ?? false
      return {
        ...state,
        weeklyCompletions: {
          ...state.weeklyCompletions,
          [action.goalId]: {
            ...state.weeklyCompletions[action.goalId],
            [action.weekKey]: !current,
          },
        },
      }
    }
    case 'TOGGLE_MONTHLY_GOAL': {
      const current = state.monthlyCompletions[action.goalId][action.monthKey] ?? false
      return {
        ...state,
        monthlyCompletions: {
          ...state.monthlyCompletions,
          [action.goalId]: {
            ...state.monthlyCompletions[action.goalId],
            [action.monthKey]: !current,
          },
        },
      }
    }
    default:
      return state
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {
      completions: emptyCompletions,
      weeklyCompletions: emptyWeeklyCompletions,
      monthlyCompletions: emptyMonthlyCompletions,
    }
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      completions:        { ...emptyCompletions,        ...parsed.completions },
      weeklyCompletions:  { ...emptyWeeklyCompletions,  ...parsed.weeklyCompletions },
      monthlyCompletions: { ...emptyMonthlyCompletions, ...parsed.monthlyCompletions },
    }
  } catch {
    return {
      completions: emptyCompletions,
      weeklyCompletions: emptyWeeklyCompletions,
      monthlyCompletions: emptyMonthlyCompletions,
    }
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
