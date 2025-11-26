import type { Segment } from '@/entities/segment/types'
import { useSegmentResize } from '@/features/editor/hooks/useSegmentResize'
import { cn } from '@/shared/lib/utils'

type SegmentResizeHandleProps = {
  segment: Segment
  duration: number
  scale: number
  edge: 'start' | 'end'
  color: string
  trackSegments: Segment[]
  onResizeStart?: () => void
  onResizeEnd?: () => void
}

/**
 * 세그먼트 크기 조절 핸들
 *
 * Features:
 * - 세그먼트 시작/끝점에 배치
 * - 드래그하여 세그먼트 크기 조절
 * - 호버/드래그 상태에 따른 시각적 피드백
 */
export function SegmentResizeHandle({
  segment,
  duration,
  scale,
  edge,
  color,
  trackSegments,
  onResizeStart,
  onResizeEnd,
}: SegmentResizeHandleProps) {
  const { onPointerDown, isResizing } = useSegmentResize({
    segment,
    duration,
    scale,
    edge,
    trackSegments,
    onResizeStart,
    onResizeEnd,
  })

  return (
    <div
      onPointerDown={onPointerDown}
      className={cn(
        'absolute top-1/2 z-50 h-1/2 w-2 -translate-y-1/2 cursor-ew-resize transition-all',
        isResizing && 'rounded-full opacity-20',
        edge === 'start' ? 'left-0' : 'right-0',
      )}
      style={{
        backgroundColor: isResizing ? color : 'transparent',
      }}
    >
      {/* 시각적 표시 (가운데 선) */}
      <div
        className={cn(
          'absolute top-1/2 h-8 w-0.5 -translate-y-1/2 transition-opacity',
          'opacity-0 group-hover:opacity-100',
          isResizing && 'opacity-100',
          edge === 'start' ? 'left-1/2 -translate-x-1/2' : 'right-1/2 translate-x-1/2',
        )}
        style={{
          backgroundColor: color,
        }}
      />
    </div>
  )
}
