interface NavDotsProps {
  count: number
  active: number
  onSelect: (index: number) => void
}

export function NavDots({ count, active, onSelect }: NavDotsProps) {
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={['Daily', 'Weekly', 'Monthly'][i]}
          className={`w-2 h-2 rounded-full transition-colors pointer-events-auto ${
            i === active ? 'bg-white' : 'bg-gray-600'
          }`}
        />
      ))}
    </div>
  )
}
