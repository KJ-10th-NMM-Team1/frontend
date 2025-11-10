export type ExampleStatus = 'draft' | 'in-progress' | 'done'

export interface ExampleItem {
  id: string
  name: string
  owner: string
  status: ExampleStatus
  createdAt: string
  updatedAt: string
}

export interface ExampleItemPayload {
  name: string
  owner: string
  status: ExampleStatus
}

export interface ExampleItemResponse {
  item: ExampleItem
}

export interface ExampleItemsResponse {
  items: ExampleItem[]
}
