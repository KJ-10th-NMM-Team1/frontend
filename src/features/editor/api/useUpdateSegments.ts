/**
 * React Query hook for updating segments
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query'

import { apiClient } from '@/shared/api/client'

import type { UpdateSegmentsRequest, UpdateSegmentsResponse } from './types'

/**
 * Update all segments for a project and language
 *
 * @example
 * const { mutate: updateSegments } = useUpdateSegments({
 *   onSuccess: (data) => {
 *     console.log('Updated segments:', data.updated_count)
 *   }
 * })
 *
 * updateSegments({
 *   project_id: 'proj-123',
 *   language_code: 'ko',
 *   segments: [...]
 * })
 */
export function useUpdateSegments(
  options?: UseMutationOptions<UpdateSegmentsResponse, Error, UpdateSegmentsRequest>,
) {
  return useMutation({
    mutationFn: async (request: UpdateSegmentsRequest) => {
      const response = await apiClient
        .put(`api/projects/${request.project_id}/segments/${request.language_code}`, {
          json: {
            segments: request.segments,
          },
        })
        .json<UpdateSegmentsResponse>()

      return response
    },
    ...options,
  })
}
