import type { Segment } from '@/entities/segment/types'

/**
 * 에디터 버전 스냅샷
 * 프론트엔드에서만 관리되는 버전 정보
 */
export interface EditorVersion {
  id: string
  name: string // version0, version1, version2 등
  createdAt: Date
  segments: Segment[] // 해당 버전의 세그먼트 스냅샷
  description?: string // 버전 설명 (선택적)
}
