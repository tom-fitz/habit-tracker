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
