import type { ProjectSummary } from '@/entities/project/types'

import { formatRegisteredAt } from './episodeCardUtils'

interface EpisodeCardInfoProps {
  project: ProjectSummary
  isCompleted?: boolean
  isFailed?: boolean
  isProcessing?: boolean
  onTagClick?: (tag: string) => void
}

/**
 * 에피소드 카드 정보 영역 (제목, 생성일, 상태)
 */
export function EpisodeCardInfo({
  project,
  isCompleted,
  isFailed,
}: EpisodeCardInfoProps) {
  const registeredLabel = formatRegisteredAt(project.created_at)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <p className="line-clamp-1 text-lg font-semibold">{project.title}</p>
      </div>
      <p className="text-xs text-muted">{registeredLabel}</p>
    </div>
  )
}
