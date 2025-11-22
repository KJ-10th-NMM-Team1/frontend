import { Info } from 'lucide-react'

import type { Segment } from '@/entities/segment/types'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '@/shared/ui/Tabs'

import { ProjectInfoSection } from './ProjectInfoSection'
import { TranslationSummarySection } from './TranslationSummarySection'
import { DubbingIssuesSection } from './DubbingIssuesSection'

interface EditorSummaryPanelProps {
  projectId: string
  segments: Segment[]
  duration: number
  sourceLanguage: string
  targetLanguage: string
  summaryPaneRatio: number
}

/**
 * 에디터 우측 패널 - 이슈/번역/정보 탭
 *
 * - 요약 탭: 세그먼트 요약 더빙
 * - 번역 탭: 번역 요약 섹션
 * - 정보 탭: 프로젝트 정보
 */
export function EditorSummaryPanel({
  projectId,
  segments,
  sourceLanguage,
  targetLanguage,
  summaryPaneRatio,
}: EditorSummaryPanelProps) {
  return (
    <div
      className="shrink-0 overflow-hidden border border-b-0 border-l-0 border-surface-3 bg-surface-1 shadow-sm"
      style={{ flexBasis: `${summaryPaneRatio * 100}%` }}
    >
      <TabsRoot defaultValue="issues" className="flex h-full flex-col">
        <div className="border-b border-surface-3 px-3">
          <TabsList className="flex h-auto w-full justify-between gap-0 rounded-none border-0 bg-transparent p-0">
            <TabsTrigger
              value="issues"
              className="data-[state=active]:text-balck data-[state=active]:bg-tran rounded-none border-primary px-4 py-2 text-xs font-semibold data-[state=active]:border-b-2"
            >
              이슈
            </TabsTrigger>
            <TabsTrigger
              value="translation"
              className="data-[state=active]:text-balck data-[state=active]:bg-tran rounded-none border-primary px-4 py-2 text-xs font-semibold data-[state=active]:border-b-2"
            >
              번역
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="data-[state=active]:text-balck data-[state=active]:bg-tran ml-auto rounded-none border-primary px-3 py-2 text-xs font-semibold data-[state=active]:border-b-2"
            >
              <Info className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="issues" className="mt-0 flex-1 overflow-hidden">
          <DubbingIssuesSection segments={segments} />
        </TabsContent>

        <TabsContent value="translation" className="mt-0 flex-1 overflow-hidden">
          <TranslationSummarySection
            projectId={projectId}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        </TabsContent>

        <TabsContent value="info" className="mt-0 flex-1 overflow-hidden">
          <ProjectInfoSection projectId={projectId} />
        </TabsContent>
      </TabsRoot>
    </div>
  )
}
