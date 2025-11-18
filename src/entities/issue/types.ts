/**
 * 세그먼트 이슈 정보
 */
export interface Issue {
  id: string
  issue_type: string
  severity: string
  score?: string
  diff?: string
  details?: Record<string, unknown>
  resolved: boolean
}
