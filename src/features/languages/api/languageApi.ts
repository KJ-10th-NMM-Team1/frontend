import type { LanguageResponse, LanguagePayload } from '@/entities/language/types'
import { apiClient } from '@/shared/api/client'

export async function fetchLanguage() {
  return apiClient.get('api/languages').json<LanguageResponse>()
}

export async function createLanguage(payload: LanguagePayload) {
  return apiClient.post('api/languages', { json: payload }).json<LanguageResponse>()
}

export async function updateLanguage(id: string, payload: LanguagePayload) {
  return apiClient.patch(`api/languages/${id}`, { json: payload }).json<LanguageResponse>()
}

export async function deleteLanguage(id: string) {
  await apiClient.delete(`api/languages/${id}`)
  return { id }
}
