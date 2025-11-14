import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCallback, useRef, useState, useMemo } from 'react'

import type { Segment } from '@/entities/segment/types'
import {
  clampSegmentStartResize,
  clampSegmentEndResize,
  findAdjacentSegments,
} from '@/features/editor/utils/segment-constraints'
import { pixelToTime } from '@/features/editor/utils/timeline-scale'
import { useSegmentsStore } from '@/shared/store/useSegmentsStore'

type ResizeEdge = 'start' | 'end'

type UseSegmentResizeOptions = {
  segment: Segment
  duration: number
  scale: number
  edge: ResizeEdge
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
  onResizeStart,
  onResizeEnd,
}: UseSegmentResizeOptions) {
  const updateSegmentSize = useSegmentsStore((state) => state.updateSegmentSize)
  const segments = useSegmentsStore((state) => state.segments)
  const [isResizing, setIsResizing] = useState(false)

  const resizeStateRef = useRef<{
    startX: number
    initialStart: number
    initialEnd: number
    originalDuration: number // 원본 세그먼트 길이 (변경 전)
  } | null>(null)

  // 인접 세그먼트를 ref로 저장
  const adjacentSegmentsRef = useRef<{
    previous: Segment | null
    next: Segment | null
  }>({ previous: null, next: null })

  useMemo(() => {
    adjacentSegmentsRef.current = findAdjacentSegments(segments, segment.id)
  }, [segments, segment.id])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Only handle left mouse button
      if (event.button !== 0) return

      // Prevent text selection and event bubbling
      event.preventDefault()
      event.stopPropagation()

      // 초기 상태 저장
      const originalDuration = segment.end - segment.start

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
