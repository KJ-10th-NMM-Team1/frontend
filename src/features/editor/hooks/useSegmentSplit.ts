import { useCallback, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { Segment } from '@/entities/segment/types'
import { useSplitSegment } from '@/features/editor/api/useSplitSegment'
import { useTracksStore } from '@/shared/store/useTracksStore'
import { useUiStore } from '@/shared/store/useUiStore'

/**
 * Hook to handle segment splitting logic
 *
 * Manages:
 * - Split API mutation
 * - Local state updates (replaceSegment)
 * - Toast notifications
 * - Original segment reference for metadata preservation
 */
export function useSegmentSplit() {
  const queryClient = useQueryClient()
  const showToast = useUiStore((state) => state.showToast)
  const replaceSegment = useTracksStore((state) => state.replaceSegment)

  // Store original segment for split callback
  const splitSegmentRef = useRef<Segment | null>(null)

  // Split segment mutation
  const splitMutation = useSplitSegment({
    onSuccess: (data) => {
      // Get the original segment from ref
      const originalSegment = splitSegmentRef.current
      if (!originalSegment) {
        showToast({
          title: 'Split Failed',
          description: 'Original segment not found',
        })
        return
      }

      // Update local state with the two new segments
      const [segment1, segment2] = data.segments

      // Map API response to Segment type, copying metadata from original
      const newSegments: Segment[] = [
        {
          id: segment1.id,
          project_id: originalSegment.project_id,
          language_code: originalSegment.language_code,
          speaker_tag: originalSegment.speaker_tag,
          start: segment1.start,
          end: segment1.end,
          source_text: originalSegment.source_text,
          target_text: originalSegment.target_text,
          segment_audio_url: segment1.audio_url,
          playbackRate: 1.0,
          trackId: originalSegment.trackId,
        },
        {
          id: segment2.id,
          project_id: originalSegment.project_id,
          language_code: originalSegment.language_code,
          speaker_tag: originalSegment.speaker_tag,
          start: segment2.start,
          end: segment2.end,
          source_text: originalSegment.source_text,
          target_text: originalSegment.target_text,
          segment_audio_url: segment2.audio_url,
          playbackRate: 1.0,
          trackId: originalSegment.trackId,
        },
      ]

      // Replace the original segment with the two new segments
      replaceSegment(originalSegment.id, newSegments)

      // Clear ref
      splitSegmentRef.current = null

      // Invalidate segments query to refetch
      void queryClient.invalidateQueries({ queryKey: ['segments'] })
    },
    onError: (error) => {
      showToast({
        title: 'Split Failed',
        description: error.message,
      })
      splitSegmentRef.current = null
    },
  })

  const handleSplit = useCallback(
    (segment: Segment, splitTime: number) => {
      // Validate playback_rate
      if (segment.playbackRate !== undefined && segment.playbackRate !== 1.0) {
        showToast({
          title: 'Cannot Split Segment',
          description: 'Segment with modified playback rate cannot be split. Reset to 1.0 first.',
        })
        return
      }

      // Store original segment for success callback
      splitSegmentRef.current = segment

      // Calculate split position relative to segment start (offset in seconds)
      const offset = splitTime - segment.start

      // Call split API with current start/end values
      splitMutation.mutate({
        segment_id: segment.id,
        language_code: segment.language_code,
        split_time: offset,
        current_start: segment.start,
        current_end: segment.end,
      })
    },
    [splitMutation, showToast],
  )

  return {
    handleSplit,
    isSplitting: splitMutation.isPending,
  }
}
