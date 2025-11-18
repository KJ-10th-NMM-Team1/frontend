import { useEffect } from 'react'

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
import { useEditorStore } from '@/shared/store/useEditorStore'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Spinner } from '@/shared/ui/Spinner'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '@/shared/ui/Tabs'

export default function EditorPage() {
  const { projectId = '', languageCode = '' } = useParams<{
    projectId: string
    languageCode: string
  }>()
  const { data, isLoading } = useEditorState(projectId, languageCode)
  const setAudioPlaybackMode = useEditorStore((state) => state.setAudioPlaybackMode)
  // Mux 핸들러 - 나중에 버튼 추가 시 사용 예정
  // TODO: 버튼 추가 시 mux.handleMux와 mux.isMuxing 사용
  const mux = useMux({
    projectId,
    editorData: data,
  })

  // Save functionality
  const { saveStatus, hasChanges, handleSave } = useSaveSegments({
    projectId,
    languageCode,
  })

  // Set initial audio playback mode to current language code (first target language)
  useEffect(() => {
    if (languageCode) {
      setAudioPlaybackMode(languageCode)
    }
  }, [languageCode, setAudioPlaybackMode])

  // Subscribe to audio generation events via SSE
  // When worker completes audio generation, this will update the segment data automatically
  useAudioGenerationEvents(projectId, languageCode, !isLoading && !!data)

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
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        {/* Breadcrumbs with Language Selector */}
        <div className="flex items-center justify-between px-1">
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
            <LanguageSelector projectId={projectId} currentLanguageCode={languageCode} />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 gap-2">
          {/* Video Preview Card */}
          <div className="flex-1 overflow-hidden rounded-lg border border-surface-3 bg-surface-1 shadow-sm">
            <StudioVideoPreview
              activeLanguage={targetLanguage}
              duration={data.playback.duration}
              playbackRate={data.playback.playback_rate}
              videoSource={data.playback.video_source}
            />
          </div>

          {/* Summary/Translation Tabs Card */}
          <div className="w-[35%] overflow-hidden rounded-lg border border-surface-3 bg-surface-1 shadow-sm">
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

        {/* Audio Track Workspace Card */}
        <div className="z-10 h-[445px] overflow-hidden rounded-lg border border-surface-3 bg-surface-1 shadow-sm">
          <AudioTrackWorkspace
            segments={data.segments}
            duration={data.playback.duration}
            originalAudioSrc={data.playback.audio_source}
            backgroundAudioSrc={data.playback.background_audio_source}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  )
}
