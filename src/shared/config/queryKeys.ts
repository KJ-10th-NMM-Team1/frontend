export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  editor: {
    state: (id: string) => ['editor', id] as const,
  },
  example: {
    all: ['example', 'items'] as const,
    detail: (id: string) => ['example', 'items', id] as const,
  },
  voiceSamples: {
    all: ['voice-samples'] as const,
    list: () => ['voice-samples', 'list'] as const,
    detail: (id: string) => ['voice-samples', id] as const,
  },
  assets: {
    list: (projectId: string, languageCode?: string) =>
      ['assets', projectId, languageCode ?? 'all'] as const,
  },
}
