import type { ProjectSummary } from '@/entities/project/types'

interface EpisodeCardInfoProps {
  project: ProjectSummary
}

/**
 * 에피소드 카드 정보 영역 (제목)
 */
export function EpisodeCardInfo({ project }: EpisodeCardInfoProps) {
  return (
    <p className="line-clamp-1 text-lg font-semibold">{project.title}</p>
  )
}
