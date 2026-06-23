# Multi-View Goals — Design Spec

**Date:** 2026-06-21
**Extends:** `2026-06-20-habit-tracker-design.md`

---

## Overview

Add Weekly and Monthly goal views to the existing Daily habit tracker. Three full-screen panels slide horizontally; the user swipes left/right to navigate. All goals are hardcoded binary check-offs. Each view's completions are stored independently in `localStorage` alongside the existing daily data.

---

## Goal Lists

### Daily (existing, unchanged)
| ID | Label |
|----|-------|
| `alcohol` | No Alcohol |
| `exercise` | 30 Min Exercise |
| `reading` | 30 Min Reading |
| `produce` | Fruit or Vegetable |

### Weekly (resets every Sunday)
| ID | Label |
|----|-------|
| `water_plants` | Water Plants |
| `cycle` | Cycle 2x |
| `situps_pushups` | 500 Situps / 500 Pushups |
| `vacuum` | Vacuum Upstairs & Downstairs |
| `sheets` | Change Sheets |
| `sweep` | Sweep Downstairs |

### Monthly (resets 1st of month)
| ID | Label |
|----|-------|
| `couch_cushions` | Wash Couch Cushions & Blankets |
| `steam_rug` | Steam Clean Downstairs Rug |
| `stove_top` | Wash Stove Top |

---

## Data Model Changes

### New types (added to `src/habits.ts`)

```typescript
export type WeeklyGoalId =
  | 'water_plants' | 'cycle' | 'situps_pushups'
  | 'vacuum' | 'sheets' | 'sweep'

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

### Extended `AppState` (in `src/reducer.ts`)

```typescript
export type WeeklyCompletions  = Record<WeeklyGoalId,  Record<string, boolean>>
export type MonthlyCompletions = Record<MonthlyGoalId, Record<string, boolean>>

export interface AppState {
  completions:        Completions         // existing daily, keyed by YYYY-MM-DD
  weeklyCompletions:  WeeklyCompletions   // keyed by YYYY-MM-DD of that week's Sunday
  monthlyCompletions: MonthlyCompletions  // keyed by YYYY-MM
}
```

### New actions

```typescript
| { type: 'TOGGLE_WEEKLY_GOAL';  goalId: WeeklyGoalId;  weekKey: string  }
| { type: 'TOGGLE_MONTHLY_GOAL'; goalId: MonthlyGoalId; monthKey: string }
```

### New utility functions (added to `src/utils/habits.ts`)

```typescript
// Returns YYYY-MM-DD of the most recent Sunday (or today if today is Sunday)
export function getWeekKey(today: string): string

// Returns YYYY-MM
export function getMonthKey(today: string): string
```

---

## Navigation Architecture

`App` holds `view: 0 | 1 | 2` in `useState` (not persisted — always opens on Daily).

```
┌──────────────────────────────────────┐  300vw container
│  Panel 0 (Daily)  │  Panel 1 (Weekly)  │  Panel 2 (Monthly)  │
└──────────────────────────────────────┘
         ↑ transform: translateX(-view * 33.333vw)
         ↑ transition: transform 250ms ease-out
```

### `useSwipe` hook (`src/hooks/useSwipe.ts`)

Attaches `touchstart` / `touchend` listeners to a ref'd element. If `deltaX > 40px` swipe left → increment view (capped at 2). If `deltaX < -40px` swipe right → decrement view (floor 0).

```typescript
export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold?: number,   // default 40px
): React.RefObject<HTMLDivElement>
```

### `NavDots` component

Fixed at bottom center. Three dots — active dot is white/filled, inactive dots are gray. Tapping a dot sets the view directly (desktop fallback).

---

## Component Changes

### Renamed / generalised
`HabitCard.tsx` → `GoalCard.tsx` — same visual design (dark card, circular checkbox, green when complete), generic props:

```typescript
interface GoalCardProps {
  label: string
  completed: boolean
  onToggle: () => void
}
```

`HabitCard.tsx` is deleted; `TodayPanel` is updated to use `GoalCard` directly.

### New components
| File | Responsibility |
|------|----------------|
| `src/components/GoalCard.tsx` | Generic binary check-off card (replaces HabitCard) |
| `src/components/WeeklyPanel.tsx` | Week header + 6 GoalCards |
| `src/components/MonthlyPanel.tsx` | Month header + 3 GoalCards |
| `src/components/NavDots.tsx` | 3-dot view indicator, fixed bottom |
| `src/hooks/useSwipe.ts` | Touch swipe detection |

### Updated components
| File | Change |
|------|--------|
| `src/habits.ts` | Add weekly/monthly types and constants |
| `src/reducer.ts` | Extend AppState, add two new actions + empty defaults |
| `src/utils/habits.ts` | Add `getWeekKey`, `getMonthKey` |
| `src/App.tsx` | Add `view` state, sliding container, `useSwipe`, `NavDots` |
| `src/components/TodayPanel.tsx` | Use `GoalCard` instead of `HabitCard` |

---

## Period Keys

- **Week key:** `YYYY-MM-DD` of the Sunday that starts the current week. If today is Sunday, today's date is the key. All goals checked during Mon–Sat use the preceding Sunday's date.
- **Month key:** `YYYY-MM` (e.g. `2026-06`). Resets automatically when the calendar month changes.

---

## Out of Scope

- History / streaks for weekly or monthly goals
- Editing the goal lists from the UI
- Animations beyond the panel slide
- Swipe detection on desktop (mouse drag)
