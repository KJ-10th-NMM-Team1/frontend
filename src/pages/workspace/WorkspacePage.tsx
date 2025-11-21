import { useEffect, useMemo, useCallback, useState } from 'react'

import { Filter, Search, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { ProjectSummary } from '@/entities/project/types'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { ExportDialog } from '@/features/projects/modals/ExportDialog'
import { useProjects, useDeleteProjectMutation } from '@/features/projects/hooks/useProjects'
import { ProjectList } from '@/features/workspace/components/project-list/ProjectList'
import { UploadCard } from '@/features/workspace/components/upload-card/UploadCard'
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
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [exportProjectId, setExportProjectId] = useState<string | null>(null)
  const [exportLanguageCode, setExportLanguageCode] = useState<string | null>(null)

  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const showToast = useUiStore((state) => state.showToast)
  const openProjectCreation = useUiStore((state) => state.openProjectCreation)
  const closeProjectCreation = useUiStore((state) => state.closeProjectCreation)
  const projectCreation = useUiStore((state) => state.projectCreation)
  const isModalOpen = projectCreation.open
  const modalStep = projectCreation.step
  const workspaceSourceLanguageFilter = useUiStore((state) => state.workspaceSourceLanguageFilter)
  const setWorkspaceSourceLanguageFilter = useUiStore(
    (state) => state.setWorkspaceSourceLanguageFilter,
  )
  const workspaceTargetLanguageFilter = useUiStore((state) => state.workspaceTargetLanguageFilter)
  const setWorkspaceTargetLanguageFilter = useUiStore(
    (state) => state.setWorkspaceTargetLanguageFilter,
  )

  const stepParam = searchParams.get('create')

  const { data: languages = [] } = useLanguage()

  const workspaceSearchTerm: string = useUiStore((state) => state.workspaceSearchTerm)
  const setWorkspaceSearchTerm: (value: string) => void = useUiStore(
    (state) => state.setWorkspaceSearchTerm,
  )
  const workspaceSelectedTags: string[] = useUiStore((state) => state.workspaceSelectedTags)
  const setWorkspaceSelectedTags: (value: string[]) => void = useUiStore(
    (state) => state.setWorkspaceSelectedTags,
  )

  useEffect(() => {
    if (stepParam) {
      const step = stepMap[stepParam as keyof typeof stepMap]
      if (step) {
        openProjectCreation(step)
      } else {
        // Invalid step param, remove it
        const next = new URLSearchParams(searchParams)
        next.delete('create')
        setSearchParams(next)
      }
    } else {
      closeProjectCreation()
    }
  }, [stepParam, openProjectCreation, closeProjectCreation, searchParams, setSearchParams])

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

  const clearAllFilters = useCallback(() => {
    setWorkspaceSelectedTags([])
    setTagFilterQuery('')
    setWorkspaceSourceLanguageFilter(null)
    setWorkspaceTargetLanguageFilter(null)
  }, [
    setWorkspaceSelectedTags,
    setWorkspaceSourceLanguageFilter,
    setWorkspaceTargetLanguageFilter,
  ])


  const handleExportProject = useCallback((project: ProjectSummary) => {
    const targetLang = project.targets?.[0]?.language_code
    if (targetLang) {
      setExportProjectId(project.id)
      setExportLanguageCode(targetLang)
      setIsExportOpen(true)
    } else {
      showToast({
        title: '내보내기 실패',
        description: '타겟 언어가 설정되지 않은 프로젝트입니다.',
        variant: 'error',
      })
    }
  }, [showToast])

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

  // 태그 통계 계산
  const tagStats = useMemo(() => {
    const stats = new Map<string, number>()
    projects.forEach((project) => {
      project.tags?.forEach((tag) => {
        const normalized = normalizeTag(tag)
        if (normalized) {
          stats.set(normalized, (stats.get(normalized) || 0) + 1)
        }
      })
    })
    return Array.from(stats.entries())
      .sort((a, b) => b[1] - a[1]) // 빈도수 내림차순 정렬
      .map(([tag, count]) => ({ tag, count }))
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

      const matchesSourceLang =
        !workspaceSourceLanguageFilter || project.source_language === workspaceSourceLanguageFilter

      const matchesTargetLang =
        !workspaceTargetLanguageFilter ||
        project.targets?.some((t) => t.language_code === workspaceTargetLanguageFilter)

      return matchesSearch && matchesTags && matchesSourceLang && matchesTargetLang
    })
  }, [
    projects,
    workspaceSearchTerm,
    workspaceSelectedTags,
    workspaceSourceLanguageFilter,
    workspaceTargetLanguageFilter,
  ])

  const filteredTags = useMemo(() => {
    const query = tagFilterQuery.trim().toLowerCase()
    return tagStats.filter(({ tag }) => tag.toLowerCase().includes(query))
  }, [tagStats, tagFilterQuery])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              내 워크스페이스
            </h1>
          </div>
        </div>

        {/* Upload Card */}
        <UploadCard />

        {/* Projects Section */}
        <div className="space-y-6 pt-1">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                placeholder="프로젝트 검색..."
                className="h-10 w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={workspaceSearchTerm}
                onChange={(e) => setWorkspaceSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 gap-1 rounded-full border-surface-3 px-3 py-1.5 text-xs font-medium"
                  aria-label="필터"
                >
                  <Filter className="h-3 w-3" />
                  필터
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                    {/* Language Filters Grid */}
                    <div className="grid grid-cols-2 gap-2 p-2">
                      {/* Source Language Section */}
                      <div>
                        <DropdownMenuLabel className="mb-0 px-2 text-xs font-medium text-gray-500">
                          원본 언어
                        </DropdownMenuLabel>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-full justify-between px-2 py-1 text-sm font-normal"
                            >
                              <span className="truncate">
                                {workspaceSourceLanguageFilter
                                  ? languages.find(
                                      (l) => l.language_code === workspaceSourceLanguageFilter,
                                    )?.name_ko || '선택됨'
                                  : '전체'}
                              </span>
                              <span className="text-muted-foreground ml-2 text-xs">▼</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="max-h-60 w-48 overflow-y-auto">
                            <DropdownMenuItem
                              onSelect={() => setWorkspaceSourceLanguageFilter(null)}
                            >
                              모든 언어
                            </DropdownMenuItem>
                            {languages.map((lang) => (
                              <DropdownMenuItem
                                key={lang.language_code}
                                onSelect={() =>
                                  setWorkspaceSourceLanguageFilter(lang.language_code)
                                }
                              >
                                {lang.name_ko}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Target Language Section */}
                      <div>
                        <DropdownMenuLabel className="mb-0 px-2 text-xs font-medium text-gray-500">
                          타겟 언어
                        </DropdownMenuLabel>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-full justify-between px-2 py-1 text-sm font-normal"
                            >
                              <span className="truncate">
                                {workspaceTargetLanguageFilter
                                  ? languages.find(
                                      (l) => l.language_code === workspaceTargetLanguageFilter,
                                    )?.name_ko || '선택됨'
                                  : '전체'}
                              </span>
                              <span className="text-muted-foreground ml-2 text-xs">▼</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="max-h-60 w-48 overflow-y-auto">
                            <DropdownMenuItem
                              onSelect={() => setWorkspaceTargetLanguageFilter(null)}
                            >
                              모든 언어
                            </DropdownMenuItem>
                            {languages.map((lang) => (
                              <DropdownMenuItem
                                key={lang.language_code}
                                onSelect={() =>
                                  setWorkspaceTargetLanguageFilter(lang.language_code)
                                }
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
                    <div className="p-2">
                      <DropdownMenuLabel className="mb-2 px-2 text-xs font-medium text-gray-500">
                        태그 검색
                      </DropdownMenuLabel>
                      <div className="px-2 pb-2">
                        <Input
                          placeholder="태그 검색..."
                          value={tagFilterQuery}
                          onChange={(e) => setTagFilterQuery(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredTags.length > 0 ? (
                          filteredTags.map(({ tag, count }) => (
                            <div
                              key={tag}
                              className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-100"
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
                                  <span className="text-muted-foreground text-xs">
                                    {count}
                                  </span>
                                </div>
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 text-center text-xs text-gray-500">
                            검색 결과가 없습니다
                          </div>
                        )}
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-xs text-gray-500 hover:text-gray-900"
                        onClick={clearAllFilters}
                      >
                        필터 초기화
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            {/* Active Filters */}
            {(workspaceSelectedTags.length > 0 ||
              workspaceSourceLanguageFilter ||
              workspaceTargetLanguageFilter) && (
              <div className="flex flex-wrap items-center gap-2">
                {workspaceSourceLanguageFilter && (
                  <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
                    원본: {languages.find((l) => l.language_code === workspaceSourceLanguageFilter)?.name_ko}
                    <button
                      type="button"
                      onClick={() => setWorkspaceSourceLanguageFilter(null)}
                      className="hover:text-primary/80 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {workspaceTargetLanguageFilter && (
                  <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
                    타겟: {languages.find((l) => l.language_code === workspaceTargetLanguageFilter)?.name_ko}
                    <button
                      type="button"
                      onClick={() => setWorkspaceTargetLanguageFilter(null)}
                      className="hover:text-primary/80 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {workspaceSelectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => toggleTagFilter(tag)}
                      className="hover:text-primary/80 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-900"
                >
                  모두 지우기
                </Button>
              </div>
            )}
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <ProjectList
                projects={filteredProjects}
                onExport={handleExportProject}
                onDelete={handleDeleteProject}
                onTagClick={handleTagClick}
              />
            )}
          </div>
      </main>

      {exportProjectId && exportLanguageCode && (
        <ExportDialog
          open={isExportOpen}
          onOpenChange={setIsExportOpen}
          projectId={exportProjectId}
          languageCode={exportLanguageCode}
        />
      )}
    </div>
  )
}
