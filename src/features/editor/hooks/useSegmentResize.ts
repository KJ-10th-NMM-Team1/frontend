import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCallback, useRef, useState, useMemo } from 'react'

import type { Segment } from '@/entities/segment/types'
import {
  clampSegmentStartResize,
  clampSegmentEndResize,
  findAdjacentSegments,
} from '@/features/editor/utils/segment-constraints'
import { pixelToTime } from '@/features/editor/utils/timeline-scale'
import { useTracksStore } from '@/shared/store/useTracksStore'

type ResizeEdge = 'start' | 'end'

type UseSegmentResizeOptions = {
  segment: Segment
  duration: number
  scale: number
  edge: ResizeEdge
  trackSegments: Segment[]  // 같은 트랙 내의 세그먼트만
  onResizeStart?: () => void
  onResizeEnd?: () => void
}

/**
 * Hook to handle segment resizing (start/end edge dragging)
 *
 * Features:
 * - 세그먼트 시작/끝점 드래그로 크기 조절
 * - 배속 자동 계산 (playbackRate = originalDuration / newDuration)
 * - 인접 세그먼트와 겹치지 않도록 제약
 * - 최소 세그먼트 길이 제약
 */
export function useSegmentResize({
  segment,
  duration,
  scale,
  edge,
  trackSegments,
  onResizeStart,
  onResizeEnd,
}: UseSegmentResizeOptions) {
  const updateSegmentSize = useTracksStore((state) => state.updateSegmentSize)
  const [isResizing, setIsResizing] = useState(false)

  const resizeStateRef = useRef<{
    startX: number
    initialStart: number
    initialEnd: number
    originalDuration: number // 원본 세그먼트 길이 (변경 전)
  } | null>(null)

  // 인접 세그먼트를 ref로 저장 (같은 트랙 내에서만)
  const adjacentSegmentsRef = useRef<{
    previous: Segment | null
    next: Segment | null
  }>({ previous: null, next: null })

  useMemo(() => {
    adjacentSegmentsRef.current = findAdjacentSegments(trackSegments, segment.id)
  }, [trackSegments, segment.id])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Only handle left mouse button
      if (event.button !== 0) return

      // Prevent text selection and event bubbling
      event.preventDefault()
      event.stopPropagation()

      // 실제 원본 오디오 길이 계산
      const currentDuration = segment.end - segment.start
      const currentRate = segment.playbackRate ?? 1.0
      const originalDuration = currentDuration * currentRate

      console.log('[Resize] 리사이즈 시작:', {
        segmentId: segment.id,
        currentDuration,
        currentPlaybackRate: currentRate,
        originalDuration, // 실제 원본 오디오 길이
        start: segment.start,
        end: segment.end,
      })

      setIsResizing(true)
      resizeStateRef.current = {
        startX: event.clientX,
        initialStart: segment.start,
        initialEnd: segment.end,
        originalDuration, // 변경 전 길이 저장
      }

      onResizeStart?.()

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!resizeStateRef.current) return

        const deltaX = moveEvent.clientX - resizeStateRef.current.startX
        const deltaTime = pixelToTime(deltaX, duration, scale)

        let newStart = resizeStateRef.current.initialStart
        let newEnd = resizeStateRef.current.initialEnd

        if (edge === 'start') {
          // 시작점 조절
          newStart = resizeStateRef.current.initialStart + deltaTime

          // 제약 조건 적용
          newStart = clampSegmentStartResize(
            newStart,
            resizeStateRef.current.initialEnd,
            adjacentSegmentsRef.current.previous,
          )
        } else {
          // 끝점 조절
          newEnd = resizeStateRef.current.initialEnd + deltaTime

          // 제약 조건 적용
          newEnd = clampSegmentEndResize(
            newEnd,
            resizeStateRef.current.initialStart,
            duration,
            adjacentSegmentsRef.current.next,
          )
        }

        // Update segment size
        // playbackRate는 store에서 자동 계산됨
        updateSegmentSize(segment.id, newStart, newEnd, resizeStateRef.current.originalDuration)
      }

      const handlePointerUp = () => {
        if (resizeStateRef.current) {
          resizeStateRef.current = null
          setIsResizing(false)
          onResizeEnd?.()
        }

        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [segment, duration, scale, edge, updateSegmentSize, onResizeStart, onResizeEnd],
  )

  return {
    onPointerDown,
    isResizing,
  }
}
