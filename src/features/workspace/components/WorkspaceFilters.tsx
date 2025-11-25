import { Filter, Search, X } from 'lucide-react'

import type { Language } from '@/entities/language/types'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'
import { Input } from '@/shared/ui/Input'

type TagStat = { tag: string; count: number }

type WorkspaceFiltersProps = {
  workspaceSearchTerm: string
  setWorkspaceSearchTerm: (value: string) => void
  workspaceSourceLanguageFilter: string | null
  setWorkspaceSourceLanguageFilter: (value: string | null) => void
  workspaceTargetLanguageFilter: string | null
  setWorkspaceTargetLanguageFilter: (value: string | null) => void
  workspaceSelectedTags: string[]
  toggleTagFilter: (tag: string) => void
  clearAllFilters: () => void
  languages: Language[]
  filteredTags: TagStat[]
  tagFilterQuery: string
  setTagFilterQuery: (value: string) => void
}

export function WorkspaceFilters({
  workspaceSearchTerm,
  setWorkspaceSearchTerm,
  workspaceSourceLanguageFilter,
  setWorkspaceSourceLanguageFilter,
  workspaceTargetLanguageFilter,
  setWorkspaceTargetLanguageFilter,
  workspaceSelectedTags,
  toggleTagFilter,
  clearAllFilters,
  languages,
  filteredTags,
  tagFilterQuery,
  setTagFilterQuery,
}: WorkspaceFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Search Bar */}
      <div className="relative flex min-h-[2.75rem] flex-1 flex-wrap items-center gap-1.5 rounded-full border border-outline/50 bg-surface-1 px-3 py-1 shadow-soft focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

        <Input
          placeholder="에피소드 검색..."
          className="h-8 min-w-[80px] flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={workspaceSearchTerm}
          onChange={(e) => setWorkspaceSearchTerm(e.target.value)}
        />

        {/* Active Filters inside Search Bar */}
        {workspaceSourceLanguageFilter && (
          <span className="inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full bg-tertiary-container px-2 text-xs font-semibold text-on-tertiary-container shadow-soft">
            원본:{' '}
            {languages.find((l) => l.language_code === workspaceSourceLanguageFilter)?.name_ko}
            <button
              type="button"
              onClick={() => setWorkspaceSourceLanguageFilter(null)}
              className="ml-0.5 text-on-tertiary-container/80 hover:text-on-tertiary-container"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        {workspaceTargetLanguageFilter && (
          <span className="inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full bg-tertiary-container px-2 text-xs font-semibold text-on-tertiary-container shadow-soft">
            번역:{' '}
            {languages.find((l) => l.language_code === workspaceTargetLanguageFilter)?.name_ko}
            <button
              type="button"
              onClick={() => setWorkspaceTargetLanguageFilter(null)}
              className="ml-0.5 text-on-tertiary-container/80 hover:text-on-tertiary-container"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        {workspaceSelectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full bg-tertiary/10 px-2 text-xs font-medium text-tertiary"
          >
            #{tag}
            <button
              type="button"
              onClick={() => toggleTagFilter(tag)}
              className="ml-0.5 hover:text-tertiary/80"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {(workspaceSelectedTags.length > 0 ||
          workspaceSourceLanguageFilter ||
          workspaceTargetLanguageFilter) && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="필터 초기화"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="h-10 gap-2 rounded-full border-outline/30 bg-primary-container px-3 py-1.5 text-sm font-medium text-on-primary-container shadow-soft hover:bg-primary-container/90"
            aria-label="필터"
          >
            <Filter className="h-4 w-4 text-on-primary-container" />
            필터
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 rounded-2xl border border-outline/40 bg-surface-1 p-0 shadow-soft"
        >
          {/* Language Filters Grid */}
          <div className="grid grid-cols-2 gap-2 p-3">
            {/* Source Language Section */}
            <div>
              <DropdownMenuLabel className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                원본 언어
              </DropdownMenuLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 w-full justify-between rounded-xl px-3 py-1 text-sm font-medium text-foreground"
                  >
                    <span className="truncate">
                      {workspaceSourceLanguageFilter
                        ? languages.find((l) => l.language_code === workspaceSourceLanguageFilter)
                            ?.name_ko || '선택됨'
                        : '전체'}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 w-48 overflow-y-auto">
                  <DropdownMenuItem onSelect={() => setWorkspaceSourceLanguageFilter(null)}>
                    모든 언어
                  </DropdownMenuItem>
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.language_code}
                      onSelect={() => setWorkspaceSourceLanguageFilter(lang.language_code)}
                    >
                      {lang.name_ko}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Target Language Section */}
            <div>
              <DropdownMenuLabel className="mb-1 px-2 text-lg font-medium text-muted-foreground">
                번역 언어
              </DropdownMenuLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 w-full justify-between rounded-xl px-3 py-1 text-sm font-medium text-foreground"
                  >
                    <span className="truncate">
                      {workspaceTargetLanguageFilter
                        ? languages.find((l) => l.language_code === workspaceTargetLanguageFilter)
                            ?.name_ko || '선택됨'
                        : '전체'}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 w-48 overflow-y-auto">
                  <DropdownMenuItem onSelect={() => setWorkspaceTargetLanguageFilter(null)}>
                    모든 언어
                  </DropdownMenuItem>
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.language_code}
                      onSelect={() => setWorkspaceTargetLanguageFilter(lang.language_code)}
                    >
                      {lang.name_ko}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Tag Search Section */}
          <div className="p-3">
            <DropdownMenuLabel className="mb-2 px-2 text-xs font-medium text-muted-foreground">
              태그 검색
            </DropdownMenuLabel>
            <div className="space-y-2 px-2">
              <Input
                placeholder="태그 검색..."
                value={tagFilterQuery}
                onChange={(e) => setTagFilterQuery(e.target.value)}
                className="h-10 rounded-xl bg-surface-2 text-sm"
              />
              <div className="max-h-48 overflow-y-auto rounded-xl border border-outline/30 bg-surface-2/60">
                {filteredTags.length > 0 ? (
                  filteredTags.map(({ tag, count }) => (
                    <div
                      key={tag}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-surface-1"
                    >
                      <Checkbox
                        id={`filter-tag-${tag}`}
                        checked={workspaceSelectedTags.includes(tag)}
                        onCheckedChange={() => toggleTagFilter(tag)}
                      />
                      <label
                        htmlFor={`filter-tag-${tag}`}
                        className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <div className="flex items-center justify-between">
                          <span>#{tag}</span>
                          <span className="text-xs text-muted-foreground">{count}</span>
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-center text-xs text-muted-foreground">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs text-muted-foreground hover:text-foreground"
              onClick={clearAllFilters}
            >
              필터 초기화
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
