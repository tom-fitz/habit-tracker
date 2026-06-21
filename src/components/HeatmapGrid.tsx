import { useEffect, useRef } from 'react'
import { HeatmapCell, CELL_SIZE } from './HeatmapCell'
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
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [])

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
          <div
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
              gridAutoFlow: 'column',
              gap: '4px',
              width: 'max-content',
              margin: '10px'
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
  )
}
