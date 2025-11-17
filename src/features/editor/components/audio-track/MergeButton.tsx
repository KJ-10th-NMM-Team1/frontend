import { Plus } from 'lucide-react'

import type { Segment } from '@/entities/segment/types'
import { cn } from '@/shared/lib/utils'

type MergeButtonProps = {
  currentSegment: Segment
  nextSegment: Segment
  onMerge: (segmentIds: string[], languageCode: string) => void
  color: string
}

/**
 * MergeButton component
 *
 * Displays a merge button between two touching segments
 * - Positioned at the boundary between current and next segment
 * - Merges the two segments when clicked
 * - Disabled if either segment has playbackRate !== 1.0
 */
export function MergeButton({ currentSegment, nextSegment, onMerge, color }: MergeButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Merge current segment with next segment
    const segmentIds = [currentSegment.id, nextSegment.id]
    onMerge(segmentIds, currentSegment.language_code)
  }

  // Check if either segment has modified playback rate
  const isDisabled =
    (currentSegment.playbackRate !== undefined && currentSegment.playbackRate !== 1.0) ||
    (nextSegment.playbackRate !== undefined && nextSegment.playbackRate !== 1.0)

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'pointer-events-auto absolute top-0 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-lg transition-all hover:scale-110',
        isDisabled && 'cursor-not-allowed opacity-40',
        !isDisabled && 'hover:shadow-xl',
      )}
      style={{
        right: '-12px', // Position at the right edge of current segment (between segments)
        backgroundColor: isDisabled ? '#6b7280' : color,
        borderColor: 'white',
      }}
      title={
        isDisabled ? 'Cannot merge segments with modified playback rate' : 'Merge with next segment'
      }
    >
      <Plus className="h-3.5 w-3.5 text-white" />
    </button>
  )
}
