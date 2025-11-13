import { useMemo } from 'react'

import { useQueries } from '@tanstack/react-query'

import type { Segment } from '@/entities/segment/types'
import { queryKeys } from '@/shared/config/queryKeys'
import { resolvePresignedUrl } from '@/shared/lib/utils'

/**
 * Hook to preload presigned URLs for all segment audios
 *
 * This ensures all audio URLs are ready before playback starts,
 * preventing delays when the playhead enters a new segment.
 *
 * @param segments - Array of segments to preload
 * @param enabled - Whether to enable preloading (default: true)
 * @returns Map of segmentId -> presigned URL
 */
export function usePreloadSegmentAudios(segments: Segment[], enabled = true) {
  // Create queries for all segment audio URLs
  const queries = useQueries({
    queries: segments.map((segment) => ({
      queryKey: queryKeys.storage.presignedUrl(segment.segment_audio_url ?? ''),
      queryFn: () => resolvePresignedUrl(segment.segment_audio_url!),
      enabled: enabled && !!segment.segment_audio_url,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    })),
  })

  // Convert query results to a Map for easy lookup
  const audioUrls = useMemo(() => {
    const map = new Map<string, string>()

    segments.forEach((segment, index) => {
      const query = queries[index]
      if (query?.data) {
        map.set(segment.id, query.data)
      }
    })

    return map
  }, [segments, queries])

  const isLoading = queries.some((q) => q.isLoading)
  const isError = queries.some((q) => q.isError)
  const loadedCount = queries.filter((q) => q.isSuccess).length
  const totalCount = segments.length

  return {
    audioUrls,
    isLoading,
    isError,
    loadedCount,
    totalCount,
    isAllLoaded: loadedCount === totalCount && totalCount > 0,
  }
}
