import { useEffect, useRef, useMemo } from 'react'

import type { Segment } from '@/entities/segment/types'
import { findSegmentByPlayhead } from '@/features/editor/utils/segment-search'

type UseSegmentAudioPlayerOptions = {
  segments: Segment[]
  playhead: number
  isPlaying: boolean
  isScrubbing: boolean
  audioUrls: Map<string, string> // segmentId -> presigned URL (kept for backward compatibility)
  audioObjects?: Map<string, HTMLAudioElement> // segmentId -> preloaded Audio object
  readyAudioIds?: Set<string> // Set of segment IDs with fully loaded audio (ready for playback)
}

type SegmentData = {
  id: string
  start: number
  end: number
  playbackRate: number
}

/**
 * 캐시된 오디오 객체를 사용하거나 새로 생성하여 재생을 시작합니다.
 * 로드되지 않은 세그먼트는 재생하지 않습니다 (끊김 방지).
 */
function playOrCreateAudio(
  segmentData: SegmentData,
  audioUrls: Map<string, string>,
  audioObjects: Map<string, HTMLAudioElement> | undefined,
  readyAudioIds: Set<string> | undefined,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  playheadRef: React.MutableRefObject<number>,
) {
  // 이전 오디오 정지
  if (audioRef.current) {
    audioRef.current.pause()
  }

  // 현재 playhead 기준으로 오디오 offset 계산
  const offset = playheadRef.current - segmentData.start

  // Try to use preloaded Audio object first
  let audio = audioObjects?.get(segmentData.id)

  if (audio) {
    // Check if audio is ready for playback
    const isReady = readyAudioIds?.has(segmentData.id) ?? true // Default to true if not tracking

    if (!isReady) {
      console.warn(
        `[Audio] Segment ${segmentData.id} is not ready yet (still loading). Skipping playback to prevent lag.`,
      )
      return // Don't play unloaded audio
    }

    // Use preloaded audio object
    console.debug(`[Audio] Using preloaded audio for segment ${segmentData.id}`)
    audio.currentTime = offset
    audio.playbackRate = segmentData.playbackRate
    audioRef.current = audio
  } else {
    // Fallback: create new Audio object (legacy behavior)
    const audioUrl = audioUrls.get(segmentData.id)
    if (!audioUrl) {
      console.warn(`No audio URL found for segment ${segmentData.id}`)
      return
    }

    console.debug(`[Audio] Creating new audio for segment ${segmentData.id}`)
    audio = new Audio(audioUrl)
    audio.crossOrigin = 'anonymous'
    audio.currentTime = offset
    audio.playbackRate = segmentData.playbackRate
    audioRef.current = audio
  }

  // Ensure audio is not null before proceeding
  if (!audio) {
    console.error('Failed to create or retrieve audio object')
    return
  }

  // 재생 시작
  const playAudio = () => {
    if (audio) {
      void audio.play().catch((error) => {
        console.error('Audio playback failed:', error)
      })
    }
  }

  if (audio.readyState >= 2) {
    // Audio is ready, play immediately
    playAudio()
  } else {
    // Wait for audio to be ready
    audio.addEventListener('canplay', playAudio, { once: true })
  }
}

/**
 * Hook to manage audio playback synchronized with timeline playhead
 *
 * 최적화 전략:
 * - useEffect를 역할별로 분리하여 불필요한 실행 최소화
 * - playhead는 ref로만 추적하여 dependency 제거
 * - RAF로 주기적 동기화 체크 (초당 60회 → 초당 10회)
 */
export function useSegmentAudioPlayer({
  segments,
  playhead,
  isPlaying,
  isScrubbing,
  audioUrls,
  audioObjects,
  readyAudioIds,
}: UseSegmentAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentSegmentIdRef = useRef<string | null>(null)
  const lastPlayheadRef = useRef<number>(0)
  const prevSegmentDataRef = useRef<SegmentData | null>(null)
  const isPlayingRef = useRef<boolean>(isPlaying)
  const lastOffsetUpdateTimeRef = useRef<number>(0)

  // Refs를 최신 상태로 유지 (가벼운 연산)
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    lastPlayheadRef.current = playhead
  }, [playhead])

  // Find current segment and extract needed properties (using binary search for O(log n) performance)
  const currentSegmentData = useMemo(() => {
    const segment = findSegmentByPlayhead(segments, playhead)
    if (!segment) {
      prevSegmentDataRef.current = null
      return null
    }

    const newData = {
      id: segment.id,
      start: segment.start,
      end: segment.end,
      playbackRate: segment.playbackRate ?? 1,
    }

    // prev와 같으면 그대로 반환 (참조 안정성)
    const prev = prevSegmentDataRef.current
    if (
      prev &&
      prev.id === newData.id &&
      prev.start === newData.start &&
      prev.end === newData.end &&
      prev.playbackRate === newData.playbackRate
    ) {
      return prev
    }

    prevSegmentDataRef.current = newData
    return newData
  }, [segments, playhead])

  // Effect 1: isPlaying 변경 시 재생/일시정지 처리
  // Dependency: isPlaying
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      // Resume playback
      if (audioRef.current.paused) {
        void audioRef.current.play().catch((error) => {
          console.error('Audio resume failed:', error)
        })
      }
    } else {
      // Pause playback
      audioRef.current.pause()
    }
  }, [isPlaying])

  // Effect 2: segmentChanged시 새 오디오 생성 및 재생
  // Dependency: currentSegmentData
  useEffect(() => {
    // 재생 중이 아니면 아무것도 안함
    if (!isPlayingRef.current) return

    // currentSegmentData가 null이면 오디오 정지
    if (!currentSegmentData) {
      currentSegmentIdRef.current = null
      audioRef.current?.pause()
      return
    }

    const segmentChanged = currentSegmentIdRef.current !== currentSegmentData.id
    if (!segmentChanged) return

    // 새로운 세그먼트: 캐시된 오디오 사용 또는 새로 생성
    playOrCreateAudio(
      currentSegmentData,
      audioUrls,
      audioObjects,
      readyAudioIds,
      audioRef,
      lastPlayheadRef,
    )
    currentSegmentIdRef.current = currentSegmentData.id
  }, [currentSegmentData, audioUrls, audioObjects, readyAudioIds])

  // Effect 3: currentSegmentData 실행 중 변경 (resize/move)
  // Dependency: currentSegmentData
  useEffect(() => {
    if (!currentSegmentData) return
    if (!audioRef.current) return

    const audio = audioRef.current
    const segmentChanged = currentSegmentIdRef.current !== currentSegmentData.id

    // 세그먼트 변경은 Effect 2에서 처리, 여기서는 속성 변경만 처리
    if (segmentChanged) return

    // playbackRate 업데이트 (즉시)
    if (audio.playbackRate !== currentSegmentData.playbackRate) {
      audio.playbackRate = currentSegmentData.playbackRate
    }

    // offset 계산 및 업데이트 (1초에 한 번으로 throttle)
    const now = performance.now()
    const timeSinceLastUpdate = now - lastOffsetUpdateTimeRef.current

    if (timeSinceLastUpdate >= 1000) {
      const expectedOffset = lastPlayheadRef.current - currentSegmentData.start
      audio.currentTime = expectedOffset
      lastOffsetUpdateTimeRef.current = now
    }
  }, [currentSegmentData])

  // Effect 4: scrubbing 시 offset 동기화
  // Dependency: playhead, isScrubbing
  useEffect(() => {
    if (!isScrubbing) return
    if (!audioRef.current) return
    if (!currentSegmentData) return

    // playhead가 현재 세그먼트 범위 내에 있을 때만 offset 업데이트
    if (playhead >= currentSegmentData.start && playhead < currentSegmentData.end) {
      const expectedOffset = playhead - currentSegmentData.start
      audioRef.current.currentTime = expectedOffset
    }
  }, [playhead, isScrubbing, currentSegmentData])

  // Effect 5: 같은 세그먼트 내에서 playhead 점프 시 offset 동기화
  // (키보드 단축키로 5초 이동 등)
  // Dependency: playhead
  useEffect(() => {
    if (!audioRef.current) return
    if (!currentSegmentData) return
    if (isPlayingRef.current) return // 재생 중일 때는 자동으로 동기화됨
    if (isScrubbing) return // 스크러빙 중일 때는 Effect 4에서 처리

    // 같은 세그먼트 내에 있는지 확인
    if (playhead >= currentSegmentData.start && playhead < currentSegmentData.end) {
      const expectedOffset = playhead - currentSegmentData.start
      const currentOffset = audioRef.current.currentTime

      // offset 차이가 4초 이상일 때만 업데이트 (미세한 차이 무시)
      if (Math.abs(currentOffset - expectedOffset) > 0.1) {
        audioRef.current.currentTime = expectedOffset
        lastPlayheadRef.current = playhead
      }
    }
  }, [playhead, currentSegmentData, isScrubbing])

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
