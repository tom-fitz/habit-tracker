# Multi-View Goals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Weekly and Monthly goal views to the habit tracker, navigable via left/right swipe with a sliding panel layout.

**Architecture:** Three full-width panels sit side-by-side in a `300vw` flex container; a CSS `translateX` driven by `view: 0|1|2` state slides between them. A `useSwipe` hook attaches touch listeners to the outer container. Weekly and monthly completions extend `AppState` and are stored in the same `localStorage` key.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, no new dependencies.

## Global Constraints

- No commits, no build/compile steps — user tests locally
- All dates in local time — never `toISOString()` for date keys
- Week key = `YYYY-MM-DD` of the Sunday that starts the week (use `getWeekKey`)
- Month key = `YYYY-MM` (use `getMonthKey`)
- All new goal lists are hardcoded constants, not user-editable
- Named exports only — no default exports
- Dark theme throughout (`bg-gray-950` base)
- Swipe threshold: 40px

---

### Task 1: Extend the data layer

**Files:**
- Modify: `src/habits.ts`
- Modify: `src/reducer.ts`
- Modify: `src/utils/habits.ts`

**Interfaces — Produces:**
- `WeeklyGoalId` — `'water_plants' | 'cycle' | 'situps_pushups' | 'vacuum' | 'sheets' | 'sweep'`
- `WeeklyGoal` — `{ id: WeeklyGoalId; label: string }`
- `WEEKLY_GOALS` — `WeeklyGoal[]`
- `MonthlyGoalId` — `'couch_cushions' | 'steam_rug' | 'stove_top'`
- `MonthlyGoal` — `{ id: MonthlyGoalId; label: string }`
- `MONTHLY_GOALS` — `MonthlyGoal[]`
- `WeeklyCompletions` — `Record<WeeklyGoalId, Record<string, boolean>>`
- `MonthlyCompletions` — `Record<MonthlyGoalId, Record<string, boolean>>`
- `AppState.weeklyCompletions: WeeklyCompletions`
- `AppState.monthlyCompletions: MonthlyCompletions`
- `Action` union — adds `TOGGLE_WEEKLY_GOAL` and `TOGGLE_MONTHLY_GOAL`
- `getWeekKey(today: string): string`
- `getMonthKey(today: string): string`

- [ ] **Step 1: Replace `src/habits.ts`**

```typescript
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
```

- [ ] **Step 2: Replace `src/reducer.ts`**

```typescript
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
```

- [ ] **Step 3: Add `getWeekKey` and `getMonthKey` to `src/utils/habits.ts`**

Append these two functions to the end of the existing file (do not touch the existing functions):

```typescript
// Returns YYYY-MM-DD of the Sunday that starts the week containing today.
export function getWeekKey(today: string): string {
  const date = new Date(today + 'T00:00:00')
  date.setDate(date.getDate() - date.getDay()) // rewind to Sunday
  return localDateString(date)
}

// Returns YYYY-MM
export function getMonthKey(today: string): string {
  const date = new Date(today + 'T00:00:00')
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
```

---

### Task 2: GoalCard component + update TodayPanel

**Files:**
- Create: `src/components/GoalCard.tsx`
- Modify: `src/components/TodayPanel.tsx`
- Delete: `src/components/HabitCard.tsx`

**Interfaces:**
- Consumes: nothing from other tasks
- Produces: `<GoalCard label completed onToggle>` — used by TodayPanel, WeeklyPanel, MonthlyPanel

- [ ] **Step 1: Create `src/components/GoalCard.tsx`**

```tsx
interface GoalCardProps {
  label: string
  completed: boolean
  onToggle: () => void
}

export function GoalCard({ label, completed, onToggle }: GoalCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
```

- [ ] **Step 2: Replace `src/components/TodayPanel.tsx`**

```tsx
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
```

- [ ] **Step 3: Delete `src/components/HabitCard.tsx`**

Delete the file — it is fully replaced by `GoalCard`.

---

### Task 3: useSwipe hook + NavDots

**Files:**
- Create: `src/hooks/useSwipe.ts`
- Create: `src/components/NavDots.tsx`

**Interfaces — Produces:**
- `useSwipe(onSwipeLeft, onSwipeRight, threshold?): RefObject<HTMLDivElement>`
- `<NavDots count active onSelect>`

- [ ] **Step 1: Create `src/hooks/useSwipe.ts`**

```typescript
import { useRef, useEffect, type RefObject } from 'react'

export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 40,
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const onSwipeLeftRef = useRef(onSwipeLeft)
  const onSwipeRightRef = useRef(onSwipeRight)

  // Keep refs current so the effect closure never goes stale
  onSwipeLeftRef.current = onSwipeLeft
  onSwipeRightRef.current = onSwipeRight

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
    }

    const onTouchEnd = (e: TouchEvent) => {
      const delta = e.changedTouches[0].clientX - startX.current
      if (delta < -threshold) onSwipeLeftRef.current()
      else if (delta > threshold) onSwipeRightRef.current()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [threshold])

  return ref
}
```

- [ ] **Step 2: Create `src/components/NavDots.tsx`**

```tsx
interface NavDotsProps {
  count: number
  active: number
  onSelect: (index: number) => void
}

export function NavDots({ count, active, onSelect }: NavDotsProps) {
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={['Daily', 'Weekly', 'Monthly'][i]}
          className={`w-2 h-2 rounded-full transition-colors pointer-events-auto ${
            i === active ? 'bg-white' : 'bg-gray-600'
          }`}
        />
      ))}
    </div>
  )
}
```

---

### Task 4: WeeklyPanel + MonthlyPanel

**Files:**
- Create: `src/components/WeeklyPanel.tsx`
- Create: `src/components/MonthlyPanel.tsx`

**Interfaces:**
- Consumes: `WeeklyCompletions`, `MonthlyCompletions`, `Action` from `../reducer`; `WEEKLY_GOALS`, `MONTHLY_GOALS` from `../habits`; `GoalCard` from `./GoalCard`
- Produces: `<WeeklyPanel weeklyCompletions weekKey dispatch>`, `<MonthlyPanel monthlyCompletions monthKey dispatch>`

- [ ] **Step 1: Create `src/components/WeeklyPanel.tsx`**

```tsx
import type { Dispatch } from 'react'
import type { WeeklyCompletions, Action } from '../reducer'
import { WEEKLY_GOALS } from '../habits'
import { GoalCard } from './GoalCard'

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

export function WeeklyPanel({ weeklyCompletions, weekKey, dispatch }: WeeklyPanelProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 px-4 py-8 max-w-3xl mx-auto pb-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Weekly Goals</h1>
        <p className="text-gray-400 text-sm mt-1">{formatWeekRange(weekKey)}</p>
      </header>
      <div className="flex flex-col gap-3">
        {WEEKLY_GOALS.map((goal) => (
          <GoalCard
            key={goal.id}
            label={goal.label}
            completed={weeklyCompletions[goal.id][weekKey] ?? false}
            onToggle={() =>
              dispatch({ type: 'TOGGLE_WEEKLY_GOAL', goalId: goal.id, weekKey })
            }
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/MonthlyPanel.tsx`**

```tsx
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

export function MonthlyPanel({ monthlyCompletions, monthKey, dispatch }: MonthlyPanelProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 px-4 py-8 max-w-3xl mx-auto pb-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Monthly Goals</h1>
        <p className="text-gray-400 text-sm mt-1">{formatMonth(monthKey)}</p>
      </header>
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
```

---

### Task 5: Wire App.tsx

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: all of `useSwipe`, `NavDots`, `WeeklyPanel`, `MonthlyPanel`, `getWeekKey`, `getMonthKey` from prior tasks

- [ ] **Step 1: Replace `src/App.tsx`**

```tsx
import { useReducer, useEffect, useState } from 'react'
import { reducer, loadState, saveState } from './reducer'
import { getToday, getWeekKey, getMonthKey } from './utils/habits'
import { Header } from './components/Header'
import { TodayPanel } from './components/TodayPanel'
import { StreaksPanel } from './components/StreaksPanel'
import { WeeklyPanel } from './components/WeeklyPanel'
import { MonthlyPanel } from './components/MonthlyPanel'
import { NavDots } from './components/NavDots'
import { useSwipe } from './hooks/useSwipe'

const VIEW_COUNT = 3

export function App() {
  const [state, dispatch] = useReducer(reducer, loadState())
  const [view, setView] = useState(0)
  const today    = getToday()
  const weekKey  = getWeekKey(today)
  const monthKey = getMonthKey(today)

  useEffect(() => {
    saveState(state)
  }, [state])

  const swipeRef = useSwipe(
    () => setView(v => Math.min(v + 1, VIEW_COUNT - 1)),
    () => setView(v => Math.max(v - 1, 0)),
  )

  return (
    <div ref={swipeRef} style={{ overflow: 'hidden', width: '100vw' }}>
      <div
        style={{
          display: 'flex',
          width: `${VIEW_COUNT * 100}vw`,
          transform: `translateX(-${view * (100 / VIEW_COUNT)}%)`,
          transition: 'transform 250ms ease-out',
        }}
      >
        {/* Panel 0 — Daily */}
        <div style={{ width: '100vw', flexShrink: 0 }}>
          <div className="min-h-screen bg-gray-950 text-gray-100 px-4 py-8 max-w-3xl mx-auto pb-16">
            <Header today={today} />
            <TodayPanel
              completions={state.completions}
              today={today}
              dispatch={dispatch}
            />
            <StreaksPanel completions={state.completions} today={today} />
          </div>
        </div>

        {/* Panel 1 — Weekly */}
        <div style={{ width: '100vw', flexShrink: 0 }}>
          <WeeklyPanel
            weeklyCompletions={state.weeklyCompletions}
            weekKey={weekKey}
            dispatch={dispatch}
          />
        </div>

        {/* Panel 2 — Monthly */}
        <div style={{ width: '100vw', flexShrink: 0 }}>
          <MonthlyPanel
            monthlyCompletions={state.monthlyCompletions}
            monthKey={monthKey}
            dispatch={dispatch}
          />
        </div>
      </div>

      <NavDots count={VIEW_COUNT} active={view} onSelect={setView} />
    </div>
  )
}
```
