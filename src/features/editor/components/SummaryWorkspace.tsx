import type { Segment } from '@/entities/segment/types'

import { DubbingIssuesSection } from './DubbingIssuesSection'

type SummaryWorkspaceProps = {
  segments: Segment[]
}

export function SummaryWorkspace({ segments }: SummaryWorkspaceProps) {
  return <DubbingIssuesSection segments={segments} />
}
