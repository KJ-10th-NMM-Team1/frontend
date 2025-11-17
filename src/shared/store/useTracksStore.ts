import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { Segment } from '@/entities/segment/types'
import type { TrackRow } from '@/features/editor/components/audio-track/types'

/**
 * Track Store
 *
 * 에디터의 트랙 데이터를 관리합니다.
 * - 트랙 생성, 수정, 삭제
 * - 스피커 번호 자동 증가
 * - 세그먼트 업데이트 (단일 데이터 소스)
 * - 서버 저장을 위한 편집 데이터 포함
 */

type TracksState = {
  // Track data
  tracks: TrackRow[]
  originalTracks: TrackRow[] // 서버에서 불러온 원본 데이터
  nextSpeakerNumber: number // 다음 스피커 번호

  // Track Actions
  setTracks: (tracks: TrackRow[]) => void
  addSpeakerTrack: () => void
  removeTrack: (id: string) => void
  updateTrack: (id: string, updates: Record<string, unknown>) => void
  resetTracks: () => void
  hasChanges: () => boolean

  // Segment Actions (operate on segments within tracks)
  updateSegment: (segmentId: string, updates: Partial<Segment>) => void
  updateSegmentPosition: (segmentId: string, start: number, end: number) => void
  updateSegmentSize: (segmentId: string, start: number, end: number, originalDuration: number) => void
  moveSegmentToTrack: (segmentId: string, targetTrackId: string) => void
  replaceSegment: (segmentId: string, newSegments: Segment[]) => void
  replaceMultipleSegments: (segmentIds: string[], newSegment: Segment) => void
  getAllSegments: () => Segment[]
}

// 기본 트랙 색상 팔레트
const TRACK_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export const useTracksStore = create<TracksState>()(
  devtools((set, get) => ({
    // Initial state
    tracks: [],
    originalTracks: [],
    nextSpeakerNumber: 1,

    // Actions
    setTracks: (tracks) => {
      // 기존 트랙에서 최대 스피커 번호 찾기
      const maxSpeakerNumber = tracks
        .filter((track) => track.type === 'speaker')
        .reduce((max, track) => {
          const match = track.label.match(/Speaker (\d+)/)
          if (match) {
            const num = parseInt(match[1], 10)
            return Math.max(max, num)
          }
          return max
        }, 0)

      // 각 트랙의 segments를 start 시간 기준으로 정렬
      const sortedTracks = tracks.map((track) => {
        if (track.type === 'speaker') {
          return {
            ...track,
            segments: [...track.segments].sort((a, b) => a.start - b.start),
          }
        }
        return track
      })

      set(
        {
          tracks: sortedTracks,
          originalTracks: sortedTracks,
          nextSpeakerNumber: maxSpeakerNumber + 1,
        },
        false,
        { type: 'tracks/setTracks', payload: tracks },
      )
    },

    addSpeakerTrack: () => {
      const state = get()
      const speakerNumber = state.nextSpeakerNumber
      const colorIndex =
        state.tracks.filter((t) => t.type === 'speaker').length % TRACK_COLORS.length

      const newTrack: TrackRow = {
        id: `speaker-${Date.now()}-${speakerNumber}`,
        type: 'speaker',
        label: `Speaker ${speakerNumber}`,
        color: TRACK_COLORS[colorIndex],
        segments: [],
        size: 'medium',
        voiceSampleId: 'clone', // 기본 clone 모델로 설정
      }

      set(
        (state) => ({
          tracks: [...state.tracks, newTrack],
          nextSpeakerNumber: state.nextSpeakerNumber + 1,
        }),
        false,
        { type: 'tracks/addSpeakerTrack', payload: newTrack },
      )
    },

    removeTrack: (id) =>
      set(
        (state) => ({
          tracks: state.tracks.filter((track) => track.id !== id),
        }),
        false,
        { type: 'tracks/removeTrack', payload: id },
      ),

    updateTrack: (id, updates) =>
      set(
        (state) => ({
          tracks: state.tracks.map((track) =>
            track.id === id ? ({ ...track, ...updates } as TrackRow) : track,
          ),
        }),
        false,
        { type: 'tracks/updateTrack', payload: { id, updates } },
      ),

    resetTracks: () =>
      set(
        (state) => ({
          tracks: [...state.originalTracks],
        }),
        false,
        { type: 'tracks/resetTracks' },
      ),

    hasChanges: () => {
      const state = get()
      return JSON.stringify(state.tracks) !== JSON.stringify(state.originalTracks)
    },

    // Segment Actions - operate on segments within tracks
    updateSegment: (segmentId, updates) =>
      set(
        (state) => ({
          tracks: state.tracks.map((track) => {
            if (track.type !== 'speaker') return track
            return {
              ...track,
              segments: track.segments.map((segment) =>
                segment.id === segmentId ? { ...segment, ...updates } : segment,
              ),
            }
          }),
        }),
        false,
        { type: 'tracks/updateSegment', payload: { segmentId, updates } },
      ),

    updateSegmentPosition: (segmentId, start, end) =>
      set(
        (state) => ({
          tracks: state.tracks.map((track) => {
            if (track.type !== 'speaker') return track
            return {
              ...track,
              segments: track.segments.map((segment) =>
                segment.id === segmentId ? { ...segment, start, end } : segment,
              ),
            }
          }),
        }),
        false,
        { type: 'tracks/updateSegmentPosition', payload: { segmentId, start, end } },
      ),

    updateSegmentSize: (segmentId, start, end, originalDuration) => {
      const newDuration = end - start
      const playbackRate = originalDuration / newDuration

      return set(
        (state) => ({
          tracks: state.tracks.map((track) => {
            if (track.type !== 'speaker') return track
            return {
              ...track,
              segments: track.segments.map((segment) =>
                segment.id === segmentId
                  ? {
                      ...segment,
                      start,
                      end,
                      playbackRate,
                    }
                  : segment,
              ),
            }
          }),
        }),
        false,
        {
          type: 'tracks/updateSegmentSize',
          payload: { segmentId, start, end, originalDuration },
        },
      )
    },

    moveSegmentToTrack: (segmentId, targetTrackId) =>
      set(
        (state) => {
          let segmentToMove: Segment | null = null
          let sourceTrackId: string | null = null

          // Find the segment and its source track
          for (const track of state.tracks) {
            if (track.type !== 'speaker') continue
            const segment = track.segments.find((s) => s.id === segmentId)
            if (segment) {
              segmentToMove = segment
              sourceTrackId = track.id
              break
            }
          }

          if (!segmentToMove || !sourceTrackId || sourceTrackId === targetTrackId) {
            return state // No change needed
          }

          // Update segment's trackId and move it to target track
          const updatedSegment = { ...segmentToMove, trackId: targetTrackId }

          return {
            tracks: state.tracks.map((track) => {
              if (track.type !== 'speaker') return track

              // Remove from source track
              if (track.id === sourceTrackId) {
                return {
                  ...track,
                  segments: track.segments.filter((s) => s.id !== segmentId),
                }
              }

              // Add to target track
              if (track.id === targetTrackId) {
                return {
                  ...track,
                  segments: [...track.segments, updatedSegment].sort((a, b) => a.start - b.start),
                }
              }

              return track
            }),
          }
        },
        false,
        { type: 'tracks/moveSegmentToTrack', payload: { segmentId, targetTrackId } },
      ),

    replaceSegment: (segmentId, newSegments) =>
      set(
        (state) => ({
          tracks: state.tracks.map((track) => {
            if (track.type !== 'speaker') return track

            // Check if this track contains the segment to replace
            const hasSegment = track.segments.some((s) => s.id === segmentId)
            if (!hasSegment) return track

            // Replace the segment with new segments
            return {
              ...track,
              segments: track.segments
                .flatMap((segment) => (segment.id === segmentId ? newSegments : [segment]))
                .sort((a, b) => a.start - b.start),
            }
          }),
        }),
        false,
        { type: 'tracks/replaceSegment', payload: { segmentId, newSegments } },
      ),

    replaceMultipleSegments: (segmentIds, newSegment) =>
      set(
        (state) => ({
          tracks: state.tracks.map((track) => {
            if (track.type !== 'speaker') return track

            // Check if this track contains any of the segments to replace
            const hasAnySegment = track.segments.some((s) => segmentIds.includes(s.id))
            if (!hasAnySegment) return track

            // Remove all segments to be merged and add the new merged segment
            const filteredSegments = track.segments.filter((s) => !segmentIds.includes(s.id))

            return {
              ...track,
              segments: [...filteredSegments, newSegment].sort((a, b) => a.start - b.start),
            }
          }),
        }),
        false,
        { type: 'tracks/replaceMultipleSegments', payload: { segmentIds, newSegment } },
      ),

    getAllSegments: () => {
      const state = get()
      return state.tracks
        .filter((track): track is Extract<TrackRow, { type: 'speaker' }> => track.type === 'speaker')
        .flatMap((track) => track.segments)
    },
  })),
)
