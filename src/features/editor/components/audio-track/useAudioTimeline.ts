import type { PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

import { shallow } from 'zustand/shallow'

import type { Segment } from '@/entities/segment/types'
import { useEditorStore } from '@/shared/store/useEditorStore'

import type { TrackRow } from './types'

const STATIC_TRACKS: TrackRow[] = [
  { id: 'track-original', label: 'Original', color: '#ec4899', type: 'waveform' },
  { id: 'track-fx', label: 'Music & FX', color: '#38bdf8', type: 'muted' },
]

const ROW_HEIGHT = 84

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
  } = useEditorStore(
    (state) => ({
      playbackRate: state.playbackRate,
      setPlaybackRate: state.setPlaybackRate,
      playhead: state.playhead,
      setPlayhead: state.setPlayhead,
      isPlaying: state.isPlaying,
      setPlaying: state.setPlaying,
      togglePlayback: state.togglePlayback,
    }),
    shallow,
  )

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
      if (next >= duration) {
        setPlayhead(duration)
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
  }, [isPlaying, playbackRate, duration, setPlayhead, setPlaying])

  const [isScrubbing, setIsScrubbing] = useState(false)

  const scrub = useCallback(
    (clientX: number) => {
      const node = timelineRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
      setPlayhead(percent * duration)
    },
    [duration, setPlayhead],
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
    setPlaying(false)
    scrub(event.clientX)
    setIsScrubbing(true)
  }

  const speakerTracks = useMemo(() => {
    const palette = ['#f97316', '#0ea5e9', '#8b5cf6', '#22c55e']
    const map = new Map<string, { id: string; label: string; color: string; segments: Segment[] }>()
    segments.forEach((segment, index) => {
      if (!map.has(segment.speakerId)) {
        map.set(segment.speakerId, {
          id: segment.speakerId,
          label: segment.speakerName,
          color: palette[index % palette.length],
          segments: [],
        })
      }
      map.get(segment.speakerId)?.segments.push(segment)
    })
    return Array.from(map.values())
  }, [segments])

  const trackRows = useMemo<TrackRow[]>(
    () => [
      ...STATIC_TRACKS,
      ...speakerTracks.map((track) => ({ ...track, type: 'speaker' as const })),
    ],
    [speakerTracks],
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
    const step = duration > 120 ? 10 : duration > 60 ? 5 : 2
    return Array.from({ length: Math.ceil(duration / step) + 1 }, (_, i) => i * step)
  }, [duration])

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
    togglePlayback,
    trackRows,
    timelineTicks,
    waveformData,
    playheadPercent,
    onTimelinePointerDown,
    formatTime,
    duration,
    rowHeight: ROW_HEIGHT,
  }
}
