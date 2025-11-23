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
  readyAudioIds?: Set<string>
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
    {
      track,
      index,
      duration,
      scale,
      height,
      waveformData,
      waveformLoading,
      trackLayouts,
      readyAudioIds,
    },
    ref,
  ) {
    // Different styles for each track type
    const getTrackStyle = () => {
      if (track.type === 'waveform') {
        if (track.id === 'track-original') {
          return {
            background: undefined,
            className: 'rounded-xl border border-outline/20 bg-surface-2 shadow-inner',
          }
        }
        if (track.id === 'track-fx') {
          return {
            background: undefined,
            className: 'rounded-xl border border-outline/20 bg-surface-1 shadow-inner',
          }
        }
      }
      // Speaker tracks: subtle alternating surface tones
      return {
        background: undefined,
        className: index % 2 === 0 ? 'bg-surface-1' : 'bg-surface-2/70',
      }
    }

    const trackStyle = getTrackStyle()

    return (
      <div
        ref={ref}
        className={`border-outline/20 relative overflow-visible border-b ${trackStyle.className} ${track.type === 'waveform' ? 'px-2 py-2' : 'px-4 py-3'}`}
        style={{
          background: trackStyle.background,
          height: `${height}px`,
        }}
      >
        {track.type === 'waveform' && waveformData ? (
          <div className="h-full rounded-md bg-white/25 px-2 shadow-sm backdrop-blur-sm">
            <WaveformTrack
              waveformData={waveformData}
              isLoading={waveformLoading}
              color={track.color}
            />
          </div>
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
                isAudioReady={readyAudioIds?.has(segment.id) ?? true}
                trackSegments={track.segments}
              />
            ))}
          </>
        ) : (
          <div className="text-muted-foreground border-outline/20 flex h-full items-center justify-center rounded-xl border border-dashed text-xs">
            FX Placeholder
          </div>
        )}
      </div>
    )
  }),
)
