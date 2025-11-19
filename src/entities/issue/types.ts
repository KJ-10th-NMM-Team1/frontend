/**
 * 이슈 타입
 */
export type IssueType = 'stt_quality' | 'tts_quality' | 'sync_duration' | 'speaker_identification'

/**
 * 심각도
 */
export type IssueSeverity = 'high' | 'medium' | 'low'

/**
 * 세그먼트 이슈 정보
 */
export interface Issue {
  id: string
  issue_type: IssueType
  severity: IssueSeverity
  score?: string
  diff?: string
  details?: Record<string, unknown>
  resolved: boolean
}
