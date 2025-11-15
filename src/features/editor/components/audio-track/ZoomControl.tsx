// import { Minus, Plus } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { useEditorStore } from '@/shared/store/useEditorStore'

interface ZoomControlProps {
  className?: string
}

const MIN_SCALE = 0.35
const MAX_SCALE = 2

export function ZoomControl({ className }: ZoomControlProps) {
  const { scale, setScale } = useEditorStore()

  const handleSliderChange = (value: number) => {
    setScale(value)
  }

  // Calculate percentage for slider position
  const percentage = ((scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative h-[4px] w-28 overflow-hidden rounded-full bg-zinc-400">
        {/* Progress bar */}
        <div
          className="absolute left-0 h-full rounded-full bg-zinc-700 transition-all duration-150 ease-out"
          style={{ width: `${percentage}%` }}
        />

        {/* Invisible range input for interaction */}
        <input
          type="range"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={0.01}
          value={scale}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Zoom level"
        />
      </div>

      <span className="min-w-[2.5rem] text-[10px] font-medium text-zinc-500">
        {Math.round(scale * 100)}%
      </span>
    </div>
  )
}
