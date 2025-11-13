import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCallback, useRef } from 'react'

import type { Segment } from '@/entities/segment/types'
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

  const dragStateRef = useRef<{
    isDragging: boolean
    startX: number
    initialSegmentStart: number
    segmentDuration: number
  } | null>(null)

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Only handle left mouse button
      if (event.button !== 0) return

      // Prevent text selection during drag
      event.preventDefault()

      const segmentDuration = segment.end - segment.start

      dragStateRef.current = {
        isDragging: true,
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
        let newStart = dragStateRef.current.initialSegmentStart + deltaTime
        const newEnd = newStart + dragStateRef.current.segmentDuration

        // Clamp to timeline bounds
        if (newStart < 0) {
          newStart = 0
        } else if (newEnd > duration) {
          newStart = duration - dragStateRef.current.segmentDuration
        }

        const finalEnd = newStart + dragStateRef.current.segmentDuration

        // Update segment position
        updateSegmentPosition(segment.id, newStart, finalEnd)
      }

      const handlePointerUp = () => {
        if (dragStateRef.current) {
          dragStateRef.current = null
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
    isDragging: dragStateRef.current?.isDragging ?? false,
  }
}
