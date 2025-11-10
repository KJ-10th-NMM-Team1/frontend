import { useEffect, useMemo, useState } from 'react'

import { Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useProjects } from '@/features/projects/hooks/useProjects'
import { ProjectCreationModal } from '@/features/projects/modals/ProjectCreationModal'
import { ProjectList } from '@/features/workspace/components/project-list/ProjectList'
import { UploadCard } from '@/features/workspace/components/upload-card/UploadCard'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useUiStore } from '@/shared/store/useUiStore'
import { Input } from '@/shared/ui/Input'
import { Spinner } from '@/shared/ui/Spinner'

const stepMap = {
  source: 'source',
  details: 'details',
} as const

// type WorkspaceSection = 'projects' | 'voice-samples' | 'glossary' | 'guide' | 'support'

export default function WorkspacePage() {
  const { data: projects = [], isLoading } = useProjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isModalOpen = useUiStore((state) => state.projectCreation.open)
  const modalStep = useUiStore((state) => state.projectCreation.step)
  const openProjectCreation = useUiStore((state) => state.openProjectCreation)
  const closeProjectCreation = useUiStore((state) => state.closeProjectCreation)

  const stepParam = searchParams.get('create')
  const derivedStep = stepParam ? stepMap[stepParam as keyof typeof stepMap] : null

  useEffect(() => {
    if (derivedStep) {
      openProjectCreation(derivedStep)
    }
  }, [derivedStep, openProjectCreation])

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
    const term = searchTerm.trim().toLowerCase()
    if (!term) return projects
    return projects.filter((project) => {
      const haystack = `${project.title} ${project.status} ${project.targetLanguages.join(' ')}`
      return haystack.toLowerCase().includes(term)
    })
  }, [projects, searchTerm])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-12 py-12">
      <section className="flex-1 space-y-10">
        <UploadCard />

        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="text-muted pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="에피소드 제목 · 언어 · 상태로 검색"
              className="h-14 rounded-[999px] pl-14 pr-6 text-base shadow-soft"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-xl font-semibold">내 에피소드</h2>
            <span className="text-muted text-xs">AI 더빙 진행률이 표시됩니다.</span>
          </div>

          {isLoading ? (
            <div className="border-surface-3 bg-surface-1 flex items-center justify-center rounded-3xl border py-10">
              <Spinner />
              <span className="text-muted ml-3 text-sm">프로젝트 불러오는 중…</span>
            </div>
          ) : (
            <ProjectList projects={filteredProjects} />
          )}
        </div>
      </section>
      <ProjectCreationModal />
    </div>
  )
}
