import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { VoiceSamplePayload } from '@/entities/voice-sample/types'
import type { VoiceSample } from '@/entities/voice-sample/types'
import { queryKeys } from '@/shared/config/queryKeys'

import {
  addToMyVoices,
  createVoiceSample,
  deleteVoiceSample,
  fetchVoiceSamples,
  removeFromMyVoices,
  updateVoiceSample,
} from '../api/voiceSamplesApi'

export function useVoiceSamples(options?: {
  myVoicesOnly?: boolean
  mySamplesOnly?: boolean
  category?: string
  isDefault?: boolean
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
        { queryKey: ['voice-samples'], exact: false },
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
      void queryClient.invalidateQueries({ queryKey: ['voice-samples'], exact: false })
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

// 보이스를 내 라이브러리에 추가
export function useAddToMyVoices() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: addToMyVoices,
    // 낙관적 업데이트: API 호출 전에 UI를 먼저 업데이트
    onMutate: async (id) => {
      // 진행 중인 쿼리들을 취소하여 낙관적 업데이트가 덮어쓰이지 않도록 함
      await queryClient.cancelQueries({ queryKey: ['voice-library'], exact: false })
      await queryClient.cancelQueries({ queryKey: ['voice-samples'], exact: false })

      // 이전 쿼리 데이터를 백업 (에러 시 롤백)
      const previousQueries = queryClient.getQueriesData({
        queryKey: ['voice-library'],
        exact: false,
      })

      // 모든 관련 쿼리 캐시를 낙관적으로 업데이트
      queryClient
        .getQueriesData({ queryKey: ['voice-library'], exact: false })
        .forEach(([queryKey, queryData]) => {
          if (!queryData) return

          const data = queryData as { samples: VoiceSample[]; total: number }
          const sampleIndex = data.samples.findIndex((sample) => sample.id === id)

          if (sampleIndex !== -1) {
            // isInMyVoices를 true로, addedCount를 1 증가
            const newSamples = [...data.samples]
            newSamples[sampleIndex] = {
              ...data.samples[sampleIndex],
              isInMyVoices: true,
              addedCount: (data.samples[sampleIndex].addedCount ?? 0) + 1,
            }

            queryClient.setQueryData(queryKey, {
              samples: newSamples,
              total: data.total,
            })
          }
        })

      // 롤백을 위한 컨텍스트 반환
      return { previousQueries }
    },
    // 에러 발생 시 롤백
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        const queries = context.previousQueries as Array<[readonly unknown[], unknown]>
        queries.forEach(([queryKey, data]) => {
          if (queryKey && data !== undefined) {
            queryClient.setQueryData(queryKey, data)
          }
        })
      }
    },
    // 성공 시 쿼리 무효화하여 최신 데이터 가져오기
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
      void queryClient.invalidateQueries({ queryKey: ['voice-samples'], exact: false })
    },
  })
}

// 내 라이브러리에서 보이스 제거
export function useRemoveFromMyVoices() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: removeFromMyVoices,
    // 낙관적 업데이트: API 호출 전에 UI를 먼저 업데이트
    onMutate: async (id) => {
      // 진행 중인 쿼리들을 취소하여 낙관적 업데이트가 덮어쓰이지 않도록 함
      await queryClient.cancelQueries({ queryKey: ['voice-library'], exact: false })
      await queryClient.cancelQueries({ queryKey: ['voice-samples'], exact: false })

      // 이전 쿼리 데이터를 백업 (에러 시 롤백)
      const previousQueries = queryClient.getQueriesData({
        queryKey: ['voice-library'],
        exact: false,
      })

      // 모든 관련 쿼리 캐시를 낙관적으로 업데이트
      queryClient
        .getQueriesData({ queryKey: ['voice-library'], exact: false })
        .forEach(([queryKey, queryData]) => {
          if (!queryData) return

          const data = queryData as { samples: VoiceSample[]; total: number }
          const sampleIndex = data.samples.findIndex((sample) => sample.id === id)

          if (sampleIndex !== -1) {
            // isInMyVoices를 false로, addedCount를 1 감소 (최소 0)
            const newSamples = [...data.samples]
            newSamples[sampleIndex] = {
              ...data.samples[sampleIndex],
              isInMyVoices: false,
              addedCount: Math.max(0, (data.samples[sampleIndex].addedCount ?? 0) - 1),
            }

            queryClient.setQueryData(queryKey, {
              samples: newSamples,
              total: data.total,
            })
          }
        })

      // 롤백을 위한 컨텍스트 반환
      return { previousQueries }
    },
    // 에러 발생 시 롤백
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        const queries = context.previousQueries as Array<[readonly unknown[], unknown]>
        queries.forEach(([queryKey, data]) => {
          if (queryKey && data !== undefined) {
            queryClient.setQueryData(queryKey, data)
          }
        })
      }
    },
    // 성공 시 쿼리 무효화하여 최신 데이터 가져오기
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
      void queryClient.invalidateQueries({ queryKey: ['voice-samples'], exact: false })
    },
  })
}
