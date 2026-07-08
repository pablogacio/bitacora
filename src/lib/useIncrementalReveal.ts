import { useEffect, useRef, useState } from 'react'

/**
 * Reveals a large list gradually (first `pageSize` items, then more as the
 * sentinel scrolls into view) so trips with hundreds of photos don't mount
 * every grid tile — and its motion/observer overhead — at once.
 */
export function useIncrementalReveal(total: number, resetKey: string, pageSize = 24) {
  const [count, setCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCount(pageSize)
  }, [resetKey, pageSize])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCount((c) => Math.min(total, c + pageSize))
        }
      },
      { rootMargin: '600px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [total, pageSize])

  return { count: Math.min(count, total), hasMore: count < total, sentinelRef }
}
