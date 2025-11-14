import type { PointerEvent } from 'react'

import { getTimelineWidth, timeToPixel } from '@/features/editor/utils/timeline-scale'

type TimeRulerProps = {
  timelineTicks: number[]
  duration: number
  scale: number
  onTimelinePointerDown: (event: PointerEvent<HTMLDivElement>) => void
}

/**
 * 타임라인 상단의 시간 눈금자를 표시하는 컴포넌트
 * z-index: 없음 (기본 레이어)
 */
export function TimeRuler({
  timelineTicks,
  duration,
  scale,
  onTimelinePointerDown,
}: TimeRulerProps) {
  const timelineWidth = getTimelineWidth(duration, scale)

  return (
    <div
      className="border-surface-3 cursor-col-resize overflow-hidden border-b"
      onPointerDown={onTimelinePointerDown}
    >
      <div className="relative h-10 bg-white" style={{ width: `${timelineWidth}px` }}>
        <div className="text-muted relative h-full text-[10px]">
          {timelineTicks.map((tick) => {
            const tickPosition = timeToPixel(tick, duration, scale)
            return (
              <div
                key={tick}
                className="absolute flex flex-col items-center"
                style={{ left: `${tickPosition}px` }}
              >
                <span>{tick.toFixed(0).padStart(2, '0')}s</span>
                <span className="bg-surface-3 mt-1 h-4 w-px" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
