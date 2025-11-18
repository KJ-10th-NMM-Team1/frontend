/**
 * API transformers for editor data
 * Converts server response (snake_case) to client format (camelCase)
 */

import type { Issue } from '@/entities/issue/types'
import type { Segment } from '@/entities/segment/types'

/**
 * Server response type for a segment (snake_case)
 */
export type SegmentDTO = {
  id: string
  project_id: string
  language_code: string
  speaker_tag?: string
  start: number
  end: number
  source_text: string
  target_text?: string
  segment_audio_url?: string
  playback_rate?: number // Server response uses snake_case
  trackId?: string
  issues?: Issue[]
}

/**
 * Convert segment from server response format (snake_case) to client format (camelCase)
 *
 * Note: Server accepts camelCase in requests (playbackRate),
 * but returns snake_case in responses (playback_rate)
 */
export function transformSegmentFromServer(dto: SegmentDTO): Segment {
  return {
    id: dto.id,
    project_id: dto.project_id,
    language_code: dto.language_code,
    speaker_tag: dto.speaker_tag,
    start: dto.start,
    end: dto.end,
    source_text: dto.source_text,
    target_text: dto.target_text,
    segment_audio_url: dto.segment_audio_url,
    playbackRate: dto.playback_rate, // Convert snake_case to camelCase
    trackId: dto.trackId,
    issues: dto.issues,
  }
}
