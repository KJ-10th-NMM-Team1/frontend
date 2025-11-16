/**
 * 프로젝트 요약 섹션
 * 프로젝트 정보를 표시
 */

import { useProject } from '@/features/projects/hooks/useProjects'
import { getLanguageFlag, getLanguageName } from '@/shared/lib/language'
import { Spinner } from '@/shared/ui/Spinner'

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
  const { data: project, isLoading } = useProject(projectId)

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
      <section className="border-surface-3 flex-1 overflow-y-auto rounded border bg-white p-3">
        <h3 className="text-foreground mb-3 text-xs font-semibold">프로젝트 정보</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : project ? (
          <div className="space-y-3 text-xs">
            {/* 번역 언어 */}
            {project.targets && project.targets.length > 0 && (
              <div>
                <span className="text-muted mb-1.5 block">번역 언어</span>
                <div className="flex flex-wrap gap-1.5">
                  {project.targets.map((target) => (
                    <div
                      key={target.id}
                      className="bg-surface-2 flex items-center gap-1.5 rounded px-2 py-1"
                    >
                      <span className="text-base leading-none">
                        {getLanguageFlag(target.language_code)}
                      </span>
                      <span className="text-foreground text-xs font-medium">
                        {getLanguageName(target.language_code)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 원본 언어 */}
            <div className="flex justify-between">
              <span className="text-muted">원본 언어</span>
              <div className="flex items-center gap-1">
                <span className="text-base leading-none">
                  {getLanguageFlag(project.source_language)}
                </span>
                <span className="text-foreground font-medium">
                  {getLanguageName(project.source_language)}
                </span>
              </div>
            </div>

            {/* 화자 수 */}
            <div className="flex justify-between">
              <span className="text-muted">화자 수</span>
              <span className="text-foreground font-medium">{project.speaker_count}명</span>
            </div>

            {/* 총 문장 */}
            <div className="flex justify-between">
              <span className="text-muted">총 문장</span>
              <span className="text-foreground font-medium">{segments}개</span>
            </div>

            {/* 총 길이 */}
            <div className="flex justify-between">
              <span className="text-muted">총 길이</span>
              <span className="text-foreground font-medium">{formatDuration(duration)}</span>
            </div>
          </div>
        ) : (
          <div className="text-muted py-6 text-center text-xs">
            프로젝트 정보를 불러올 수 없습니다
          </div>
        )}
      </section>
    </div>
  )
}
