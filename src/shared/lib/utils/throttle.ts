/**
 * 함수 호출을 일정 시간 간격으로 제한합니다.
 *
 * @param func - throttle을 적용할 함수
 * @param limit - 최소 호출 간격 (ms)
 * @returns throttled 함수
 *
 * @example
 * const throttledScroll = throttle((e) => console.log(e), 100)
 * window.addEventListener('scroll', throttledScroll)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false
  let lastArgs: Parameters<T> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true

      setTimeout(() => {
        inThrottle = false

        // 마지막에 호출된 인자가 있으면 실행 (trailing call)
        if (lastArgs) {
          func.apply(this, lastArgs)
          lastArgs = null
        }
      }, limit)
    } else {
      // throttle 중에는 마지막 호출 저장
      lastArgs = args
    }
  }
}

/**
 * requestAnimationFrame을 이용한 throttle
 * 프레임 단위로 제한하여 60fps에 맞춰 호출합니다.
 *
 * @example
 * const throttledRender = throttleRAF((data) => render(data))
 * element.addEventListener('pointermove', throttledRender)
 */
export function throttleRAF<T extends (...args: any[]) => any>(
  func: T,
): (...args: Parameters<T>) => void {
  let rafId: number | null = null
  let lastArgs: Parameters<T> | null = null

  return function (this: any, ...args: Parameters<T>) {
    lastArgs = args

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func.apply(this, lastArgs)
        }
        rafId = null
        lastArgs = null
      })
    }
  }
}
