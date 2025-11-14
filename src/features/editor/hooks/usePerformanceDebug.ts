import { useEffect, useRef } from 'react'

type PerformanceStats = {
  totalCalls: number
  callsPerSecond: number
  averageInterval: number
  lastResetTime: number
}

/**
 * Performance debugging hook
 *
 * 특정 dependency가 변경될 때마다 실행 횟수와 빈도를 측정합니다.
 *
 * @example
 * usePerformanceDebug('useSegmentAudioPlayer effect', playhead)
 */
export function usePerformanceDebug(label: string, ...dependencies: unknown[]) {
  const statsRef = useRef<PerformanceStats>({
    totalCalls: 0,
    callsPerSecond: 0,
    averageInterval: 0,
    lastResetTime: performance.now(),
  })

  const lastCallTimeRef = useRef<number>(performance.now())
  const intervalsRef = useRef<number[]>([])

  useEffect(() => {
    const now = performance.now()
    const stats = statsRef.current

    // 실행 횟수 증가
    stats.totalCalls++

    // 이전 호출로부터의 간격 계산
    const interval = now - lastCallTimeRef.current
    lastCallTimeRef.current = now

    // 최근 60개의 간격만 저장 (메모리 효율)
    intervalsRef.current.push(interval)
    if (intervalsRef.current.length > 60) {
      intervalsRef.current.shift()
    }

    // 평균 간격 계산
    const avgInterval = intervalsRef.current.reduce((a, b) => a + b, 0) / intervalsRef.current.length
    stats.averageInterval = avgInterval

    // 초당 호출 횟수 계산
    const elapsed = (now - stats.lastResetTime) / 1000
    stats.callsPerSecond = elapsed > 0 ? stats.totalCalls / elapsed : 0

    // 1초마다 통계 출력
    if (elapsed >= 1) {
      console.group(`🔍 [Performance] ${label}`)
      console.log(`📊 Total calls: ${stats.totalCalls}`)
      console.log(`⚡ Calls/sec: ${stats.callsPerSecond.toFixed(2)}`)
      console.log(`⏱️  Avg interval: ${stats.averageInterval.toFixed(2)}ms`)
      console.log(`🎯 Target: 60fps = 16.67ms interval`)

      if (stats.averageInterval < 20) {
        console.warn('⚠️  Very high frequency! This may cause performance issues.')
      }

      console.groupEnd()

      // 통계 초기화
      stats.totalCalls = 0
      stats.lastResetTime = now
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}

/**
 * 컴포넌트 렌더링 횟수를 추적하는 훅
 */
export function useRenderCount(componentName: string) {
  const renderCountRef = useRef(0)
  const lastLogTimeRef = useRef(performance.now())

  renderCountRef.current++

  const now = performance.now()
  const elapsed = (now - lastLogTimeRef.current) / 1000

  // 1초마다 렌더링 횟수 출력
  if (elapsed >= 1) {
    const rendersPerSecond = renderCountRef.current / elapsed

    console.group(`🎨 [Render] ${componentName}`)
    console.log(`📊 Renders in last ${elapsed.toFixed(1)}s: ${renderCountRef.current}`)
    console.log(`⚡ Renders/sec: ${rendersPerSecond.toFixed(2)}`)

    if (rendersPerSecond > 60) {
      console.warn('⚠️  Rendering more than 60 times per second!')
    }

    console.groupEnd()

    renderCountRef.current = 0
    lastLogTimeRef.current = now
  }
}

/**
 * useEffect 실행 시간을 측정하는 훅
 */
export function useEffectTiming(label: string, callback: () => void | (() => void), deps: unknown[]) {
  useEffect(() => {
    const start = performance.now()
    const cleanup = callback()
    const end = performance.now()
    const duration = end - start

    if (duration > 16.67) {
      console.warn(`⚠️  [Effect Timing] ${label} took ${duration.toFixed(2)}ms (> 16.67ms)`)
    } else {
      console.log(`✅ [Effect Timing] ${label} took ${duration.toFixed(2)}ms`)
    }

    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
