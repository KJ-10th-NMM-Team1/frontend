import { useEffect, useMemo, useState } from 'react'
import { CreateProjectModal } from './components/CreateProjectModal'
import { ProjectCard } from './components/ProjectCard'
import { ProcessingDashboard } from './components/ProcessingDashboard'
import { Button } from './components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select'
import {
  TranslatorAssignments,
  type TranslatorAssignment,
} from './components/TranslatorAssignments'
import { TranslatorEditorShell } from './components/TranslatorEditorShell'
import { Plus, Video } from 'lucide-react'
import { Toaster } from './components/ui/sonner'
import type { Language, Project } from './types'

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'owner' | 'translator'>('owner')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'product_demo_final.mp4',
      languages: [
        {
          code: 'en',
          name: 'English',
          subtitle: true,
          dubbing: true,
          progress: 100,
          status: 'completed',
          translator: 'Emily Carter',
        },
        {
          code: 'ja',
          name: '日本語',
          subtitle: true,
          dubbing: false,
          progress: 100,
          status: 'completed',
          translator: 'Aiko Tanaka',
        },
      ],
      status: 'completed',
      uploadProgress: 100,
      createdAt: '2025-10-24 14:30',
    },
    {
      id: '2',
      name: 'tutorial_video.mp4',
      languages: [
        {
          code: 'ko',
          name: '한국어',
          subtitle: true,
          dubbing: true,
          progress: 72,
          status: 'processing',
        },
        {
          code: 'zh',
          name: '中文',
          subtitle: true,
          dubbing: true,
          progress: 45,
          status: 'review',
        },
      ],
      status: 'processing',
      uploadProgress: 67,
      createdAt: '2025-10-26 09:15',
    },
  ])
  const translatorNames = useMemo(() => {
    const names = new Set<string>()
    projects.forEach((project) => {
      project.languages.forEach((lang) => {
        if (lang.translator) {
          names.add(lang.translator)
        }
      })
    })
    return Array.from(names)
  }, [projects])
  const [selectedTranslator, setSelectedTranslator] = useState<string>(
    () => translatorNames[0] ?? ''
  )
  useEffect(() => {
    if (translatorNames.length === 0) {
      setSelectedTranslator('')
    } else if (!translatorNames.includes(selectedTranslator)) {
      setSelectedTranslator(translatorNames[0])
    }
  }, [translatorNames, selectedTranslator])
  const translatorAssignments = useMemo<TranslatorAssignment[]>(
    () =>
      projects.flatMap((project) =>
        project.languages
          .filter((lang) => lang.translator === selectedTranslator)
          .map((lang) => ({
            projectId: project.id,
            projectName: project.name,
            languageCode: lang.code,
            languageName: lang.name,
            status: lang.status,
            progress: lang.progress,
            translator: lang.translator ?? '',
            isDubbing: lang.dubbing,
          }))
      ),
    [projects, selectedTranslator]
  )
  const [activeTranslatorAssignment, setActiveTranslatorAssignment] =
    useState<TranslatorAssignment | null>(null)
  useEffect(() => {
    if (
      activeTranslatorAssignment &&
      activeTranslatorAssignment.translator !== selectedTranslator
    ) {
      setActiveTranslatorAssignment(null)
    }
  }, [activeTranslatorAssignment, selectedTranslator])

  const handleCreateProject = (projectData: {
    name: string
    languages: Language[]
    uploadProgress: number
  }) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectData.name,
      languages: projectData.languages,
      status: 'uploading',
      uploadProgress: projectData.uploadProgress,
      createdAt: new Date()
        .toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(/\. /g, '-')
        .replace('.', ''),
    }

    setProjects([newProject, ...projects])

    // 업로드 완료 후 처리 단계로 전환 시뮬레이션
    setTimeout(() => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === newProject.id ? { ...p, status: 'processing', uploadProgress: 0 } : p
        )
      )

      // 처리 진행률 시뮬레이션
      let progress = 0
      const processingInterval = setInterval(() => {
        progress += 15
        if (progress >= 100) {
          clearInterval(processingInterval)
          setProjects((prev) =>
            prev.map((p) =>
              p.id === newProject.id
                ? {
                    ...p,
                    status: 'completed',
                    uploadProgress: 100,
                    languages: p.languages.map((lang) => ({
                      ...lang,
                      progress: 100,
                      status: 'completed',
                    })),
                  }
                : p
            )
          )
        } else {
          setProjects((prev) =>
            prev.map((p) =>
              p.id === newProject.id
                ? {
                    ...p,
                    uploadProgress: progress,
                    languages: p.languages.map((lang) => ({
                      ...lang,
                      progress: progress,
                      status: 'processing',
                    })),
                  }
                : p
            )
          )
        }
      }, 1000)
    }, 2000)
  }

  const handleProjectUpdate = (updated: Project) => {
    setProjects((prev) => prev.map((project) => (project.id === updated.id ? updated : project)))
    setSelectedProject(updated)
  }

  if (activeTranslatorAssignment) {
    return (
      <TranslatorEditorShell
        assignment={activeTranslatorAssignment}
        onBack={() => setActiveTranslatorAssignment(null)}
      />
    )
  }

  if (selectedProject && viewMode === 'owner') {
    return (
      <>
        <ProcessingDashboard
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onUpdateProject={handleProjectUpdate}
        />
        <Toaster />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1>Video Dubbing Studio</h1>
                <p className="text-xs text-gray-500">AI 기반 영상 자동 더빙 솔루션</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'owner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('owner')
                  setSelectedProject(null)
                }}
              >
                배급자 모드
              </Button>
              <Button
                variant={viewMode === 'translator' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('translator')
                  setSelectedProject(null)
                }}
              >
                번역가 모드
              </Button>
              {viewMode === 'owner' && (
                <Button onClick={() => setIsModalOpen(true)} className="gap-2 ">
                  <Plus />새 프로젝트
                </Button>
              )}
            </div>
          </div>

          {viewMode === 'translator' && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                담당 번역가별로 할당된 작업을 확인하고 편집할 수 있습니다.
              </p>
              {translatorNames.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">번역가 선택</span>
                  <Select value={selectedTranslator} onValueChange={setSelectedTranslator}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="번역가 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {translatorNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-xs text-gray-500">아직 번역가에게 할당된 작업이 없습니다.</p>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2>프로젝트</h2>
          <p className="text-sm text-gray-500">총 {projects.length}개의 프로젝트</p>
        </div>

        {viewMode === 'owner' ? (
          projects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="mb-2">프로젝트가 없습니다</h3>
              <p className="text-sm text-gray-500 mb-6">
                첫 번째 프로젝트를 생성하여 영상 더빙을 시작하세요
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />새 프로젝트 만들기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={viewMode === 'owner' ? () => setSelectedProject(project) : undefined}
                />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-6">
            <TranslatorAssignments
              assignments={translatorAssignments}
              onOpenAssignment={setActiveTranslatorAssignment}
            />
          </div>
        )}
      </main>

      <CreateProjectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreateProject={handleCreateProject}
      />
      <Toaster />
    </div>
  )
}
