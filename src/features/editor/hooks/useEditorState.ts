import { useQuery } from '@tanstack/react-query'

import type { Glossary } from '../../../entities/glossary/types'
import type { Segment } from '../../../entities/segment/types'
import type { VoiceSample } from '../../../entities/voice-sample/types'
import { apiGet } from '../../../shared/api/client'
import { queryKeys } from '../../../shared/config/queryKeys'
import { transformSegmentFromServer, type SegmentDTO } from '../api/transformers'

/**
 * Server response type (with snake_case fields)
 */
type EditorStateDTO = {
  projectId: string
  segments: SegmentDTO[]
  voices: VoiceSample[]
  glossaries: Glossary[]
  playback: {
    duration: number
    active_language: string
    playback_rate: number
    video_source: string
    audio_source?: string
    video_only_source?: string
    background_audio_source?: string
  }
}

/**
 * Client type (with camelCase fields)
 */
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
    background_audio_source?: string
  }
}

export function useEditorState(projectId: string, languageCode: string) {
  return useQuery<EditorState>({
    queryKey: queryKeys.editor.state(projectId, languageCode),
    queryFn: async () => {
      const response = await apiGet<EditorStateDTO>(
        `api/projects/${projectId}/languages/${languageCode}`,
      )

      // Transform segments from server format (snake_case) to client format (camelCase)
      return {
        ...response,
        segments: response.segments.map(transformSegmentFromServer),
      }
    },
    enabled: Boolean(projectId && languageCode),
  })
}
