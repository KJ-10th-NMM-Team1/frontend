import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { VoiceSamplePayload } from '@/entities/voice-sample/types'
import { queryKeys } from '@/shared/config/queryKeys'

import {
  createVoiceSample,
  deleteVoiceSample,
  fetchVoiceSamples,
  toggleFavorite,
  updateVoiceSample,
} from '../api/voiceSamplesApi'
import type { VoiceSample } from '@/entities/voice-sample/types'

export function useVoiceSamples() {
  return useQuery({
    queryKey: queryKeys.voiceSamples.list(),
    queryFn: fetchVoiceSamples,
  })
}

export function useCreateVoiceSample() {
  const queryClient = useQueryClient()

  return useMutation<VoiceSample, Error, VoiceSamplePayload>({
    mutationFn: createVoiceSample,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.list() })
    },
  })
}

export function useUpdateVoiceSample() {
  const queryClient = useQueryClient()

  return useMutation<VoiceSample, Error, { id: string; payload: Partial<VoiceSamplePayload> }>({
    mutationFn: ({ id, payload }) => updateVoiceSample(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.list() })
    },
  })
}

export function useDeleteVoiceSample() {
  const queryClient = useQueryClient()

  return useMutation<{ id: string }, Error, string>({
    mutationFn: deleteVoiceSample,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.list() })
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation<Partial<VoiceSample>, Error, { id: string; isFavorite: boolean }>({
    mutationFn: ({ id, isFavorite }) => toggleFavorite(id, isFavorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.list() })
    },
  })
}
