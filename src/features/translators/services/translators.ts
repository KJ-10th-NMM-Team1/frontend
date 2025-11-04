import { getApiUrl } from '@/config'
import { handleEmptyResponse, handleResponse } from '@/lib/http'
import type { CreateTranslatorPayload } from '../types/createTranslator'

export interface Translator {
  id: string
  name: string
  email?: string
  languages?: string[]
  status?: 'active' | 'inactive'
  createdAt?: string
}

export async function fetchTranslators(): Promise<Translator[]> {
  const res = await fetch(getApiUrl('/api/translators'), {
    method: 'GET',
    credentials: 'include',
  })
  return handleResponse<Translator[]>(res)
}
export async function createTranslator(payload: CreateTranslatorPayload) {
  const res = await fetch(getApiUrl('/api/translators'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return handleResponse<Translator>(res)
}

export async function updateTranslator(id: string, payload: CreateTranslatorPayload) {
  const res = await fetch(getApiUrl(`/api/translators/${encodeURIComponent(id)}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return handleResponse<Translator>(res)
}

export async function deleteTranslator(id: string) {
  const res = await fetch(getApiUrl(`/api/translators/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    credentials: 'include',
  })
  await handleEmptyResponse(res)
}
