import { useParams } from 'react-router-dom'

import { AudioTrackWorkspace } from '@/features/editor/components/AudioTrackWorkspace'
import { StudioVideoPreview } from '@/features/editor/components/StudioVideoPreview'
import { SummaryWorkspace } from '@/features/editor/components/SummaryWorkspace'
import { TranslationSummarySection } from '@/features/editor/components/TranslationSummarySection'
import { useAudioGenerationEvents } from '@/features/editor/hooks/useAudioGenerationEvents'
import { useEditorState } from '@/features/editor/hooks/useEditorState'
import { Spinner } from '@/shared/ui/Spinner'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '@/shared/ui/Tabs'

export default function EditorPage() {
  const { projectId = '', languageCode = '' } = useParams<{
    projectId: string
    languageCode: string
  }>()
  const { data, isLoading } = useEditorState(projectId, languageCode)

  // Subscribe to audio generation events via SSE
  // When worker completes audio generation, this will update the segment data automatically
  useAudioGenerationEvents(projectId, languageCode, !isLoading && !!data)

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-muted text-sm">에디터 상태를 불러오는 중…</p>
      </div>
    )
  }

  const sourceLanguage = '원본'
  const targetLanguage = data.playback.active_language || '번역본'

  return (
    <div className="bg-surface-1 flex h-screen flex-col">
      {/* <EditorToolbar /> */}

      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex min-h-0 flex-1 gap-1">
          <div className="flex-1 items-stretch">
            <StudioVideoPreview
              activeLanguage={targetLanguage}
              duration={data.playback.duration}
              playbackRate={data.playback.playback_rate}
              videoSource={data.playback.video_source}
            />
          </div>

          <div className="w-1/3">
            <TabsRoot defaultValue="summary" className="flex h-full flex-col">
              <div className="border-surface-3 border-b px-3">
                <TabsList className="h-auto gap-0 rounded-none border-0 bg-transparent p-0">
                  <TabsTrigger
                    value="summary"
                    className="border-primary data-[state=active]:text-balck data-[state=active]:bg-tran rounded-none px-4 py-2 text-xs font-semibold data-[state=active]:border-b-2"
                  >
                    요약
                  </TabsTrigger>
                  <TabsTrigger
                    value="translation"
                    className="border-primary data-[state=active]:text-balck data-[state=active]:bg-tran rounded-none px-4 py-2 text-xs font-semibold data-[state=active]:border-b-2"
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

        <div className="z-10 h-[480px] min-h-0">
          <AudioTrackWorkspace
            segments={data.segments}
            duration={data.playback.duration}
            originalAudioSrc={data.playback.audio_source}
            backgroundAudioSrc={data.playback.background_audio_source}
          />
        </div>
      </div>
    </div>
  )
}
