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
