/**
 * 프로젝트 요약 섹션
 * 프로젝트 정보를 표시
 */

import type { Segment } from '@/entities/segment/types'
import { useProject } from '@/features/projects/hooks/useProjects'
import { getLanguageFlag, getLanguageName } from '@/shared/lib/language'
import { Spinner } from '@/shared/ui/Spinner'

import { DubbingIssuesSection } from './DubbingIssuesSection'

type ProjectSummarySectionProps = {
  projectId: string
  segments: Segment[]
  duration: number
}

export function ProjectSummarySection({
  projectId,
  segments,
  duration,
}: ProjectSummarySectionProps) {
  const { data: project, isLoading } = useProject(projectId)

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* 이슈 섹션 */}
      <DubbingIssuesSection segments={segments} />

      {/* 프로젝트 정보 */}
      <section className="scrollbar-thin flex-1 overflow-y-auto rounded border border-surface-3 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">프로젝트 정보</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : project ? (
          <div className="space-y-4 text-sm">
            {/* 번역 언어 */}
            {project.targets && project.targets.length > 0 && (
              <div>
                <span className="mb-2 block text-muted">번역 언어</span>
                <div className="flex flex-wrap gap-2">
                  {project.targets.map((target) => (
                    <div
                      key={target.target_id}
                      className="flex items-center gap-2 rounded bg-surface-2 px-3 py-1.5"
                    >
                      <span className="text-lg leading-none">
                        {getLanguageFlag(target.language_code)}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {getLanguageName(target.language_code)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 원본 언어 */}
            {/* <div className="flex justify-between">
              <span className="text-muted">원본 언어</span>
              <div className="flex items-center gap-1">
                <span className="text-base leading-none">
                  {getLanguageFlag(project.source_language)}
                </span>
                <span className="font-medium text-foreground">
                  {getLanguageName(project.source_language)}
                </span>
              </div>
            </div> */}

            {/* 화자 수 */}
            <div className="flex justify-between">
              <span className="text-muted">화자 수</span>
              <span className="font-medium text-foreground">{project.speaker_count}명</span>
            </div>

            {/* 총 문장 */}
            <div className="flex justify-between">
              <span className="text-muted">총 문장</span>
              <span className="font-medium text-foreground">{segments.length}개</span>
            </div>

            {/* 총 길이 */}
            <div className="flex justify-between">
              <span className="text-muted">총 길이</span>
              <span className="font-medium text-foreground">{formatDuration(duration)}</span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted">
            프로젝트 정보를 불러올 수 없습니다
          </div>
        )}
      </section>
    </div>
  )
}
