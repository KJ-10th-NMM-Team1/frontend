import type { PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useMemo, useRef, useCallback } from 'react'

import { shallow } from 'zustand/shallow'

import type { Segment } from '@/entities/segment/types'
import { useAudioWaveform } from '@/features/editor/hooks/useAudioWaveform'
import { usePreloadSegmentAudios } from '@/features/editor/hooks/usePreloadSegmentAudios'
import { useSegmentAudioPlayer } from '@/features/editor/hooks/useSegmentAudioPlayer'
import { useOriginalAudioPlayer } from '@/features/editor/hooks/useOriginalAudioPlayer'
import { convertSegmentsToTracks } from '@/features/editor/utils/trackInitializer'
import { pixelToTime } from '@/features/editor/utils/timeline-scale'
import { findSegmentByPlayhead } from '@/features/editor/utils/segment-search'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { useTracksStore } from '@/shared/store/useTracksStore'
import { usePresignedUrl } from '@/shared/api/hooks'
import { useEditorContext } from '@/features/editor/context/EditorContext'

import type { TrackRow } from './types'

const STATIC_TRACKS: TrackRow[] = [
  {
    id: 'track-original',
    label: '원본트랙',
    color: '#b5b5b5', // tertiary tone for original track
    type: 'waveform',
    size: 'small',
  },
  {
    id: 'track-fx',
    label: '배경음&효과음',
    color: '#ccdcff', // muted gray for less emphasis
    type: 'waveform',
    size: 'small',
  },
]

const SPEAKER_ROW_HEIGHT = 84
const STATIC_ROW_HEIGHT = 42 // 1/3 of speaker height

/**
 * Get height for a track row based on its type
 */
function getTrackRowHeight(track: TrackRow): number {
  return track.type === 'speaker' ? SPEAKER_ROW_HEIGHT : STATIC_ROW_HEIGHT
}

export function useAudioTimeline(
  segments: Segment[],
  duration: number,
  originalAudioSrc?: string,
  backgroundAudioSrc?: string,
  languageCode?: string,
) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()
  const playheadRef = useRef(0)

  // ⭐ EditorContext에서 projectId 가져오기
  const { projectId } = useEditorContext()

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
    audioPlaybackMode,
    isScrubbing,
    setIsScrubbing,
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
      audioPlaybackMode: state.audioPlaybackMode,
      isScrubbing: state.isScrubbing,
      setIsScrubbing: state.setIsScrubbing,
    }),
    shallow,
  )

  // Get speaker tracks from store (user-created tracks)
  const storedSpeakerTracks = useTracksStore((state) => state.tracks)
  const setTracks = useTracksStore((state) => state.setTracks)

  // Initialize tracks from segments only once on first load
  const isInitializedRef = useRef(false)

  // localStorage key: 프로젝트와 언어별로 구분
  const STORAGE_KEY = `track-order-${projectId}-${languageCode}`

  // Reset initialization when language changes
  useEffect(() => {
    isInitializedRef.current = false
  }, [languageCode])

  useEffect(() => {
    // 이미 초기화되었고 segments가 변하지 않았으면 스킵
    if (isInitializedRef.current) return

    // segments가 비어있어도 tracks를 초기화해야 함 (이전 언어의 데이터 제거)
    if (segments.length === 0) {
      setTracks([])
      localStorage.removeItem(STORAGE_KEY)
    } else {
      const newTracks = convertSegmentsToTracks(segments)

      // ⭐ localStorage에서 저장된 트랙 순서 불러오기
      const storedOrderJson = localStorage.getItem(STORAGE_KEY)

      if (storedOrderJson) {
        // 저장된 순서가 있으면 그대로 유지
        try {
          const parsed = JSON.parse(storedOrderJson) as unknown
          // 타입 가드: string 배열인지 검증
          if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
            throw new Error('Invalid stored order format')
          }

          const storedOrder: string[] = parsed
          const trackMap = new Map(newTracks.map((t) => [t.id, t]))

          // 1. 저장된 순서대로 트랙 배치
          const orderedTracks = storedOrder
            .map((id) => trackMap.get(id))
            .filter((t): t is TrackRow => t !== undefined)

          // 2. 새로 추가된 트랙은 맨 뒤에
          const storedOrderSet = new Set(storedOrder)
          const addedTracks = newTracks.filter((t) => !storedOrderSet.has(t.id))

          const finalTracks = [...orderedTracks, ...addedTracks]
          setTracks(finalTracks)

          // 업데이트된 순서 저장
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalTracks.map((t) => t.id)))
        } catch (error) {
          // JSON 파싱 실패 시 새 트랙으로 초기화
          setTracks(newTracks)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newTracks.map((t) => t.id)))
        }
      } else {
        // 최초 로드 시 (localStorage에 저장된 순서가 없음)
        setTracks(newTracks)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTracks.map((t) => t.id)))
      }
    }

    isInitializedRef.current = true
  }, [segments, setTracks, STORAGE_KEY])

  // Get all segments from tracks store, sorted by time (for audio preloading and active segment detection)
  const allSegments = useMemo(() => {
    return storedSpeakerTracks
      .filter((track) => track.type === 'speaker')
      .flatMap((track) => track.segments)
      .sort((a, b) => a.start - b.start)
  }, [storedSpeakerTracks])

  // Get track-separated segments for multi-track audio playback
  // Each track's segments are already sorted in the store
  const trackSegments = useMemo(() => {
    return storedSpeakerTracks
      .filter((track) => track.type === 'speaker')
      .map((track) => track.segments)
  }, [storedSpeakerTracks])

  // Preload all segment audio URLs and Audio objects for seamless playback
  const { audioUrls, audioObjects, readyAudioIds, isInitialLoadComplete } =
    usePreloadSegmentAudios(allSegments)

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
        setPlayhead(0)
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

  // Scrub function: playhead는 즉시 업데이트 (부드러운 움직임)
  // 실제 비디오/오디오 동기화는 각 컴포넌트에서 throttle 처리
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
      // playhead는 throttle 없이 즉시 업데이트 (시각적 부드러움)
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
  }, [isScrubbing, scrub, setIsScrubbing])

  const onTimelinePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()

    scrub(event.clientX)
    setIsScrubbing(true)
  }

  useEffect(() => {
    if (!allSegments.length) {
      if (lastSegmentRef.current !== null) {
        lastSegmentRef.current = null
        setActiveSegment(null)
      }
      return
    }

    // 이진 탐색으로 현재 세그먼트 찾기 (O(log n) - 성능 개선)
    const current = findSegmentByPlayhead(allSegments, playhead)

    const nextId = current?.id ?? null
    if (nextId !== lastSegmentRef.current) {
      lastSegmentRef.current = nextId
      setActiveSegment(nextId)
    }
  }, [playhead, allSegments, setActiveSegment])

  const trackRows = useMemo<TrackRow[]>(
    () => [...STATIC_TRACKS, ...storedSpeakerTracks],
    [storedSpeakerTracks],
  )

  // Resolve S3 key to presigned URL for original audio
  const { data: originalAudioUrl, isLoading: originalUrlLoading } = usePresignedUrl(
    originalAudioSrc,
    {
      staleTime: 5 * 60 * 1000,
      enabled: true,
    },
  )

  // Resolve S3 key to presigned URL for background audio (Music & FX)
  const { data: backgroundAudioUrl, isLoading: backgroundUrlLoading } = usePresignedUrl(
    backgroundAudioSrc,
    {
      staleTime: 5 * 60 * 1000,
      enabled: true,
    },
  )

  // Audio playback synchronized with playhead
  // Only play segment audio when in 'target' mode
  // Pass track-separated segments for multi-track simultaneous playback
  useSegmentAudioPlayer({
    trackSegments,
    playhead,
    isPlaying: isPlaying && audioPlaybackMode !== 'original',
    isScrubbing,
    audioObjects, // Pass preloaded Audio objects for instant playback
    readyAudioIds, // Track which segments are fully loaded and ready for playback
    languageCode, // 언어 변경 감지용
  })

  // Original audio playback synchronized with playhead
  // Only play original audio when in 'original' mode
  useOriginalAudioPlayer({
    audioUrl: originalAudioUrl,
    playhead,
    isPlaying,
    isScrubbing,
    isEnabled: audioPlaybackMode === 'original',
    playbackRate,
  })

  // Background audio (Music & FX) playback synchronized with playhead
  // Only play background audio when in 'target' mode
  useOriginalAudioPlayer({
    audioUrl: backgroundAudioUrl,
    playhead,
    isPlaying,
    isScrubbing,
    isEnabled: audioPlaybackMode !== 'original',
    playbackRate,
  })

  // Generate waveform from original audio
  // Use 35 samples per second for dense visual quality with acceptable performance
  const targetSamples = useMemo(() => Math.max(Math.floor(duration) * 35, 48), [duration])
  const {
    data: originalWaveformData,
    isLoading: originalWaveformGenerating,
    error: originalWaveformError,
  } = useAudioWaveform(originalAudioUrl, !!originalAudioUrl, targetSamples)

  // Generate waveform from background audio (Music & FX)
  const {
    data: backgroundWaveformData,
    isLoading: backgroundWaveformGenerating,
    error: backgroundWaveformError,
  } = useAudioWaveform(backgroundAudioUrl, !!backgroundAudioUrl, targetSamples)

  // Combined loading states: URL resolution + waveform generation
  const originalWaveformLoading = originalUrlLoading || originalWaveformGenerating
  const backgroundWaveformLoading = backgroundUrlLoading || backgroundWaveformGenerating

  // Process original waveform data
  const originalWaveformBars = useMemo(() => {
    if (originalWaveformData) {
      // Convert amplitude data (0-1) to height percentage (0-100)
      return originalWaveformData.map((amplitude, index) => ({
        id: index,
        height: amplitude * 350,
      }))
    }
    // Fallback: random data while loading or on error
    const bars = targetSamples
    return Array.from({ length: bars }, (_, index) => ({
      id: index,
      height: 30 + Math.random() * 60,
    }))
  }, [originalWaveformData, targetSamples])

  // Process background waveform data
  const backgroundWaveformBars = useMemo(() => {
    if (backgroundWaveformData) {
      // Convert amplitude data (0-1) to height percentage (0-100)
      return backgroundWaveformData.map((amplitude, index) => ({
        id: index,
        height: amplitude * 350,
      }))
    }
    // Fallback: random data while loading or on error
    const bars = targetSamples
    return Array.from({ length: bars }, (_, index) => ({
      id: index,
      height: 30 + Math.random() * 60,
    }))
  }, [backgroundWaveformData, targetSamples])

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
    originalWaveformData: originalWaveformBars,
    originalWaveformLoading,
    originalWaveformError,
    backgroundWaveformData: backgroundWaveformBars,
    backgroundWaveformLoading,
    backgroundWaveformError,
    playheadPercent,
    onTimelinePointerDown,
    formatTime,
    duration,
    getTrackRowHeight,
    scale,
    isInitialLoadComplete, // Audio loading state for initial segments
    readyAudioIds, // Track which segments are ready for playback
    loadingProgress: {
      readyCount: readyAudioIds.size,
      totalCount: allSegments.length,
    },
  }
}
