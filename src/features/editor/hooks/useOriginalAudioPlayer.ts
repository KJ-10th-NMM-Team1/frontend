import { useEffect, useRef } from 'react'

type UseOriginalAudioPlayerOptions = {
  audioUrl: string | undefined
  playhead: number
  isPlaying: boolean
  isScrubbing: boolean
  isEnabled: boolean // Only play when audioPlaybackMode is 'original'
  playbackRate: number
}

/**
 * Hook to manage original audio playback synchronized with timeline playhead
 *
 * This hook creates a background audio player for the full original audio track.
 * It syncs with the timeline's playhead position and respects the playback mode.
 */
export function useOriginalAudioPlayer({
  audioUrl,
  playhead,
  isPlaying,
  isScrubbing,
  isEnabled,
  playbackRate,
}: UseOriginalAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef<boolean>(isPlaying)
  const playheadRef = useRef<number>(playhead)
  const lastSyncTimeRef = useRef<number>(0)

  // Keep refs up to date
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    playheadRef.current = playhead
  }, [playhead])

  // Effect 1: Create audio element when URL is available
  useEffect(() => {
    if (!audioUrl) {
      // Clean up if URL becomes unavailable
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      return
    }

    // Create new audio element
    const audio = new Audio(audioUrl)
    audio.crossOrigin = 'anonymous'
    audio.currentTime = playheadRef.current
    audio.playbackRate = playbackRate

    audioRef.current = audio

    // Start playing if conditions are met
    if (isEnabled && isPlayingRef.current) {
      void audio.play().catch((error) => {
        console.error('Original audio playback failed:', error)
      })
    }

    return () => {
      audio.pause()
    }
  }, [audioUrl, playbackRate, isEnabled])

  // Effect 2: Handle play/pause based on isPlaying and isEnabled
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying && isEnabled) {
      // Resume playback
      if (audioRef.current.paused) {
        void audioRef.current.play().catch((error) => {
          console.error('Original audio resume failed:', error)
        })
      }
    } else {
      // Pause playback
      audioRef.current.pause()
    }
  }, [isPlaying, isEnabled])

  // Effect 3: Sync audio currentTime with playhead during scrubbing
  useEffect(() => {
    if (!isScrubbing) return
    if (!audioRef.current) return

    audioRef.current.currentTime = playhead
  }, [playhead, isScrubbing])

  // Effect 4: Periodic sync check during playback (throttled to once per second)
  useEffect(() => {
    if (!isPlaying || !isEnabled) return
    if (!audioRef.current) return

    const currentTime = audioRef.current.currentTime
    const expectedTime = playheadRef.current
    const drift = Math.abs(currentTime - expectedTime)

    // If drift is more than 0.2 seconds, resync
    if (drift > 0.2) {
      audioRef.current.currentTime = expectedTime
      lastSyncTimeRef.current = performance.now()
    }
  }, [isPlaying, isEnabled])

  // Effect 5: Handle playhead jumps when paused
  useEffect(() => {
    if (isPlayingRef.current) return // Skip during playback
    if (isScrubbing) return // Skip during scrubbing (handled by Effect 3)
    if (!audioRef.current) return

    const currentTime = audioRef.current.currentTime
    const expectedTime = playhead

    // Only update if jump is significant (> 0.1 seconds)
    if (Math.abs(currentTime - expectedTime) > 0.1) {
      audioRef.current.currentTime = expectedTime
    }
  }, [playhead, isScrubbing])

  // Effect 6: Update playback rate
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

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
  }
}
