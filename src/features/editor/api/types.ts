/**
 * Segment operation API types
 */

export interface SplitSegmentRequest {
  segment_id: string
  language_code: string
  split_time: number
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

export interface MergeSegmentsRequest {
  segment_ids: string[]
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
