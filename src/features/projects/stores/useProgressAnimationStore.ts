import { create } from 'zustand'

interface ProgressState {
  // 프로젝트ID-언어코드별 진행도
  progress: Record<string, number>
}

interface ProgressActions {
  setProgress: (projectId: string, languageCode: string, progress: number) => void
  getProgress: (projectId: string, languageCode: string) => number | undefined
  clearProgress: (projectId: string, languageCode?: string) => void
}

const getKey = (projectId: string, languageCode: string) => `${projectId}-${languageCode}`

export const useProgressAnimationStore = create<ProgressState & ProgressActions>((set, get) => ({
  progress: {},

  setProgress: (projectId, languageCode, progress) => {
    const key = getKey(projectId, languageCode)
    set((state) => ({
      progress: {
        ...state.progress,
        [key]: progress,
      },
    }))
  },

  getProgress: (projectId, languageCode) => {
    const key = getKey(projectId, languageCode)
    return get().progress[key]
  },

  clearProgress: (projectId, languageCode) => {
    if (languageCode) {
      const key = getKey(projectId, languageCode)
      set((state) => {
        const newProgress = { ...state.progress }
        delete newProgress[key]
        return { progress: newProgress }
      })
    } else {
      // 프로젝트 전체 진행도 삭제
      set((state) => {
        const newProgress = { ...state.progress }
        Object.keys(newProgress).forEach((key) => {
          if (key.startsWith(`${projectId}-`)) {
            delete newProgress[key]
          }
        })
        return { progress: newProgress }
      })
    }
  },
}))
