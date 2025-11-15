import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { useEffect, useRef, useState, useCallback } from 'react'

import { getTimelineWidth } from '@/features/editor/utils/timeline-scale'
import { useEditorStore } from '@/shared/store/useEditorStore'

import { PlayheadIndicator } from './PlayheadIndicator'
import { TimeRuler } from './TimeRuler'
import { TrackRow as TrackRowComponent } from './TrackRow'
import type { TrackRow } from './types'
import './timeline-scrollbar.css'

type WaveformBar = {
  id: number
  height: number
}

type AudioTimelineProps = {
  trackRows: TrackRow[]
  timelineTicks: number[]
  waveformData: WaveformBar[]
  waveformLoading?: boolean
  timelineRef: RefObject<HTMLDivElement>
  playheadPercent: number
  onTimelinePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  getTrackRowHeight: (track: TrackRow) => number
  duration: number
  playhead: number
}

/**
 * AudioTimeline 메인 컴포넌트
 *
 * 레이어 구조 (z-index 순서):
 * 1. 기본 레이어 (z-index 없음): TimeRuler, TrackRow 배경
 * 2. z-10: SpeakerSegment (클릭 가능한 세그먼트들)
 * 3. z-20: 타임라인 컨테이너 (포인터 이벤트 처리)
 * 4. z-[100]: PlayheadIndicator (최상위 - 삼각형과 세로선)
 *
 * 높이 계산:
 * - TimeRuler: 40px (h-10)
 * - 각 트랙 행: 84px (rowHeight)
 * - 스크롤 영역: 전체 높이 - 40px
 */
export function AudioTimeline({
  trackRows,
  timelineTicks,
  waveformData,
  waveformLoading,
  timelineRef,
  // playheadPercent,
  onTimelinePointerDown,
  getTrackRowHeight,
  duration,
  playhead,
}: AudioTimelineProps) {
  const { scale, setDuration } = useEditorStore((state) => ({
    scale: state.scale,
    setDuration: state.setDuration,
  }))

  // Set duration when component mounts or duration changes
  useEffect(() => {
    if (duration > 0) {
      setDuration(duration)
    }
  }, [duration, setDuration])

  const timelineWidth = getTimelineWidth(duration, scale)
  // Calculate total height by summing all track heights
  const contentHeight = trackRows.reduce((total, track) => total + getTrackRowHeight(track), 0) + 40

  // Track layout state for drag-and-drop between tracks
  const trackRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [trackLayouts, setTrackLayouts] = useState<
    Array<{ trackId: string; yStart: number; yEnd: number }>
  >([])

  // Update track layouts when trackRows change or on scroll
  const updateTrackLayouts = useCallback(() => {
    const layouts = trackRows
      .filter((track) => track.type === 'speaker')
      .map((track) => {
        const element = trackRefs.current.get(track.id)
        if (!element) return null

        const rect = element.getBoundingClientRect()
        return {
          trackId: track.id,
          yStart: rect.top,
          yEnd: rect.bottom,
        }
      })
      .filter((layout): layout is NonNullable<typeof layout> => layout !== null)

    setTrackLayouts(layouts)
  }, [trackRows])

  // Update layouts on mount and when tracks change
  useEffect(() => {
    updateTrackLayouts()
  }, [updateTrackLayouts])

  // Update layouts on scroll (for sticky positioning)
  useEffect(() => {
    const container = timelineRef.current?.parentElement
    if (!container) return

    container.addEventListener('scroll', updateTrackLayouts)
    return () => container.removeEventListener('scroll', updateTrackLayouts)
  }, [updateTrackLayouts, timelineRef])

  return (
    <div className="relative" style={{ width: `${timelineWidth}px` }}>
      {/* PlayheadIndicator - 절대 위치로 고정 */}
      <div className="pointer-events-none absolute inset-y-0 z-[31]">
        <PlayheadIndicator playhead={playhead} duration={duration} scale={scale} />
      </div>

      {/* TimeRuler - 상단 고정 */}
      <div className="bg-surface-1 sticky top-0 z-30">
        <TimeRuler
          timelineTicks={timelineTicks}
          duration={duration}
          scale={scale}
          onTimelinePointerDown={onTimelinePointerDown}
        />
      </div>

      {/* 타임라인 콘텐츠 */}
      <div
        ref={timelineRef}
        className="bg-surface-1 overflow-visible"
        style={{
          width: `${timelineWidth}px`,
          minHeight: `${contentHeight}px`,
        }}
      >
        {/* 트랙 행들 */}
        {trackRows.map((track, index) => (
          <TrackRowComponent
            key={track.id}
            ref={(el) => {
              if (el && track.type === 'speaker') {
                trackRefs.current.set(track.id, el)
              } else {
                trackRefs.current.delete(track.id)
              }
            }}
            track={track}
            index={index}
            duration={duration}
            scale={scale}
            height={getTrackRowHeight(track)}
            waveformData={track.type === 'waveform' ? waveformData : undefined}
            waveformLoading={track.type === 'waveform' ? waveformLoading : undefined}
            trackLayouts={trackLayouts}
          />
        ))}
      </div>
    </div>
  )
}
