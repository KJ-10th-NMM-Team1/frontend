import { useMemo, useEffect, useRef, useState } from 'react'

import { useQueries } from '@tanstack/react-query'

import type { Segment } from '@/entities/segment/types'
import { queryKeys } from '@/shared/config/queryKeys'
import { resolvePresignedUrl } from '@/shared/lib/utils'

// Number of segments to fully load before showing the page
const INITIAL_LOAD_COUNT = 5
// Maximum number of presigned URL requests to run concurrently (to avoid browser connection limit)
const MAX_CONCURRENT_REQUESTS = 4

/**
 * Hook to preload Audio objects for all segment audios with progressive loading
 *
 * Progressive loading strategy:
 * 1. Load first 5 segments completely before showing page
 * 2. Load remaining segments in background with chunked requests (max 4 concurrent)
 * 3. Track loading state to prevent playback of non-loaded segments
 *
 * @param segments - Array of segments to preload
 * @param enabled - Whether to enable preloading (default: true)
 * @returns Audio objects, loading states, and ready segment IDs
 */
export function usePreloadSegmentAudios(segments: Segment[], enabled = true) {
  // Track how many presigned URLs have been successfully loaded
  const [loadedUrlCount, setLoadedUrlCount] = useState(0)

  // Create queries for all segment audio URLs with chunked loading
  // Only enable MAX_CONCURRENT_REQUESTS queries at a time to avoid browser connection limit
  const queries = useQueries({
    queries: segments.map((segment, index) => ({
      queryKey: queryKeys.storage.presignedUrl(segment.segment_audio_url ?? ''),
      queryFn: async () => {
        const url = await resolvePresignedUrl(segment.segment_audio_url!)
        // Increment loaded count when a URL is successfully fetched
        setLoadedUrlCount((prev) => prev + 1)
        return url
      },
      // Enable queries in chunks: first MAX_CONCURRENT_REQUESTS, then next batch after some complete
      enabled:
        enabled &&
        !!segment.segment_audio_url &&
        index < loadedUrlCount + MAX_CONCURRENT_REQUESTS,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    })),
  })

  // Cache Audio objects to avoid recreating them
  const audioObjectsRef = useRef<Map<string, HTMLAudioElement>>(new Map())

  // Track which segments have fully loaded audio (canplaythrough)
  const [readyAudioIds, setReadyAudioIds] = useState<Set<string>>(new Set())

  // Convert query results to a Map of presigned URLs
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

  // Create Audio objects and explicitly load them (progressive loading)
  useEffect(() => {
    const audioObjects = audioObjectsRef.current

    // Determine which segments to load immediately (first N segments)
    const initialSegments = segments.slice(0, INITIAL_LOAD_COUNT)
    const backgroundSegments = segments.slice(INITIAL_LOAD_COUNT)

    // Helper to create and load audio
    const createAndLoadAudio = (segment: Segment, isPriority: boolean) => {
      const url = audioUrls.get(segment.id)
      if (!url) return

      // Check if URL changed - if so, remove old Audio object
      const existingAudio = audioObjects.get(segment.id)
      if (existingAudio && existingAudio.src !== url) {
        console.debug(`[Preload] URL changed for segment ${segment.id}, reloading audio`)
        existingAudio.pause()
        existingAudio.src = ''
        audioObjects.delete(segment.id)
        setReadyAudioIds((prev) => {
          const next = new Set(prev)
          next.delete(segment.id)
          return next
        })
      } else if (existingAudio) {
        // URL hasn't changed, keep existing Audio object
        return
      }

      const audio = new Audio(url)
      audio.crossOrigin = 'anonymous'
      audio.preload = isPriority ? 'auto' : 'auto' // All segments load fully for smooth playback

      // Track when audio is ready for playback
      // Use both canplaythrough event AND readyState check for reliability
      const handleCanPlayThrough = () => {
        // HAVE_ENOUGH_DATA (readyState === 4) means enough data is buffered
        if (audio.readyState >= 3) {
          // readyState 3 (HAVE_FUTURE_DATA) or 4 (HAVE_ENOUGH_DATA)
          console.debug(
            `[Preload] Audio ready for segment ${segment.id} (readyState: ${audio.readyState})`,
          )
          setReadyAudioIds((prev) => new Set(prev).add(segment.id))
        } else {
          console.warn(
            `[Preload] canplaythrough fired but readyState is only ${audio.readyState} for segment ${segment.id}. Waiting...`,
          )
          // If readyState is not sufficient, wait for it to increase
          const checkReadyState = () => {
            if (audio.readyState >= 3) {
              console.debug(
                `[Preload] Audio now ready for segment ${segment.id} (readyState: ${audio.readyState})`,
              )
              setReadyAudioIds((prev) => new Set(prev).add(segment.id))
            }
          }
          audio.addEventListener('canplay', checkReadyState, { once: true })
        }
      }

      audio.addEventListener('loadedmetadata', () => {
        console.debug(`[Preload] Audio metadata loaded for segment ${segment.id}`)
      })
      audio.addEventListener('canplaythrough', handleCanPlayThrough, { once: true })

      audioObjects.set(segment.id, audio)

      // Explicitly start loading
      audio.load()
    }

    // Load initial segments first (priority) - these must be ready before showing page
    initialSegments.forEach((segment) => {
      createAndLoadAudio(segment, true)
    })

    // Load background segments immediately (no delay)
    backgroundSegments.forEach((segment) => {
      createAndLoadAudio(segment, false)
    })

    // Clean up Audio objects for segments that no longer exist
    const currentSegmentIds = new Set(segments.map((s) => s.id))
    for (const [segmentId, audio] of audioObjects.entries()) {
      if (!currentSegmentIds.has(segmentId)) {
        audio.pause()
        audio.src = '' // Release the resource
        audioObjects.delete(segmentId)
        setReadyAudioIds((prev) => {
          const next = new Set(prev)
          next.delete(segmentId)
          return next
        })
      }
    }
  }, [segments, audioUrls])

  // Cleanup on unmount
  useEffect(() => {
    const audioObjects = audioObjectsRef.current

    return () => {
      for (const [, audio] of audioObjects.entries()) {
        audio.pause()
        audio.src = ''
      }
      audioObjects.clear()
    }
  }, [])

  const isLoading = queries.some((q) => q.isLoading)
  const isError = queries.some((q) => q.isError)
  const loadedCount = queries.filter((q) => q.isSuccess).length
  const totalCount = segments.length

  // Count ready audio (fully loaded and playable)
  const readyCount = readyAudioIds.size

  // Initial load complete when first N segments are ready
  const isInitialLoadComplete = readyCount >= Math.min(INITIAL_LOAD_COUNT, totalCount)

  return {
    audioUrls,
    audioObjects: audioObjectsRef.current,
    readyAudioIds, // Set of segment IDs with fully loaded audio
    isLoading,
    isError,
    loadedCount, // URLs loaded
    readyCount, // Audio files ready for playback
    totalCount,
    isAllLoaded: loadedCount === totalCount && totalCount > 0,
    isInitialLoadComplete, // First N segments are ready
  }
}
