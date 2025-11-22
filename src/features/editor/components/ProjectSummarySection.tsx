/**
 * 에피소드 요약 섹션
 * 에피소드 정보를 표시
 */

import type { Segment } from '@/entities/segment/types'

import { DubbingIssuesSection } from './DubbingIssuesSection'

type ProjectSummarySectionProps = {
  projectId: string
  segments: Segment[]
  duration: number
}

export function ProjectSummarySection({ segments }: ProjectSummarySectionProps) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <DubbingIssuesSection segments={segments} />
    </div>
  )
}
