import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type EditorUiState = {
  // Timeline state
  playhead: number
  duration: number
  scale: number // Timeline zoom scale (0.1 to 2)

  // Playback state
  isPlaying: boolean
  playbackRate: number
  segmentEnd: number | null // Stop playback at this point (for segment preview)

  // Selection state
  activeSegmentId: string | null

  // UI modes
  splitMode: boolean

  // Actions
  setActiveSegment: (id: string | null) => void
  setPlaybackRate: (rate: number) => void
  toggleSplitMode: () => void
  setPlayhead: (time: number) => void
  setPlaying: (isPlaying: boolean) => void
  togglePlayback: () => void
  setSegmentEnd: (time: number | null) => void
  setScale: (scale: number) => void
  setDuration: (duration: number) => void
}

const MIN_SCALE = 0.35
const MAX_SCALE = 2

export const useEditorStore = create<EditorUiState>()(
  devtools((set) => ({
    // Initial state
    playhead: 0,
    duration: 0,
    scale: 1,
    isPlaying: false,
    playbackRate: 1,
    segmentEnd: null,
    activeSegmentId: null,
    splitMode: false,

    // Actions
    setActiveSegment: (id) =>
      set({ activeSegmentId: id }, false, { type: 'editor/setActiveSegment', payload: id }),

    setPlaybackRate: (rate) =>
      set({ playbackRate: rate }, false, { type: 'editor/setPlaybackRate', payload: rate }),

    toggleSplitMode: () =>
      set((state) => ({ splitMode: !state.splitMode }), false, { type: 'editor/toggleSplitMode' }),

    setPlayhead: (time) =>
      set({ playhead: Math.max(0, time) }, false, { type: 'editor/setPlayhead', payload: time }),

    setPlaying: (isPlaying) =>
      set({ isPlaying }, false, { type: 'editor/setPlaying', payload: isPlaying }),

    togglePlayback: () =>
      set((state) => ({ isPlaying: !state.isPlaying }), false, { type: 'editor/togglePlayback' }),

    setSegmentEnd: (time) =>
      set({ segmentEnd: time }, false, { type: 'editor/setSegmentEnd', payload: time }),

    setScale: (scale) =>
      set({ scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale)) }, false, {
        type: 'editor/setScale',
        payload: scale,
      }),

    setDuration: (duration) =>
      set({ duration }, false, { type: 'editor/setDuration', payload: duration }),
  })),
)
