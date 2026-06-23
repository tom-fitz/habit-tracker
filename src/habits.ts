export type HabitId = 'alcohol' | 'exercise' | 'reading' | 'produce'

export interface Habit {
  id: HabitId
  label: string
}

export const HABITS: Habit[] = [
  { id: 'alcohol', label: 'No Alcohol' },
  { id: 'exercise', label: '30 Min Exercise' },
  { id: 'reading', label: '30 Min Reading' },
  { id: 'produce', label: 'Fruit or Vegetable' },
]

export type WeeklyGoalId =
  | 'water_plants'
  | 'cycle'
  | 'situps_pushups'
  | 'vacuum'
  | 'sheets'
  | 'sweep'

export interface WeeklyGoal {
  id: WeeklyGoalId
  label: string
}

export const WEEKLY_GOALS: WeeklyGoal[] = [
  { id: 'water_plants',   label: 'Water Plants' },
  { id: 'cycle',          label: 'Cycle 2x' },
  { id: 'situps_pushups', label: '500 Situps / 500 Pushups' },
  { id: 'vacuum',         label: 'Vacuum Upstairs & Downstairs' },
  { id: 'sheets',         label: 'Change Sheets' },
  { id: 'sweep',          label: 'Sweep Downstairs' },
]

export type MonthlyGoalId = 'couch_cushions' | 'steam_rug' | 'stove_top'

export interface MonthlyGoal {
  id: MonthlyGoalId
  label: string
}

export const MONTHLY_GOALS: MonthlyGoal[] = [
  { id: 'couch_cushions', label: 'Wash Couch Cushions & Blankets' },
  { id: 'steam_rug',      label: 'Steam Clean Downstairs Rug' },
  { id: 'stove_top',      label: 'Wash Stove Top' },
]
