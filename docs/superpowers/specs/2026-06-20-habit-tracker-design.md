# Habit Tracker PWA — Design Spec

**Date:** 2026-06-20  
**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + vite-plugin-pwa

---

## Overview

A personal, single-page PWA for tracking 4 daily binary habits. All data lives in `localStorage` — no account, no backend, no sync. Installable on mobile and desktop. Notifications deferred to a future iteration.

---

## Habits

| ID | Label |
|----|-------|
| `alcohol` | No Alcohol |
| `exercise` | 30 Min Exercise |
| `reading` | 30 Min Reading |
| `produce` | Fruit or Vegetable |

The habit list is static for MVP — defined as a constant, not stored in state.

---

## Architecture

- **Vite** for bundling and dev server
- **React 18 + TypeScript** for UI
- **Tailwind CSS** for styling (dark theme)
- **vite-plugin-pwa** for service worker + `manifest.json`
- **No router** — single page
- **No external state library** — `useReducer` + `useEffect` for localStorage sync

### State Management

`useReducer` in `App` holds all app state. On every state change, a `useEffect` serializes state to `localStorage`. On first mount, state is hydrated from `localStorage` (falling back to empty if nothing is stored).

Single action: `TOGGLE_HABIT { habitId, date }` — toggles the boolean for a given habit on a given date.

---

## Data Model

```typescript
type HabitId = 'alcohol' | 'exercise' | 'reading' | 'produce'

interface Habit {
  id: HabitId
  label: string
}

// completions[habitId][date] = true | undefined
type Completions = Record<HabitId, Record<string, boolean>>

interface AppState {
  completions: Completions
}

type Action = {
  type: 'TOGGLE_HABIT'
  habitId: HabitId
  date: string // 'YYYY-MM-DD'
}
```

Streaks are **derived at render time** — no stored counter. This prevents counters drifting out of sync with the underlying completion data.

**Current streak definition:** count of consecutive days ending on today (inclusive) where the habit was completed. If today is not yet checked, the streak counts back from yesterday. A single missed day resets the streak to 0.

---

## UI Layout

Single scrollable page. Dark background.

### Header
- App name: "Habit Tracker"
- Today's date displayed

### Today Panel
- 2×2 grid of habit cards (single column on mobile)
- Each card shows: habit label + large checkbox
- Checking/unchecking toggles today's completion in state

### Streaks Panel
- 4 labeled heatmap grids, one per habit
- GitHub contribution graph style: 52 weeks × 7 days, oldest left → newest right
- Empty day: light gray square
- Completed day: solid green square
- Today: subtle ring/border highlight
- No tooltip for MVP

---

## Component Tree

```
App                         — holds reducer, localStorage sync
├── Header                  — app title + today's date
├── TodayPanel              — renders 4 HabitCards
│   └── HabitCard × 4      — label + checkbox, dispatches TOGGLE_HABIT
└── StreaksPanel            — renders 4 HeatmapGrids
    └── HeatmapGrid × 4    — labeled grid for one habit
        └── HeatmapCell    — single day square, colored by completion
```

---

## File Structure

```
habit-tracker/
├── public/
│   └── icons/             — PWA icons
├── src/
│   ├── main.tsx
│   ├── App.tsx            — root, reducer, localStorage sync
│   ├── habits.ts          — HABITS constant + types
│   ├── reducer.ts         — AppState, Action, reducer function
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── TodayPanel.tsx
│   │   ├── HabitCard.tsx
│   │   ├── StreaksPanel.tsx
│   │   ├── HeatmapGrid.tsx
│   │   └── HeatmapCell.tsx
│   └── index.css          — Tailwind directives
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## PWA

- `vite-plugin-pwa` configured with a `manifest.json`: name, short name, theme color, display: standalone
- Service worker in `networkFirst` or `staleWhileRevalidate` mode (all assets are local, so offline works automatically)
- Icons: at minimum 192×192 and 512×512 PNG

---

## Out of Scope (MVP)

- Push notifications / reminders
- Backend sync
- Editing the habit list
- Tooltips on heatmap cells
- Multiple users
