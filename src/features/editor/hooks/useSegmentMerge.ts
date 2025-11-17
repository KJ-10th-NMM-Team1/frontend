import { useCallback, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { Segment } from '@/entities/segment/types'
import { useMergeSegments } from '@/features/editor/api/useMergeSegments'
import { useTracksStore } from '@/shared/store/useTracksStore'
import { useUiStore } from '@/shared/store/useUiStore'

/**
 * Hook to handle segment merging logic
 *
 * Manages:
 * - Merge API mutation
 * - Local state updates (replaceMultipleSegments)
 * - Toast notifications
 * - Original segments reference for metadata preservation
 */
export function useSegmentMerge() {
  const queryClient = useQueryClient()
  const showToast = useUiStore((state) => state.showToast)
  const tracks = useTracksStore((state) => state.tracks)
  const replaceMultipleSegments = useTracksStore((state) => state.replaceMultipleSegments)

  // Store original segment IDs for merge callback
  const mergeSegmentIdsRef = useRef<string[]>([])

  // Merge segments mutation
  const mergeMutation = useMergeSegments({
    onSuccess: (data) => {
      // Get the original segment IDs from ref
      const segmentIds = mergeSegmentIdsRef.current
      if (!segmentIds.length) {
        showToast({
          title: 'Merge Failed',
          description: 'Original segments not found',
        })
        return
      }

      // Find the first segment to get metadata
      let firstSegment: Segment | null = null
      for (const track of tracks) {
        if (track.type === 'speaker') {
          const found = track.segments.find((seg) => seg.id === segmentIds[0])
          if (found) {
            firstSegment = found
            break
          }
        }
      }

      if (!firstSegment) {
        showToast({
          title: 'Merge Failed',
          description: 'First segment not found',
        })
        return
      }

      // Map API response to Segment type, copying metadata from first segment
      const mergedSegment: Segment = {
        id: data.id,
        project_id: firstSegment.project_id,
        language_code: firstSegment.language_code,
        speaker_tag: firstSegment.speaker_tag,
        start: data.start,
        end: data.end,
        source_text: firstSegment.source_text,
        target_text: firstSegment.target_text,
        segment_audio_url: data.audio_url,
        playbackRate: 1.0,
        trackId: firstSegment.trackId,
      }

      // Replace the multiple segments with the merged segment
      replaceMultipleSegments(segmentIds, mergedSegment)

      // Clear ref
      mergeSegmentIdsRef.current = []

      // Invalidate segments query to refetch
      void queryClient.invalidateQueries({ queryKey: ['segments'] })
    },
    onError: (error) => {
      showToast({
        title: 'Merge Failed',
        description: error.message,
      })
      mergeSegmentIdsRef.current = []
    },
  })

  const handleMerge = useCallback(
    (segmentIds: string[], languageCode: string) => {
      // Validate that we have at least 2 segments
      if (segmentIds.length < 2) {
        showToast({
          title: 'Cannot Merge Segments',
          description: 'At least 2 segments are required for merge',
        })
        return
      }

      // Validate playback_rate for all segments
      for (const track of tracks) {
        if (track.type === 'speaker') {
          for (const segment of track.segments) {
            if (segmentIds.includes(segment.id)) {
              if (segment.playbackRate !== undefined && segment.playbackRate !== 1.0) {
                showToast({
                  title: 'Cannot Merge Segments',
                  description:
                    'Segments with modified playback rate cannot be merged. Reset to 1.0 first.',
                })
                return
              }
            }
          }
        }
      }

      // Store original segment IDs for success callback
      mergeSegmentIdsRef.current = segmentIds

      // Call merge API
      mergeMutation.mutate({
        segment_ids: segmentIds,
        language_code: languageCode,
      })
    },
    [mergeMutation, showToast, tracks],
  )

  return {
    handleMerge,
    isMerging: mergeMutation.isPending,
  }
}
