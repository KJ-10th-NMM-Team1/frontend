import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { VoiceSample, VoiceSamplePayload } from '@/entities/voice-sample/types'
import { queryKeys } from '@/shared/config/queryKeys'

import {
  createVoiceSample,
  deleteVoiceSample,
  fetchVoiceSamples,
  toggleFavorite,
  updateVoiceSample,
} from '../api/voiceSamplesApi'

export function useVoiceSamples() {
  return useQuery({
    queryKey: queryKeys.voiceSamples.list(),
    queryFn: fetchVoiceSamples,
  })
}

export function useCreateVoiceSample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVoiceSample,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.list() })
    },
  })
}

export function useUpdateVoiceSample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<VoiceSamplePayload> }) =>
      updateVoiceSample(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.list() })
    },
  })
}

export function useDeleteVoiceSample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteVoiceSample,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.list() })
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      toggleFavorite(id, isFavorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.list() })
    },
  })
}

