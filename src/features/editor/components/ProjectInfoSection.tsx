import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, FileVideo, Globe, Tag } from 'lucide-react'

import type { ProjectSummary } from '@/entities/project/types'
import { apiGet } from '@/shared/api/client'
import { queryKeys } from '@/shared/config/queryKeys'
import { getLanguageFlag, getLanguageName } from '@/shared/lib/language'
import { Spinner } from '@/shared/ui/Spinner'

interface ProjectInfoSectionProps {
  projectId: string
}

/**
 * 프로젝트 정보 섹션
 *
 * 프로젝트의 기본 정보를 표시합니다.
 */
export function ProjectInfoSection({ projectId }: ProjectInfoSectionProps) {
  const { data: project, isLoading } = useQuery<ProjectSummary>({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: async () => {
      const response = await apiGet(`/projects/${projectId}`)
      return response as ProjectSummary
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted">프로젝트 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}분 ${secs}초`
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="space-y-6">
        {/* 프로젝트 제목 */}
        <div>
          <h3 className="font-semibold text-foreground">{project.title}</h3>
        </div>

        {/* 기본 정보 */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 text-muted" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted">생성일</p>
              <p className="mt-0.5 text-sm text-foreground">{formatDate(project.created_at)}</p>
            </div>
          </div>

          {project.duration_seconds && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-muted" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted">영상 길이</p>
                <p className="mt-0.5 text-sm text-foreground">
                  {formatDuration(project.duration_seconds)}
                </p>
              </div>
            </div>
          )}

          {project.source_language && (
            <div className="flex flex-col">
              <div className="mb-2 flex items-center gap-3">
                <Globe className="mt-0.5 h-4 w-4 text-muted" />
                <p className="text-xs font-medium text-muted">원본 언어</p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded bg-surface-2 px-3 py-1.5">
                <span className="text-lg leading-none">
                  {getLanguageFlag(project.source_language)}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {getLanguageName(project.source_language)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 타겟 언어 */}
        {project.targets && project.targets.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted" />
              <h4 className="text-xs font-medium text-muted">타겟 언어</h4>
            </div>
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

        {/* 태그 */}
        {project.tags && project.tags.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted" />
              <h4 className="text-xs font-medium text-muted">태그</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 이슈 */}
        {project.issue_count > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-medium text-muted">이슈</h4>
            <div className="rounded-lg border border-surface-3 bg-surface-2 px-3 py-2">
              <span className="text-sm font-medium text-foreground">
                {project.issue_count}개의 이슈
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
