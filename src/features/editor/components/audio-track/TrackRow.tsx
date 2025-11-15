import { forwardRef, memo } from 'react'

import { SpeakerSegment } from './SpeakerSegment'
import type { TrackRow as TrackRowType } from './types'
import { WaveformTrack } from './WaveformTrack'

type TrackLayout = {
  trackId: string
  yStart: number
  yEnd: number
}

type TrackRowProps = {
  track: TrackRowType
  index: number
  duration: number
  scale: number
  height: number
  waveformData?: Array<{ id: number; height: number }>
  waveformLoading?: boolean
  trackLayouts?: TrackLayout[]
}

/**
 * 타임라인의 개별 트랙 행을 렌더링하는 컴포넌트
 * z-index: 없음 (기본 레이어)
 *
 * 트랙 타입:
 * - waveform: 오디오 파형 표시 (높이: 28px)
 * - speaker: 스피커별 세그먼트 표시 (높이: 84px)
 * - muted/fx: FX 플레이스홀더 (높이: 28px)
 *
 * Memoized to prevent re-renders when playhead changes
 */
export const TrackRow = memo(
  forwardRef<HTMLDivElement, TrackRowProps>(function TrackRow(
    { track, index, duration, scale, height, waveformData, waveformLoading, trackLayouts },
    ref,
  ) {
    // Darker background for waveform tracks
    const backgroundColor =
      track.type === 'waveform'
        ? '#e6e6e6'
        : index % 2 === 0
          ? 'rgba(15,23,42,0.02)'
          : 'transparent'

    return (
      <div
        ref={ref}
        className="border-surface-3 relative overflow-visible border-b px-4 py-3"
        style={{
          backgroundColor,
          height: `${height}px`,
        }}
      >
        {track.type === 'waveform' && waveformData ? (
          <WaveformTrack
            waveformData={waveformData}
            isLoading={waveformLoading}
            color={track.color}
          />
        ) : track.type === 'speaker' ? (
          <>
            {track.segments.map((segment) => (
              <SpeakerSegment
                key={segment.id}
                segment={segment}
                duration={duration}
                scale={scale}
                color={track.color}
                currentTrackId={track.id}
                trackLayouts={trackLayouts}
                voiceSampleId={track.voiceSampleId}
              />
            ))}
          </>
        ) : (
          <div className="border-surface-3 text-muted flex h-full items-center justify-center rounded-xl border border-dashed text-xs">
            FX Placeholder
          </div>
        )}
      </div>
    )
  }),
)
