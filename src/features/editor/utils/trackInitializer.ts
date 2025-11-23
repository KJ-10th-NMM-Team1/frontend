import type { Segment } from '@/entities/segment/types'
import type { TrackRow } from '@/features/editor/components/audio-track/types'

/**
 * Segments를 speaker_tag 기준으로 그룹화하여 TrackRow 배열로 변환합니다.
 *
 * @param segments - 변환할 세그먼트 배열
 * @returns speaker 트랙 배열
 */
export function convertSegmentsToTracks(segments: Segment[]): TrackRow[] {
  if (segments.length === 0) return []

  // 색상 팔레트 (VersionListSection과 동일)
  // 따뜻한 톤(오렌지)에서 차가운 톤(블루)으로 자연스럽게 전환
  const palette = [
    '#f97316', // orange-500 - 주황, 활기차고 따뜻함
    '#8b5cf6', // violet-500 - 보라, tertiary 계열
    '#10b981', // emerald-500 - 에메랄드 그린, 신선함
    '#ec4899', // pink-500 - 분홍, 부드러운 강조
    '#06b6d4', // cyan-500 - 청록, primary와 조화
    '#a855f7', // purple-500 - 밝은 보라, 우아함
    '#f59e0b', // amber-500 - 호박색, 따뜻한 골드 톤
    '#3b82f6', // blue-500 - 파란색, primary와 유사
  ]

  // speaker_tag 기준으로 그룹화
  const speakerMap = new Map<
    string,
    { id: string; label: string; color: string; segments: Segment[] }
  >()

  segments.forEach((segment, index) => {
    const speakerId = segment.speaker_tag ?? `speaker-${index + 1}`
    if (!speakerMap.has(speakerId)) {
      speakerMap.set(speakerId, {
        id: speakerId,
        label: segment.speaker_tag ?? `Speaker ${speakerMap.size + 1}`,
        color: palette[speakerMap.size % palette.length],
        segments: [],
      })
    }
    speakerMap.get(speakerId)?.segments.push(segment)
  })

  // TrackRow 배열로 변환
  const tracks: TrackRow[] = Array.from(speakerMap.values()).map((track) => ({
    ...track,
    type: 'speaker' as const,
    size: 'medium' as const,
  }))

  return tracks
}
