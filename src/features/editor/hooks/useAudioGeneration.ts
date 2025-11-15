import { useMutation } from '@tanstack/react-query'

import { regenerateSegmentTTS, type RegenerateTTSPayload } from '../api/audioGenerationApi'

/**
 * 세그먼트 TTS 재생성 mutation 훅
 * - Fixed/Dynamic 모드를 payload의 mod로 구분
 *
 * Usage:
 * ```ts
 * const { mutate: regenerateTTS } = useRegenerateSegmentTTS()
 * regenerateTTS({
 *   projectId,
 *   segmentId,
 *   translatedText,
 *   start,
 *   end,
 *   targetLang,
 *   mod: 'fixed', // or 'dynamic'
 *   voiceSampleId
 * })
 * ```
 */
export function useRegenerateSegmentTTS() {
  return useMutation({
    mutationFn: (payload: RegenerateTTSPayload) => regenerateSegmentTTS(payload),
    onSuccess: (data) => {
      console.log('[AudioGeneration] TTS regeneration queued:', data)
    },
    onError: (error) => {
      console.error('[AudioGeneration] TTS regeneration failed:', error)
    },
  })
}
