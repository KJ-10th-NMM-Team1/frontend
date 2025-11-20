import { Link } from 'react-router-dom'

import type { ProjectSummary } from '@/entities/project/types'
import { useProjectProgressStore } from '@/features/projects/stores/useProjectProgressStore'
import { routes } from '@/shared/config/routes'

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
          onTagClick={onTagClick}
        />
        <EpisodeCardTargets project={project} sseProgressData={sseProgressData} />
      </div>
    </Link>
  )
}

// Re-export utilities for backward compatibility
export { getProjectStatusLabel } from './episodeCardUtils'
