import { useCallback, useEffect, useState } from 'react'

import { env } from '@/shared/config/env'

import type { UploadProgressState, UploadStage } from '../types'

interface UploadProgressEvent {
  job_id?: string
  stage?: 'downloading' | 'uploading' | 'finalizing' | 'done'
  status?: string
  progress?: number
  s3_key?: string
}

export const initialUploadProgressState: UploadProgressState = {
  stage: 'idle',
  progress: 0,
}

export const stageMessageMap: Record<UploadStage, string> = {
  idle: '대기 중',
  preparing: '업로드 준비 중',
  uploading: '영상 업로드 중',
  finalizing: '업로드 마무리 중',
  processing: '요청 처리 중',
  downloading: '콘텐츠 다운로드 중',
  done: '완료되었습니다.',
  error: '오류가 발생했습니다.',
}

const isUploadProgressEvent = (payload: unknown): payload is UploadProgressEvent => {
  if (typeof payload !== 'object' || payload === null) {
    return false
  }
  return true
}

const statusMessageMap: Record<string, string> = {
  queued: '순서를 기다리는 중',
  downloading: '콘텐츠 다운로드 중',
  uploaded: '업로드 완료',
  finished: '마무리 중',
  finalizing: '업로드 마무리 중',
  processing: '처리 중',
  done: '완료되었습니다.',
  error: '오류가 발생했습니다.',
}

const toLocalizedStatus = (status?: string) => {
  if (!status) return undefined
  return statusMessageMap[status.toLowerCase()] ?? status
}

type UseUploadProgressControllerOptions = {
  projectCreationOpen: boolean
  onComplete: () => void
}

export function useUploadProgressController({
  projectCreationOpen,
  onComplete,
}: UseUploadProgressControllerOptions) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>(
    initialUploadProgressState,
  )
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (!projectCreationOpen) {
      setUploadProgress(initialUploadProgressState)
      setActiveProjectId(null)
    }
  }, [projectCreationOpen])

  const updateProgress = useCallback((stage: UploadStage, progress: number, message?: string) => {
    setUploadProgress({
      stage,
      progress,
      message: message ?? stageMessageMap[stage],
    })
  }, [])

  const handleProgressError = useCallback((message?: string) => {
    setUploadProgress((prev) => ({
      stage: 'error',
      progress: prev.progress,
      message: message ?? '요청 처리 중 오류가 발생했습니다.',
    }))
  }, [])

  useEffect(() => {
    if (!projectCreationOpen || !activeProjectId) return

    const source = new EventSource(`${env.apiBaseUrl}/api/storage/${activeProjectId}/events`)

    source.addEventListener('progress', (event) => {
      try {
        const parsed = JSON.parse(event.data as string) as unknown
        if (!isUploadProgressEvent(parsed)) return

        setUploadProgress((prev) => {
          const nextStage =
            (parsed.stage as UploadStage | undefined) ??
            (prev.stage === 'idle' ? 'processing' : prev.stage)
          const isDone = parsed.stage === 'done'
          const nextProgress = typeof parsed.progress === 'number' ? parsed.progress : prev.progress
          const localizedStatus = toLocalizedStatus(parsed.status)
          return {
            stage: isDone ? 'done' : nextStage,
            progress: isDone ? 100 : nextProgress,
            message: localizedStatus ?? prev.message ?? stageMessageMap[nextStage],
          }
        })

        if (parsed.stage === 'done') {
          source.close()
          onComplete()
        }
      } catch (error) {
        console.error('Failed to parse SSE payload', error)
      }
    })

    source.onerror = (error) => {
      console.error('SSE connection error', error)
      handleProgressError('실시간 진행률 수신 중 문제가 발생했습니다.')
    }

    return () => {
      source.close()
    }
  }, [projectCreationOpen, activeProjectId, handleProgressError, onComplete])

  const startTrackingProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId)
  }, [])

  return {
    uploadProgress,
    updateProgress,
    handleProgressError,
    startTrackingProject,
  }
}
