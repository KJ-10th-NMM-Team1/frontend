import { useEffect } from 'react'

import { getNextStageProgress } from '../constants/progressStages'
import { useProgressAnimationStore } from '../stores/useProgressAnimationStore'

interface UseProgressAnimationProps {
  projectId: string
  languageCode: string
  sseProgress?: number // SSE로 받은 진행도
}

/**
 * SSE로 받은 진행도를 부드럽게 증가시키는 훅
 *
 * 동작:
 * 1. SSE로 진행도를 받으면 해당 값으로 설정
 * 2. 다음 진행 단계 이전까지 1씩 증가
 * 3. 300ms마다 1씩 증가하여 부드러운 UX 제공
 */
export function useProgressAnimation({
  projectId,
  languageCode,
  sseProgress,
}: UseProgressAnimationProps) {
  const { progress, setProgress, getProgress } = useProgressAnimationStore()
  const key = `${projectId}-${languageCode}`
  const currentProgress = progress[key]

  // SSE로 받은 진행도가 있으면 바로 업데이트
  useEffect(() => {
    if (sseProgress !== undefined) {
      const stored = getProgress(projectId, languageCode)

      // SSE 진행도가 현재 진행도보다 크면 업데이트
      if (stored === undefined || sseProgress > stored) {
        setProgress(projectId, languageCode, sseProgress)
      }
    }
  }, [sseProgress, projectId, languageCode, getProgress, setProgress])

  // 현재 진행도부터 다음 단계 이전까지 1씩 증가
  useEffect(() => {
    if (currentProgress === undefined || currentProgress >= 100) {
      return
    }

    const nextStageProgress = getNextStageProgress(currentProgress)
    const targetProgress = nextStageProgress - 1 // 다음 단계 직전까지

    if (currentProgress >= targetProgress) {
      return
    }

    const interval = setInterval(() => {
      const current = getProgress(projectId, languageCode) ?? currentProgress

      // 다음 단계 직전까지만 증가
      if (current >= targetProgress) {
        clearInterval(interval)
        return
      }

      setProgress(projectId, languageCode, current + 1)
    }, 300) // 300ms마다 1씩 증가

    return () => clearInterval(interval)
  }, [currentProgress, projectId, languageCode, setProgress, getProgress])

  return currentProgress
}
