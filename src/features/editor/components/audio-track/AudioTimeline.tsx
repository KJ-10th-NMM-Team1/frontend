import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react'

import type { Segment } from '@/entities/segment/types'
import { useEditorStore } from '@/shared/store/useEditorStore'

import type { Segment } from '@/entities/segment/types'
import { env } from '@/shared/config/env'
import { useEditorStore } from '@/shared/store/useEditorStore'

import type { TrackRow } from './types'


<<<<<<< HEAD
=======

>>>>>>> 419e5817170be518925c1a17886836d9d561c311
type WaveformBar = {
  id: number
  height: number
}

type AudioTimelineProps = {
  trackRows: TrackRow[]
  timelineTicks: number[]
  waveformData: WaveformBar[]
  timelineRef: RefObject<HTMLDivElement>
  playheadPercent: number
  onTimelinePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  rowHeight: number
  duration: number
  playhead: number
}

export function AudioTimeline({
  trackRows,
  timelineTicks,
  waveformData,
  timelineRef,
  playheadPercent,
  onTimelinePointerDown,
  rowHeight,
  duration,
  playhead,
}: AudioTimelineProps) {
  const { playSegmentAudio, setPlayhead, setSegmentEnd } = useEditorStore((state) => ({
    playSegmentAudio: state.playSegmentAudio,
    setPlayhead: state.setPlayhead,
    setSegmentEnd: state.setSegmentEnd
  }))                
  return (
    <div className="bg-surface-1 flex flex-col">
      <div className="border-surface-3 border-b px-4 py-2">
        <div className="text-muted flex h-10 items-end justify-between text-[10px]">
          {timelineTicks.map((tick) => (
            <div key={tick} className="flex flex-col items-center">
              <span>{tick.toFixed(0).padStart(2, '0')}s</span>
              <span className="bg-surface-3 mt-1 h-4 w-px" />
            </div>
          ))}
        </div>
      </div>

      <div
        ref={timelineRef}
        className="relative flex-1 cursor-col-resize select-none"
        style={{ minHeight: trackRows.length * rowHeight }}
        onPointerDown={onTimelinePointerDown}
      >
        {trackRows.map((track, index) => (
          <div
            key={track.id}
            className="border-surface-3 relative h-[84px] border-b px-4 py-3"
            style={{ backgroundColor: index % 2 === 0 ? 'rgba(15,23,42,0.02)' : 'transparent' }}
          >
            {track.type === 'waveform' ? (
              <div className="flex h-full items-center gap-px">
                {waveformData.map((bar) => (
                  <span
                    key={bar.id}
                    className="bg-primary/60 flex-1 rounded-full"
                    style={{ height: `${bar.height}%` }}
                  />
                ))}
              </div>
            ) : track.type === 'speaker' ? (
              track.segments.map((segment) => {

                const startPercent = duration > 0 ? (segment.start / duration) * 100 : 0
                const widthPercent =
                  duration > 0 ? Math.max(((segment.end - segment.start) / duration) * 100, 1) : 0   

                const handleSegmentClick = (
                  event: ReactMouseEvent<HTMLDivElement>,
                  segment: Segment
                ) => {
                  if (!segment.segment_audio_url) return

                  const rect = event.currentTarget.getBoundingClientRect()
                  const segmentDuration = segment.end - segment.start
                  const clickRatio = rect.width > 0
                      ? Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
                      : 0
                  const timelinePosition = segment.start + clickRatio * segmentDuration
                  const localOffset = clickRatio * segmentDuration
                  setPlayhead(timelinePosition) // 초록 진행바를 클릭 지점으로 이동     
                  setSegmentEnd(segment.end)               
                  playSegmentAudio(segment.segment_audio_url, { audioOffset: localOffset, timelinePosition })  // 세그먼트 오디오를 해당 지점부터 재생
                }
                return (
                  <div
                    key={segment.id}
                    className="absolute top-3 flex h-[60px] items-center justify-between rounded-2xl border px-3 text-xs font-semibold cursor-pointer"
                    onClick={(event)=> handleSegmentClick(event, segment)}
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      minWidth: '64px',
                      backgroundColor: `${track.color}20`,
                      borderColor: track.color,
                      color: track.color,
                    }}
                  >
                    <span>{segment.speaker_tag}</span>
                    <span>
                      {segment.start.toFixed(1)}s → {segment.end.toFixed(1)}s
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="border-surface-3 text-muted flex h-full items-center justify-center rounded-xl border border-dashed text-xs">
                FX Placeholder
              </div>
            )}
          </div>
        ))}

        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: `calc(${playheadPercent}% - 1px)` }}
        >
          <div className="bg-primary absolute inset-y-0 left-1/2 w-0.5" />
          <div className="bg-primary shadow-primary/40 absolute -top-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full shadow-lg" />
          <div className="bg-primary shadow-primary/40 absolute -bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full shadow-lg" />
        </div>
      </div>
    </div>
  )
}
