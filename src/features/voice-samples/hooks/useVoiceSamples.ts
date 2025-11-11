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
      await queryClient.cancelQueries({ queryKey: ['voice-samples'], exact: false })

      // 이전 쿼리 데이터를 백업 (에러 시 롤백)
      const previousQueries = queryClient.getQueriesData({
        queryKey: ['voice-samples'],
        exact: false,
      })

      // 모든 관련 쿼리 캐시를 낙관적으로 업데이트
      queryClient
        .getQueriesData({ queryKey: ['voice-samples'], exact: false })
        .forEach(([queryKey, queryData]) => {
          if (!queryData) return

          const data = queryData as { samples: VoiceSample[]; total: number }
          const queryKeyArray = queryKey

          // 쿼리 키에서 options 추출
          const options = queryKeyArray[2] as
            | { favoritesOnly?: boolean; mySamplesOnly?: boolean; q?: string }
            | undefined
          const isFavoritesOnly = options?.favoritesOnly === true

          // 변경된 샘플이 있는지 확인
          const sampleIndex = data.samples.findIndex((sample) => sample.id === id)

          if (isFavoritesOnly) {
            // 즐겨찾기 필터가 활성화된 경우: 목록에 추가/제거
            if (isFavorite) {
              // 좋아요 추가: 샘플이 목록에 없으면 추가
              if (sampleIndex === -1) {
                // 다른 쿼리에서 샘플 찾기
                const allQueries = queryClient.getQueriesData({
                  queryKey: ['voice-samples'],
                  exact: false,
                })
                let sampleToAdd: VoiceSample | undefined

                for (const [, otherData] of allQueries) {
                  if (!otherData) continue
                  const otherDataTyped = otherData as { samples: VoiceSample[]; total: number }
                  const found = otherDataTyped.samples.find((s) => s.id === id)
                  if (found) {
                    sampleToAdd = { ...found, isFavorite: true }
                    break
                  }
                }

                if (sampleToAdd) {
                  queryClient.setQueryData(queryKey, {
                    samples: [...data.samples, sampleToAdd],
                    total: data.total + 1,
                  })
                }
              } else {
                // 이미 있으면 isFavorite만 업데이트
                const newSamples = [...data.samples]
                newSamples[sampleIndex] = { ...data.samples[sampleIndex], isFavorite: true }
                queryClient.setQueryData(queryKey, {
                  samples: newSamples,
                  total: data.total,
                })
              }
            } else {
              // 좋아요 제거: 목록에서 샘플 제거
              if (sampleIndex !== -1) {
                const newSamples = data.samples.filter((_, index) => index !== sampleIndex)
                queryClient.setQueryData(queryKey, {
                  samples: newSamples,
                  total: Math.max(0, data.total - 1),
                })
              }
            }
          } else {
            // 일반 목록: isFavorite만 업데이트
            if (sampleIndex === -1) return

            // 이미 같은 상태면 업데이트하지 않음
            if (data.samples[sampleIndex].isFavorite === isFavorite) return

            // 변경된 샘플만 새 객체로 만들고, 나머지는 기존 배열 참조 유지
            const newSamples = [...data.samples]
            newSamples[sampleIndex] = { ...data.samples[sampleIndex], isFavorite }

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
        context.previousQueries.forEach(([queryKey, data]) => {
          if (queryKey && data !== undefined) {
            queryClient.setQueryData(queryKey as readonly unknown[], data)
          }
        })
      }
    },
    // 성공 시 서버 응답으로 최종 업데이트
    // toggleFavorite API는 부분 객체만 반환하므로 기존 샘플 필드를 유지하면서 isFavorite만 업데이트
    onSuccess: (data) => {
      queryClient
        .getQueriesData({ queryKey: ['voice-samples'], exact: false })
        .forEach(([queryKey, queryData]) => {
          if (!queryData) return

          const old = queryData as { samples: VoiceSample[]; total: number }
          const queryKeyArray = queryKey

          // 쿼리 키에서 options 추출
          const options = queryKeyArray[2] as
            | { favoritesOnly?: boolean; mySamplesOnly?: boolean; q?: string }
            | undefined
          const isFavoritesOnly = options?.favoritesOnly === true

          // 변경된 샘플이 있는지 확인
          const sampleIndex = old.samples.findIndex((sample) => sample.id === data.id)

          if (isFavoritesOnly) {
            // 즐겨찾기 필터가 활성화된 경우: 목록에 추가/제거
            if (data.isFavorite) {
              // 좋아요 추가: 샘플이 목록에 없으면 추가
              if (sampleIndex === -1) {
                // 다른 쿼리에서 샘플 찾기
                const allQueries = queryClient.getQueriesData({
                  queryKey: ['voice-samples'],
                  exact: false,
                })
                let sampleToAdd: VoiceSample | undefined

                for (const [, otherData] of allQueries) {
                  if (!otherData) continue
                  const otherDataTyped = otherData as { samples: VoiceSample[]; total: number }
                  const found = otherDataTyped.samples.find((s) => s.id === data.id)
                  if (found) {
                    sampleToAdd = { ...found, isFavorite: true }
                    break
                  }
                }

                if (sampleToAdd) {
                  queryClient.setQueryData(queryKey, {
                    samples: [...old.samples, sampleToAdd],
                    total: old.total + 1,
                  })
                }
              } else {
                // 이미 있으면 isFavorite만 업데이트
                const newSamples = [...old.samples]
                newSamples[sampleIndex] = {
                  ...old.samples[sampleIndex],
                  isFavorite: data.isFavorite,
                }
                queryClient.setQueryData(queryKey, {
                  samples: newSamples,
                  total: old.total,
                })
              }
            } else {
              // 좋아요 제거: 목록에서 샘플 제거
              if (sampleIndex !== -1) {
                const newSamples = old.samples.filter((_, index) => index !== sampleIndex)
                queryClient.setQueryData(queryKey, {
                  samples: newSamples,
                  total: Math.max(0, old.total - 1),
                })
              }
            }
          } else {
            // 일반 목록: isFavorite만 업데이트
            if (sampleIndex === -1) return

            // 기존 샘플의 필드를 유지하면서 isFavorite만 업데이트
            const newSamples = [...old.samples]
            newSamples[sampleIndex] = {
              ...old.samples[sampleIndex],
              isFavorite: data.isFavorite,
            }

            queryClient.setQueryData(queryKey, {
              samples: newSamples,
              total: old.total,
            })
          }
        })
    },
  })
}
