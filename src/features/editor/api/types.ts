/**
 * Segment operation API types
 */

export interface SplitSegmentRequest {
  segment_id: string
  language_code: string
  split_time: number
  current_start: number
  current_end: number
}

export interface SegmentSplitResponseItem {
  id: string
  start: number
  end: number
  audio_url: string
}

export interface SplitSegmentResponse {
  segments: [SegmentSplitResponseItem, SegmentSplitResponseItem]
}

export interface MergeSegmentData {
  id: string
  start: number
  end: number
}

export interface MergeSegmentsRequest {
  segments: MergeSegmentData[]
  language_code: string
}

export interface MergeSegmentResponse {
  id: string
  start: number
  end: number
  audio_url: string
  source_text: string
  target_text: string
}

/**
 * Segment save/update types
 */

export interface SegmentUpdateData {
  id: string
  start: number
  end: number
  speaker_tag?: string
  playbackRate?: number
  source_text?: string
  target_text?: string
}

export interface UpdateSegmentsRequest {
  project_id: string
  language_code: string
  segments: SegmentUpdateData[]
}

export interface UpdateSegmentsResponse {
  success: boolean
  message?: string
  updated_count: number
}

/**
 * Batch TTS regeneration types
 */

export interface SegmentTTSItem {
  segment_id: string
  translated_text: string
  start: number
  end: number
}

export interface BatchSegmentTTSRegenerateRequest {
  segments: SegmentTTSItem[]
  target_lang: string
  mod: 'fixed' | 'dynamic'
  voice_sample_id?: string
}

export interface BatchSegmentTTSRegenerateResponse {
  success: boolean
  message: string
  queued_count: number
  segment_ids: string[]
}
