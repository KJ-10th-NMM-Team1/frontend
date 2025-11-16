/**
 * 프로젝트 요약 섹션
 * 프로젝트 정보를 표시
 */

import { DubbingIssuesSection } from './DubbingIssuesSection'

type ProjectSummarySectionProps = {
  projectId: string
  segments: number
  duration: number
}

export function ProjectSummarySection({
  projectId,
  segments,
  duration,
}: ProjectSummarySectionProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {/* 이슈 섹션 */}
      <DubbingIssuesSection />

      {/* 프로젝트 정보 */}
      <section className="border-surface-3 flex-1 rounded border bg-white p-3">
        <h3 className="text-foreground mb-3 text-xs font-semibold">프로젝트 정보</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">총 문장</span>
            <span className="text-foreground font-medium">{segments}개</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">총 길이</span>
            <span className="text-foreground font-medium">{formatDuration(duration)}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
