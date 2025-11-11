import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { resolvePresignedUrl } from '../lib/utils'

type EditorUiState = {
  activeSegmentId: string | null
  playbackRate: number
  splitMode: boolean
  selectedTrackId: string | null
  playhead: number
  isPlaying: boolean
  currentAudio: HTMLAudioElement | null
  currentAudioUrl: string | null  
  segmentEnd: number | null
  setActiveSegment: (id: string | null) => void
  setPlaybackRate: (rate: number) => void
  toggleSplitMode: () => void
  selectTrack: (id: string | null) => void
  setPlayhead: (time: number) => void
  setPlaying: (isPlaying: boolean) => void
  togglePlayback: () => void
  playSegmentAudio: (url: string, options?: { audioOffset?: number; timelinePosition?: number }) => void
  stopAudio: () => void  
  setSegmentEnd: (time: number | null) => void
}



export const useEditorStore = create<EditorUiState>()(
  devtools((set) => ({
    activeSegmentId: null,
    playbackRate: 1,
    splitMode: false,
    selectedTrackId: null,
    playhead: 0,
    isPlaying: false,
    currentAudio: null,
    currentAudioUrl: null,    
    segmentEnd: null,
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
    playSegmentAudio: (rawUrl, options) => {
      const audioOffset = options?.audioOffset ?? 0
      const timelinePosition = options?.timelinePosition
      const urlPromise = resolvePresignedUrl(rawUrl)      
        void urlPromise
          .then((resolvedUrl) => {
            set((state) => {
              const audio = state.currentAudio ?? new Audio()
              audio.crossOrigin = 'anonymous'
              if (state.currentAudioUrl !== resolvedUrl) {
                audio.pause()
                audio.src = resolvedUrl
                audio.load()
              }
              const startPlayback = () => {
                audio.currentTime = audioOffset
                void audio.play().catch(console.error)
              }
              if (audio.readyState >= 1) {
                startPlayback()
              } else {
                audio.addEventListener('loadedmetadata', startPlayback, { once: true })
              }
              return {
                currentAudio: audio,
                currentAudioUrl: resolvedUrl,
                isPlaying: true,
                playhead: timelinePosition ?? state.playhead,
              }
            })
          })
          .catch(console.error)      
        },
    stopAudio: () =>
      set((state) => {
        state.currentAudio?.pause()
        return { isPlaying: false }
      }),
    setSegmentEnd: (time) => 
      set({ segmentEnd: time }, false, { type: 'editor/setSegmentEnd', payload: time })
  })),
)
