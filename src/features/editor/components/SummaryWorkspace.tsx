import type { Segment } from '@/entities/segment/types'

import { ProjectSummarySection } from './ProjectSummarySection'

type SummaryWorkspaceProps = {
  projectId: string
  segments: Segment[]
  duration: number
}

export function SummaryWorkspace({ projectId, segments, duration }: SummaryWorkspaceProps) {
  return (
    <ProjectSummarySection projectId={projectId} segments={segments.length} duration={duration} />
  )
}
