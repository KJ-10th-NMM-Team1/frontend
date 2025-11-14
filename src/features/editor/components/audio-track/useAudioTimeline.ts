import type { PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

import { shallow } from 'zustand/shallow'

import type { Segment } from '@/entities/segment/types'
import { usePreloadSegmentAudios } from '@/features/editor/hooks/usePreloadSegmentAudios'
import { useSegmentAudioPlayer } from '@/features/editor/hooks/useSegmentAudioPlayer'
import { convertSegmentsToTracks } from '@/features/editor/utils/trackInitializer'
import { pixelToTime } from '@/features/editor/utils/timeline-scale'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { useTracksStore } from '@/shared/store/useTracksStore'

import type { TrackRow } from './types'

const STATIC_TRACKS: TrackRow[] = [
  { id: 'track-original', label: 'Original', color: '#ec4899', type: 'waveform', size: 'small' },
  { id: 'track-fx', label: 'Music & FX', color: '#38bdf8', type: 'muted', size: 'small' },
]

const SPEAKER_ROW_HEIGHT = 84
const STATIC_ROW_HEIGHT = 42 // 1/3 of speaker height

/**
 * Get height for a track row based on its type
 */
function getTrackRowHeight(track: TrackRow): number {
  return track.type === 'speaker' ? SPEAKER_ROW_HEIGHT : STATIC_ROW_HEIGHT
}

export function useAudioTimeline(segments: Segment[], duration: number) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()
  const playheadRef = useRef(0)

  const {
    playbackRate,
    setPlaybackRate,
    playhead,
    setPlayhead,
    isPlaying,
    setPlaying,
    togglePlayback,
    setActiveSegment,
    segmentEnd,
    scale,
  } = useEditorStore(
    (state) => ({
      playbackRate: state.playbackRate,
      setPlaybackRate: state.setPlaybackRate,
      playhead: state.playhead,
      setPlayhead: state.setPlayhead,
      isPlaying: state.isPlaying,
      setPlaying: state.setPlaying,
      togglePlayback: state.togglePlayback,
      setActiveSegment: state.setActiveSegment,
      segmentEnd: state.segmentEnd,
      scale: state.scale,
    }),
    shallow,
  )

  // Get speaker tracks from store (user-created tracks)
  const storedSpeakerTracks = useTracksStore((state) => state.tracks)
  const setTracks = useTracksStore((state) => state.setTracks)

  // Initialize tracks from segments (only once when segments are loaded)
  useEffect(() => {
    if (segments.length === 0) return

    const initialTracks = convertSegmentsToTracks(segments)
    setTracks(initialTracks)
  }, [segments, setTracks])

  // Preload all segment audio URLs for seamless playback
  const { audioUrls } = usePreloadSegmentAudios(segments)

  const [isScrubbing, setIsScrubbing] = useState(false)

  // Audio playback synchronized with playhead
  useSegmentAudioPlayer({
    segments,
    playhead,
    isPlaying,
    isScrubbing,
    audioUrls,
  })

  useEffect(() => {
    playheadRef.current = playhead
  }, [playhead])

  useEffect(() => {
    if (!isPlaying) return
    let previous = performance.now()
    const loop = (now: number) => {
      const delta = (now - previous) / 1000
      previous = now
      const next = playheadRef.current + delta * playbackRate
      const stopAt = segmentEnd ?? duration
      if (next >= stopAt) {
        setPlayhead(stopAt)
        setPlaying(false)
        return
      }
      setPlayhead(next)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, playbackRate, duration, setPlayhead, setPlaying, segmentEnd])

  const lastSegmentRef = useRef<string | null>(null)

  /**
   * playhead를 수동으로 이동시키는 함수
   * 재생 중이면 자동으로 정지시킨다
   */
  const movePlayhead = useCallback(
    (time: number) => {
      if (isPlaying) {
        setPlaying(false)
      }
      setPlayhead(Math.min(Math.max(time, 0), duration))
    },
    [isPlaying, setPlaying, setPlayhead, duration],
  )

  const scrub = useCallback(
    (clientX: number) => {
      const node = timelineRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      // Account for scrolling
      const scrollLeft = node.parentElement?.scrollLeft || 0
      // Convert pixel position to time using utility function
      const pixelPosition = clientX - rect.left + scrollLeft
      const time = pixelToTime(pixelPosition, duration, scale)
      movePlayhead(time)
    },
    [duration, scale, movePlayhead],
  )

  useEffect(() => {
    if (!isScrubbing) return
    const move = (event: PointerEvent) => scrub(event.clientX)
    const up = () => {
      setIsScrubbing(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [isScrubbing, scrub])

  const onTimelinePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()

    scrub(event.clientX)
    setIsScrubbing(true)
  }

  useEffect(() => {
    if (!segments.length) {
      if (lastSegmentRef.current !== null) {
        lastSegmentRef.current = null
        setActiveSegment(null)
      }
      return
    }
    const current =
      segments.find((segment) => playhead >= segment.start && playhead < segment.end) ??
      (playhead >= segments[segments.length - 1].end ? segments[segments.length - 1] : null)
    const nextId = current?.id ?? null
    if (nextId !== lastSegmentRef.current) {
      lastSegmentRef.current = nextId
      setActiveSegment(nextId)
    }
  }, [playhead, segments, setActiveSegment])

  const trackRows = useMemo<TrackRow[]>(
    () => [...STATIC_TRACKS, ...storedSpeakerTracks],
    [storedSpeakerTracks],
  )

  const waveformData = useMemo(() => {
    const bars = Math.max(Math.floor(duration) * 6, 48)
    return Array.from({ length: bars }, (_, index) => ({
      id: index,
      height: 30 + Math.random() * 60,
    }))
  }, [duration])

  const timelineTicks = useMemo(() => {
    if (duration === 0) return [0]

    // Adjust tick interval based on scale
    // At low scale (zoomed out), use larger intervals
    // At high scale (zoomed in), use smaller intervals
    let step: number
    if (scale < 0.5) {
      step = duration > 120 ? 20 : duration > 60 ? 10 : 5
    } else if (scale < 1) {
      step = duration > 120 ? 10 : duration > 60 ? 5 : 2
    } else if (scale < 2) {
      step = duration > 120 ? 5 : duration > 60 ? 2 : 1
    } else {
      step = duration > 120 ? 2 : 1
    }

    return Array.from({ length: Math.ceil(duration / step) + 1 }, (_, i) => i * step)
  }, [duration, scale])

  const playheadPercent = duration > 0 ? Math.min((playhead / duration) * 100, 100) : 0

  const formatTime = (value: number) => {
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    const milliseconds = Math.floor((value % 1) * 1000)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`
  }

  return {
    timelineRef,
    playbackRate,
    setPlaybackRate,
    playhead,
    setPlayhead,
    isPlaying,
    setPlaying,
    togglePlayback,
    trackRows,
    timelineTicks,
    waveformData,
    playheadPercent,
    onTimelinePointerDown,
    formatTime,
    duration,
    getTrackRowHeight,
    scale,
  }
}
