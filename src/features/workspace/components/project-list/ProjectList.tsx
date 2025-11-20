import type { ProjectSummary } from '@/entities/project/types'

import { EpisodeCard } from './EpisodeCard'

type ProjectListProps = {
  projects: ProjectSummary[]
  onEditProject?: (project: ProjectSummary) => void
  onDeleteProject?: (project: ProjectSummary) => void
  onTagClick?: (tag: string) => void
}

export function ProjectList({ projects, onEditProject, onDeleteProject, onTagClick }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-surface-4 bg-surface-2 p-10 text-center">
        <p className="text-sm text-muted">등록된 에피소드가 없습니다. 지금 바로 만들어보세요.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {projects.map((project) => (
        <EpisodeCard
          key={project.id}
          project={project}
          onEdit={onEditProject}
          onDelete={onDeleteProject}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  )
}
