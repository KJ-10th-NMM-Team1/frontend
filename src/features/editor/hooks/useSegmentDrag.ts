import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCallback, useRef, useState, useMemo } from 'react'

import type { Segment } from '@/entities/segment/types'
import {
  clampSegmentPosition,
  findAdjacentSegments,
} from '@/features/editor/utils/segment-constraints'
import { pixelToTime } from '@/features/editor/utils/timeline-scale'
import { useSegmentsStore } from '@/shared/store/useSegmentsStore'

type UseSegmentDragOptions = {
  segment: Segment
  duration: number
  scale: number
  onDragStart?: () => void
  onDragEnd?: () => void
}

/**
 * Hook to handle segment dragging on timeline
 *
 * Features:
 * - Drag segment to move its position
 * - Updates segment start/end times
 * - Prevents dragging outside timeline bounds
 * - Snapping to grid (optional)
 */
export function useSegmentDrag({
  segment,
  duration,
  scale,
  onDragStart,
  onDragEnd,
}: UseSegmentDragOptions) {
  const updateSegmentPosition = useSegmentsStore((state) => state.updateSegmentPosition)
  const segments = useSegmentsStore((state) => state.segments)
  const [isDragging, setIsDragging] = useState(false)

  const dragStateRef = useRef<{
    startX: number
    initialSegmentStart: number
    segmentDuration: number
  } | null>(null)

  // 인접 세그먼트를 ref로 저장하여 불필요한 재계산 방지
  const adjacentSegmentsRef = useRef<{
    previous: Segment | null
    next: Segment | null
  }>({ previous: null, next: null })

  // segments 배열이 변경되거나 segment.id가 변경될 때만 인접 세그먼트 재계산
  // 순서가 변경되지 않는다고 가정하므로 findIndex만 사용
  useMemo(() => {
    adjacentSegmentsRef.current = findAdjacentSegments(segments, segment.id)
  }, [segments, segment.id])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Only handle left mouse button
      if (event.button !== 0) return

      // Prevent text selection during drag
      event.preventDefault()

      const segmentDuration = segment.end - segment.start

      setIsDragging(true)
      dragStateRef.current = {
        startX: event.clientX,
        initialSegmentStart: segment.start,
        segmentDuration,
      }

      onDragStart?.()

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!dragStateRef.current) return

        const deltaX = moveEvent.clientX - dragStateRef.current.startX
        const deltaTime = pixelToTime(deltaX, duration, scale)

        // Calculate new position
        const newStart = dragStateRef.current.initialSegmentStart + deltaTime

        // Apply constraints using utility function
        const { start: clampedStart, end: clampedEnd } = clampSegmentPosition(
          newStart,
          dragStateRef.current.segmentDuration,
          duration,
          adjacentSegmentsRef.current.previous,
          adjacentSegmentsRef.current.next,
        )

        // Update segment position
        updateSegmentPosition(segment.id, clampedStart, clampedEnd)
      }

      const handlePointerUp = () => {
        if (dragStateRef.current) {
          dragStateRef.current = null
          setIsDragging(false)
          onDragEnd?.()
        }

        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [segment, duration, scale, updateSegmentPosition, onDragStart, onDragEnd],
  )

  return {
    onPointerDown,
    isDragging,
  }
}
