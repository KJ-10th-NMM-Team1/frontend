import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/config/queryKeys'
import { useUiStore } from '../../../shared/store/useUiStore'
import type { ExampleItemPayload } from '../../example/api/exampleApi'
import {
  createExampleItem,
  deleteExampleItem,
  fetchExampleItems,
  updateExampleItem,
} from '../../example/api/exampleApi'

export function useExampleItemsQuery() {
  return useQuery({
    queryKey: queryKeys.example.all,
    queryFn: async () => {
      const response = await fetchExampleItems()
      return response.items
    },
  })
}

export function useCreateExampleItemMutation() {
  const queryClient = useQueryClient()
  const showToast = useUiStore((state) => state.showToast)

  return useMutation({
    mutationKey: ['example', 'create'],
    mutationFn: (payload: ExampleItemPayload) => createExampleItem(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.example.all })
      showToast({
        id: 'example-create-success',
        title: '항목이 생성되었습니다',
        autoDismiss: 2500,
      })
    },
  })
}

export function useUpdateExampleItemMutation() {
  const queryClient = useQueryClient()
  const showToast = useUiStore((state) => state.showToast)

  return useMutation({
    mutationKey: ['example', 'update'],
    mutationFn: ({ id, payload }: { id: string; payload: ExampleItemPayload }) =>
      updateExampleItem(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.example.all })
      showToast({
        id: 'example-update-success',
        title: '항목이 수정되었습니다',
        autoDismiss: 2500,
      })
    },
  })
}

export function useDeleteExampleItemMutation() {
  const queryClient = useQueryClient()
  const showToast = useUiStore((state) => state.showToast)

  return useMutation({
    mutationKey: ['example', 'delete'],
    mutationFn: (id: string) => deleteExampleItem(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.example.all })
      showToast({
        id: 'example-delete-success',
        title: '항목이 삭제되었습니다',
        autoDismiss: 2000,
      })
    },
  })
}
