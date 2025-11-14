import { create } from 'zustand'

import type { SuggestionContext } from '@/entities/suggestion/types'

type SuggestionItem = {
  id: string
  context: SuggestionContext
  text: string
  createdAt: number
}

type SuggestionState = {
  items: Record<string, SuggestionItem[]>
  addSuggestion: (segmentId: string, suggestion: SuggestionItem) => void
  clearSuggestions: (segmentId: string) => void
  clearAll: () => void
}

export const useSuggestionStore = create<SuggestionState>((set) => ({
  items: {},
  addSuggestion: (segmentId, suggestion) =>
    set((state) => {
      const prev = state.items[segmentId] ?? []
      const nextList = [...prev, suggestion].slice(-10)
      return {
        items: {
          ...state.items,
          [segmentId]: nextList,
        },
      }
    }),
  clearSuggestions: (segmentId) =>
    set((state) => {
      if (!state.items[segmentId]) return state
      const next = { ...state.items }
      delete next[segmentId]
      return { items: next }
    }),
  clearAll: () => set({ items: {} }),
}))
