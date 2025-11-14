import type { Segment } from '@/entities/segment/types'
import { useAudioWaveform } from '@/features/editor/hooks/useAudioWaveform'
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
 * **Lazy Loading 전략:**
 * 1. 뷰포트에 진입하면 presigned URL 요청 시작
 * 2. URL 받으면 파형 생성 시작
 * 3. 뷰포트 밖에 있으면 플레이스홀더만 렌더링
 * 4. 한 번 로드되면 캐시에 유지 (재방문 시 즉시 표시)
 */
export function SpeakerSegment({ segment, duration, scale, color }: SpeakerSegmentProps) {
  const startPx = timeToPixel(segment.start, duration, scale)
  const widthPx = Math.max(timeToPixel(segment.end - segment.start, duration, scale), 64)

  // Lazy loading: 뷰포트에 진입했을 때만 로드 (한 번 진입하면 계속 로드 상태 유지)
  const [ref, isVisible] = useIntersectionObserverOnce<HTMLDivElement>({
    rootMargin: '300px', // 뷰포트 진입 300px 전부터 로드 시작
    threshold: 0.01, // 1%만 보여도 로드 시작
  })

  // Step 1: Get presigned URL (only when visible)
  const { data: audioSrc, isLoading: urlLoading } = usePresignedUrl(segment.segment_audio_url, {
    staleTime: 5 * 60 * 1000,
    enabled: isVisible, // 뷰포트에 있을 때만 요청
  })

  // Step 2: Generate waveform from audio URL (only when URL is available)
  // 바 너비 3px + 간격 1px = 4px 기준으로 세그먼트에 맞는 샘플 수 계산
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
      className={cn(
        'absolute top-3 z-10 flex h-[60px] items-center justify-between rounded-2xl border px-3 text-xs font-semibold transition-opacity',
        isLoading && 'opacity-60',
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
