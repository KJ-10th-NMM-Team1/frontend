import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCallback, useRef, useState, useMemo } from 'react'

import type { Segment } from '@/entities/segment/types'
import {
  clampSegmentPosition,
  findAdjacentSegments,
} from '@/features/editor/utils/segment-constraints'
import { pixelToTime } from '@/features/editor/utils/timeline-scale'
import { useTracksStore } from '@/shared/store/useTracksStore'

type TrackLayout = {
  trackId: string
  yStart: number // Track의 Y 좌표 시작점 (절대 위치)
  yEnd: number // Track의 Y 좌표 끝점 (절대 위치)
}

type UseSegmentDragOptions = {
  segment: Segment
  duration: number
  scale: number
  currentTrackId: string // 현재 세그먼트가 속한 트랙 ID
  trackLayouts?: TrackLayout[] // 모든 speaker 트랙의 레이아웃 정보 (트랙 간 이동용)
  onDragStart?: () => void
  onDragEnd?: () => void
}

/**
 * Hook to handle segment dragging on timeline
 *
 * Features:
 * - Drag segment to move its position (horizontal)
 * - Drag segment to move between tracks (vertical)
 * - Updates segment start/end times
 * - Prevents dragging outside timeline bounds
 * - Snapping to grid (optional)
 */
export function useSegmentDrag({
  segment,
  duration,
  scale,
  currentTrackId,
  trackLayouts,
  onDragStart,
  onDragEnd,
}: UseSegmentDragOptions) {
  const updateSegmentPosition = useTracksStore((state) => state.updateSegmentPosition)
  const moveSegmentToTrack = useTracksStore((state) => state.moveSegmentToTrack)
  const tracks = useTracksStore((state) => state.tracks)
  const [isDragging, setIsDragging] = useState(false)

  // 현재 트랙의 세그먼트만 가져오기 (인접 세그먼트 계산용)
  const currentTrackSegments = useMemo(() => {
    const track = tracks.find((t) => t.id === currentTrackId && t.type === 'speaker')
    return track && track.type === 'speaker' ? track.segments : []
  }, [tracks, currentTrackId])

  const dragStateRef = useRef<{
    startX: number
    startY: number
    initialSegmentStart: number
    segmentDuration: number
    currentTrackId: string
    targetTrackId: string | null // 드래그 중 호버 중인 트랙 (드롭 시 사용)
    dragAxis: 'none' | 'x' | 'y' // 드래그 축 잠금 ('none': 아직 결정 안됨, 'x': 수평만, 'y': 수직만)
  } | null>(null)

  // Y축 드래그 시 마우스를 따라다니는 오프셋
  const [verticalOffset, setVerticalOffset] = useState<number>(0)

  // 인접 세그먼트를 ref로 저장하여 불필요한 재계산 방지
  const adjacentSegmentsRef = useRef<{
    previous: Segment | null
    next: Segment | null
  }>({ previous: null, next: null })

  // 현재 트랙의 세그먼트 배열이 변경되거나 segment.id가 변경될 때만 인접 세그먼트 재계산
  // 같은 트랙 내의 세그먼트만 고려하여 충돌 방지
  useMemo(() => {
    adjacentSegmentsRef.current = findAdjacentSegments(currentTrackSegments, segment.id)
  }, [currentTrackSegments, segment.id])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Only handle left mouse button
      if (event.button !== 0) return

      // Prevent text selection during drag
      event.preventDefault()

      const segmentDuration = segment.end - segment.start

      setIsDragging(true)
      setVerticalOffset(0) // 초기화
      dragStateRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        initialSegmentStart: segment.start,
        segmentDuration,
        currentTrackId,
        targetTrackId: null, // 초기에는 타겟 트랙 없음
        dragAxis: 'none', // 아직 축 결정 안됨
      }

      onDragStart?.()

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!dragStateRef.current) return

        const deltaX = moveEvent.clientX - dragStateRef.current.startX
        const deltaY = moveEvent.clientY - dragStateRef.current.startY

        // === 드래그 축 결정 (처음 이동 시 한 번만) ===
        const AXIS_LOCK_THRESHOLD = 10 // 10px 이동 후 축 결정

        if (dragStateRef.current.dragAxis === 'none') {
          const absX = Math.abs(deltaX)
          const absY = Math.abs(deltaY)

          if (absX > AXIS_LOCK_THRESHOLD || absY > AXIS_LOCK_THRESHOLD) {
            // 더 많이 이동한 축으로 잠금
            dragStateRef.current.dragAxis = absX > absY ? 'x' : 'y'
          }
        }

        // === Horizontal Movement (Time Position) - X축 잠금 시에만 ===
        if (dragStateRef.current.dragAxis === 'x' || dragStateRef.current.dragAxis === 'none') {
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

        // === Vertical Movement (Track Change Detection) - Y축 잠금 시에만 ===
        if (
          (dragStateRef.current.dragAxis === 'y' || dragStateRef.current.dragAxis === 'none') &&
          trackLayouts &&
          trackLayouts.length > 0
        ) {
          const currentY = moveEvent.clientY

          // Y축 오프셋 업데이트 (마우스를 따라다니게)
          setVerticalOffset(deltaY)

          // Find which track the cursor is currently over
          const targetTrack = trackLayouts.find(
            (layout) => currentY >= layout.yStart && currentY <= layout.yEnd,
          )

          // 호버 중인 트랙 ID 업데이트 (실제 이동은 하지 않음)
          if (targetTrack) {
            dragStateRef.current.targetTrackId = targetTrack.trackId
          } else {
            dragStateRef.current.targetTrackId = null
          }
        }
      }

      const handlePointerUp = () => {
        if (dragStateRef.current) {
          // === 드롭 시 트랙 변경 처리 ===
          const { currentTrackId: sourceTrackId, targetTrackId } = dragStateRef.current

          // 다른 트랙으로 드롭한 경우에만 이동
          if (targetTrackId && targetTrackId !== sourceTrackId) {
            moveSegmentToTrack(segment.id, targetTrackId)
          }

          dragStateRef.current = null
          setIsDragging(false)
          setVerticalOffset(0) // 오프셋 초기화
          onDragEnd?.()
        }

        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [
      segment,
      duration,
      scale,
      currentTrackId,
      trackLayouts,
      updateSegmentPosition,
      moveSegmentToTrack,
      onDragStart,
      onDragEnd,
    ],
  )

  return {
    onPointerDown,
    isDragging,
    verticalOffset, // Y축 드래그 시 세그먼트가 따라다니는 오프셋
  }
}
