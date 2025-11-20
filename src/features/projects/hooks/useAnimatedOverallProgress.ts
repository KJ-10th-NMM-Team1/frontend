import { useMemo } from 'react'

import type { ProjectSummary } from '@/entities/project/types'
import type { ProjectProgress } from '@/features/projects/types/progress'

import { useProgressAnimationStore } from '../stores/useProgressAnimationStore'

interface UseAnimatedOverallProgressProps {
  project: ProjectSummary
  sseProgressData?: ProjectProgress
}

/**
 * 타겟 진행률 기반으로 전체 진행률을 계산하는 훅
 *
 * 각 타겟의 애니메이션된 진행도를 가져와서 평균을 계산합니다.
 * SSE로 받은 진행도가 있으면 애니메이션이 적용되고,
 * 없으면 API 진행도를 그대로 사용합니다.
 */
export function useAnimatedOverallProgress({
  project,
  sseProgressData,
}: UseAnimatedOverallProgressProps): number {
  const { progress } = useProgressAnimationStore()

  const overallProgress = useMemo(() => {
    if (!project.targets || project.targets.length === 0) {
      return 0
    }

    let totalProgress = 0

    project.targets.forEach((target) => {
      const key = `${project.id}-${target.language_code}`
      const animatedProgress = progress[key]

      // 애니메이션된 진행도가 있으면 사용
      if (animatedProgress !== undefined) {
        totalProgress += animatedProgress
      } else {
        // SSE 진행도가 있으면 사용, 없으면 API 진행도 사용
        const sseTarget = sseProgressData?.targets[target.language_code]
        const targetProgress = sseTarget?.progress ?? target.progress
        totalProgress += targetProgress
      }
    })

    // 평균 계산
    return Math.round(totalProgress / project.targets.length)
  }, [project.id, project.targets, sseProgressData, progress])

  return overallProgress
}
