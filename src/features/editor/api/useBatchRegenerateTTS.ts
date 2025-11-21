/**
 * React Query hook for batch TTS regeneration
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query'

import {
  batchRegenerateSegmentTTS,
  type BatchRegenerateTTSPayload,
} from './audioGenerationApi'
import type { BatchSegmentTTSRegenerateResponse } from './types'

/**
 * 여러 세그먼트에 대한 TTS 일괄 재생성 훅
 *
 * @example
 * const { mutate: batchRegenerate, isPending } = useBatchRegenerateTTS({
 *   onSuccess: (data) => {
 *     console.log(`${data.queued_count} segments queued for TTS`)
 *   }
 * })
 *
 * batchRegenerate({
 *   projectId: 'proj-123',
 *   segments: [
 *     { segmentId: 'seg-1', translatedText: '안녕하세요', start: 0, end: 2 },
 *     { segmentId: 'seg-2', translatedText: '반갑습니다', start: 2, end: 4 },
 *   ],
 *   targetLang: 'ko',
 *   mod: 'fixed',
 * })
 */
export function useBatchRegenerateTTS(
  options?: UseMutationOptions<
    BatchSegmentTTSRegenerateResponse,
    Error,
    BatchRegenerateTTSPayload
  >,
) {
  return useMutation({
    mutationFn: batchRegenerateSegmentTTS,
    ...options,
  })
}
