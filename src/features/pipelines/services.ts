import { getApiUrl } from '@/config'
import { handleResponse } from '@/lib/http'
import type { PipelineState, PipelineEventPayload } from './types'

/**
 * 프로젝트의 현재 파이프라인 상태를 가져옵니다.
 */
export const fetchPipelineStatus = async (projectId: string) => {
  const res = await fetch(getApiUrl(`/api/pipeline/${projectId}/status`), {
    method: 'GET',
    credentials: 'include',
  })

  return handleResponse<PipelineState>(res)
}

/**
 * 파이프라인 단계 상태를 업데이트합니다.
 */
export const updatePipelineStage = async (
  projectId: string,
  stageId: string,
  status: 'pending' | 'processing' | 'review' | 'completed' | 'failed',
  progress?: number
) => {
  const res = await fetch(getApiUrl(`/api/pipeline/${projectId}/update`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      project_id: projectId,
      stage_id: stageId,
      status,
      progress,
    }),
  })

  return handleResponse(res)
}

/**
 * 파이프라인 업데이트 이벤트를 처리하기 위한 유틸 (단순 fetch는 아님, 참고용).
 */
export type PipelineEvent = PipelineEventPayload
