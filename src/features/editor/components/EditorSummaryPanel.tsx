import { Info } from 'lucide-react'

import type { Segment } from '@/entities/segment/types'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '@/shared/ui/Tabs'

import { ProjectInfoSection } from './ProjectInfoSection'
import { TranslationSummarySection } from './TranslationSummarySection'
import { DubbingIssuesSection } from './DubbingIssuesSection'
import { VersionListSection } from './VersionListSection'

interface EditorSummaryPanelProps {
  projectId: string
  languageCode: string
  segments: Segment[]
  duration: number
  sourceLanguage: string
  targetLanguage: string
  summaryPaneRatio: number
}

/**
 * 에디터 우측 패널 - 이슈/번역/버전/정보 탭
 *
 * - 이슈 탭: 세그먼트 이슈 목록
 * - 번역 탭: 번역 요약 섹션
 * - 버전 탭: 버전 관리 섹션
 * - 정보 탭: 프로젝트 정보
 */
export function EditorSummaryPanel({
  projectId,
  languageCode,
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
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              이슈
            </TabsTrigger>
            <TabsTrigger
              value="translation"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              번역
            </TabsTrigger>
            <TabsTrigger
              value="version"
              className="data-[state=active]:text-balck data-[state=active]:bg-tran rounded-none border-primary px-4 py-2 text-xs font-semibold data-[state=active]:border-b-2"
            >
              버전
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="ml-auto rounded-none border-b-2 border-transparent bg-transparent px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
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

        <TabsContent value="version" className="mt-0 flex-1 overflow-hidden">
          <VersionListSection projectId={projectId} languageCode={languageCode} />
        </TabsContent>

        <TabsContent value="info" className="mt-0 flex-1 overflow-hidden">
          <ProjectInfoSection projectId={projectId} />
        </TabsContent>
      </TabsRoot>
    </div>
  )
}
