import type { ProjectSummary } from '@/entities/project/types'

import { EpisodeCard } from './EpisodeCard'

type ProjectListProps = {
  projects: ProjectSummary[]
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="border-surface-4 bg-surface-2 rounded-3xl border border-dashed p-10 text-center">
        <p className="text-muted text-sm">등록된 에피소드가 없습니다. 지금 바로 만들어보세요.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-8 xl:grid-cols-3">
      {projects.map((project) => (
        <EpisodeCard key={project.id} project={project} />
      ))}
    </div>
  )
}
