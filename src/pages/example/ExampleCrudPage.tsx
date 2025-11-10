import { useMemo, useState } from 'react'

import type { ExampleItem } from '@/entities/example/types'
import { ExampleForm } from '@/features/example/components/ExampleForm'
import { ExampleList } from '@/features/example/components/ExampleList'
import {
  useCreateExampleItemMutation,
  useDeleteExampleItemMutation,
  useExampleItemsQuery,
  useUpdateExampleItemMutation,
} from '@/features/example/hooks/useExampleItems'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'

export default function ExampleCrudPage() {
  const { data: items = [], isLoading } = useExampleItemsQuery()
  const createMutation = useCreateExampleItemMutation()
  const updateMutation = useUpdateExampleItemMutation()
  const deleteMutation = useDeleteExampleItemMutation()
  const [editingItem, setEditingItem] = useState<ExampleItem | null>(null)

  const stats = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.status] += 1
        return acc
      },
      { draft: 0, 'in-progress': 0, done: 0 },
    )
  }, [items])

  const handleCreate = (payload: {
    name: string
    owner: string
    status: ExampleItem['status']
  }) => {
    createMutation.mutate(payload)
  }

  const handleUpdate = (
    payload: { name: string; owner: string; status: ExampleItem['status'] } & { id: string },
  ) => {
    updateMutation.mutate({ id: payload.id, payload })
    setEditingItem(null)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
    if (editingItem?.id === id) {
      setEditingItem(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="space-y-3 text-center">
        <h1 className="text-foreground text-3xl font-semibold">CRUD 예제</h1>
        <p className="text-muted text-sm">
          이 페이지는 React Query + MSW + React Hook Form 조합으로 간단한 CRUD 패턴을 보여줍니다.
          실제 서비스 기능을 만들 때 이 구조를 복제하면 빠르게 기능을 확장할 수 있습니다.
        </p>
      </header>

      <Card className="border-surface-4 bg-surface-1/90 border p-6">
        <CardHeader className="mb-4">
          <CardTitle>{editingItem ? '프로젝트 수정' : '새 프로젝트 추가'}</CardTitle>
          <CardDescription>
            이 폼은 React Hook Form을 사용하며, 제출 시 React Query mutation을 호출합니다.
          </CardDescription>
        </CardHeader>
        <ExampleForm
          key={editingItem?.id ?? 'create'}
          mode={editingItem ? 'edit' : 'create'}
          defaultValues={editingItem ?? undefined}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={(values) =>
            editingItem ? handleUpdate({ ...values, id: editingItem.id }) : handleCreate(values)
          }
          onCancel={() => setEditingItem(null)}
        />
      </Card>

      <Card className="border-surface-4 bg-surface-1/80 border p-6">
        <CardHeader className="mb-4">
          <CardTitle>프로젝트 목록</CardTitle>
          <CardDescription>
            React Query가 리스트를 관리하고, 개별 카드에서는 수정/삭제 액션을 제공합니다.
          </CardDescription>
        </CardHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner />
            <span className="text-muted ml-3 text-sm">목록을 불러오는 중…</span>
          </div>
        ) : (
          <ExampleList
            items={items}
            stats={stats}
            isDeleting={deleteMutation.isPending}
            onEdit={setEditingItem}
            onDelete={handleDelete}
          />
        )}
      </Card>
    </div>
  )
}
