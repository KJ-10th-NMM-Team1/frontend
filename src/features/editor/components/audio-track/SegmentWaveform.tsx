/**
 * Waveform visualization component for audio segments
 */

import { memo } from 'react'

import { cn } from '@/shared/lib/utils'

type SegmentWaveformProps = {
  waveformData: number[]
  color: string
  height?: number
}

/**
 * Renders waveform bars for a segment
 * Memoized to prevent unnecessary re-renders
 *
 * 균일한 바 크기를 위해 고정 너비(3px)와 간격(1px) 사용
 */
export const SegmentWaveform = memo(function SegmentWaveform({
  waveformData,
  color,
  height = 40,
}: SegmentWaveformProps) {
  const BAR_WIDTH = 3 // 고정 바 너비 (px)

  return (
    <div className="absolute inset-x-0 bottom-1 top-1 flex items-center px-2">
      <div className="relative flex h-full items-center justify-center gap-px">
        {waveformData.map((amplitude, index) => {
          const barHeight = amplitude * height * 1.5

          return (
            <div
              key={index}
              className="flex-shrink-0"
              style={{
                width: `${BAR_WIDTH}px`,
                height: `${barHeight}px`,
                backgroundColor: color,
                opacity: 0.75,
                borderRadius: '3px',
              }}
            />
          )
        })}
      </div>
    </div>
  )
})

/**
 * Loading spinner for segment
 * Used for various loading states (URL fetching, waveform generation, etc.)
 */
export function SegmentLoadingSpinner({
  color,
  size = 'sm',
}: {
  color: string
  size?: 'sm' | 'md'
}) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-[3px]',
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span
        className={cn('animate-spin rounded-full border-r-transparent', sizeClasses[size])}
        style={{
          borderColor: color,
          borderRightColor: 'transparent',
        }}
      />
    </div>
  )
}
