interface HeatmapCellProps {
  date: string
  completed: boolean
  isToday: boolean
}

const CELL_SIZE = 14

export function HeatmapCell({ date, completed, isToday }: HeatmapCellProps) {
  return (
    <div
      title={date}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: 3,
        backgroundColor: completed ? '#22c55e' : '#374151',
        boxShadow: isToday ? '0 0 0 1.5px #fff' : 'none',
        flexShrink: 0,
      }}
    />
  )
}

export { CELL_SIZE }
