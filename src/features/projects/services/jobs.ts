import { getApiUrl } from '@/config'
import { handleResponse } from '@/lib/http'

export type JobStatus = 'queued' | 'in_progress' | 'done' | 'failed'

export interface JobStatusResponse {
  job_id: string
  project_id: string
  status: JobStatus
  result_key?: string | null
  error?: string | null
  metadata?: Record<string, unknown> | null
}

export interface SegmentRetranslateResponse {
  jobId: string
  segmentId: string
  segmentIndex: number
  status: JobStatus
}

export const requestSegmentRetranslate = async (
  projectId: string,
  segmentId: string,
  body: { text: string }
): Promise<SegmentRetranslateResponse> => {
  const res = await fetch(
    getApiUrl(
      `/api/editor/projects/${encodeURIComponent(projectId)}/segments/${encodeURIComponent(segmentId)}/retranslate`
    ),
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  const data = await handleResponse<{
    job_id: string
    segment_id: string
    segment_index: number
    status: JobStatus
  }>(res)

  return {
    jobId: data.job_id,
    segmentId: data.segment_id,
    segmentIndex: data.segment_index,
    status: data.status,
  }
}

export const fetchJobStatus = async (jobId: string) => {
  const res = await fetch(getApiUrl(`/api/jobs/${jobId}`), {
    method: 'GET',
    credentials: 'include',
  })

  return handleResponse<JobStatusResponse>(res)
}
