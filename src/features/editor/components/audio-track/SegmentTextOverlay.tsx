/**
 * Text overlay component for focused segments
 * Shows source/target text with editing capability
 */

import { cn } from '@/shared/lib/utils'

type SegmentTextOverlayProps = {
  sourceText: string
  targetText: string
  onSourceChange: (value: string) => void
  onTargetChange: (value: string) => void
  color: string
}

export function SegmentTextOverlay({
  sourceText,
  targetText,
  onSourceChange,
  onTargetChange,
  color,
}: SegmentTextOverlayProps) {

  // Stop event propagation to prevent drag/resize when editing
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Prevent context menu on text inputs
  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center gap-0.5 rounded-2xl bg-white/90 px-3 py-1 backdrop-blur-sm"
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Source text input */}
      <input
        type="text"
        value={sourceText}
        onChange={(e) => onSourceChange(e.target.value)}
        placeholder="원문 입력..."
        className={cn(
          'w-full truncate border-0 bg-transparent p-0 text-xs font-medium leading-tight',
          'text-gray-600 placeholder:text-gray-400 focus:outline-none',
        )}
      />

      {/* Arrow and target text */}
      <div className="flex items-center gap-1">
        <span className="shrink-0 text-xs" style={{ color: color }}>
          →
        </span>
        <input
          type="text"
          value={targetText}
          onChange={(e) => onTargetChange(e.target.value)}
          placeholder="번역 입력..."
          className={cn(
            'min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-xs font-bold leading-tight',
            'placeholder:text-gray-400 focus:outline-none',
          )}
          style={{ color: color }}
        />
      </div>
    </div>
  )
}
