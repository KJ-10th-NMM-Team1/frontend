import type { Segment } from '@/entities/segment/types'

import { DubbingIssuesSection } from './DubbingIssuesSection'
import { TranslationSummarySection } from './TranslationSummarySection'

type SummaryWorkspaceProps = {
  segments: Segment[]
  sourceLanguage: string
  targetLanguage: string
}

export function SummaryWorkspace() {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {/* 상단: 이슈 표시 영역 */}
      <DubbingIssuesSection />

      {/* 하단: 번역 결과 요약 */}
      <TranslationSummarySection />
    </div>
  )
}
