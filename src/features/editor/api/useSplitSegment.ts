/**
 * React Query hook for splitting a segment
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query'

import { apiClient } from '@/shared/api/client'

import type { SplitSegmentRequest, SplitSegmentResponse } from './types'

/**
 * Split a segment at the specified time
 *
 * @example
 * const { mutate: splitSegment } = useSplitSegment({
 *   onSuccess: (data) => {
 *     console.log('Split result:', data.segments)
 *   }
 * })
 *
 * splitSegment({
 *   segment_id: 'seg-123',
 *   split_time: 5.5
 * })
 */
export function useSplitSegment(
  options?: UseMutationOptions<SplitSegmentResponse, Error, SplitSegmentRequest>,
) {
  return useMutation({
    mutationFn: async (request: SplitSegmentRequest) => {
      const response = await apiClient
        .post('api/segment/split', {
          json: request,
        })
        .json<SplitSegmentResponse>()

      return response
    },
    ...options,
  })
}
