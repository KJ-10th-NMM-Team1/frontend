import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  completeYoutubeOAuth,
  disconnectYoutube,
  fetchYoutubeStatus,
  publishYoutubeVideo,
  startYoutubeOAuth,
  type YoutubeConnectionInfo,
  type YoutubePublishPayload,
  type YoutubePublishResponse,
} from '@/features/youtube/api/youtubeApi'
import { queryKeys } from '@/shared/config/queryKeys'

export function useYoutubeStatus(enabled = true) {
  return useQuery<YoutubeConnectionInfo>({
    queryKey: queryKeys.youtube.status(),
    queryFn: fetchYoutubeStatus,
    enabled,
    staleTime: 1000 * 60 * 2,
  })
}

export function useStartYoutubeOAuthMutation() {
  return useMutation({
    mutationFn: startYoutubeOAuth,
  })
}

export function useDisconnectYoutubeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: disconnectYoutube,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.youtube.status() })
    },
  })
}

export function useCompleteYoutubeOAuthMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: completeYoutubeOAuth,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.youtube.status(), () => data)
      void queryClient.invalidateQueries({ queryKey: queryKeys.youtube.status() })
    },
  })
}

export function useYoutubePublishMutation() {
  return useMutation<YoutubePublishResponse, unknown, YoutubePublishPayload>({
    mutationFn: publishYoutubeVideo,
  })
}
