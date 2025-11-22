import { useEffect, useMemo } from 'react'

import type { NormalizedProjectData } from './projectDataNormalizer'
import { loadSmoothProgress, saveSmoothProgress } from './smoothProgressStorage'
import { useMultiSmoothProgress } from './useSmoothProgress'

/**
 * 프로젝트 진행도 단계
 * 각 단계 사이에서 부드럽게 증가하는 애니메이션 적용
 */
const PROJECT_PROGRESS_STEPS = [1, 5, 20, 21, 35, 36, 85, 86, 100]

/**
 * 에피소드 카드에 표시할 정규화된 데이터를 관리하는 훅
 *
 * - 각 target별 진행도에 smooth progress 애니메이션 적용
 * - project 전체 진행률은 target별 진행도의 평균으로 계산
 * - smoothed progress를 localStorage에 저장하여 새로고침 시에도 유지
 *
 * @param projectId - 프로젝트 ID (localStorage 키로 사용)
 * @param normalizedData - 정규화된 프로젝트 데이터
 * @returns 화면에 표시할 데이터
 */
export function useEpisodeCardData(projectId: string, normalizedData: NormalizedProjectData) {
  // target별 progress를 Record 형태로 변환
  const targetProgresses = useMemo(() => {
    const progresses: Record<string, number> = {}
    normalizedData.targets.forEach((target) => {
      progresses[target.languageCode] = target.progress
    })
    return progresses
  }, [normalizedData.targets])

  // localStorage에서 저장된 smooth progress 로드 (마운트 시 1회)
  const savedProgresses = useMemo(() => loadSmoothProgress(projectId), [projectId])

  // 병합: 저장된 smooth 값과 API 값 중 높은 값 사용
  // - 저장된 값이 더 높으면 → 이어서 스무딩 (새로고침 후에도 자연스럽게 이어짐)
  // - API 값이 더 높으면 → 새로운 진행도로 업데이트 (SSE 업데이트 반영)
  const mergedProgresses = useMemo(() => {
    if (!savedProgresses) return targetProgresses

    const merged: Record<string, number> = { ...targetProgresses }

    Object.keys(targetProgresses).forEach((key) => {
      const apiValue = targetProgresses[key]
      const savedValue = savedProgresses[key]

      // 저장된 값이 있고 API보다 높으면 저장된 값 사용
      if (savedValue !== undefined && savedValue > apiValue) {
        merged[key] = savedValue
      }
    })

    return merged
  }, [targetProgresses, savedProgresses])

  // useSmoothProgress를 사용하여 각 target의 progress를 smooth하게 처리
  const smoothedProgresses = useMultiSmoothProgress({
    progresses: mergedProgresses,
    steps: PROJECT_PROGRESS_STEPS,
  })

  // smoothedProgresses가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveSmoothProgress(projectId, smoothedProgresses)
  }, [projectId, smoothedProgresses])

  // displayData 계산: smoothed progress 적용 및 전체 진행률 평균 계산
  const displayData = useMemo<NormalizedProjectData>(() => {
    const smoothedTargets = normalizedData.targets.map((target) => ({
      ...target,
      progress: smoothedProgresses[target.languageCode] ?? target.progress,
    }))

    // 전체 진행률은 target별 smoothed progress의 평균
    const averageProgress =
      smoothedTargets.length > 0
        ? smoothedTargets.reduce((sum, target) => sum + target.progress, 0) / smoothedTargets.length
        : normalizedData.progress

    return {
      ...normalizedData,
      progress: Math.floor(averageProgress),
      targets: smoothedTargets,
    }
  }, [normalizedData, smoothedProgresses])

  return displayData
}
