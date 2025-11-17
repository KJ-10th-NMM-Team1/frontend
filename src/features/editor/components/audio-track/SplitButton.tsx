import { Scissors } from 'lucide-react'

import type { Segment } from '@/entities/segment/types'
import { cn } from '@/shared/lib/utils'

type SplitButtonProps = {
  segment: Segment
  yOffset: number // Y position relative to timeline (cumulative track heights)
  onSplit: (segment: Segment, splitTime: number) => void
  splitTime: number
  color: string
}

/**
 * Split button displayed at playhead position when hovering over a segment
 * Shows at the current playhead position to split the segment
 */
export function SplitButton({ segment, yOffset, onSplit, splitTime, color }: SplitButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSplit(segment, splitTime)
  }

  // Prevent split if playback_rate is not 1.0 (배속이 변경된 경우)
  const isDisabled = segment.playbackRate !== undefined && segment.playbackRate !== 1.0

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'pointer-events-auto absolute flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-lg transition-all hover:scale-110',
        isDisabled && 'cursor-not-allowed opacity-40',
        !isDisabled && 'hover:shadow-xl',
      )}
      style={{
        top: `${yOffset + 42 - 12}px`, // Center vertically in track (84px height / 2 - button height / 2)
        left: '-12px', // Center horizontally on playhead line
        backgroundColor: isDisabled ? '#6b7280' : color,
        borderColor: 'white',
      }}
      title={
        isDisabled
          ? '배속이 조정된 세그먼트는 분할할 수 없습니다. 배속을 1.0으로 리셋하세요.'
          : `Split segment at ${splitTime.toFixed(2)}s`
      }
    >
      <Scissors className="h-3 w-3 text-white" />
    </button>
  )
}
