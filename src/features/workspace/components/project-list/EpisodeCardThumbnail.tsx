import type { ProjectSummary } from '@/entities/project/types'
import { env } from '@/shared/config/env'

import { formatDuration } from './episodeCardUtils'
import { ProgressOverlay } from './ProgressOverlay'

interface EpisodeCardThumbnailProps {
  project: ProjectSummary
  gradient: string
  progress: number
  progressMessage?: string
  isProcessing: boolean
  isFailed: boolean
  isCompleted: boolean
}

/**
 * 에피소드 카드 썸네일 영역 (이미지, 진행도)
 */
export function EpisodeCardThumbnail({
  project,
  gradient,
  progress,
  progressMessage,
  // isProcessing,
  isFailed,
  isCompleted,
}: EpisodeCardThumbnailProps) {
  const thumbnailUrl =
    project.thumbnail?.kind === 's3' && project.thumbnail?.key
      ? `https://${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com/${project.thumbnail.key}`
      : project.thumbnail?.url

  return (
    <div className="relative aspect-video overflow-hidden">
      {/* Thumbnail or gradient background */}
      {project.thumbnail ? (
        <img src={thumbnailUrl} alt={''} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />
      )}

      {/* Progress overlay (완료되지 않은 경우에만 표시) */}
      {!isCompleted && (
        <ProgressOverlay
          project={project}
          progress={progress}
          message={progressMessage}
          isFailed={isFailed}
          isCompleted={isCompleted}
        />
      )}

      {/* Duration badge (우측 하단) */}
      {project.duration_seconds != null && (
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
          {formatDuration(project.duration_seconds)}
        </span>
      )}
    </div>
  )
}
