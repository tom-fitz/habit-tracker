import { useEffect, useRef, type CSSProperties } from 'react'
import { HeatmapCell, CELL_SIZE } from './HeatmapCell'
import { computeStreak, generateWeekGrid } from '../utils/habits'

interface HeatmapGridProps {
  label: string
  completions: Record<string, boolean>
  today: string
}

const CELL_GAP = 4

export function HeatmapGrid({ label, completions, today }: HeatmapGridProps) {
  const weeks = generateWeekGrid(today)
  const streak = computeStreak(completions, today)
  const flatCells = weeks.flat()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [])

  const monthLabels = weeks.map((week, i) => {
    const firstDate = week.find(d => d !== null)
    if (!firstDate) return ''
    const month = new Date(firstDate + 'T00:00:00').getMonth()
    if (i === 0) return new Date(firstDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })
    const prevFirst = weeks[i - 1].find(d => d !== null)
    if (!prevFirst) return ''
    return new Date(prevFirst + 'T00:00:00').getMonth() !== month
      ? new Date(firstDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })
      : ''
  })

  const colStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${weeks.length}, ${CELL_SIZE}px)`,
    gap: `${CELL_GAP}px`,
  }

  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-xs text-gray-500">
          {streak > 0 ? `${streak} day streak` : 'No current streak'}
        </span>
      </div>
      <div className="rounded-lg bg-gray-900 px-4 py-3">
        <div ref={scrollRef} className="overflow-x-auto">
          <div style={{ width: 'max-content', margin: '10px' }}>
            {/* Month labels */}
            <div style={{ ...colStyle, marginBottom: 6 }}>
              {monthLabels.map((lbl, i) => (
                <div
                  key={i}
                  style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'visible', lineHeight: 1 }}
                >
                  {lbl}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                gridAutoFlow: 'column',
                gap: `${CELL_GAP}px`,
                width: 'max-content',
              }}
            >
              {flatCells.map((date, i) =>
                date === null ? (
                  <div key={i} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
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
      </div>
    </div>
  )
}
