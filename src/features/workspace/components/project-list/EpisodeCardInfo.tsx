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
  isProcessing,
  onTagClick,
}: EpisodeCardInfoProps) {
  const registeredLabel = formatRegisteredAt(project.created_at)

  // 상태에 따른 점 색상
  const statusColor = isCompleted
    ? 'bg-green-500'
    : isFailed
      ? 'bg-red-500'
      : isProcessing
        ? 'bg-blue-500'
        : 'bg-gray-400'

  const tags: string[] = project.tags ?? []

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <p className="line-clamp-1 text-lg font-semibold">{project.title}</p>

        <div
          className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${statusColor}`}
          title={isCompleted ? '완료' : isFailed ? '실패' : isProcessing ? '처리 중' : '대기'}
        />

        {tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-medium text-foreground transition hover:bg-surface-3"
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
        ) : null}
      </div>
      <p className="text-xs text-muted">{registeredLabel}</p>
    </div>
  )
}
