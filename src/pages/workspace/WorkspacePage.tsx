import { useEffect, useMemo, useCallback, useState } from 'react'

import { Filter, Search, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { ProjectSummary } from '@/entities/project/types'
import { useProjects, useDeleteProjectMutation } from '@/features/projects/hooks/useProjects'
import { ProjectList } from '@/features/workspace/components/project-list/ProjectList'
import { UploadCard } from '@/features/workspace/components/upload-card/UploadCard'
import { routes } from '@/shared/config/routes'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useUiStore } from '@/shared/store/useUiStore'
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
import { Spinner } from '@/shared/ui/Spinner'

const stepMap = {
  source: 'source',
  details: 'details',
} as const

const normalizeTag = (tag: string) => tag.replace(/^#/, '').trim()

// type WorkspaceSection = 'projects' | 'voice-samples' | 'glossary' | 'guide' | 'support'

export default function WorkspacePage() {
  const { data: projects = [], isLoading } = useProjects()
  const deleteProjectMutation = useDeleteProjectMutation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tagFilterQuery, setTagFilterQuery] = useState('')
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const projectCreation = useUiStore((state) => state.projectCreation)
  const openProjectCreation = useUiStore((state) => state.openProjectCreation)
  const closeProjectCreation = useUiStore((state) => state.closeProjectCreation)
  const showToast = useUiStore((state) => state.showToast)
  const workspaceSearchTerm: string = useUiStore((state) => state.workspaceSearchTerm)
  const setWorkspaceSearchTerm: (value: string) => void = useUiStore(
    (state) => state.setWorkspaceSearchTerm,
  )
  const workspaceSelectedTags: string[] = useUiStore((state) => state.workspaceSelectedTags)
  const setWorkspaceSelectedTags: (value: string[]) => void = useUiStore(
    (state) => state.setWorkspaceSelectedTags,
  )
  const isModalOpen = projectCreation.open
  const modalStep = projectCreation.step

  const stepParam = searchParams.get('create')
  const derivedStep = stepParam ? stepMap[stepParam as keyof typeof stepMap] : null

  useEffect(() => {
    if (derivedStep) {
      openProjectCreation(derivedStep)
    }
  }, [derivedStep, openProjectCreation])

  const toggleTagFilter = useCallback(
    (tag: string) => {
      const normalized = normalizeTag(tag)
      if (!normalized) return
      const exists = workspaceSelectedTags.some((item) => item === normalized)
      const next = exists
        ? workspaceSelectedTags.filter((item) => item !== normalized)
        : [...workspaceSelectedTags, normalized]
      setWorkspaceSelectedTags(next)
    },
    [workspaceSelectedTags, setWorkspaceSelectedTags],
  )

  const clearTagFilters = useCallback(() => {
    setWorkspaceSelectedTags([])
    setTagFilterQuery('')
  }, [setWorkspaceSelectedTags])

  const handleEditProject = useCallback(
    (project: ProjectSummary) => {
      navigate(routes.projectDetail(project.id)) // 수정은 상세 페이지로 이동
    },
    [navigate],
  )

  const handleDeleteProject = useCallback(
    (project: ProjectSummary) => {
      if (!window.confirm(`"${project.title}" 에피소드를 삭제할까요?`)) return

      deleteProjectMutation.mutate(project.id, {
        onSuccess: () =>
          showToast({
            title: '에피소드가 삭제됐습니다.',
            description: '목록에서 항목이 곧 사라집니다.',
          }),
        onError: () =>
          showToast({
            title: '삭제에 실패했습니다.',
            description: '잠시 후 다시 시도해주세요.',
          }),
      })
    },
    [deleteProjectMutation, showToast],
  )

  const handleTagClick = useCallback(
    (tag: string) => {
      toggleTagFilter(tag)
    },
    [toggleTagFilter],
  )

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (!isModalOpen) {
      next.delete('create')
    } else {
      const currentKey = Object.entries(stepMap).find(([, value]) => value === modalStep)?.[0]
      if (currentKey) {
        next.set('create', currentKey)
      }
    }
    setSearchParams(next)
  }, [isModalOpen, modalStep, searchParams, setSearchParams])

  useEffect(() => {
    if (!stepParam) {
      closeProjectCreation()
    }
  }, [stepParam, closeProjectCreation])

  const tagStats = useMemo(() => {
    const tagCountMap = new Map<string, number>()
    projects.forEach((project) => {
      const tags = project.tags ?? []
      tags.forEach((tag) => {
        const normalized = normalizeTag(tag)
        if (!normalized) return
        const current = tagCountMap.get(normalized) ?? 0
        tagCountMap.set(normalized, current + 1)
      })
    })
    return Array.from(tagCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.name.localeCompare(b.name)
      })
  }, [projects])

  const filteredProjects = useMemo(() => {
    const term = workspaceSearchTerm.trim().replace(/^#/, '').toLowerCase()
    const selectedTags = workspaceSelectedTags.map((tag) => tag.replace(/^#/, '').toLowerCase())
    return projects.filter((project) => {
      const tags = project.tags ?? []
      const haystack = `${project.title ?? ''} ${project.description ?? ''} ${tags.join(' ')}`
      const matchesSearch = !term || haystack.toLowerCase().includes(term)
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((target) => tags.some((tag) => tag.toLowerCase() === target))
      return matchesSearch && matchesTags
    })
  }, [projects, workspaceSearchTerm, workspaceSelectedTags])

  const displayedTags = useMemo(() => {
    const term = tagFilterQuery.trim().toLowerCase()
    const filtered =
      term.length > 0
        ? tagStats.filter((entry) => entry.name.toLowerCase().includes(term))
        : tagStats
    return term.length > 0 ? filtered : filtered.slice(0, 10)
  }, [tagFilterQuery, tagStats])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Workspace</p>
          <p className="text-sm text-muted">AI 기반 자동 더빙으로 글로벌 콘텐츠를 만드세요.</p>
        </div>
        <div className="flex-shrink-0">
          <UploadCard />
        </div>
      </div>
      <section className="flex flex-1 flex-col space-y-10">
        <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-1.5">
          <div className="relative w-full md:pr-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              value={workspaceSearchTerm}
              onChange={(event) => setWorkspaceSearchTerm(event.target.value)}
              placeholder="제목, 설명, 태그 검색"
              className="h-11 rounded-full border-surface-3 bg-surface-1/80 py-2.5 pl-9 pr-28 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {workspaceSelectedTags.length > 0 ? (
              <div className="pointer-events-auto absolute right-3 top-1/2 hidden max-w-[55%] -translate-y-1/2 flex-wrap justify-end gap-2 pr-2 md:flex">
                {workspaceSelectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border-2 border-purple-500 bg-white/85 px-3 py-1 text-xs font-semibold text-purple-700 shadow-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      className="text-purple-600 transition hover:text-danger"
                      aria-label={`${tag} 필터 제거`}
                      onClick={() => toggleTagFilter(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-11 rounded-full gap-2 px-3 md:px-4"
                  aria-label="태그 필터 열기"
                >
                  <Filter className="h-4 w-4" />
                  필터
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>태그 필터</DropdownMenuLabel>
                <div className="px-2 pb-2">
                  <Input
                    value={tagFilterQuery}
                    onChange={(event) => setTagFilterQuery(event.target.value)}
                    placeholder="태그 검색"
                    className="h-9"
                  />
                  <p className="mt-1 text-[11px] text-muted">
                    최근/자주 사용 태그 기준으로 최대 10개 표시
                  </p>
                </div>
                {displayedTags.length === 0 ? (
                  <DropdownMenuItem disabled>해당되는 태그가 없습니다.</DropdownMenuItem>
                ) : (
                  displayedTags.map((entry) => {
                    const checked = workspaceSelectedTags.includes(entry.name)
                    return (
                      <DropdownMenuItem
                        key={entry.name}
                        className="justify-between"
                        onSelect={(event) => {
                          event.preventDefault()
                          toggleTagFilter(entry.name)
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleTagFilter(entry.name)}
                          />
                          #{entry.name}
                        </span>
                        <span className="text-[11px] text-muted">{entry.count}</span>
                      </DropdownMenuItem>
                    )
                  })
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    clearTagFilters()
                  }}
                >
                  필터 모두 해제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-3xl border border-surface-3 bg-surface-1 py-10">
            <Spinner />
            <span className="ml-3 text-sm text-muted">프로젝트 불러오는 중…</span>
          </div>
        ) : (
          <>
            <ProjectList
              projects={filteredProjects}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onTagClick={handleTagClick}
            />
          </>
        )}
      </section>
    </div>
  )
}
