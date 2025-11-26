/**
 * Waveform visualization component for audio segments
 */

import { memo } from 'react'

import { cn } from '@/shared/lib/utils'

type SegmentWaveformProps = {
  waveformData: number[]
  color: string
  widthPx: number
  height?: number
  audioDuration?: number // 실제 오디오 길이 (초)
  segmentDuration?: number // 세그먼트 길이 (초)
}

/**
 * Renders waveform bars for a segment
 * Memoized to prevent unnecessary re-renders
 *
 * widthPx에 따라 바들의 간격이 자동으로 조정됨
 * audioDuration이 segmentDuration보다 짧으면 그 비율만큼만 파형 표시
 */
export const SegmentWaveform = memo(function SegmentWaveform({
  waveformData,
  color,
  widthPx,
  height = 40,
  audioDuration,
  segmentDuration,
}: SegmentWaveformProps) {
  const BAR_WIDTH = 3 // 고정 바 너비 (px)
  const MIN_BAR_HEIGHT = 1 // 최소 바 높이 (px) - 작은 파형도 보이도록
  const barCount = waveformData.length

  // 사용 가능한 너비에서 모든 바의 너비를 뺀 후 간격을 계산
  const totalAvailableWidth = widthPx - 16 // 좌우 padding 제외

  // 오디오가 세그먼트보다 짧으면 그 비율만큼만 파형 표시
  const waveformRatio =
    audioDuration && segmentDuration ? Math.min(audioDuration / segmentDuration, 1) : 1
  const availableWidth = totalAvailableWidth * waveformRatio

  const totalBarWidth = BAR_WIDTH * barCount
  const totalGapWidth = availableWidth - totalBarWidth
  const gapWidth = barCount > 1 ? Math.max(totalGapWidth / (barCount - 1), 0) : 0

  return (
    <div className="absolute inset-x-0 bottom-1 top-1 flex items-center px-2">
      <div
        style={{ width: `${availableWidth}px` }}
        className="relative flex h-full items-center overflow-hidden"
      >
        {waveformData.map((amplitude, index) => {
          const barHeight = Math.max(amplitude * height, MIN_BAR_HEIGHT)
          const isLast = index === barCount - 1

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
                marginRight: isLast ? 0 : `${gapWidth}px`,
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
