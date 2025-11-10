import type {
  ExampleItem,
  ExampleItemPayload,
  ExampleItemResponse,
  ExampleItemsResponse,
} from '../../../entities/example/types'
import { apiClient } from '../../../shared/api/client'

export async function fetchExampleItems() {
  return apiClient.get('api/example-items').json<ExampleItemsResponse>()
}

export async function createExampleItem(payload: ExampleItemPayload) {
  return apiClient.post('api/example-items', { json: payload }).json<ExampleItemResponse>()
}

export async function updateExampleItem(id: string, payload: ExampleItemPayload) {
  return apiClient.patch(`api/example-items/${id}`, { json: payload }).json<ExampleItemResponse>()
}

export async function deleteExampleItem(id: string) {
  await apiClient.delete(`api/example-items/${id}`)
  return { id }
}

export type { ExampleItem, ExampleItemPayload }
