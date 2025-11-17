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
 * Preloaded 오디오 객체를 사용하여 재생을 시작합니다.
 * 모든 오디오는 usePreloadSegmentAudios에서 미리 로드되어 있어야 합니다.
 */
function playOrCreateAudio(
  segmentData: SegmentData,
  audioObjects: Map<string, HTMLAudioElement> | undefined,
  readyAudioIds: Set<string> | undefined,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  playheadRef: React.MutableRefObject<number>,
  isPlayingRef: React.MutableRefObject<boolean>,
) {
  // 이전 오디오 정지
  if (audioRef.current) {
    audioRef.current.pause()
  }

  // audioObjects가 없으면 에러 (preload가 안 된 상태)
  if (!audioObjects) {
    console.error('[Audio] audioObjects is undefined - preloading not initialized')
    return
  }

  // Preloaded Audio 객체 가져오기
  const audio = audioObjects.get(segmentData.id)
  if (!audio) {
    console.error(`[Audio] No preloaded audio found for segment ${segmentData.id}`)
    return
  }

  // Ready 상태 확인 (경고만 출력, 재생은 진행)
  const isReady = readyAudioIds?.has(segmentData.id) ?? false
  if (!isReady) {
    console.warn(`[Audio] Segment ${segmentData.id} is still loading (will play when ready)`)
  }

  // 현재 playhead 기준으로 오디오 offset 계산 및 설정
  const offset = playheadRef.current - segmentData.start
  audio.currentTime = offset
  audio.playbackRate = segmentData.playbackRate
  audioRef.current = audio

  // Race condition 방지: 재생 중이 아니면 재생하지 않음
  if (!isPlayingRef.current) {
    console.debug('[Audio] Skipping playback - not in playing state')
    return
  }

  // 재생 시작 (이미 preload되어 있으므로 바로 재생 가능)
  console.debug(`[Audio] Playing preloaded audio for segment ${segmentData.id}`)
  void audio.play().catch((error) => {
    console.error('Audio playback failed:', error)
  })
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
  const prevAudioUrlRef = useRef<string | null>(null) // Track previous URL to detect changes

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

  // 현재 세그먼트의 audioUrl 추적 (TTS 재생성 감지용)
  const currentAudioUrl = useMemo(() => {
    return currentSegmentData ? audioUrls.get(currentSegmentData.id) : null
  }, [currentSegmentData, audioUrls])

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
    if (!isPlayingRef.current && !isScrubbing) return

    // currentSegmentData가 null이면 오디오 정지
    if (!currentSegmentData) {
      currentSegmentIdRef.current = null
      audioRef.current?.pause()
      return
    }

    const segmentChanged = currentSegmentIdRef.current !== currentSegmentData.id
    if (!segmentChanged) return

    // 새로운 세그먼트: preloaded 오디오 재생
    playOrCreateAudio(
      currentSegmentData,
      audioObjects,
      readyAudioIds,
      audioRef,
      lastPlayheadRef,
      isPlayingRef,
    )
    currentSegmentIdRef.current = currentSegmentData.id
    // Effect 2-1과의 중복 실행 방지: 현재 URL 기록
    prevAudioUrlRef.current = currentAudioUrl ?? null
  }, [currentSegmentData, audioObjects, readyAudioIds, isScrubbing, currentAudioUrl])

  // Effect 2-1: 같은 세그먼트에서 audioUrl 변경 시 새 오디오 재생 (TTS 재생성 대응)
  // Dependency: currentAudioUrl만 사용 (URL이 실제로 변경될 때만 실행)
  useEffect(() => {
    if (!isPlayingRef.current) return
    if (!currentSegmentData || !currentAudioUrl) {
      prevAudioUrlRef.current = null
      return
    }

    // 세그먼트는 같지만 URL이 변경된 경우만 처리
    const isSameSegment = currentSegmentIdRef.current === currentSegmentData.id
    if (!isSameSegment) {
      // 세그먼트 변경은 Effect 2에서 처리, URL은 업데이트
      prevAudioUrlRef.current = currentAudioUrl
      return
    }

    // URL이 실제로 변경되었는지 확인
    if (prevAudioUrlRef.current === currentAudioUrl) {
      return // URL 변경 없음, 재생하지 않음
    }

    // URL이 변경되었으므로 새 오디오 재생 (TTS 재생성 시)
    console.debug(
      `[Audio] URL changed for current segment ${currentSegmentData.id} (${prevAudioUrlRef.current} -> ${currentAudioUrl}), reloading audio`,
    )
    playOrCreateAudio(
      currentSegmentData,
      audioObjects,
      readyAudioIds,
      audioRef,
      lastPlayheadRef,
      isPlayingRef,
    )
    prevAudioUrlRef.current = currentAudioUrl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudioUrl, audioObjects, readyAudioIds])

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

    if (timeSinceLastUpdate >= 500) {
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
