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
