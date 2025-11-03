import { ProcessingDashboard } from '@/components/ProcessingDashboard'
import { ProjectCard } from '@/components/ProjectCard'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal'
import { useCreateProjectModal } from '@/features/projects/hooks/useCreateProjectModal'
import { fetchProjects } from '@/features/projects/services/projects'
import { finishUpload, getPresignedUrl, uploadFile } from '@/features/projects/services/upload'
import type { Project } from '@/types'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function OwnerPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      const list = await fetchProjects()
      setProjects(list)
      return list
    } catch (err) {
      console.error('프로젝트 조회 실패', err)
      throw err
    }
  }, [])

  useEffect(() => {
    loadProjects().catch(() => {
      // 이미 콘솔에 에러 로그 출력됨
    })
  }, [loadProjects])

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
        await finishUpload({ object_key, project_id })
        await loadProjects()
        toast.success('프로젝트 업로드 완료')
      } catch (error) {
        toast.error('업로드 중 오류가 발생했습니다.')
        throw error // 모달 상태를 유지하거나 에러 처리를 계속하려면 필요에 따라 재던지기
      }
    },
  })

  if (selectedProject) {
    return (
      <ProcessingDashboard
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onUpdateProject={(updated) => {
          setProjects((prev) =>
            prev.map((project) => (project.id === updated.id ? updated : project))
          )
          setSelectedProject(updated)
        }}
      />
    )
  }

  return (
    <div>
      {/* 헤더, 버튼 등 기존 JSX */}
      <div className="flex justify-end mb-6">
        <Button onClick={createProjectModal.open} className="gap-2">
          새 프로젝트
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => setSelectedProject(project)} // 사용자가 클릭할 때 액션
          />
        ))}
      </div>
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
