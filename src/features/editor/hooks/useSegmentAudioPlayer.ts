import { useEffect, useRef } from 'react'

import type { Segment } from '@/entities/segment/types'

type UseSegmentAudioPlayerOptions = {
  segments: Segment[]
  playhead: number
  isPlaying: boolean
  playbackRate: number
  audioUrls: Map<string, string> // segmentId -> presigned URL
}

/**
 * Hook to manage audio playback synchronized with timeline playhead
 *
 * Features:
 * - Automatically plays audio when playhead enters a segment
 * - Calculates correct audio offset based on playhead position
 * - Stops previous audio when switching segments
 * - Respects playback rate
 */
export function useSegmentAudioPlayer({
  segments,
  playhead,
  isPlaying,
  playbackRate,
  audioUrls,
}: UseSegmentAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentSegmentIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isPlaying) {
      // Stop audio when playback is paused
      if (audioRef.current) {
        audioRef.current.pause()
      }
      return
    }

    // Find the segment that contains the current playhead
    const currentSegment = segments.find(
      (segment) => playhead >= segment.start && playhead < segment.end,
    )

    if (!currentSegment) {
      // No segment at current playhead - stop audio
      if (audioRef.current) {
        audioRef.current.pause()
      }
      currentSegmentIdRef.current = null
      return
    }

    // Check if we switched to a different segment
    const segmentChanged = currentSegmentIdRef.current !== currentSegment.id

    if (segmentChanged) {
      currentSegmentIdRef.current = currentSegment.id

      // Stop previous audio if any
      if (audioRef.current) {
        audioRef.current.pause()
      }

      // Get the presigned URL for this segment
      const audioUrl = audioUrls.get(currentSegment.id)
      if (!audioUrl) {
        // URL not loaded yet - skip playback
        return
      }

      // Calculate audio offset (how far into the segment we are)
      const segmentOffset = playhead - currentSegment.start

      // Create and play new audio
      const audio = new Audio(audioUrl)
      audio.crossOrigin = 'anonymous'
      audio.playbackRate = playbackRate
      audio.currentTime = segmentOffset

      audioRef.current = audio

      // Start playback when audio is ready
      const playAudio = () => {
        void audio.play().catch((error) => {
          console.error('Audio playback failed:', error)
        })
      }

      if (audio.readyState >= 2) {
        // HAVE_CURRENT_DATA or higher
        playAudio()
      } else {
        audio.addEventListener('canplay', playAudio, { once: true })
      }
    } else {
      // Same segment - update playback rate if changed
      if (audioRef.current && audioRef.current.playbackRate !== playbackRate) {
        audioRef.current.playbackRate = playbackRate
      }

      // Resume playback if paused
      if (audioRef.current && audioRef.current.paused) {
        void audioRef.current.play().catch((error) => {
          console.error('Audio resume failed:', error)
        })
      }
    }
  }, [segments, playhead, isPlaying, playbackRate, audioUrls])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return {
    currentAudio: audioRef.current,
    currentSegmentId: currentSegmentIdRef.current,
  }
}
