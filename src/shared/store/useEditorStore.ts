import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type AudioGenerationMode = 'fixed' | 'dynamic'
// AudioPlaybackMode supports 'original' or any language code (e.g., 'en', 'ja')
export type AudioPlaybackMode = string

type EditorUiState = {
  // Timeline state
  playhead: number
  duration: number
  scale: number // Timeline zoom scale (0.1 to 2)

  // Playback state
  isPlaying: boolean
  playbackRate: number
  segmentEnd: number | null // Stop playback at this point (for segment preview)
  audioPlaybackMode: AudioPlaybackMode // Switch between original and target languages

  // Selection state
  activeSegmentId: string | null
  isTextMode: boolean // Toggle between text/waveform view for active segment

  // UI modes
  splitMode: boolean
  isScrubbing: boolean // Timeline scrubbing state

  // Loading states
  loadingSegments: Set<string> // Segments currently generating audio

  // Actions
  setActiveSegment: (id: string | null) => void
  setTextMode: (isTextMode: boolean) => void
  toggleTextMode: () => void
  setPlaybackRate: (rate: number) => void
  toggleSplitMode: () => void
  setPlayhead: (time: number) => void
  setPlaying: (isPlaying: boolean) => void
  togglePlayback: () => void
  setSegmentEnd: (time: number | null) => void
  setScale: (scale: number) => void
  setDuration: (duration: number) => void
  setSegmentLoading: (segmentId: string, isLoading: boolean) => void
  isSegmentLoading: (segmentId: string) => boolean
  setAudioPlaybackMode: (mode: AudioPlaybackMode) => void
  setIsScrubbing: (isScrubbing: boolean) => void
  reset: () => void
}

const MIN_SCALE = 0.35
const MAX_SCALE = 2

export const useEditorStore = create<EditorUiState>()(
  devtools((set, get) => ({
    // Initial state
    playhead: 0,
    duration: 0,
    scale: 1,
    isPlaying: false,
    playbackRate: 1,
    segmentEnd: null,
    activeSegmentId: null,
    isTextMode: false,
    splitMode: false,
    isScrubbing: false,
    loadingSegments: new Set(),
    audioPlaybackMode: 'original', // Default to original audio

    // Actions
    setActiveSegment: (id) =>
      set({ activeSegmentId: id, isTextMode: false }, false, { type: 'editor/setActiveSegment', payload: id }),

    setTextMode: (isTextMode) =>
      set({ isTextMode }, false, { type: 'editor/setTextMode', payload: isTextMode }),

    toggleTextMode: () =>
      set((state) => ({ isTextMode: !state.isTextMode }), false, { type: 'editor/toggleTextMode' }),

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

    setSegmentLoading: (segmentId, isLoading) =>
      set(
        (state) => {
          const loadingSegments = new Set(state.loadingSegments)
          if (isLoading) {
            loadingSegments.add(segmentId)
          } else {
            loadingSegments.delete(segmentId)
          }
          return { loadingSegments }
        },
        false,
        { type: 'editor/setSegmentLoading', payload: { segmentId, isLoading } },
      ),

    isSegmentLoading: (segmentId) => get().loadingSegments.has(segmentId),

    setAudioPlaybackMode: (mode) =>
      set({ audioPlaybackMode: mode }, false, {
        type: 'editor/setAudioPlaybackMode',
        payload: mode,
      }),

    setIsScrubbing: (isScrubbing) =>
      set({ isScrubbing }, false, {
        type: 'editor/setIsScrubbing',
        payload: isScrubbing,
      }),

    reset: () =>
      set(
        {
          playhead: 0,
          duration: 0,
          scale: 1,
          isPlaying: false,
          playbackRate: 1,
          segmentEnd: null,
          activeSegmentId: null,
          isTextMode: false,
          splitMode: false,
          isScrubbing: false,
          loadingSegments: new Set(),
          // audioPlaybackMode는 언어 변경 시 별도로 설정되므로 초기화하지 않음
        },
        false,
        { type: 'editor/reset' },
      ),
  })),
)
