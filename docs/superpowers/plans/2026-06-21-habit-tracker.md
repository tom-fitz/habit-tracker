# Habit Tracker PWA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal daily habit tracking PWA with today's check-offs and GitHub-style streak heatmaps, all stored in `localStorage`.

**Architecture:** Single-page React app using `useReducer` for all state, with a `useEffect` syncing to `localStorage` on every change. No router, no backend. Four hardcoded habits. Streak and heatmap data derived from raw completion records at render time — no stored counters.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), `vite-plugin-pwa`

## Global Constraints

- All data stored under `localStorage` key `habit-tracker-state`
- Dates always stored as `YYYY-MM-DD` strings in **local time** — never use `toISOString()` for date keys (it returns UTC and will produce wrong dates for timezone offsets)
- Four hardcoded habits: `alcohol` → "No Alcohol", `exercise` → "30 Min Exercise", `reading` → "30 Min Reading", `produce` → "Fruit or Vegetable"
- Dark theme throughout (`bg-gray-950` base)
- Heatmap shows 364 days (52 weeks) ending today, columns aligned to Sun–Sat week boundaries
- Current streak = consecutive completed days ending on today; if today not yet checked, streak counts back from yesterday

---

### Task 1: Scaffold and configure the project

**Files:**
- Modify: `vite.config.ts` (replace generated)
- Modify: `src/index.css` (replace generated)
- Modify: `index.html` (update title)
- Delete: `src/App.css`, `src/assets/react.svg`

- [ ] **Step 1: Initialize Vite project**

Run inside `habit-tracker/` — confirm overwrite when prompted (dir only has `.git`):
```bash
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: Install dependencies**
```bash
npm install
npm install tailwindcss @tailwindcss/vite vite-plugin-pwa
```

- [ ] **Step 3: Write `vite.config.ts`**

Replace the generated file entirely:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Habit Tracker',
        short_name: 'Habits',
        description: 'Track your daily habits',
        theme_color: '#030712',
        background_color: '#030712',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 4: Write `src/index.css`**

Replace the generated file entirely:
```css
@import "tailwindcss";

body {
  background-color: #030712;
}
```

- [ ] **Step 5: Update `index.html`**

Change the `<title>` to `Habit Tracker`.

- [ ] **Step 6: Delete unused boilerplate**

Delete `src/App.css` and `src/assets/react.svg`.

---

### Task 2: Data layer

**Files:**
- Create: `src/habits.ts`
- Create: `src/reducer.ts`
- Create: `src/utils/habits.ts`

**Interfaces — Produces:**
- `HabitId` — `'alcohol' | 'exercise' | 'reading' | 'produce'`
- `Habit` — `{ id: HabitId; label: string }`
- `HABITS` — `Habit[]`
- `Completions` — `Record<HabitId, Record<string, boolean>>`
- `AppState` — `{ completions: Completions }`
- `Action` — `{ type: 'TOGGLE_HABIT'; habitId: HabitId; date: string }`
- `reducer(state: AppState, action: Action): AppState`
- `loadState(): AppState`
- `saveState(state: AppState): void`
- `getToday(): string`
- `computeStreak(completions: Record<string, boolean>, today: string): number`
- `generateWeekGrid(today: string): (string | null)[][]`

- [ ] **Step 1: Create `src/habits.ts`**

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
```

- [ ] **Step 2: Create `src/reducer.ts`**

```typescript
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
```

- [ ] **Step 3: Create `src/utils/habits.ts`**

```typescript
function localDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getToday(): string {
  return localDateString(new Date())
}

export function computeStreak(
  completions: Record<string, boolean>,
  today: string,
): number {
  const cursor = new Date(today + 'T00:00:00')

  // If today isn't completed yet, start counting from yesterday
  if (!completions[today]) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (true) {
    const key = localDateString(cursor)
    if (!completions[key]) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// Returns 52-53 week columns (Sun–Sat each), covering 364 days ending on today.
// Cells outside the 364-day window are null (used for padding partial weeks).
export function generateWeekGrid(today: string): (string | null)[][] {
  const endDate = new Date(today + 'T00:00:00')

  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 363)

  // Align grid start to the nearest preceding Sunday
  const gridStart = new Date(startDate)
  gridStart.setDate(gridStart.getDate() - gridStart.getDay())

  // Align grid end to the nearest following Saturday
  const gridEnd = new Date(endDate)
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()))

  const weeks: (string | null)[][] = []
  const cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    const week: (string | null)[] = []
    for (let day = 0; day < 7; day++) {
      if (cursor >= startDate && cursor <= endDate) {
        week.push(localDateString(cursor))
      } else {
        week.push(null)
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}
```

---

### Task 3: App root

**Files:**
- Modify: `src/main.tsx`
- Create: `src/App.tsx`

**Interfaces:**
- Consumes: `reducer`, `loadState`, `saveState` from `./reducer`; `getToday` from `./utils/habits`; `Header`, `TodayPanel`, `StreaksPanel` from `./components/*`

- [ ] **Step 1: Replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: Create `src/App.tsx`**

```tsx
import { useReducer, useEffect } from 'react'
import { reducer, loadState, saveState } from './reducer'
import { getToday } from './utils/habits'
import { Header } from './components/Header'
import { TodayPanel } from './components/TodayPanel'
import { StreaksPanel } from './components/StreaksPanel'

export function App() {
  const [state, dispatch] = useReducer(reducer, loadState())
  const today = getToday()

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 px-4 py-8 max-w-3xl mx-auto">
      <Header today={today} />
      <TodayPanel completions={state.completions} today={today} dispatch={dispatch} />
      <StreaksPanel completions={state.completions} today={today} />
    </div>
  )
}
```

---

### Task 4: Today panel components

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/HabitCard.tsx`
- Create: `src/components/TodayPanel.tsx`

**Interfaces:**
- Consumes: `HABITS` from `../habits`; `Completions`, `Action` from `../reducer`
- Produces: `<Header today>`, `<HabitCard id label completed today dispatch>`, `<TodayPanel completions today dispatch>`

- [ ] **Step 1: Create `src/components/Header.tsx`**

```tsx
interface HeaderProps {
  today: string // 'YYYY-MM-DD'
}

export function Header({ today }: HeaderProps) {
  const formatted = new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">Habit Tracker</h1>
      <p className="text-gray-400 text-sm mt-1">{formatted}</p>
    </header>
  )
}
```

- [ ] **Step 2: Create `src/components/HabitCard.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `src/components/TodayPanel.tsx`**

```tsx
import type { Dispatch } from 'react'
import type { Completions, Action } from '../reducer'
import { HABITS } from '../habits'
import { HabitCard } from './HabitCard'

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
          <HabitCard
            key={habit.id}
            id={habit.id}
            label={habit.label}
            completed={completions[habit.id][today] ?? false}
            today={today}
            dispatch={dispatch}
          />
        ))}
      </div>
    </section>
  )
}
```

---

### Task 5: Streaks panel components

**Files:**
- Create: `src/components/HeatmapCell.tsx`
- Create: `src/components/HeatmapGrid.tsx`
- Create: `src/components/StreaksPanel.tsx`

**Interfaces:**
- Consumes: `HABITS` from `../habits`; `Completions` from `../reducer`; `computeStreak`, `generateWeekGrid` from `../utils/habits`
- Produces: `<HeatmapCell date completed isToday>`, `<HeatmapGrid label completions today>`, `<StreaksPanel completions today>`

- [ ] **Step 1: Create `src/components/HeatmapCell.tsx`**

```tsx
interface HeatmapCellProps {
  date: string
  completed: boolean
  isToday: boolean
}

export function HeatmapCell({ date, completed, isToday }: HeatmapCellProps) {
  const color = completed ? 'bg-green-500' : 'bg-gray-800'
  const ring = isToday ? 'ring-1 ring-white ring-offset-1 ring-offset-gray-950' : ''
  return <div className={`w-3 h-3 rounded-sm transition-colors ${color} ${ring}`} title={date} />
}
```

- [ ] **Step 2: Create `src/components/HeatmapGrid.tsx`**

The grid uses CSS `gridAutoFlow: column` with 7 rows so each week becomes a vertical column, oldest week on the left — matching the GitHub contribution graph layout. `overflow-x-auto` on the wrapper enables scrolling on narrow screens.

```tsx
import { HeatmapCell } from './HeatmapCell'
import { computeStreak, generateWeekGrid } from '../utils/habits'

interface HeatmapGridProps {
  label: string
  completions: Record<string, boolean>
  today: string
}

export function HeatmapGrid({ label, completions, today }: HeatmapGridProps) {
  const weeks = generateWeekGrid(today)
  const streak = computeStreak(completions, today)
  const flatCells = weeks.flat()

  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-xs text-gray-500">
          {streak > 0 ? `${streak} day streak` : 'No current streak'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <div
          style={{
            display: 'grid',
            gridTemplateRows: 'repeat(7, 12px)',
            gridAutoFlow: 'column',
            gap: '3px',
            width: 'max-content',
          }}
        >
          {flatCells.map((date, i) =>
            date === null ? (
              <div key={i} style={{ width: 12, height: 12 }} />
            ) : (
              <HeatmapCell
                key={i}
                date={date}
                completed={completions[date] ?? false}
                isToday={date === today}
              />
            ),
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/StreaksPanel.tsx`**

```tsx
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
```

---

### Task 6: PWA icon

**Files:**
- Create: `public/icons/icon.svg`

- [ ] **Step 1: Create `public/icons/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="80" fill="#030712"/>
  <rect x="40" y="40" width="432" height="432" rx="60" fill="#14532d"/>
  <path d="M128 256 L208 336 L384 160"
        stroke="#22c55e"
        stroke-width="48"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>
</svg>
```
