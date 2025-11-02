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

export const fetchJobStatus = async (jobId: string) => {
  const res = await fetch(getApiUrl(`/api/jobs/${jobId}`), {
    method: 'GET',
    credentials: 'include',
  })

  return handleResponse<JobStatusResponse>(res)
}
