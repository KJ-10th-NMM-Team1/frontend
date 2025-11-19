// EditorPage.tsx
import { useEffect, useRef, useState } from 'react'

import { Upload, Video } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { AudioTrackWorkspace } from '@/features/editor/components/AudioTrackWorkspace'
import { LanguageSelector } from '@/features/editor/components/LanguageSelector'
import { SaveIndicator } from '@/features/editor/components/SaveIndicator'
import { StudioVideoPreview } from '@/features/editor/components/StudioVideoPreview'
import { SummaryWorkspace } from '@/features/editor/components/SummaryWorkspace'
import { TranslationSummarySection } from '@/features/editor/components/TranslationSummarySection'
import { useAudioGenerationEvents } from '@/features/editor/hooks/useAudioGenerationEvents'
import { useEditorState } from '@/features/editor/hooks/useEditorState'
import { useSaveSegments } from '@/features/editor/hooks/useSaveSegments'
import { useMux } from '@/features/editor/hooks/useMux'
import { ExportDialog } from '@/features/projects/modals/ExportDialog'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '@/shared/ui/Tabs'

export default function EditorPage() {
  const { projectId = '', languageCode = '' } = useParams<{
    projectId: string
    languageCode: string
  }>()
  const [isExportOpen, setIsExportOpen] = useState(false)
  const { data, isLoading } = useEditorState(projectId, languageCode)
  const setAudioPlaybackMode = useEditorStore((state) => state.setAudioPlaybackMode)
  const reset = useEditorStore((state) => state.reset)
  const { handleMux, isMuxing } = useMux({
    projectId,
    editorData: data,
  })

  // ★ 레이아웃 비율 상태
  // 전체 에디터 높이 중 하단 오디오 트랙 비율 (0.2 ~ 0.8 사이에서 움직이게 할 예정)
  const [audioPaneRatio, setAudioPaneRatio] = useState(0.4)
  // 상단 가로 영역에서 오른쪽 요약/번역 패널 비율 (0.2 ~ 0.7)
  const [summaryPaneRatio, setSummaryPaneRatio] = useState(0.35)

  // 높이 계산용 컨테이너, 가로 분할용 컨테이너 ref
  const contentRef = useRef<HTMLDivElement | null>(null)
  const topRowRef = useRef<HTMLDivElement | null>(null)

  // Save functionality
  const { saveStatus, hasChanges, handleSave } = useSaveSegments({
    projectId,
    languageCode,
  })

  // Reset editor state and set audio playback mode when project or language changes
  useEffect(() => {
    reset()
    if (languageCode) {
      setAudioPlaybackMode(languageCode)
    }
  }, [projectId, languageCode, reset, setAudioPlaybackMode])

  // Subscribe to audio generation events via SSE
  // When worker completes audio generation, this will update the segment data automatically
  useAudioGenerationEvents(projectId, languageCode, !isLoading && !!data)

  // ★ 상/하 분할 드래그 시작
  const startVerticalDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!contentRef.current) return

    const handleMove = (moveEvt: PointerEvent) => {
      const rect = contentRef.current!.getBoundingClientRect()
      // 컨테이너 내부에서 마우스가 차지하는 상대적인 Y 비율 (0~1)
      let topRatio = (moveEvt.clientY - rect.top) / rect.height
      // 위쪽 영역 최소/최대 20%~80%로 제한
      topRatio = Math.min(0.8, Math.max(0.2, topRatio))
      // 아래 오디오 영역 비율은 나머지
      const newAudioRatio = 1 - topRatio
      setAudioPaneRatio(newAudioRatio)
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      document.body.style.cursor = ''
    }

    document.body.style.cursor = 'row-resize'
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  // ★ 좌/우 분할 드래그 시작 (영상 vs 세그먼트 패널)
  const startHorizontalDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!topRowRef.current) return

    const handleMove = (moveEvt: PointerEvent) => {
      const rect = topRowRef.current!.getBoundingClientRect()
      const leftWidth = moveEvt.clientX - rect.left
      let rightRatio = 1 - leftWidth / rect.width // 오른쪽이 차지하는 비율
      rightRatio = Math.min(0.7, Math.max(0.2, rightRatio))
      setSummaryPaneRatio(rightRatio)
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      document.body.style.cursor = ''
    }

    document.body.style.cursor = 'col-resize'
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-sm text-muted">에디터 상태를 불러오는 중…</p>
      </div>
    )
  }

  const sourceLanguage = '원본'
  const targetLanguage = data.playback.active_language || '번역본'

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Main Content - 패딩과 카드 스타일 적용 */}
      <div ref={contentRef} className="flex min-h-0 flex-col gap-0">
        {/* 상단: 영상 + 요약/번역 패널 (좌우 분할) */}
        <div
          ref={topRowRef}
          className="flex min-h-0 gap-0"
          style={{ flex: `${1 - audioPaneRatio} 1 0%` }} // 남은 높이 중 위쪽 비율
        >
          <div className="flex min-h-0 flex-1 flex-col gap-0">
            {/* Breadcrumbs with Language Selector */}
            <div className="flex items-center justify-between border-b-[3px] border-neutral-200 px-2 py-2">
              <div className="text-xs">
                <Breadcrumbs
                  items={[
                    { label: '홈', href: '/' },
                    { label: `프로젝트`, href: `/projects/${projectId}` },
                    { label: '에디터' },
                  ]}
                  className="opacity-50"
                />
              </div>
              <div className="flex items-center gap-4">
                <SaveIndicator status={saveStatus} hasChanges={hasChanges} />
                <div className="flex items-center gap-3">
                  <Button type="button" onClick={() => setIsExportOpen(true)} className="h-9">
                    <Upload className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      void handleMux()
                    }}
                    disabled={isMuxing || isLoading}
                  >
                    <Video className="h-4 w-4" />
                    {isMuxing ? 'Mux 중...' : 'Mux'}
                  </Button>
                  <LanguageSelector projectId={projectId} currentLanguageCode={languageCode} />
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 gap-0">
              {/* Video Preview Card */}
              <div className="flex-1 overflow-hidden border border-b-0 border-r-0 border-surface-3 bg-surface-1 shadow-sm">
                <StudioVideoPreview
                  activeLanguage={targetLanguage}
                  duration={data.playback.duration}
                  playbackRate={data.playback.playback_rate}
                  videoSource={data.playback.video_source}
                />
              </div>

              {/* 좌/우 경계 드래그바 */}
              <div
                className="group relative w-[3px] cursor-col-resize self-stretch"
                onPointerDown={startHorizontalDrag}
              >
                {/* 두께 3px짜리 세로 경계선 */}
                <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-neutral-200 group-hover:bg-neutral-400" />
              </div>

              {/* Summary/Translation Tabs Card */}
              <div
                className="shrink-0 overflow-hidden border border-b-0 border-l-0 border-surface-3 bg-surface-1 shadow-sm"
                style={{ flexBasis: `${summaryPaneRatio * 100}%` }}
              >
                <TabsRoot defaultValue="summary" className="flex h-full flex-col">
                  <div className="border-b border-surface-3 px-3">
                    <TabsList className="h-auto gap-0 rounded-none border-0 bg-transparent p-0">
                      <TabsTrigger
                        value="summary"
                        className="data-[state=active]:text-balck data-[state=active]:bg-tran rounded-none border-primary px-4 py-2 text-xs font-semibold data-[state=active]:border-b-2"
                      >
                        요약
                      </TabsTrigger>
                      <TabsTrigger
                        value="translation"
                        className="data-[state=active]:text-balck data-[state=active]:bg-tran rounded-none border-primary px-4 py-2 text-xs font-semibold data-[state=active]:border-b-2"
                      >
                        번역
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="summary" className="mt-0 flex-1 overflow-hidden">
                    <SummaryWorkspace
                      projectId={projectId}
                      segments={data.segments}
                      duration={data.playback.duration}
                    />
                  </TabsContent>

                  <TabsContent value="translation" className="mt-0 flex-1 overflow-hidden">
                    <TranslationSummarySection
                      projectId={projectId}
                      sourceLanguage={sourceLanguage}
                      targetLanguage={targetLanguage}
                    />
                  </TabsContent>
                </TabsRoot>
              </div>
            </div>
          </div>
        </div>

        {/* 상/하 경계 드래그바 */}
        <div
          className="group relative -my-[2px] h-[8px] cursor-row-resize"
          onPointerDown={startVerticalDrag}
        >
          {/* 두께 3px짜리 가로 경계선 */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-neutral-200 group-hover:bg-neutral-400" />
        </div>

        {/* 하단: Audio Track Workspace (보컬/세그먼트 타임라인) */}
        <div
          className="z-10 overflow-hidden border border-t-0 border-surface-3 bg-surface-1 shadow-sm"
          style={{ flex: `${audioPaneRatio} 1 0%` }}
        >
          <AudioTrackWorkspace
            segments={data.segments}
            duration={data.playback.duration}
            originalAudioSrc={data.playback.audio_source}
            backgroundAudioSrc={data.playback.background_audio_source}
            onSave={handleSave}
          />
        </div>
      </div>

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        projectId={projectId}
        languageCode={languageCode}
      />
    </div>
  )
}
