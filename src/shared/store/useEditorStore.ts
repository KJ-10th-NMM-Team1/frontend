import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type EditorUiState = {
  activeSegmentId: string | null
  playbackRate: number
  splitMode: boolean
  selectedTrackId: string | null
  playhead: number
  isPlaying: boolean
  setActiveSegment: (id: string | null) => void
  setPlaybackRate: (rate: number) => void
  toggleSplitMode: () => void
  selectTrack: (id: string | null) => void
  setPlayhead: (time: number) => void
  setPlaying: (isPlaying: boolean) => void
  togglePlayback: () => void
}

export const useEditorStore = create<EditorUiState>()(
  devtools((set) => ({
    activeSegmentId: null,
    playbackRate: 1,
    splitMode: false,
    selectedTrackId: null,
    playhead: 0,
    isPlaying: false,
    setActiveSegment: (id) =>
      set({ activeSegmentId: id }, false, { type: 'editor/setActiveSegment', payload: id }),
    setPlaybackRate: (rate) =>
      set({ playbackRate: rate }, false, { type: 'editor/setPlaybackRate', payload: rate }),
    toggleSplitMode: () =>
      set((state) => ({ splitMode: !state.splitMode }), false, { type: 'editor/toggleSplitMode' }),
    selectTrack: (id) =>
      set({ selectedTrackId: id }, false, { type: 'editor/selectTrack', payload: id }),
    setPlayhead: (time) =>
      set({ playhead: Math.max(0, time) }, false, { type: 'editor/setPlayhead', payload: time }),
    setPlaying: (isPlaying) =>
      set({ isPlaying }, false, { type: 'editor/setPlaying', payload: isPlaying }),
    togglePlayback: () =>
      set((state) => ({ isPlaying: !state.isPlaying }), false, { type: 'editor/togglePlayback' }),
  })),
)
