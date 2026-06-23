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
  startDate.setDate(startDate.getDate() - 179)

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

// Returns YYYY-MM-DD of the Sunday that starts the week containing today.
export function getWeekKey(today: string): string {
  const date = new Date(today + 'T00:00:00')
  date.setDate(date.getDate() - date.getDay()) // rewind to Sunday
  return localDateString(date)
}

// Returns the number of consecutive fully-completed weeks ending at (or before) the week
// containing today. "Fully completed" means every WEEKLY_GOALS entry has true for that weekKey.
export function computeWeeklyStreak(
  weeklyCompletions: Record<string, Record<string, boolean>>,
  goalIds: string[],
  today: string,
): number {
  // Build the key for the week containing `today` and walk backward
  const cursor = new Date(today + 'T00:00:00')
  cursor.setDate(cursor.getDate() - cursor.getDay()) // rewind to Sunday

  // If the current week isn't fully done, start counting from the week before
  const isWeekComplete = (sunday: Date) => {
    const key = localDateString(sunday)
    return goalIds.every(id => weeklyCompletions[id]?.[key] === true)
  }

  if (!isWeekComplete(cursor)) {
    cursor.setDate(cursor.getDate() - 7)
  }

  let streak = 0
  while (isWeekComplete(cursor)) {
    streak++
    cursor.setDate(cursor.getDate() - 7)
  }
  return streak
}

// Returns YYYY-MM
export function getMonthKey(today: string): string {
  const date = new Date(today + 'T00:00:00')
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
