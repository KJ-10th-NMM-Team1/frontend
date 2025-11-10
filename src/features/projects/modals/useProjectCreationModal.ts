import { useCallback, useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { uploadFile } from '@/features/projects/api/storageApi'
import { useCreateProjectMutation } from '@/features/projects/hooks/useProjects'
import {
  useFinalizeUploadMutation,
  usePrepareUploadMutation,
  useRegisterYoutubeSourceMutation,
} from '@/features/projects/hooks/useProjectStorage'
import { queryKeys } from '@/shared/config/queryKeys'
import { trackEvent } from '@/shared/lib/analytics'
import { useUiStore } from '@/shared/store/useUiStore'

import { useUploadProgressController } from './hooks/useUploadProgressController'
import type { AutoDubbingSettingsValues } from './steps/AutoDubbingSettingsStep'
import type { ProjectCreationDraft, SourceSelectionResult } from './types'

const createInitialDraft = (): ProjectCreationDraft => ({
  sourceType: 'file',
  title: '',
  detectAutomatically: true,
  sourceLanguage: '한국어',
  targetLanguages: [],
  speakerCount: 2,
})

export function useProjectCreationModal() {
  const { projectCreation, closeProjectCreation, setProjectCreationStep } = useUiStore((state) => ({
    projectCreation: state.projectCreation,
    closeProjectCreation: state.closeProjectCreation,
    setProjectCreationStep: state.setProjectCreationStep,
  }))

  const createProjectMutation = useCreateProjectMutation()
  const prepareUploadMutation = usePrepareUploadMutation()
  const finalizeUploadMutation = useFinalizeUploadMutation()
  const registerYoutubeSourceMutation = useRegisterYoutubeSourceMutation()
  const queryClient = useQueryClient()

  const [draft, setDraft] = useState<ProjectCreationDraft>(() => createInitialDraft())

  useEffect(() => {
    if (!projectCreation.open) {
      setDraft(createInitialDraft())
    }
  }, [projectCreation.open])

  const isSourceStep = projectCreation.step === 'source'
  const isDetailsStep = projectCreation.step === 'details'

  const recentUploadSummary = useMemo(() => {
    if (!draft.fileName) return null
    const sizeMb = draft.fileSize ? (draft.fileSize / (1024 * 1024)).toFixed(1) : '0'
    return `${draft.fileName} • ${sizeMb}MB`
  }, [draft.fileName, draft.fileSize])

  const showToast = useUiStore((state) => state.showToast)
  const finishCreation = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    setTimeout(() => {
      closeProjectCreation()
      showToast({
        id: 'example-create-success',
        title: '프로젝트 생성 완료',
        autoDismiss: 2500,
      })
    }, 400)
  }, [closeProjectCreation, showToast, queryClient])
  const { uploadProgress, updateProgress, handleProgressError, startTrackingProject } =
    useUploadProgressController({
      projectCreationOpen: projectCreation.open,
      onComplete: finishCreation,
    })

  const handleFileUpload = async (projectId: string, file: File) => {
    try {
      updateProgress('preparing', 10)
      const { upload_url, fields, object_key } = await prepareUploadMutation.mutateAsync({
        projectId,
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
      })

      updateProgress('uploading', 35)
      await uploadFile({
        uploadUrl: upload_url,
        fields,
        file,
      })

      updateProgress('finalizing', 85)
      await finalizeUploadMutation.mutateAsync({
        projectId,
        objectKey: object_key,
      })

      updateProgress('done', 100)
      finishCreation()
    } catch (error) {
      console.error('Failed to upload file', error)
      handleProgressError('파일 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.')
      showToast({
        id: 'example-create-error',
        title: '프로젝트 생성 실패',
        description: '업로드 중 오류가 발생했습니다.',
      })
    }
  }

  const handleRegisterYoutube = async (projectId: string, draft: ProjectCreationDraft) => {
    try {
      updateProgress('processing', 1, 'YouTube 링크 확인 중...')
      // Job만 큐잉함
      await registerYoutubeSourceMutation.mutateAsync({
        projectId,
        youtubeUrl: draft.youtubeUrl as string,
      })
      updateProgress('processing', 5, 'YouTube 콘텐츠를 불러오는 중...')
    } catch (error) {
      console.error('Failed to register YouTube source', error)
      handleProgressError('YouTube 소스 등록에 실패했습니다.')
      showToast({
        id: 'example-create-error',
        title: '프로젝트 생성 실패',
        description: 'YouTube 링크를 다시 확인한 뒤 재시도해주세요.',
      })
    }
  }

  const handleSourceSubmit = (values: SourceSelectionResult) => {
    setDraft((prev) => ({
      ...prev,
      sourceType: values.mode,
      youtubeUrl: values.mode === 'youtube' ? values.youtubeUrl : undefined,
      file: values.mode === 'file' ? values.file : undefined,
      fileName: values.mode === 'file' ? (values.file?.name ?? prev.fileName) : undefined,
      fileSize: values.mode === 'file' ? (values.file?.size ?? prev.fileSize) : undefined,
    }))

    trackEvent('proj_source_ready', { mode: values.mode })
    setProjectCreationStep('details')
  }

  const handleDetailsSubmit = (values: AutoDubbingSettingsValues) => {
    const nextDraft: ProjectCreationDraft = {
      ...draft,
      title: values.title,
      detectAutomatically: values.detectAutomatically,
      sourceLanguage: values.sourceLanguage,
      targetLanguages: values.targetLanguages,
      speakerCount: values.speakerCount,
    }
    setDraft(nextDraft)

    updateProgress('processing', 0)
    createProjectMutation.mutate(
      { ...nextDraft, owner_code: 'temp' },
      {
        onSuccess(project) {
          const projectId = project.project_id
          if (nextDraft.sourceType === 'file') {
            if (!nextDraft.file) return
            void handleFileUpload(projectId, nextDraft.file)
          } else if (nextDraft.sourceType === 'youtube') {
            startTrackingProject(projectId)
            void handleRegisterYoutube(projectId, nextDraft)
          }
        },
      },
    )

    trackEvent('proj_creation_complete', {
      title: values.title,
      targets: values.targetLanguages,
    })
  }

  const handleBackToSource = () => setProjectCreationStep('source')

  return {
    uploadProgress,
    projectCreation,
    closeProjectCreation,
    isSourceStep,
    isDetailsStep,
    draft,
    recentUploadSummary,
    handleSourceSubmit,
    handleDetailsSubmit,
    handleBackToSource,
  }
}
