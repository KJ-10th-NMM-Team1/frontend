import { useState } from 'react'

import { useParams } from 'react-router-dom'

import { AudioTrackWorkspace } from '@/features/editor/components/AudioTrackWorkspace'
import { EditorHeader } from '@/features/editor/components/EditorHeader'
import { EditorSummaryPanel } from '@/features/editor/components/EditorSummaryPanel'
import { ResizeDivider } from '@/features/editor/components/ResizeDivider'
import { StudioVideoPreview } from '@/features/editor/components/StudioVideoPreview'
import { EditorProvider } from '@/features/editor/context/EditorContext'
import { useAudioEventSubscription } from '@/features/editor/hooks/useAudioEventSubscription'
import { useEditorState } from '@/features/editor/hooks/useEditorState'
import { useEditorVersioning } from '@/features/editor/hooks/useEditorVersioning'
import { useResizablePanes } from '@/features/editor/hooks/useResizablePanes'
import { useSaveSegments } from '@/features/editor/hooks/useSaveSegments'
import { useSelectedLanguage } from '@/features/editor/hooks/useSelectedLanguage'
import { useMux } from '@/features/editor/hooks/useMux'
import { ExportDialog } from '@/features/projects/modals/ExportDialog'
import { Spinner } from '@/shared/ui/Spinner'

export default function EditorPage() {
  const { projectId = '' } = useParams<{
    projectId: string
  }>()

  // Language selection
  const { selectedLanguage, setSelectedLanguage } = useSelectedLanguage({ projectId })

  // Resizable panes
  const {
    audioPaneRatio,
    summaryPaneRatio,
    contentRef,
    topRowRef,
    startVerticalDrag,
    startHorizontalDrag,
  } = useResizablePanes()

  // Editor state and data
  const [isExportOpen, setIsExportOpen] = useState(false)
  const { data, isLoading, isLanguageChanging } = useEditorState(projectId, selectedLanguage)
  const { handleMux, isMuxing } = useMux({
    projectId,
    editorData: data,
  })

  // Save functionality
  const { saveStatus, hasChanges, handleSave } = useSaveSegments({
    projectId,
    languageCode: selectedLanguage,
  })

  // Subscribe to audio generation events via global SSE
  useAudioEventSubscription(projectId, selectedLanguage, !isLoading && !!data)

  // Version management: Initialize version0 for each language
  useEditorVersioning(projectId, selectedLanguage, data?.segments)

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
    <EditorProvider projectId={projectId} languageCode={selectedLanguage}>
      <div className="flex h-full flex-col overflow-hidden bg-background">
        <div ref={contentRef} className="flex min-h-0 flex-1 flex-col gap-0">
          {/* 상단: 영상 + 요약/번역 패널 (좌우 분할) */}
          <div
            ref={topRowRef}
            className="flex min-h-0 gap-0"
            style={{ flex: `${1 - audioPaneRatio} 1 0%` }}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-0">
              {/* Header */}
              <EditorHeader
                projectId={projectId}
                selectedLanguage={selectedLanguage}
                saveStatus={saveStatus}
                hasChanges={hasChanges}
                isLoading={isLoading}
                onLanguageChange={setSelectedLanguage}
                onSaveClick={handleSave}
                onExportClick={() => setIsExportOpen(true)}
              />

              <div className="flex min-h-0 flex-1 gap-0">
                {/* Video Preview */}
                <div className="flex-1 overflow-hidden border border-b-0 border-r-0 border-surface-3 shadow-sm">
                  <StudioVideoPreview
                    activeLanguage={targetLanguage}
                    duration={data.playback.duration}
                    playbackRate={data.playback.playback_rate}
                    videoSource={data.playback.video_source}
                  />
                </div>

                {/* Horizontal Divider */}
                <ResizeDivider direction="horizontal" onPointerDown={startHorizontalDrag} />

                {/* Summary/Translation Panel */}
                {isLanguageChanging ? (
                  <div
                    className="flex items-center justify-center border border-b-0 border-surface-3 bg-surface-1"
                    style={{ flex: `${summaryPaneRatio} 1 0%` }}
                  >
                    <Spinner size="md" />
                  </div>
                ) : (
                  <EditorSummaryPanel
                    projectId={projectId}
                    languageCode={selectedLanguage}
                    segments={data.segments}
                    duration={data.playback.duration}
                    sourceLanguage={sourceLanguage}
                    targetLanguage={targetLanguage}
                    summaryPaneRatio={summaryPaneRatio}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <ResizeDivider direction="vertical" onPointerDown={startVerticalDrag} />

          {/* 하단: Audio Track Workspace */}
          <div
            className="z-10 overflow-hidden border border-t-0 border-surface-3 bg-surface-1 shadow-sm"
            style={{ flex: `${audioPaneRatio} 1 0%` }}
          >
            {isLanguageChanging ? (
              <div className="flex h-full items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : (
              <AudioTrackWorkspace
                segments={data.segments}
                duration={data.playback.duration}
                originalAudioSrc={data.playback.audio_source ?? data.playback.video_source}
                backgroundAudioSrc={data.playback.background_audio_source}
                languageCode={selectedLanguage}
                onSave={handleSave}
              />
            )}
          </div>
        </div>

        <ExportDialog
          open={isExportOpen}
          onOpenChange={setIsExportOpen}
          projectId={projectId}
          languageCode={selectedLanguage}
          onMux={handleMux}
          isMuxing={isMuxing}
        />
      </div>
    </EditorProvider>
  )
}
