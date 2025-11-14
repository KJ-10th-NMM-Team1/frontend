import { apiClient } from '@/shared/api/client'
import type { SuggestionRequest } from '../../../entities/suggestion/types'

export async function fetchSuggestion({ segmentId, context }: SuggestionRequest) {
  const url = `api/suggestion/${segmentId}?request_context=${encodeURIComponent(context)}`
  return apiClient.get(url).text()
}
