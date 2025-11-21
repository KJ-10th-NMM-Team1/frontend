import type { MouseEvent } from 'react'

import { MoreVertical } from 'lucide-react'

import type { ProjectSummary } from '@/entities/project/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

interface EpisodeCardActionsProps {
  project: ProjectSummary
  onExport?: (project: ProjectSummary) => void
  onDelete?: (project: ProjectSummary) => void
}

/**
 * 에피소드 카드 액션 메뉴 (수정/삭제)
 */
export function EpisodeCardActions({ project, onExport, onDelete }: EpisodeCardActionsProps) {
  const handleExportClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onExport?.(project)
  }

  const handleDeleteClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onDelete?.(project)
  }

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-10 opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="에피소드 작업"
            className="focus-visible:outline-hidden flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-gray-900 shadow hover:bg-white focus-visible:ring-2 focus-visible:ring-primary/40"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onExport && <DropdownMenuItem onClick={handleExportClick}>내보내기</DropdownMenuItem>}
          {onDelete && (
            <DropdownMenuItem className="text-danger" onClick={handleDeleteClick}>
              삭제
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
