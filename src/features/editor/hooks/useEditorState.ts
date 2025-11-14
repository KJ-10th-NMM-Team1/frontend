import { useQuery } from '@tanstack/react-query'

import type { Glossary } from '../../../entities/glossary/types'
import type { Segment } from '../../../entities/segment/types'
import type { VoiceSample } from '../../../entities/voice-sample/types'
import { apiGet } from '../../../shared/api/client'
// import { queryKeys } from '../../../shared/config/queryKeys'

export type EditorState = {
  projectId: string
  segments: Segment[]
  voices: VoiceSample[]
  glossaries: Glossary[]
  playback: {
    duration: number
    active_language: string
    playback_rate: number
    video_source: string
    audio_source?: string
    video_only_source?: string
  }
}

export function useEditorState(projectId: string, languageCode: string) {
  const editorStateKey = (projectId: string, languageCode: string) =>
    ['editor', 'state', projectId, languageCode] as const
  return useQuery<EditorState>({
    queryKey: editorStateKey(projectId, languageCode),
    queryFn: () => apiGet<EditorState>(`api/projects/${projectId}/languages/${languageCode}`),
    enabled: Boolean(projectId && languageCode),
  })
}
