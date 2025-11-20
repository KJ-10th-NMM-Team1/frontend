export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  editor: {
    state: (projectId: string, languageCode: string) =>
      ['editor', 'state', projectId, languageCode] as const,
  },
  segments: {
    list: (projectId: string, languageCode: string) =>
      ['segments', projectId, languageCode] as const,
    detail: (segmentId: string) => ['segments', 'detail', segmentId] as const,
  },
  example: {
    all: ['example', 'items'] as const,
    detail: (id: string) => ['example', 'items', id] as const,
  },
  voiceSamples: {
    all: ['voice-samples'] as const,
    list: (options?: {
      myVoicesOnly?: boolean
      mySamplesOnly?: boolean
      category?: string
      isBuiltin?: boolean
      q?: string
    }) => {
      if (!options) return ['voice-samples', 'list'] as const
      return ['voice-samples', 'list', options] as const
    },
    detail: (id: string) => ['voice-samples', id] as const,
  },
  assets: {
    list: (projectId: string, languageCode?: string) =>
      ['assets', projectId, languageCode ?? 'all'] as const,
  },
  storage: {
    presignedUrl: (filePath: string) => ['storage', 'presigned-url', filePath] as const,
  },
  youtube: {
    status: () => ['youtube', 'status'] as const,
  },
}
