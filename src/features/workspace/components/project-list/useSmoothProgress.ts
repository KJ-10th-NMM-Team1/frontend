import { useEffect, useRef, useState } from 'react'

import { STAGE_PROGRESS_MAP } from './episodeCardConstants'

// Stage 순서 정의 (진행 순서대로)
const STAGE_ORDER = [
  'starting',
  'asr_started',
  'asr_completed',
  'translation_started',
  'translation_completed',
  'tts_started',
  'tts_completed',
  'mux_started',
  'done',
]

/**
 * SSE로 받은 진행도와 Stage를 기반으로 부드러운 진행도 표시를 처리하는 훅
 *
 * @param targetProgress - SSE로 받은 실제 진행도
 * @param currentStage - 현재 처리 단계
 * @returns 화면에 표시할 진행도
 */
export function useSmoothProgress(targetProgress: number, currentStage: string) {
  const [displayProgress, setDisplayProgress] = useState(targetProgress)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // SSE로 새로운 값이 들어오면 즉시 반영
  useEffect(() => {
    setDisplayProgress(targetProgress)
  }, [targetProgress])

  useEffect(() => {
    // 완료나 실패면 자동 증가 로직 중단
    if (targetProgress >= 100 || targetProgress === 0 || currentStage === 'done' || currentStage === 'failed') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }

    // 다음 단계의 목표 진행도 찾기
    const currentIndex = STAGE_ORDER.indexOf(currentStage)
    let nextStageProgress = 100

    // Stage가 순서에 없으면 자동 증가 하지 않음 (limit = target)
    if (currentIndex === -1) {
      nextStageProgress = targetProgress + 1
    } else if (currentIndex < STAGE_ORDER.length - 1) {
      const nextStage = STAGE_ORDER[currentIndex + 1]
      nextStageProgress = STAGE_PROGRESS_MAP[nextStage] || 100
    }

    // 목표치: 다음 단계 진행도 - 1 (다음 단계 도달 전까지만 증가)
    const limitProgress = Math.max(targetProgress, nextStageProgress - 1)

    const scheduleNextIncrement = () => {
      // 평균 500ms의 랜덤 간격 (200ms ~ 800ms)
      const randomDelay = Math.random() * 600 + 200

      timeoutRef.current = setTimeout(() => {
        setDisplayProgress((prev) => {
          // 목표치에 도달했으면 멈춤
          if (prev >= limitProgress) {
            return prev
          }
          // 1씩 증가
          return Math.min(prev + 1, limitProgress)
        })
        scheduleNextIncrement()
      }, randomDelay)
    }

    scheduleNextIncrement()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [targetProgress, currentStage]) // targetProgress가 바뀌면 재설정 (위의 useEffect로 즉시 반영 후 다시 스케줄링)

  return displayProgress
}
