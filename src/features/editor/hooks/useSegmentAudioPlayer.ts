import { useEffect, useRef, useMemo } from 'react'

import type { Segment } from '@/entities/segment/types'

type UseSegmentAudioPlayerOptions = {
  segments: Segment[]
  playhead: number
  isPlaying: boolean
  playbackRate: number
  audioUrls: Map<string, string> // segmentId -> presigned URL
}

type SegmentData = {
  id: string
  start: number
  end: number
  playbackRate: number
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
  playbackRate,
  audioUrls,
}: UseSegmentAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentSegmentIdRef = useRef<string | null>(null)
  const lastPlayheadRef = useRef<number>(0)
  const prevSegmentDataRef = useRef<SegmentData | null>(null)
  // const playbackRateRef = useRef<number>(playbackRate)
  const isPlayingRef = useRef<boolean>(isPlaying)

  // Refs를 최신 상태로 유지 (가벼운 연산)
  // useEffect(() => {
  //   playbackRateRef.current = playbackRate
  // }, [playbackRate])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    lastPlayheadRef.current = playhead
  }, [playhead])

  // Find current segment and extract needed properties
  const currentSegmentData = useMemo(() => {
    const segment = segments.find((seg) => playhead >= seg.start && playhead < seg.end)
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

  // Effect 1: Segment 변경 시에만 새 오디오 생성 및 재생
  // Dependency: currentSegmentData (segment 변경시에만 트리거)
  useEffect(() => {
    if (!isPlayingRef.current || !currentSegmentData) return

    // Segment가 변경되었는지 확인
    const segmentChanged = currentSegmentIdRef.current !== currentSegmentData.id
    if (!segmentChanged) return

    currentSegmentIdRef.current = currentSegmentData.id

    // Stop previous audio if any
    if (audioRef.current) audioRef.current.pause()

    // Get the presigned URL for this segment
    const audioUrl = audioUrls.get(currentSegmentData.id)
    if (!audioUrl) return

    // Calculate audio offset using ref (최신 playhead 값)
    const segmentOffset = lastPlayheadRef.current - currentSegmentData.start

    // Create and play new audio
    const audio = new Audio(audioUrl)
    audio.crossOrigin = 'anonymous'
    audio.playbackRate = currentSegmentData.playbackRate
    audio.currentTime = segmentOffset

    audioRef.current = audio

    // Start playback when audio is ready
    const playAudio = () => {
      void audio.play().catch((error) => {
        console.error('Audio playback failed:', error)
      })
    }

    if (audio.readyState >= 2) {
      playAudio()
    } else {
      audio.addEventListener('canplay', playAudio, { once: true })
    }
  }, [currentSegmentData, audioUrls])

  // Effect 2: isPlaying 변경 시 재생/일시정지 처리
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

  // Effect 3: playbackRate 변경 시 속도 업데이트
  // Dependency: playbackRate
  useEffect(() => {
    if (!audioRef.current) return

    if (audioRef.current.playbackRate !== playbackRate) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  // Effect 4: playhead jump 감지 및 오디오 동기화
  // RAF 기반으로 주기적 체크 (초당 10회로 제한)
  // Dependency: isPlaying, currentSegmentData
  useEffect(() => {
    if (!isPlaying || !currentSegmentData) return

    const PLAYHEAD_JUMP_THRESHOLD = 0.5 // 0.5초 이상 차이나면 동기화
    const SYNC_CHECK_INTERVAL = 100 // 100ms마다 체크 (초당 10회)

    let lastCheckTime = performance.now()
    let rafId: number

    const checkSync = () => {
      const now = performance.now()
      const elapsed = now - lastCheckTime

      // 100ms마다만 체크 (초당 60회 → 10회로 감소)
      if (elapsed >= SYNC_CHECK_INTERVAL) {
        lastCheckTime = now

        const currentPlayhead = lastPlayheadRef.current
        const audio = audioRef.current

        if (audio && currentSegmentData) {
          const expectedAudioTime = currentPlayhead - currentSegmentData.start
          const actualAudioTime = audio.currentTime
          const drift = Math.abs(expectedAudioTime - actualAudioTime)

          // drift가 임계값을 넘으면 동기화
          if (drift > PLAYHEAD_JUMP_THRESHOLD) {
            audio.currentTime = expectedAudioTime
          }
        }
      }

      if (isPlayingRef.current) {
        rafId = requestAnimationFrame(checkSync)
      }
    }

    rafId = requestAnimationFrame(checkSync)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [isPlaying, currentSegmentData])

  // Effect 5: Segment가 없을 때 오디오 정지
  // Dependency: currentSegmentData
  useEffect(() => {
    if (currentSegmentData === null && audioRef.current) {
      audioRef.current.pause()
      currentSegmentIdRef.current = null
    }
  }, [currentSegmentData])

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
