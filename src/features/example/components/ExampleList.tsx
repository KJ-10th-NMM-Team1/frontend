import type { ExampleItem } from '@/entities/example/types'
import { Button } from '@/shared/ui/Button'

const statusLabels: Record<ExampleItem['status'], string> = {
  draft: '초안',
  'in-progress': '진행 중',
  done: '완료',
}

type ExampleListProps = {
  items: ExampleItem[]
  stats: Record<'draft' | 'in-progress' | 'done', number>
  isDeleting: boolean
  onEdit: (item: ExampleItem) => void
  onDelete: (id: string) => void
}

export function ExampleList({ items, stats, isDeleting, onEdit, onDelete }: ExampleListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {(Object.keys(stats) as Array<keyof typeof stats>).map((key) => (
          <div
            key={key}
            className="border-surface-4 bg-surface-2 text-muted rounded-2xl border px-4 py-3 text-sm"
          >
            {statusLabels[key]}: <span className="text-foreground font-semibold">{stats[key]}</span>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="border-surface-4 bg-surface-2 text-muted rounded-2xl border border-dashed py-6 text-center text-sm">
            등록된 항목이 없습니다. 상단 폼에서 새 프로젝트를 추가해 보세요.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="border-surface-4 bg-surface-1 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3"
            >
              <div>
                <p className="text-foreground text-sm font-semibold">{item.name}</p>
                <p className="text-muted text-xs">
                  담당자: {item.owner} • 상태: {statusLabels[item.status]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(item)}>
                  수정
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => onDelete(item.id)}
                >
                  삭제
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
