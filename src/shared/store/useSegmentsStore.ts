import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { Segment } from '@/entities/segment/types'

type SegmentsState = {
  // Segment data (modified versions)
  segments: Segment[]
  originalSegments: Segment[] // Keep original for reset/comparison

  // Actions
  setSegments: (segments: Segment[]) => void
  updateSegment: (id: string, updates: Partial<Segment>) => void
  updateSegmentPosition: (id: string, start: number, end: number) => void
  updateSegmentSize: (id: string, start: number, end: number, originalDuration: number) => void
  resetSegments: () => void
  hasChanges: () => boolean
}

export const useSegmentsStore = create<SegmentsState>()(
  devtools((set, get) => ({
    // Initial state
    segments: [],
    originalSegments: [],

    // Actions
    setSegments: (segments) =>
      set(
        {
          segments: [...segments],
          originalSegments: [...segments],
        },
        false,
        { type: 'segments/setSegments', payload: segments },
      ),

    updateSegment: (id, updates) =>
      set(
        (state) => ({
          segments: state.segments.map((segment) =>
            segment.id === id ? { ...segment, ...updates } : segment,
          ),
        }),
        false,
        { type: 'segments/updateSegment', payload: { id, updates } },
      ),

    updateSegmentPosition: (id, start, end) =>
      set(
        (state) => ({
          segments: state.segments.map((segment) =>
            segment.id === id ? { ...segment, start, end } : segment,
          ),
        }),
        false,
        { type: 'segments/updateSegmentPosition', payload: { id, start, end } },
      ),

    updateSegmentSize: (id, start, end, originalDuration) =>
      set(
        (state) => ({
          segments: state.segments.map((segment) =>
            segment.id === id
              ? {
                  ...segment,
                  start,
                  end,
                  // 배속 자동 계산: 원본 오디오 길이 / 새 세그먼트 길이
                  playbackRate: originalDuration / (end - start),
                }
              : segment,
          ),
        }),
        false,
        {
          type: 'segments/updateSegmentSize',
          payload: { id, start, end, originalDuration },
        },
      ),

    resetSegments: () =>
      set(
        (state) => ({
          segments: [...state.originalSegments],
        }),
        false,
        { type: 'segments/resetSegments' },
      ),

    hasChanges: () => {
      const state = get()
      return JSON.stringify(state.segments) !== JSON.stringify(state.originalSegments)
    },
  })),
)
