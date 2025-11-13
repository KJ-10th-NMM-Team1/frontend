import type { Segment } from '@/entities/segment/types'
import { useAudioWaveform } from '@/features/editor/hooks/useAudioWaveform'
import { useSegmentDrag } from '@/features/editor/hooks/useSegmentDrag'
import { timeToPixel } from '@/features/editor/utils/timeline-scale'
import { usePresignedUrl } from '@/shared/api/hooks'
import { useIntersectionObserverOnce } from '@/shared/lib/hooks/useIntersectionObserver'
import { cn } from '@/shared/lib/utils'

import { SegmentLoadingSpinner, SegmentWaveform } from './SegmentWaveform'

type SpeakerSegmentProps = {
  segment: Segment
  duration: number
  scale: number
  color: string
}

/**
 * 개별 스피커 세그먼트를 표시하는 컴포넌트
 * z-index: z-10 (트랙 레이어 위, PlayheadIndicator 아래)
 *
 * Features:
 * - Draggable to reposition on timeline
 * - Lazy loading for waveform
 */
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
  const BAR_UNIT = 4 // 바 하나당 차지하는 공간 (3px bar + 1px gap)
  const availableWidth = widthPx - 16 // 좌우 padding 8px씩 제외
  const optimalSamples = Math.max(Math.floor(availableWidth / BAR_UNIT), 10) // 최소 10개

  const { data: waveformData, isLoading: waveformLoading } = useAudioWaveform(
    audioSrc,
    !!audioSrc && isVisible, // URL 있고 visible일 때만 파형 생성
    optimalSamples,
  )

  const isLoading = isVisible && (urlLoading || waveformLoading)

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      className={cn(
        'absolute top-3 z-10 flex h-[60px] items-center justify-between rounded-2xl border px-3 text-xs font-semibold transition-opacity',
        isLoading && 'opacity-60',
        isDragging && 'cursor-grabbing opacity-80',
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
      {/* Waveform visualization */}
      {!isVisible ? null : isLoading ? ( // 뷰포트 밖: 플레이스홀더 (아무것도 표시 안함)
        // 로딩 중: 스피너
        <SegmentLoadingSpinner color={color} size="sm" />
      ) : waveformData ? (
        // 로드 완료: 파형 표시
        <SegmentWaveform waveformData={waveformData} color={color} height={40} />
      ) : null}

      {/* Segment labels */}
      <div className="relative z-10 flex w-full items-center justify-between">
        {/* <span className="text-xs">{segment.speaker_tag}</span> */}
        {/* <div className="text-nowrap text-[10px]">
          {segment.start.toFixed(1)}s ~ {segment.end.toFixed(1)}s
        </div> */}
      </div>
    </div>
  )
}
