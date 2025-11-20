import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import type { ProjectSummary } from '@/entities/project/types'
import { useProjectProgressStore } from '@/features/projects/stores/useProjectProgressStore'
import { routes } from '@/shared/config/routes'
import { useUiStore } from '@/shared/store/useUiStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

import { EpisodeCardActions } from './EpisodeCardActions'
import { EpisodeCardInfo } from './EpisodeCardInfo'
import { EpisodeCardTargets } from './EpisodeCardTargets'
import { EpisodeCardThumbnail } from './EpisodeCardThumbnail'
import { GRADIENTS } from './episodeCardConstants'
import { getGradientIndex } from './episodeCardUtils'
import { getProgressMessage, getStatusFlags, normalizeProjectData } from './projectDataNormalizer'

type EpisodeCardProps = {
  project: ProjectSummary
  onEdit?: (project: ProjectSummary) => void
  onDelete?: (project: ProjectSummary) => void
  onTagClick?: (tag: string) => void
}

export function EpisodeCard({ project, onEdit, onDelete, onTagClick }: EpisodeCardProps) {
  const showActions = Boolean(onEdit || onDelete)
  const gradientIndex = getGradientIndex(project.id, GRADIENTS.length)
  const gradient = GRADIENTS[gradientIndex]

  // SSE Store에서 실시간 진행도 데이터 가져오기
  const sseProgressData = useProjectProgressStore((state) => state.getProjectProgress(project.id))

  // API와 SSE 데이터를 정규화하여 일관된 형태로 통합
  const normalizedData = normalizeProjectData(project, sseProgressData)

  // SSE로 받은 진행도 사용
  const progress = normalizedData.progress
  const progressMessage = getProgressMessage(normalizedData)

  // UI 표시용 플래그 계산
  const { isProcessing, isFailed, isCompleted } = getStatusFlags(normalizedData)

  const primaryTargetLanguage = project.targets?.[0]?.language_code
  const tags = project.tags ?? []
  const workspaceSelectedTags = useUiStore((state) => state.workspaceSelectedTags) ?? []
  const MAX_VISIBLE_TAGS = 3

  const orderedTags = useMemo(() => {
    const selected = workspaceSelectedTags.filter((t) => tags.includes(t))
    const others = tags.filter((t) => !selected.includes(t))
    return [...selected, ...others]
  }, [workspaceSelectedTags, tags])
  const visibleTags = orderedTags.slice(0, MAX_VISIBLE_TAGS)
  const hiddenTags = orderedTags.slice(MAX_VISIBLE_TAGS)
  const hiddenCount = Math.max(orderedTags.length - visibleTags.length, 0)
  const episodeLink = primaryTargetLanguage
    ? routes.editor(project.id, primaryTargetLanguage)
    : routes.projectDetail(project.id)

  return (
    <Link
      to={episodeLink}
      className="focus-visible:outline-hidden group block overflow-hidden rounded-3xl border shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      {/* Thumbnail section */}
      <div className="relative">
        {showActions && isCompleted && (
          <EpisodeCardActions project={project} onEdit={onEdit} onDelete={onDelete} />
        )}
        <EpisodeCardThumbnail
          project={project}
          gradient={gradient}
          progress={progress}
          progressMessage={progressMessage}
          isProcessing={isProcessing}
          isFailed={isFailed}
          isCompleted={isCompleted}
        />
      </div>

      {/* Info section */}
      <div className="space-y-2.5 p-4">
        <EpisodeCardInfo
          project={project}
          isCompleted={isCompleted}
          isFailed={isFailed}
          isProcessing={isProcessing}
        />
        <EpisodeCardTargets project={project} sseProgressData={sseProgressData} />
        <div className="relative mt-2 flex items-center gap-2">
          <div className="relative flex min-w-0 flex-1">
            <div className="flex flex-nowrap items-center gap-1 overflow-hidden whitespace-nowrap pr-10">
              {visibleTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition hover:bg-surface-3 ${
                    workspaceSelectedTags.includes(tag)
                      ? 'border border-primary/60 bg-primary/10 text-primary'
                      : 'bg-surface-2 text-foreground'
                  }`}
                  onClick={(event) => {
                    if (!onTagClick) return
                    event.preventDefault()
                    event.stopPropagation()
                    onTagClick(tag)
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
            {hiddenCount > 0 ? (
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white via-white/70 to-transparent" />
            ) : null}
          </div>

          {hiddenCount > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground focus-visible:outline-hidden flex h-8 shrink-0 items-center gap-2 rounded-full bg-surface-2 px-3 text-[11px] font-semibold shadow-sm transition hover:bg-surface-3 focus-visible:ring-2 focus-visible:ring-primary/30"
                  aria-label={`태그 ${hiddenCount}개 더 보기`}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                >
                  +{hiddenCount}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  추가 태그
                </DropdownMenuLabel>
                {hiddenTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag}
                    className="text-[12px]"
                    onClick={(event) => {
                      if (!onTagClick) return
                      event.preventDefault()
                      event.stopPropagation()
                      onTagClick(tag)
                    }}
                  >
                    #{tag}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

// Re-export utilities for backward compatibility
export { getProjectStatusLabel } from './episodeCardUtils'
