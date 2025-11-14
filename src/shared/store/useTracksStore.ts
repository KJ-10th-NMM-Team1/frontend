import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { TrackRow } from '@/features/editor/components/audio-track/types'

/**
 * Track Store
 *
 * 에디터의 트랙 데이터를 관리합니다.
 * - 트랙 생성, 수정, 삭제
 * - 스피커 번호 자동 증가
 * - 서버 저장을 위한 편집 데이터 포함
 */

type TracksState = {
  // Track data
  tracks: TrackRow[]
  originalTracks: TrackRow[] // 서버에서 불러온 원본 데이터
  nextSpeakerNumber: number // 다음 스피커 번호

  // Actions
  setTracks: (tracks: TrackRow[]) => void
  addSpeakerTrack: () => void
  removeTrack: (id: string) => void
  updateTrack: (id: string, updates: Record<string, unknown>) => void
  resetTracks: () => void
  hasChanges: () => boolean
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

      set(
        {
          tracks: [...tracks],
          originalTracks: [...tracks],
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
  })),
)
