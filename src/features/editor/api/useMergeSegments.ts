/**
 * React Query hook for merging segments
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query'

import { apiClient } from '@/shared/api/client'

import type { MergeSegmentsRequest, MergeSegmentResponse } from './types'

/**
 * Merge multiple segments into one
 *
 * @example
 * const { mutate: mergeSegments } = useMergeSegments({
 *   onSuccess: (data) => {
 *     console.log('Merged segment:', data.segment)
 *   }
 * })
 *
 * mergeSegments({
 *   segment_ids: ['seg-123', 'seg-124', 'seg-125']
 * })
 */
export function useMergeSegments(
  options?: UseMutationOptions<MergeSegmentResponse, Error, MergeSegmentsRequest>,
) {
  return useMutation({
    mutationFn: async (request: MergeSegmentsRequest) => {
      const response = await apiClient
        .post('segments/merge', {
          json: request,
        })
        .json<MergeSegmentResponse>()

      return response
    },
    ...options,
  })
}
