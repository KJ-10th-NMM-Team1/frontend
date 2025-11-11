import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  FinishUploadPayload,
  FinishUploadResponse,
  PrepareUploadPayload,
  PrepareUploadResponse,
  RegisterYoutubeSourcePayload,
  RegisterYoutubeSourceResponse,
} from '@/entities/project/types'
import {
  finalizeUpload,
  prepareFileUpload,
  registerYoutubeSource,
} from '@/features/projects/api/storageApi'
import { apiGet } from '@/shared/api/client'
import { queryKeys } from '@/shared/config/queryKeys'

export function usePrepareUploadMutation() {
  return useMutation<PrepareUploadResponse, Error, PrepareUploadPayload>({
    mutationKey: ['projects', 'prepare-upload'],
    mutationFn: prepareFileUpload,
  })
}

export function useRegisterYoutubeSourceMutation() {
  // const queryClient = useQueryClient()
  return useMutation<RegisterYoutubeSourceResponse, Error, RegisterYoutubeSourcePayload>({
    mutationKey: ['projects', 'register-youtube'],
    mutationFn: registerYoutubeSource,
    // onSuccess() {
    // void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    // },
  })
}

export function useFinalizeUploadMutation() {
  const queryClient = useQueryClient()

  return useMutation<FinishUploadResponse, Error, FinishUploadPayload>({
    mutationKey: ['projects', 'finish-upload'],
    mutationFn: finalizeUpload,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function usePresignedUrl(s3key: string) {
  return useQuery({
    queryKey: ['s3-video-source', s3key],
    queryFn: () => apiGet<{ url: string }>(`api/storage/media/${s3key}`),
    select: (data) => data.url,
  })
}
