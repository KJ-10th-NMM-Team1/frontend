import {
  DAY_IN_MS,
  LANGUAGE_COUNTRY_MAP,
  PROJECT_STAGE_LABELS,
  TARGET_STATUS_LABELS,
  type StatusLabel,
} from './episodeCardConstants'

/**
 * 영상 길이를 MM:SS 형식으로 포맷
 */
export function formatDuration(seconds = 0) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 프로젝트 Stage → 표시 레이블
 * (워커에서 보내는 stage 값: "starting", "asr_started", "done", "failed" 등)
 *
 * @param stage - 프로젝트 현재 stage (워커가 전달하는 문자열)
 * @returns UI에 표시할 상태 레이블
 */
export function getProjectStatusLabel(stage?: string): StatusLabel {
  if (!stage) return '처리중'

  // 매핑 테이블에 있으면 해당 레이블 반환
  const mappedLabel = PROJECT_STAGE_LABELS[stage]
  if (mappedLabel) {
    return mappedLabel
  }

  // 매핑에 없는 경우 패턴으로 판단
  const lowerStage = stage.toLowerCase()

  if (lowerStage === 'failed' || lowerStage.includes('error')) {
    return '실패'
  }

  if (lowerStage === 'done' || lowerStage === 'completed' || lowerStage.endsWith('_completed')) {
    return '완료'
  }

  if (lowerStage === 'pending' || lowerStage.includes('wait')) {
    return '대기'
  }

  // 그 외 모든 경우는 처리중으로 간주
  return '처리중'
}

/**
 * 타겟 상태 → 표시 레이블
 * (Enum 타입: pending, processing, completed, failed)
 *
 * @param status - 타겟 언어별 상태
 * @returns UI에 표시할 상태 레이블
 */
export function getTargetStatusLabel(status?: string): StatusLabel {
  return TARGET_STATUS_LABELS[status ?? ''] ?? '대기'
}

/**
 * 등록일 포맷 (오늘/어제/N일 전)
 */
export function formatRegisteredAt(dateString?: Date) {
  if (!dateString) return null

  const createdAt = new Date(dateString)
  if (Number.isNaN(createdAt.getTime())) return null

  const today = new Date()
  const diffDays = Math.floor((today.getTime() - createdAt.getTime()) / DAY_IN_MS)

  if (diffDays <= 0) return '오늘'
  return `${diffDays}일 전`
}

/**
 * 언어 코드에서 국가 코드 가져오기
 */
export function getCountryCode(languageCode: string): string {
  const lowerCode = languageCode.toLowerCase()
  return LANGUAGE_COUNTRY_MAP[lowerCode] ?? lowerCode.slice(0, 2).toUpperCase()
}

/**
 * 프로젝트 ID에서 그라디언트 인덱스 계산
 */
export function getGradientIndex(projectId: string, gradientsLength: number): number {
  return Math.abs(projectId.charCodeAt(0)) % gradientsLength
}

/**
 * 타겟들의 평균 진행도 계산
 * API 응답에는 overall_progress가 없으므로 타겟별 progress를 평균내어 계산
 */
export function calculateProgressFromTargets(targets: Array<{ progress: number }>): number {
  if (!targets || targets.length === 0) {
    return 0
  }

  const totalProgress = targets.reduce((sum, target) => {
    const progress = typeof target.progress === 'number' ? target.progress : 0
    return sum + Math.min(Math.max(progress, 0), 100)
  }, 0)

  return Math.round(totalProgress / targets.length)
}
