import { createPortal } from 'react-dom'
import { Music, Wand2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

type SegmentContextMenuProps = {
  isOpen: boolean
  position: { x: number; y: number }
  onClose: () => void
  onGenerateFixed: () => void
  onGenerateDynamic: () => void
}

/**
 * Context menu for segment actions
 *
 * Appears on right-click with options:
 * - Generate Audio (Fixed): Uses fixed voice sample
 * - Generate Audio (Dynamic): Uses dynamic voice generation
 */
export function SegmentContextMenu({
  isOpen,
  position,
  onClose,
  onGenerateFixed,
  onGenerateDynamic,
}: SegmentContextMenuProps) {
  if (!isOpen) return null

  return createPortal(
    <>
      {/* Backdrop to catch outside clicks */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault()
          onClose()
        }}
      />

      {/* Context Menu */}
      <div
        className="bg-surface-1 border-surface-3 text-foreground fixed z-[101] min-w-[14rem] rounded-2xl border p-2 shadow-soft"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(0, -50%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-muted px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
          Generate Audio
        </div>

        <button
          onClick={onGenerateFixed}
          className={cn(
            'text-foreground hover:bg-surface-2 flex w-full cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium outline-none transition-colors',
          )}
        >
          <Music className="h-4 w-4" />
          <div className="flex flex-col gap-0.5">
            <span>Fixed Voice</span>
            <span className="text-muted text-xs font-normal">Use assigned voice sample</span>
          </div>
        </button>

        <button
          onClick={onGenerateDynamic}
          className={cn(
            'text-foreground hover:bg-surface-2 flex w-full cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium outline-none transition-colors',
          )}
        >
          <Wand2 className="h-4 w-4" />
          <div className="flex flex-col gap-0.5">
            <span>Dynamic Voice</span>
            <span className="text-muted text-xs font-normal">AI-generated voice cloning</span>
          </div>
        </button>
      </div>
    </>,
    document.body,
  )
}
