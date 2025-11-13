import { useParams } from 'react-router-dom'

import { AudioTrackWorkspace } from '@/features/editor/components/AudioTrackWorkspace'
import { StudioVideoPreview } from '@/features/editor/components/StudioVideoPreview'
import { TranslationWorkspace } from '@/features/editor/components/TranslationWorkspace'
import { useEditorState } from '@/features/editor/hooks/useEditorState'
import { Spinner } from '@/shared/ui/Spinner'

export default function EditorPage() {
  const { projectId = '', languageCode = '' } = useParams<{
    projectId: string
    languageCode: string
  }>()
  const { data, isLoading } = useEditorState(projectId, languageCode)

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-muted text-sm">에디터 상태를 불러오는 중…</p>
      </div>
    )
  }

  const sourceLanguage = '원문'
  const targetLanguage = data.playback.active_language || '번역본'

  return (
    <div className="bg-surface-1 flex h-screen flex-col">
      {/* <EditorToolbar /> */}

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="overflow-y-auto">
            <TranslationWorkspace
              segments={data.segments}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
            />
          </div>
          <StudioVideoPreview
            activeLanguage={targetLanguage}
            duration={data.playback.duration}
            playbackRate={data.playback.playback_rate}
            videoSource={data.playback.video_source}
            videoOnlySource={data.playback.video_only_source}
          />
        </div>
        <div className="h-[400px] min-h-0">
          <AudioTrackWorkspace segments={data.segments} duration={data.playback.duration} />
        </div>
      </div>
    </div>
  )
}
