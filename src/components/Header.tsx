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
