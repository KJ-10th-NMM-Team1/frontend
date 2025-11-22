import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 진행도가 부드럽게 올라 갈 수 있게 애니메이션을 관리하는 훅
 *
 * steps를 받아, 다음 진행도까지 자연스럽게 증가시킨다.
 *
 * @param steps - 진행률 중간 기준점 (예: [0, 25, 50, 75, 100])
 * @param currentProgress - 현재 진행률
 * @returns 실제 보여줄 진행률
 */

interface SmoothProgressProps {
  currentProgress: number
  steps: number[]
}

/**
 * 랜덤한 지연 시간 생성 (평균 600ms)
 * 500ms ~ 1000ms 범위
 */
export function getRandomDelay(): number {
  return 500 + Math.random() * 500
}

/**
 * 랜덤한 증가 폭 생성
 * 1 ~ 2 범위
 */
export function getRandomIncrement(): number {
  return 1 + Math.random()
}

export const useSmoothProgress = ({ steps, currentProgress }: SmoothProgressProps) => {
  const [displayProgress, setDisplayProgress] = useState(currentProgress)
  const displayProgressRef = useRef(currentProgress)

  // ref와 state 동기화
  useEffect(() => {
    displayProgressRef.current = displayProgress
  }, [displayProgress])

  // currentProgress가 변경되면 즉시 갱신
  useEffect(() => {
    setDisplayProgress(currentProgress)
  }, [currentProgress])

  // 자동 증가 로직
  useEffect(() => {
    // 현재 진행도가 속한 step 구간 찾기
    const nextStepIndex = steps.findIndex((step) => step > currentProgress)

    // 다음 step이 없으면 자동 증가 중지
    if (nextStepIndex === -1) return

    const nextStep = steps[nextStepIndex]
    const limit = nextStep - 1

    // 이미 limit에 도달했으면 자동 증가 중지
    if (displayProgressRef.current >= limit) {
      return
    }

    // 랜덤 타이밍으로 자동 증가
    const timer = setTimeout(() => {
      setDisplayProgress((prev) => {
        // 타이머 실행 시점에 이미 limit 도달했다면 업데이트하지 않음
        if (prev >= limit) return prev
        const increment = getRandomIncrement()
        return Math.min(prev + increment, limit)
      })
    }, getRandomDelay())

    return () => clearTimeout(timer)
  }, [currentProgress, steps])

  return displayProgress
}

/**
 * 여러 progress를 동시에 smooth하게 관리하는 훅
 */
interface MultiSmoothProgressProps {
  progresses: Record<string, number>
  steps: number[]
}

export const useMultiSmoothProgress = ({ progresses, steps }: MultiSmoothProgressProps) => {
  const [smoothedProgresses, setSmoothedProgresses] = useState<Record<string, number>>(progresses)

  // progresses가 변경되면 즉시 갱신
  useEffect(() => {
    setSmoothedProgresses(progresses)
  }, [progresses])

  const increaseProgress = useCallback(
    (key: string) => {
      setSmoothedProgresses((prev) => {
        const currentProgress = prev[key]
        if (currentProgress === undefined) return prev

        // 현재 진행도가 속한 step 구간 찾기
        const nextStepIndex = steps.findIndex((step) => step > currentProgress)
        // 다음 step이 없으면 증가하지 않음
        if (nextStepIndex === -1) return prev
        const limit = steps[nextStepIndex] - 1

        // 이미 limit에 도달했으면 증가하지 않음
        if (currentProgress >= limit) return prev

        // 1씩 증가
        const newProgress = Math.min(currentProgress + 1, limit)

        return {
          ...prev,
          [key]: newProgress,
        }
      })
    },
    [steps],
  )

  // 각 target별로 랜덤 타이밍에 자동 증가
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    Object.keys(smoothedProgresses).forEach((key) => {
      // 각 target마다 랜덤 타이밍으로 증가
      const timer = setTimeout(() => {
        increaseProgress(key)
      }, getRandomDelay())

      timers.push(timer)
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [smoothedProgresses, increaseProgress])

  return smoothedProgresses
}
