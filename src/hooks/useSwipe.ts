import { useRef, useEffect, type RefObject } from 'react'

export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 40,
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const onSwipeLeftRef = useRef(onSwipeLeft)
  const onSwipeRightRef = useRef(onSwipeRight)

  // Keep refs current so the effect closure never goes stale
  onSwipeLeftRef.current = onSwipeLeft
  onSwipeRightRef.current = onSwipeRight

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
    }

    const onTouchEnd = (e: TouchEvent) => {
      const delta = e.changedTouches[0].clientX - startX.current
      if (delta < -threshold) onSwipeLeftRef.current()
      else if (delta > threshold) onSwipeRightRef.current()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [threshold])

  return ref
}
