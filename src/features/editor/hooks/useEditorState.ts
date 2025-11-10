import { useQuery } from '@tanstack/react-query'

import type { Glossary } from '../../../entities/glossary/types'
import type { Segment } from '../../../entities/segment/types'
import type { VoiceSample } from '../../../entities/voice-sample/types'
import { apiGet } from '../../../shared/api/client'
import { queryKeys } from '../../../shared/config/queryKeys'

export type EditorState = {
  projectId: string
  targetLanguages: string[]
  segments: Segment[]
  voices: VoiceSample[]
  glossaries: Glossary[]
  playback: {
    duration: number
    activeLanguage: string
    playbackRate: number
  }
}

export function useEditorState(projectId: string) {
  return useQuery({
    queryKey: queryKeys.editor.state(projectId),
    queryFn: () => apiGet<EditorState>(`api/editor/${projectId}`),
    enabled: Boolean(projectId),
  })
}
