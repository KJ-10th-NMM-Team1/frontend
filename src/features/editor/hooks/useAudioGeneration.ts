import { useMutation } from '@tanstack/react-query'

import {
  generateDynamicAudio,
  generateFixedAudio,
  type GenerateDynamicAudioPayload,
  type GenerateFixedAudioPayload,
} from '../api/audioGenerationApi'

/**
 * Fixed duration 오디오 생성 mutation 훅
 *
 * Usage:
 * ```ts
 * const { mutate: generateFixed } = useGenerateFixedAudio()
 * generateFixed({ segmentId, voiceSampleId, start, end, duration })
 * ```
 */
export function useGenerateFixedAudio() {
  return useMutation({
    mutationFn: (payload: GenerateFixedAudioPayload) => generateFixedAudio(payload),
    onSuccess: (data) => {
      console.log('[AudioGeneration] Fixed audio generation queued:', data)
    },
    onError: (error) => {
      console.error('[AudioGeneration] Fixed audio generation failed:', error)
    },
  })
}

/**
 * Dynamic duration 오디오 생성 mutation 훅
 *
 * Usage:
 * ```ts
 * const { mutate: generateDynamic } = useGenerateDynamicAudio()
 * generateDynamic({ segmentId, voiceSampleId })
 * ```
 */
export function useGenerateDynamicAudio() {
  return useMutation({
    mutationFn: (payload: GenerateDynamicAudioPayload) => generateDynamicAudio(payload),
    onSuccess: (data) => {
      console.log('[AudioGeneration] Dynamic audio generation queued:', data)
    },
    onError: (error) => {
      console.error('[AudioGeneration] Dynamic audio generation failed:', error)
    },
  })
}
