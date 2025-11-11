import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { VoiceSamplePayload } from '@/entities/voice-sample/types'
import type { VoiceSample } from '@/entities/voice-sample/types'
import { queryKeys } from '@/shared/config/queryKeys'

import {
  createVoiceSample,
  deleteVoiceSample,
  fetchVoiceSamples,
  toggleFavorite,
  updateVoiceSample,
} from '../api/voiceSamplesApi'

export function useVoiceSamples(options?: {
  favoritesOnly?: boolean
  mySamplesOnly?: boolean
  q?: string
}) {
  return useQuery({
    queryKey: queryKeys.voiceSamples.list(options),
    queryFn: () => fetchVoiceSamples(options),
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
    // 성공 시 서버 응답으로 캐시 즉시 업데이트
    onSuccess: (data) => {
      // 모든 관련 쿼리 캐시를 업데이트
      queryClient.setQueriesData<{ samples: VoiceSample[]; total: number }>(
        { queryKey: queryKeys.voiceSamples.all },
        (old) => {
          if (!old) return old

          // 변경된 샘플이 있는지 확인
          const sampleIndex = old.samples.findIndex((sample) => sample.id === data.id)
          if (sampleIndex === -1) return old

          // 변경된 샘플만 새 객체로 만들고, 나머지는 기존 배열 참조 유지
          const newSamples = [...old.samples]
          newSamples[sampleIndex] = data

          return {
            ...old,
            samples: newSamples,
          }
        },
      )

      // 백그라운드에서 최신 데이터 동기화
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.all })
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

  return useMutation<
    VoiceSample,
    Error,
    { id: string; isFavorite: boolean },
    { previousQueries: Array<[unknown, unknown]> }
  >({
    mutationFn: ({ id, isFavorite }) => toggleFavorite(id, isFavorite),
    // 낙관적 업데이트: API 호출 전에 UI를 먼저 업데이트
    onMutate: async ({ id, isFavorite }) => {
      // 진행 중인 쿼리들을 취소하여 낙관적 업데이트가 덮어쓰이지 않도록 함
      await queryClient.cancelQueries({ queryKey: queryKeys.voiceSamples.all })

      // 이전 쿼리 데이터를 백업 (에러 시 롤백)
      const previousQueries = queryClient.getQueriesData({
        queryKey: queryKeys.voiceSamples.all,
      })

      // 모든 관련 쿼리 캐시를 낙관적으로 업데이트
      // 변경된 샘플만 새 객체로 만들고, 나머지는 기존 참조 유지하여 불필요한 리렌더링 방지
      queryClient.setQueriesData<{ samples: VoiceSample[]; total: number }>(
        { queryKey: queryKeys.voiceSamples.all },
        (old) => {
          if (!old) return old

          // 변경된 샘플이 있는지 확인
          const sampleIndex = old.samples.findIndex((sample) => sample.id === id)
          if (sampleIndex === -1) return old

          // 이미 같은 상태면 업데이트하지 않음
          if (old.samples[sampleIndex].isFavorite === isFavorite) return old

          // 변경된 샘플만 새 객체로 만들고, 나머지는 기존 배열 참조 유지
          const newSamples = [...old.samples]
          newSamples[sampleIndex] = { ...old.samples[sampleIndex], isFavorite }

          return {
            ...old,
            samples: newSamples,
          }
        },
      )

      // 롤백을 위한 컨텍스트 반환
      return { previousQueries }
    },
    // 에러 발생 시 롤백
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          if (queryKey && data !== undefined) {
            queryClient.setQueryData(queryKey as readonly unknown[], data)
          }
        })
      }
    },
    // 성공 시 서버 응답으로 최종 업데이트
    onSuccess: (data) => {
      queryClient.setQueriesData<{ samples: VoiceSample[]; total: number }>(
        { queryKey: queryKeys.voiceSamples.all },
        (old) => {
          if (!old) return old

          // 변경된 샘플이 있는지 확인
          const sampleIndex = old.samples.findIndex((sample) => sample.id === data.id)
          if (sampleIndex === -1) return old

          // 변경된 샘플만 새 객체로 만들고, 나머지는 기존 배열 참조 유지
          const newSamples = [...old.samples]
          newSamples[sampleIndex] = data

          return {
            ...old,
            samples: newSamples,
          }
        },
      )
    },
    // 성공/실패 후 쿼리 무효화 (백그라운드에서 최신 데이터 가져오기)
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voiceSamples.all })
    },
  })
}
