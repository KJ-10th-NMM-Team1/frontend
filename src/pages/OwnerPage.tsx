import { ProcessingDashboard } from '@/components/ProcessingDashboard'
import { ProjectCard } from '@/components/ProjectCard'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal'
import { useCreateProjectModal } from '@/features/projects/hooks/useCreateProjectModal'
import { fetchProjectsByOwner } from '@/features/projects/services/projects'
import { finishUpload, getPresignedUrl, uploadFile } from '@/features/projects/services/upload'
import { useAuth } from '@/hooks/useAuth'
import TranslatorManagementPage from '@/pages/TranslatorManagementPage'
import type { Project } from '@/types'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function OwnerPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'translators'>('projects')
  const { user } = useAuth()
  const ownerCode = user?.code ?? ''
  const loadProjects = useCallback(async () => {
    const list = await fetchProjectsByOwner()
    setProjects(list)
  }, [])

  useEffect(() => {
    if (!ownerCode) return
    void loadProjects()
  }, [ownerCode, loadProjects])

  const createProjectModal = useCreateProjectModal({
    onSubmit: async (p) => {
      try {
        const { upload_url, fields, object_key, project_id } = await getPresignedUrl(p)

        const formData = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value)
        })
        formData.append('file', p.videoFile)

        await uploadFile(upload_url, formData)
        await finishUpload({ object_key, project_id, ownerCode })
        await loadProjects()
        toast.success('프로젝트 업로드 완료')
      } catch (error) {
        toast.error('업로드 중 오류가 발생했습니다.')
        throw error // 모달 상태를 유지하거나 에러 처리를 계속하려면 필요에 따라 재던지기
      }
    },
  })
  const { ownerCode: formOwnerCode, setOwnerCode: setFormOwnerCode } = createProjectModal.form
  useEffect(() => {
    if (ownerCode && ownerCode !== formOwnerCode) {
      setFormOwnerCode(ownerCode)
    }
  }, [ownerCode, formOwnerCode, setFormOwnerCode])

  if (selectedProject) {
    return (
      <ProcessingDashboard
        project={selectedProject}
        onBack={async () => {
          await loadProjects()
          setSelectedProject(null)
        }}
        onUpdateProject={(updated) => {
          setProjects((prev) =>
            prev.map((project) => (project.id === updated.id ? updated : project))
          )
          setSelectedProject(updated)
        }}
      />
    )
  }

  const handleOpenCreateProject = () => {
    if (!user) {
      toast.error('로그인 후 이용 가능합니다.')
      return
    }
    createProjectModal.open()
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'projects' | 'translators')}
      >
        <TabsList className="w-fit">
          <TabsTrigger value="projects" className="flex-1">
            프로젝트 관리
          </TabsTrigger>
          <TabsTrigger value="translators" className="flex-1">
            번역가 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleOpenCreateProject} className="gap-2">
              <Plus className="h-4 w-4" />새 프로젝트
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)} // 사용자가 클릭할 때 액션
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="translators" className="space-y-6">
          <TranslatorManagementPage />
        </TabsContent>
      </Tabs>
      <CreateProjectModal
        isOpen={createProjectModal.isOpen}
        onClose={createProjectModal.close}
        form={createProjectModal.form}
        onSubmit={createProjectModal.submit}
      />
      <Toaster />
    </div>
  )
}
