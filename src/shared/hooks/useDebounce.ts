import { useEffect, useState } from 'react'

/**
 * 값의 변경을 디바운싱하는 훅
 * @param value 디바운싱할 값
 * @param delay 디바운스 지연 시간 (밀리초)
 * @returns 디바운싱된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
