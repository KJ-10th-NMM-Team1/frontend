import { useParams } from 'react-router-dom'

import { AudioTrackWorkspace } from '@/features/editor/components/AudioTrackWorkspace'
import { EditorToolbar } from '@/features/editor/components/EditorToolbar'
import { StudioVideoPreview } from '@/features/editor/components/StudioVideoPreview'
import { TranslationWorkspace } from '@/features/editor/components/TranslationWorkspace'
import { useEditorState } from '@/features/editor/hooks/useEditorState'
import { Spinner } from '@/shared/ui/Spinner'

export default function EditorPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading } = useEditorState(id)

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-muted text-sm">에디터 상태를 불러오는 중…</p>
      </div>
    )
  }

  const sourceLanguage = '원문'
  const targetLanguage = data.playback.activeLanguage || data.targetLanguages[0] || '번역본'

  return (
    <div className="bg-surface-1 flex min-h-screen w-full flex-col gap-2 p-2">
      <EditorToolbar />
      <div className="flex-1 space-y-2">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <TranslationWorkspace
            segments={data.segments}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
          <StudioVideoPreview
            activeLanguage={targetLanguage}
            duration={data.playback.duration}
            playbackRate={data.playback.playbackRate}
          />
        </div>
        <AudioTrackWorkspace segments={data.segments} duration={data.playback.duration} />
      </div>
    </div>
  )
}
