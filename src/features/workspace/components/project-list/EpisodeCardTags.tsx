import { useMemo } from 'react'

import { useUiStore } from '@/shared/store/useUiStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

const EMPTY_TAGS: string[] = []
const MAX_VISIBLE_TAGS = 3

type EpisodeCardTagsProps = {
  tags: string[] | undefined
  onTagClick?: (tag: string) => void
}

export function EpisodeCardTags({ tags, onTagClick }: EpisodeCardTagsProps) {
  const workspaceSelectedTags = useUiStore((state) => state.workspaceSelectedTags)
  const selectedTags = workspaceSelectedTags ?? EMPTY_TAGS

  const orderedTags = useMemo(() => {
    const normalizedTags = tags ?? EMPTY_TAGS

    const selected = selectedTags.filter((t) => normalizedTags.includes(t))
    const others = normalizedTags.filter((t) => !selected.includes(t))
    return [...selected, ...others]
  }, [tags, selectedTags])

  const visibleTags = orderedTags.slice(0, MAX_VISIBLE_TAGS)
  const hiddenTags = orderedTags.slice(MAX_VISIBLE_TAGS)
  const hiddenCount = hiddenTags.length

  if (orderedTags.length === 0) {
    return null
  }

  return (
    <div className="relative mt-2 flex items-center gap-2">
      <div className="relative flex min-w-0 flex-1">
        <div className="flex flex-nowrap items-center gap-1 overflow-hidden whitespace-nowrap pr-10">
          {visibleTags.map((tag) => (
            <TagButton
              key={tag}
              tag={tag}
              isSelected={selectedTags.includes(tag)}
              onClick={onTagClick}
            />
          ))}
        </div>
        {hiddenCount > 0 && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white via-white/70 to-transparent" />
        )}
      </div>

      {hiddenCount > 0 && (
        <HiddenTagsDropdown hiddenTags={hiddenTags} onTagClick={onTagClick} />
      )}
    </div>
  )
}

type TagButtonProps = {
  tag: string
  isSelected: boolean
  onClick?: (tag: string) => void
}

function TagButton({ tag, isSelected, onClick }: TagButtonProps) {
  return (
    <button
      type="button"
      className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition hover:bg-surface-3 ${
        isSelected
          ? 'border border-primary/60 bg-primary/10 text-primary'
          : 'bg-surface-2 text-foreground'
      }`}
      onClick={(event) => {
        if (!onClick) return
        event.preventDefault()
        event.stopPropagation()
        onClick(tag)
      }}
    >
      #{tag}
    </button>
  )
}

type HiddenTagsDropdownProps = {
  hiddenTags: string[]
  onTagClick?: (tag: string) => void
}

function HiddenTagsDropdown({ hiddenTags, onTagClick }: HiddenTagsDropdownProps) {
  const hiddenCount = hiddenTags.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground focus-visible:outline-hidden flex h-8 shrink-0 items-center gap-2 rounded-full bg-surface-2 px-3 text-[11px] font-semibold shadow-sm transition hover:bg-surface-3 focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label={`태그 ${hiddenCount}개 더 보기`}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          +{hiddenCount}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.2em] text-muted">
          추가 태그
        </DropdownMenuLabel>
        {hiddenTags.map((tag) => (
          <DropdownMenuItem
            key={tag}
            className="text-[12px]"
            onClick={(event) => {
              if (!onTagClick) return
              event.preventDefault()
              event.stopPropagation()
              onTagClick(tag)
            }}
          >
            #{tag}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
