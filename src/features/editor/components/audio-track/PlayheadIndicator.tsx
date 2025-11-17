import { useMemo } from 'react'

import type { Segment } from '@/entities/segment/types'
import { timeToPixel } from '@/features/editor/utils/timeline-scale'

import { SplitButton } from './SplitButton'
import type { TrackRow } from './types'

type PlayheadIndicatorProps = {
  playhead: number
  duration: number
  scale: number
  tracks: TrackRow[]
  isPlaying: boolean
  getTrackRowHeight: (track: TrackRow) => number
  onSplit: (segment: Segment, splitTime: number) => void
}

type SegmentWithPosition = {
  segment: Segment
  yOffset: number
  color: string
}

/**
 * 재생 위치를 나타내는 인디케이터 (삼각형 + 세로선)
 * z-index: z-[100] (최상위 레이어 - 모든 트랙 위에 표시)
 *
 * 레이어 구조:
 * - 부모 컨테이너: z-[100] + pointer-events-none (클릭 이벤트 무시)
 * - 세로선: 회색 1.5px 선
 * - 삼각형: 상단에 위치한 화살표 (border trick 사용)
 * - Split 버튼들: playhead 위치의 각 세그먼트에 표시 (재생 정지 시에만)
 */
export function PlayheadIndicator({
  playhead,
  duration,
  scale,
  tracks,
  isPlaying,
  getTrackRowHeight,
  onSplit,
}: PlayheadIndicatorProps) {
  const position = timeToPixel(playhead, duration, scale)

  // Find all segments at the current playhead position with their Y offsets
  const segmentsAtPlayhead = useMemo<SegmentWithPosition[]>(() => {
    if (isPlaying) return [] // Don't show split buttons while playing

    const result: SegmentWithPosition[] = []
    let currentY = 0

    for (const track of tracks) {
      const trackHeight = getTrackRowHeight(track)

      // Only check speaker tracks for segments
      if (track.type === 'speaker') {
        for (const segment of track.segments) {
          // Check if playhead is within this segment
          if (playhead >= segment.start && playhead < segment.end) {
            result.push({
              segment,
              yOffset: currentY,
              color: track.color,
            })
            break // Only one segment per track at a given time
          }
        }
      }

      currentY += trackHeight
    }

    return result
  }, [playhead, tracks, isPlaying, getTrackRowHeight])

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-[100]"
      style={{ left: `${position}px` }}
    >
      {/* 삼각형 화살표 - 상단에 위치 */}
      <div
        className="absolute -top-[1px] left-1/2 h-0 w-0 -translate-x-1/2"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '14px solid rgb(75, 85, 99)', // gray-600
        }}
      />

      {/* 세로선 */}
      <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-gray-600" />

      {/* Split buttons for each segment at playhead position */}
      {segmentsAtPlayhead.map(({ segment, yOffset, color }) => (
        <SplitButton
          key={segment.id}
          segment={segment}
          yOffset={yOffset}
          splitTime={playhead}
          color={color}
          onSplit={onSplit}
        />
      ))}
    </div>
  )
}
