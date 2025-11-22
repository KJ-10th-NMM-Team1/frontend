import { useMemo } from 'react'

import { Link } from 'react-router-dom'

import type { ProjectSummary } from '@/entities/project/types'
import { useProjectProgressStore } from '@/features/projects/stores/useProjectProgressStore'
import { routes } from '@/shared/config/routes'

import { EpisodeCardActions } from './EpisodeCardActions'
import { EpisodeCardInfo } from './EpisodeCardInfo'
import { EpisodeCardTags } from './EpisodeCardTags'
import { EpisodeCardTargets } from './EpisodeCardTargets'
import { EpisodeCardThumbnail } from './EpisodeCardThumbnail'
import { GRADIENTS } from './episodeCardConstants'
import { formatRegisteredAt, getGradientIndex } from './episodeCardUtils'
import { getProgressMessage, getStatusFlags, normalizeProjectData } from './projectDataNormalizer'
import { useEpisodeCardData } from './useEpisodeCardData'

type EpisodeCardProps = {
  project: ProjectSummary
  onExport?: (project: ProjectSummary) => void
  onDelete?: (project: ProjectSummary) => void
  onTagClick?: (tag: string) => void
}

export function EpisodeCard({ project, onExport, onDelete, onTagClick }: EpisodeCardProps) {
  const showActions = Boolean(onExport || onDelete)
  const gradientIndex = getGradientIndex(project.id, GRADIENTS.length)
  const gradient = GRADIENTS[gradientIndex]

  // SSE Store에서 실시간 진행도 데이터 가져오기
  const sseProgressData = useProjectProgressStore((state) => state.getProjectProgress(project.id))

  // API와 SSE 데이터를 정규화하여 일관된 형태로 통합
  // useMemo로 불필요한 재생성 방지
  const normalizedProgress = useMemo(
    () => normalizeProjectData(project, sseProgressData),
    [project, sseProgressData],
  )

  // 화면에 표시할 데이터 관리
  const displayProgress = useEpisodeCardData(project.id, normalizedProgress)
  const progressMessage = getProgressMessage(displayProgress)

  // UI 표시용 플래그 계산
  const { isProcessing, isFailed, isCompleted } = getStatusFlags(displayProgress)

  const episodeLink = routes.editor(project.id)
  return (
    <Link
      to={episodeLink}
      className="focus-visible:outline-hidden group flex h-full flex-col overflow-hidden rounded-3xl border shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      {/* Thumbnail section */}
      <div className="relative shrink-0">
        {showActions && isCompleted && (
          <EpisodeCardActions project={project} onExport={onExport} onDelete={onDelete} />
        )}
        <EpisodeCardThumbnail
          project={project}
          gradient={gradient}
          progress={displayProgress.progress}
          targets={displayProgress.targets}
          progressMessage={progressMessage}
          isProcessing={isProcessing}
          isFailed={isFailed}
          isCompleted={isCompleted}
        />
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <EpisodeCardInfo project={project} />
        <EpisodeCardTargets targets={displayProgress.targets} />
        <EpisodeCardTags tags={project.tags} onTagClick={onTagClick} />
        <span className="mt-auto flex justify-end text-right text-xs leading-3 text-muted">
          {formatRegisteredAt(project.created_at)}
        </span>
      </div>
    </Link>
  )
}

// Re-export utilities for backward compatibility
export { getProjectStatusLabel } from './episodeCardUtils'
