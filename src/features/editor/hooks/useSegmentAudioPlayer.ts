import { useEffect, useRef, useMemo } from 'react'

import type { Segment } from '@/entities/segment/types'
import { findAllSegmentsByPlayhead } from '@/features/editor/utils/segment-search'

type UseSegmentAudioPlayerOptions = {
  trackSegments: Segment[][] // 트랙별로 그룹화된 세그먼트 배열
  playhead: number
  isPlaying: boolean
  isScrubbing: boolean
  audioObjects?: Map<string, HTMLAudioElement> // segmentId -> preloaded Audio object
  readyAudioIds?: Set<string> // Set of segment IDs with fully loaded audio
}

type SegmentData = {
  id: string
  start: number
  end: number
  playbackRate: number
}

/**
 * 여러 세그먼트의 오디오를 동시에 재생합니다.
 * 각 세그먼트는 독립적으로 관리되며, playhead에 따라 자동으로 시작/정지됩니다.
 */
function playMultipleAudios(
  segmentsData: SegmentData[],
  audioObjects: Map<string, HTMLAudioElement> | undefined,
  readyAudioIds: Set<string> | undefined,
  audioRefsMap: Map<string, HTMLAudioElement>,
  playheadRef: React.MutableRefObject<number>,
  isPlayingRef: React.MutableRefObject<boolean>,
) {
  if (!audioObjects) {
    console.error('[MultiAudio] audioObjects is undefined - preloading not initialized')
    return
  }

  // 재생해야 할 세그먼트들
  for (const segmentData of segmentsData) {
    // 이미 재생 중인 세그먼트는 스킵
    if (audioRefsMap.has(segmentData.id)) {
      continue
    }

    // Preloaded Audio 객체 가져오기
    const audio = audioObjects.get(segmentData.id)
    if (!audio) {
      console.error(`[MultiAudio] No preloaded audio found for segment ${segmentData.id}`)
      continue
    }

    // Ready 상태 확인 (경고만 출력, 재생은 진행)
    const isReady = readyAudioIds?.has(segmentData.id) ?? false
    if (!isReady) {
      console.warn(`[MultiAudio] Segment ${segmentData.id} is still loading (will play when ready)`)
    }

    // 현재 playhead 기준으로 오디오 offset 계산 및 설정
    const offset = playheadRef.current - segmentData.start
    audio.currentTime = offset
    audio.playbackRate = segmentData.playbackRate
    audioRefsMap.set(segmentData.id, audio)

    // Race condition 방지: 재생 중이 아니면 재생하지 않음
    if (!isPlayingRef.current) {
      console.debug('[MultiAudio] Skipping playback - not in playing state')
      continue
    }

    // 재생 시작
    console.debug(`[MultiAudio] Playing audio for segment ${segmentData.id}`)
    void audio.play().catch((error) => {
      console.error(`[MultiAudio] Playback failed for segment ${segmentData.id}:`, error)
    })
  }
}

/**
 * 재생이 끝난 세그먼트의 오디오를 정지하고 제거합니다.
 */
function stopInactiveAudios(
  activeSegmentIds: Set<string>,
  audioRefsMap: Map<string, HTMLAudioElement>,
) {
  // 더 이상 활성 상태가 아닌 세그먼트들의 오디오 정지
  for (const [segmentId, audio] of audioRefsMap.entries()) {
    if (!activeSegmentIds.has(segmentId)) {
      console.debug(`[MultiAudio] Stopping audio for segment ${segmentId}`)
      audio.pause()
      audioRefsMap.delete(segmentId)
    }
  }
}

/**
 * Hook to manage multiple audio playback synchronized with timeline playhead
 *
 * 다중 트랙 재생 전략:
 * - 각 트랙에서 playhead와 겹치는 세그먼트를 찾아 동시 재생
 * - Map으로 여러 Audio 객체 관리
 * - Set으로 활성 세그먼트 ID 추적
 * - playhead 변경 시 자동으로 활성 세그먼트 업데이트
 */
export function useSegmentAudioPlayer({
  trackSegments,
  playhead,
  isPlaying,
  isScrubbing,
  audioObjects,
  readyAudioIds,
}: UseSegmentAudioPlayerOptions) {
  // 여러 Audio 객체를 Map으로 관리
  const audioRefsMap = useRef<Map<string, HTMLAudioElement>>(new Map())
  const activeSegmentIdsRef = useRef<Set<string>>(new Set())
  const lastPlayheadRef = useRef<number>(0)
  const prevSegmentsDataRef = useRef<SegmentData[]>([])
  const isPlayingRef = useRef<boolean>(isPlaying)
  const lastOffsetUpdateTimeRef = useRef<number>(0)

  // Refs를 최신 상태로 유지
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    lastPlayheadRef.current = playhead
  }, [playhead])

  // Find all active segments using optimized multi-track search
  const activeSegmentsData = useMemo(() => {
    const segments = findAllSegmentsByPlayhead(trackSegments, playhead)

    if (segments.length === 0) {
      prevSegmentsDataRef.current = []
      return []
    }

    const newData = segments.map((segment) => ({
      id: segment.id,
      start: segment.start,
      end: segment.end,
      playbackRate: segment.playbackRate ?? 1,
    }))

    // 참조 안정성: 데이터가 같으면 이전 참조 반환
    const prev = prevSegmentsDataRef.current
    if (
      prev.length === newData.length &&
      prev.every((p, i) => {
        const n = newData[i]
        return (
          p.id === n.id &&
          p.start === n.start &&
          p.end === n.end &&
          p.playbackRate === n.playbackRate
        )
      })
    ) {
      return prev
    }

    prevSegmentsDataRef.current = newData
    return newData
  }, [trackSegments, playhead])

  // Effect 1: isPlaying 변경 시 모든 활성 오디오 재생/일시정지
  useEffect(() => {
    const audios = audioRefsMap.current

    if (isPlaying) {
      // Resume all active audios
      for (const audio of audios.values()) {
        if (audio.paused) {
          void audio.play().catch((error) => {
            console.error('[MultiAudio] Resume failed:', error)
          })
        }
      }
    } else {
      // Pause all active audios
      for (const audio of audios.values()) {
        audio.pause()
      }
    }
  }, [isPlaying])

  // Effect 2: activeSegments 변경 시 새 오디오 재생 및 비활성 오디오 정지
  useEffect(() => {
    if (!isPlayingRef.current && !isScrubbing) return

    const newActiveIds = new Set(activeSegmentsData.map((s) => s.id))
    const audios = audioRefsMap.current

    // 비활성화된 세그먼트들의 오디오 정지
    stopInactiveAudios(newActiveIds, audios)

    // 새로 활성화된 세그먼트들의 오디오 재생
    if (activeSegmentsData.length > 0) {
      playMultipleAudios(
        activeSegmentsData,
        audioObjects,
        readyAudioIds,
        audios,
        lastPlayheadRef,
        isPlayingRef,
      )
    }

    activeSegmentIdsRef.current = newActiveIds
  }, [activeSegmentsData, audioObjects, readyAudioIds, isScrubbing])

  // Effect 3: 활성 세그먼트들의 속성 변경 (playbackRate 등)
  useEffect(() => {
    if (activeSegmentsData.length === 0) return

    const audios = audioRefsMap.current

    for (const segmentData of activeSegmentsData) {
      const audio = audios.get(segmentData.id)
      if (!audio) continue

      // playbackRate 업데이트
      if (audio.playbackRate !== segmentData.playbackRate) {
        audio.playbackRate = segmentData.playbackRate
      }

      // offset 계산 및 업데이트 (throttled)
      const now = performance.now()
      const timeSinceLastUpdate = now - lastOffsetUpdateTimeRef.current

      if (timeSinceLastUpdate >= 500) {
        const expectedOffset = lastPlayheadRef.current - segmentData.start
        audio.currentTime = expectedOffset
        lastOffsetUpdateTimeRef.current = now
      }
    }
  }, [activeSegmentsData])

  // Effect 4: scrubbing 시 모든 활성 오디오의 offset 동기화
  useEffect(() => {
    if (!isScrubbing) return

    const audios = audioRefsMap.current

    for (const segmentData of activeSegmentsData) {
      const audio = audios.get(segmentData.id)
      if (!audio) continue

      // playhead가 현재 세그먼트 범위 내에 있을 때만 offset 업데이트
      if (playhead >= segmentData.start && playhead < segmentData.end) {
        const expectedOffset = playhead - segmentData.start
        audio.currentTime = expectedOffset
      }
    }
  }, [playhead, isScrubbing, activeSegmentsData])

  // Effect 5: playhead 점프 시 offset 동기화 (키보드 단축키 등)
  useEffect(() => {
    if (isPlayingRef.current) return // 재생 중일 때는 자동으로 동기화됨
    if (isScrubbing) return // 스크러빙은 Effect 4에서 처리

    const audios = audioRefsMap.current

    for (const segmentData of activeSegmentsData) {
      const audio = audios.get(segmentData.id)
      if (!audio) continue

      // 같은 세그먼트 내에 있는지 확인
      if (playhead >= segmentData.start && playhead < segmentData.end) {
        const expectedOffset = playhead - segmentData.start
        const currentOffset = audio.currentTime

        // offset 차이가 0.1초 이상일 때만 업데이트
        if (Math.abs(currentOffset - expectedOffset) > 0.1) {
          audio.currentTime = expectedOffset
          lastPlayheadRef.current = playhead
        }
      }
    }
  }, [playhead, activeSegmentsData, isScrubbing])

  // Cleanup on unmount
  useEffect(() => {
    const audios = audioRefsMap.current
    return () => {
      for (const audio of audios.values()) {
        audio.pause()
      }
      audios.clear()
    }
  }, [])

  return {
    currentAudios: Array.from(audioRefsMap.current.values()),
    activeSegmentIds: Array.from(activeSegmentIdsRef.current),
  }
}
