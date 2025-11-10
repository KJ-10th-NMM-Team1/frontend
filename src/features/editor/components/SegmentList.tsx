import type { Segment } from '../../../entities/segment/types'
import { cn, secondsToTimestamp } from '../../../shared/lib/utils'
import { useEditorStore } from '../../../shared/store/useEditorStore'
import { Button } from '../../../shared/ui/Button'

type SegmentListProps = {
  segments: Segment[]
}

export function SegmentList({ segments }: SegmentListProps) {
  const { activeSegmentId, setActiveSegment } = useEditorStore((state) => ({
    activeSegmentId: state.activeSegmentId,
    setActiveSegment: state.setActiveSegment,
  }))

  return (
    <div className="space-y-3">
      {segments.map((segment) => {
        const isActive = activeSegmentId === segment.id
        return (
          <button
            key={segment.id}
            type="button"
            onClick={() => setActiveSegment(segment.id)}
            className={cn(
              'border-surface-4 bg-surface-1 hover:border-primary/60 w-full rounded-2xl border px-4 py-3 text-left transition',
              isActive ? 'border-primary bg-primary/10' : '',
            )}
          >
            <div className="text-muted flex items-center justify-between text-xs">
              <span>{segment.speakerName}</span>
              <span>
                {secondsToTimestamp(segment.start)} - {secondsToTimestamp(segment.end)}
              </span>
            </div>
            <p className="text-foreground mt-2 text-sm font-medium">{segment.originalText}</p>
            <p className="text-muted mt-1 text-sm">{segment.translatedText}</p>
            {segment.reviewing ? (
              <span className="bg-warning/15 text-warning-darker mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                재검토 필요
              </span>
            ) : null}
          </button>
        )
      })}
      <Button variant="ghost" size="sm" onClick={() => setActiveSegment(null)} className="w-full">
        선택 해제
      </Button>
    </div>
  )
}
