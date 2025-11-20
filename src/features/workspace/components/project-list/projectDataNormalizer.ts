import type { ProjectSummary } from '@/entities/project/types'
import type { ProjectProgress } from '@/features/projects/types/progress'

import { calculateProgressFromTargets } from './episodeCardUtils'

/**
 * 통합 프로젝트 상태 타입
 * SSE와 API 모두에서 사용하는 정규화된 상태
 */
export type NormalizedStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * 정규화된 프로젝트 데이터
 * SSE와 API 데이터를 통합한 일관된 인터페이스
 */
export interface NormalizedProjectData {
  status: NormalizedStatus
  progress: number
  message?: string
  rawStatus: string // 원본 상태값 (디버깅용)
  targets: Record<string, { progress: number; stage: string }>
}

/**
 * API 상태(워커 stage)를 정규화된 상태로 변환
 *
 * API는 워커의 실제 stage 값을 그대로 전달:
 * - "starting", "asr_started", "translation_completed" 등 → "processing"
 * - "done" → "completed"
 * - "failed" → "failed"
 * - 그 외 → "pending" 또는 패턴 매칭
 */
function normalizeApiStatus(apiStatus: string): NormalizedStatus {
  if (!apiStatus) return 'pending'

  const lowerStatus = apiStatus.toLowerCase()

  // 명확한 완료 상태
  if (lowerStatus === 'done' || lowerStatus === 'completed') {
    return 'completed'
  }

  // 실패 상태
  if (lowerStatus === 'failed' || lowerStatus.includes('error')) {
    return 'failed'
  }

  // 대기 상태
  if (lowerStatus === 'pending' || lowerStatus.includes('wait')) {
    return 'pending'
  }

  // 진행중 상태 (started, processing, 또는 그 외 모든 작업 단계)
  if (
    lowerStatus.includes('start') ||
    lowerStatus.includes('processing') ||
    lowerStatus.includes('_ing') ||
    lowerStatus.includes('upload') ||
    lowerStatus.includes('asr') ||
    lowerStatus.includes('translation') ||
    lowerStatus.includes('tts') ||
    lowerStatus.includes('sync') ||
    lowerStatus.includes('mux') ||
    lowerStatus.includes('packaging')
  ) {
    return 'processing'
  }

  // 기본값: 처리중
  return 'processing'
}

/**
 * SSE 상태를 정규화된 상태로 변환
 * SSE는 이미 4개의 단순 상태만 사용하므로 그대로 반환
 */
function normalizeSseStatus(sseStatus: string): NormalizedStatus {
  // SSE는 이미 정규화된 상태를 사용
  if (['pending', 'processing', 'completed', 'failed'].includes(sseStatus)) {
    return sseStatus as NormalizedStatus
  }

  // 예외 처리 (발생하면 안됨)
  console.warn(`Unexpected SSE status: ${sseStatus}`)
  return 'pending'
}

/**
 * 프로젝트 데이터를 정규화
 * SSE 데이터가 있으면 우선 사용, 없으면 API 데이터 사용
 *
 * @param apiProject - API로부터 받은 프로젝트 데이터
 * @param sseProgress - SSE로부터 받은 실시간 진행도 데이터 (optional)
 * @returns 정규화된 프로젝트 데이터
 */
export function normalizeProjectData(
  apiProject: ProjectSummary,
  sseProgress?: ProjectProgress,
): NormalizedProjectData {
  // SSE 데이터가 있는 경우
  if (sseProgress) {
    // SSE status는 'processing' 등으로 정규화되어 있을 수 있으므로
    // targets에서 구체적인 stage 정보를 추출하여 rawStatus로 사용
    let specificStage: string = sseProgress.status
    const targetLangs = Object.keys(sseProgress.targets)

    if (targetLangs.length > 0) {
      // API 데이터의 첫 번째 타겟(primary)을 기준으로 stage 확인
      const primaryLang = apiProject.targets?.[0]?.language_code
      if (primaryLang && sseProgress.targets[primaryLang]) {
        specificStage = sseProgress.targets[primaryLang].stage
      } else {
        // primary가 없거나 SSE에 없으면 첫 번째 타겟 사용
        specificStage = sseProgress.targets[targetLangs[0]].stage
      }
    }

    return {
      status: normalizeSseStatus(sseProgress.status),
      progress: sseProgress.overallProgress,
      message: sseProgress.message,
      rawStatus: specificStage,
      targets: Object.entries(sseProgress.targets).reduce(
        (acc, [lang, target]) => ({
          ...acc,
          [lang]: {
            progress: target.progress,
            stage: target.stage,
          },
        }),
        {},
      ),
    }
  }

  // API 데이터만 있는 경우
  const normalizedStatus = normalizeApiStatus(apiProject.status)
  const calculatedProgress = calculateProgressFromTargets(apiProject.targets)

  // 상태와 진행도 간 일관성 보정
  // completed 상태인데 progress가 100 미만이면 100으로 보정
  // failed 상태면 progress 그대로 유지 (실패 시점의 진행도)
  const adjustedProgress = normalizedStatus === 'completed' ? 100 : calculatedProgress

  // API targets를 정규화된 targets 형태로 변환
  const normalizedTargets = (apiProject.targets || []).reduce(
    (acc, target) => ({
      ...acc,
      [target.language_code]: {
        progress: target.progress || 0,
        stage: apiProject.status, // API는 개별 타겟 stage가 없으므로 프로젝트 status 사용
      },
    }),
    {},
  )

  return {
    status: normalizedStatus,
    progress: adjustedProgress,
    message: undefined,
    rawStatus: apiProject.status,
    targets: normalizedTargets,
  }
}

/**
 * 정규화된 상태 기반으로 UI 플래그 계산
 */
export function getStatusFlags(data: NormalizedProjectData) {
  const { status, progress } = data

  return {
    isProcessing: status === 'processing' && progress < 100,
    isPending: status === 'pending',
    isCompleted: status === 'completed' || progress === 100,
    isFailed: status === 'failed',
  }
}

/**
 * 진행 상태 메시지 생성
 * SSE 메시지가 있으면 사용, 없으면 상태 기반 기본 메시지
 */
export function getProgressMessage(data: NormalizedProjectData): string | undefined {
  // SSE 메시지가 있으면 우선 사용
  if (data.message) {
    return data.message
  }

  // 상태 기반 기본 메시지
  switch (data.status) {
    case 'pending':
      return '대기 중'
    case 'processing':
      return `처리 중`
    case 'completed':
      return '완료'
    case 'failed':
      return '처리 실패'
    default:
      return undefined
  }
}
