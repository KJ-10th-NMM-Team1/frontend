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
        <div className="flex min-h-0 flex-1 gap-2">
          <div className="w-1/2 overflow-y-auto">
            <TranslationWorkspace
              projectId={projectId}
              segments={data.segments}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
            />
          </div>
          <div className="flex-1 items-stretch">
            <StudioVideoPreview
              activeLanguage={targetLanguage}
              duration={data.playback.duration}
              playbackRate={data.playback.playback_rate}
              videoSource={data.playback.video_source}
            />
          </div>
        </div>

        <div className="z-10 h-[400px] min-h-0">
          <AudioTrackWorkspace segments={data.segments} duration={data.playback.duration} />
        </div>
      </div>
    </div>
  )
}
