/**
 * React hook for IntersectionObserver
 */

import { useEffect, useRef, useState } from 'react'

type UseIntersectionObserverOptions = {
  /**
   * Root element for intersection (default: viewport)
   */
  root?: Element | null
  /**
   * Margin around root (e.g., "100px" to load 100px before visible)
   */
  rootMargin?: string
  /**
   * Threshold for intersection (0.0 to 1.0)
   */
  threshold?: number | number[]
  /**
   * Whether to enable the observer
   */
  enabled?: boolean
}

/**
 * Hook to detect if an element is in viewport
 *
 * @example
 * ```tsx
 * const [ref, isIntersecting] = useIntersectionObserver({
 *   rootMargin: '200px', // Load 200px before visible
 *   threshold: 0.1,
 * })
 *
 * return (
 *   <div ref={ref}>
 *     {isIntersecting && <ExpensiveComponent />}
 *   </div>
 * )
 * ```
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T>, boolean] {
  const {
    root = null,
    rootMargin = '200px', // Load 200px before entering viewport
    threshold = 0.1,
    enabled = true,
  } = options

  const ref = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting)
        })
      },
      { root, rootMargin, threshold }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [root, rootMargin, threshold, enabled])

  return [ref, isIntersecting]
}

/**
 * Hook that tracks if element was ever intersecting (doesn't reset to false)
 * Useful for lazy loading that should stay loaded once triggered
 */
export function useIntersectionObserverOnce<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T>, boolean] {
  const [ref, isIntersecting] = useIntersectionObserver<T>(options)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    if (isIntersecting && !hasIntersected) {
      setHasIntersected(true)
    }
  }, [isIntersecting, hasIntersected])

  return [ref, hasIntersected]
}