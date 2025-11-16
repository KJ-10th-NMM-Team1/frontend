import { useEffect, useMemo, useCallback } from 'react'

import { useNavigate, useSearchParams } from 'react-router-dom'

import type { ProjectSummary } from '@/entities/project/types'
import { useProjects, useDeleteProjectMutation } from '@/features/projects/hooks/useProjects'
import { ProjectCreationModal } from '@/features/projects/modals/ProjectCreationModal'
import { ProjectList } from '@/features/workspace/components/project-list/ProjectList'
import { UploadCard } from '@/features/workspace/components/upload-card/UploadCard'
import { routes } from '@/shared/config/routes'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useUiStore } from '@/shared/store/useUiStore'
import { Spinner } from '@/shared/ui/Spinner'

const stepMap = {
  source: 'source',
  details: 'details',
} as const

// type WorkspaceSection = 'projects' | 'voice-samples' | 'glossary' | 'guide' | 'support'

export default function WorkspacePage() {
  const { data: projects = [], isLoading } = useProjects()
  const deleteProjectMutation = useDeleteProjectMutation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isModalOpen = useUiStore((state) => state.projectCreation.open)
  const modalStep = useUiStore((state) => state.projectCreation.step)
  const openProjectCreation = useUiStore((state) => state.openProjectCreation)
  const closeProjectCreation = useUiStore((state) => state.closeProjectCreation)
  const showToast = useUiStore((state) => state.showToast)
  const workspaceSearchTerm = useUiStore((state) => state.workspaceSearchTerm)

  const stepParam = searchParams.get('create')
  const derivedStep = stepParam ? stepMap[stepParam as keyof typeof stepMap] : null

  useEffect(() => {
    if (derivedStep) {
      openProjectCreation(derivedStep)
    }
  }, [derivedStep, openProjectCreation])

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

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (!isModalOpen) {
        next.delete('create')
      } else {
        const currentKey = Object.entries(stepMap).find(([, value]) => value === modalStep)?.[0]
        if (currentKey) {
          next.set('create', currentKey)
        }
      }
      return next
    })
  }, [isModalOpen, modalStep, setSearchParams])

  useEffect(() => {
    if (!stepParam) {
      closeProjectCreation()
    }
  }, [stepParam, closeProjectCreation])

  const filteredProjects = useMemo(() => {
    const term = workspaceSearchTerm.trim().toLowerCase()
    return projects.filter((project) => {
      const haystack = `${project.title} ${project.status}`
      const matchesSearch = !term || haystack.toLowerCase().includes(term)
      return matchesSearch
    })
  }, [projects, workspaceSearchTerm])

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
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">Workspace</p>
          <h1 className="text-foreground text-3xl font-bold">Workspace</h1>
          <p className="text-muted text-sm">AI 기반 자동 더빙으로 글로벌 콘텐츠를 만드세요.</p>
        </div>
        <div className="flex-shrink-0">
          <UploadCard />
        </div>
      </div>
      <section className="flex flex-1 flex-col space-y-10">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
          </div>

          {isLoading ? (
            <div className="border-surface-3 bg-surface-1 flex items-center justify-center rounded-3xl border py-10">
              <Spinner />
              <span className="text-muted ml-3 text-sm">프로젝트 불러오는 중…</span>
            </div>
          ) : (
            <ProjectList
              projects={filteredProjects}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
            />
          )}
        </div>
      </section>
      <ProjectCreationModal />
    </div>
  )
}
