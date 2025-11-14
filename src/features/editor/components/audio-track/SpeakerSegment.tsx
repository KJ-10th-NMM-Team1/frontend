import { useRef } from 'react'

import type { Segment } from '@/entities/segment/types'
import { useAudioWaveform } from '@/features/editor/hooks/useAudioWaveform'
import { useSegmentDrag } from '@/features/editor/hooks/useSegmentDrag'
import { timeToPixel } from '@/features/editor/utils/timeline-scale'
import { usePresignedUrl } from '@/shared/api/hooks'
import { useIntersectionObserverOnce } from '@/shared/lib/hooks/useIntersectionObserver'
import { cn } from '@/shared/lib/utils'

import { SegmentResizeHandle } from './SegmentResizeHandle'
import { SegmentLoadingSpinner, SegmentWaveform } from './SegmentWaveform'

type SpeakerSegmentProps = {
  segment: Segment
  duration: number
  scale: number
  color: string
}

export function SpeakerSegment({ segment, duration, scale, color }: SpeakerSegmentProps) {
  const startPx = timeToPixel(segment.start, duration, scale)
  const widthPx = Math.max(timeToPixel(segment.end - segment.start, duration, scale), 64)

  // Drag functionality
  const { onPointerDown, isDragging } = useSegmentDrag({
    segment,
    duration,
    scale,
  })

  // Lazy loading for waveform visualization (뷰포트에 진입했을 때만 파형 로드)
  const [ref, isVisible] = useIntersectionObserverOnce<HTMLDivElement>({
    rootMargin: '300px', // 뷰포트 진입 300px 전부터 로드 시작
    threshold: 0.01, // 1%만 보여도 로드 시작
  })

  // Step 1: Get presigned URL (always enabled for audio playback)
  const { data: audioSrc, isLoading: urlLoading } = usePresignedUrl(segment.segment_audio_url, {
    staleTime: 5 * 60 * 1000,
    enabled: true, // 항상 로드 (재생을 위해 필요)
  })

  // Step 2: Generate waveform from audio URL (only when URL is available)
  // 첫 로딩 시에만 optimalSamples를 계산하고 이후 크기 변경 시에는 고정
  const BAR_UNIT = 2.5 // 바 하나당 차지하는 공간 (더 촘촘하게)
  const availableWidth = widthPx - 16 // 좌우 padding 8px씩 제외
  const currentOptimalSamples = Math.max(Math.floor(availableWidth / BAR_UNIT), 20) // 최소 20개

  // 첫 로딩 시 샘플 수를 ref에 저장하여 고정
  const fixedSamplesRef = useRef<number | null>(null)
  if (fixedSamplesRef.current === null && audioSrc && isVisible) {
    fixedSamplesRef.current = currentOptimalSamples
  }
  const samplesForQuery = fixedSamplesRef.current ?? currentOptimalSamples

  const { data: waveformData, isLoading: waveformLoading } = useAudioWaveform(
    audioSrc,
    !!audioSrc && isVisible, // URL 있고 visible일 때만 파형 생성
    samplesForQuery,
  )

  const isLoading = isVisible && (urlLoading || waveformLoading)

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      className={cn(
        'group absolute top-3 z-10 flex h-[60px] items-center justify-between rounded-2xl border px-3 text-xs font-semibold transition-opacity',
        isLoading && 'opacity-60',
        isDragging && 'cursor-grabbing opacity-60',
        !isDragging && 'cursor-grab',
      )}
      style={{
        left: `${startPx}px`,
        width: `${widthPx}px`,
        backgroundColor: `${color}20`,
        borderColor: color,
        color: color,
      }}
    >
      {/* Left resize handle */}
      <SegmentResizeHandle
        segment={segment}
        duration={duration}
        scale={scale}
        edge="start"
        color={color}
      />

      {/* Waveform visualization */}
      {!isVisible ? null : isLoading ? ( // 뷰포트 밖: 플레이스홀더 (아무것도 표시 안함)
        // 로딩 중: 스피너
        <SegmentLoadingSpinner color={color} size="sm" />
      ) : waveformData ? (
        // 로드 완료: 파형 표시
        <SegmentWaveform waveformData={waveformData} color={color} widthPx={widthPx} height={60} />
      ) : null}

      {/* Right resize handle */}
      <SegmentResizeHandle
        segment={segment}
        duration={duration}
        scale={scale}
        edge="end"
        color={color}
      />
    </div>
  )
}
