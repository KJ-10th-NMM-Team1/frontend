import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { queryKeys } from '@/shared/config/queryKeys'

import {
  prepareVoiceSampleUpload,
  finishVoiceSampleUpload,
  type PrepareUploadPayload,
  type PrepareUploadResponse,
  type FinishUploadPayload,
} from '../api/voiceSamplesApi'

export function usePrepareUploadMutation() {
  return useMutation<PrepareUploadResponse, Error, PrepareUploadPayload>({
    mutationKey: ['voice-samples', 'prepare-upload'],
    mutationFn: prepareVoiceSampleUpload,
  })
}

export function useFinishUploadMutation() {
  const queryClient = useQueryClient()

  return useMutation<VoiceSample, Error, FinishUploadPayload>({
    mutationKey: ['voice-samples', 'finish-upload'],
    mutationFn: finishVoiceSampleUpload,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.list() })
    },
  })
}
