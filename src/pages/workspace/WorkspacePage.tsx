import { useEffect, useMemo, useCallback, useState } from 'react'

import { useNavigate, useSearchParams } from 'react-router-dom'

import type { ProjectSummary } from '@/entities/project/types'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { ExportDialog } from '@/features/projects/modals/ExportDialog'
import { useProjects, useDeleteProjectMutation } from '@/features/projects/hooks/useProjects'
import { useMux } from '@/features/editor/hooks/useMux'
import { useEditorState } from '@/features/editor/hooks/useEditorState'
import { ProjectList } from '@/features/workspace/components/project-list/ProjectList'
import { WorkspaceFilters } from '@/features/workspace/components/WorkspaceFilters'
import { UploadCard } from '@/features/workspace/components/upload-card/UploadCard'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useUiStore } from '@/shared/store/useUiStore'
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
    setWorkspaceSearchTerm('')
  }, [
    setWorkspaceSelectedTags,
    setWorkspaceSourceLanguageFilter,
    setWorkspaceTargetLanguageFilter,
    setWorkspaceSearchTerm,
  ])

  const handleExportProject = useCallback(
    (project: ProjectSummary) => {
      const targetLang = project.targets?.[0]?.language_code
      if (targetLang) {
        setExportProjectId(project.id)
        setExportLanguageCode(targetLang)
        setIsExportOpen(true)
      } else {
        showToast({
          title: '내보내기 실패',
          description: '번역 언어가 설정되지 않은 에피소드입니다.',
          variant: 'error',
        })
      }
    },
    [showToast],
  )

  // Editor data for mux (only fetch when export dialog is open)
  const { data: editorData } = useEditorState(exportProjectId || '', exportLanguageCode || '')

  // Mux functionality
  const { handleMux, isMuxing } = useMux({
    projectId: exportProjectId || '',
    editorData,
  })

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

  const hasActiveFilters =
    workspaceSearchTerm.trim().length > 0 ||
    workspaceSelectedTags.length > 0 ||
    !!workspaceSourceLanguageFilter ||
    !!workspaceTargetLanguageFilter

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
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-primary-container">더빙</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              에피소드를 검색하고 언어 필터를 적용해 관리하세요.
            </p>
          </div>
        </div>

        {/* Upload Card */}
        <UploadCard />

        {/* Projects Section */}
        <div className="space-y-6 pt-1">
          <WorkspaceFilters
            workspaceSearchTerm={workspaceSearchTerm}
            setWorkspaceSearchTerm={setWorkspaceSearchTerm}
            workspaceSourceLanguageFilter={workspaceSourceLanguageFilter}
            setWorkspaceSourceLanguageFilter={setWorkspaceSourceLanguageFilter}
            workspaceTargetLanguageFilter={workspaceTargetLanguageFilter}
            setWorkspaceTargetLanguageFilter={setWorkspaceTargetLanguageFilter}
            workspaceSelectedTags={workspaceSelectedTags}
            toggleTagFilter={toggleTagFilter}
            clearAllFilters={clearAllFilters}
            languages={languages}
            filteredTags={filteredTags}
            tagFilterQuery={tagFilterQuery}
            setTagFilterQuery={setTagFilterQuery}
          />

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
              isFilteredEmpty={filteredProjects.length === 0 && hasActiveFilters}
              onClearFilters={clearAllFilters}
              onCreate={() => openProjectCreation('source')}
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
          onMux={handleMux}
          isMuxing={isMuxing}
        />
      )}
    </div>
  )
}
