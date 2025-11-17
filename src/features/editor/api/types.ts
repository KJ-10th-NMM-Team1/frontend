/**
 * Segment operation API types
 */

export interface SplitSegmentRequest {
  segment_id: string
  split_time: number
}

export interface SegmentSplitResponseItem {
  id: string
  start: number
  end: number
  audio_url: string
}

export type SplitSegmentResponse = [SegmentSplitResponseItem, SegmentSplitResponseItem]

export interface MergeSegmentsRequest {
  segment_ids: string[]
}

export interface MergeSegmentResponse {
  id: string
  start: number
  end: number
  audio_url: string
}
