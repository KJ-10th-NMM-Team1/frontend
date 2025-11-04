import { getApiUrl } from '@/config'
import { handleResponse } from '@/lib/http'
import {
  type CreateProjectPayload,
  type CreateProjectResponse,
  type FinUploadPayload,
  type FinishUploadResponse,
} from '../types/createProject'

export const getPresignedUrl = async (p: CreateProjectPayload) => {
  const res = await fetch(getApiUrl('/api/storage/prepare-upload'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      filename: p.videoFile.name,
      content_type: p.videoFile.type,
      owner_code: p.ownerCode,
    }),
  })

  return handleResponse<CreateProjectResponse>(res)
}

export const uploadFile = async (upload_url: string, formData: FormData) => {
  const s3Response = await fetch(upload_url, {
    method: 'POST',
    body: formData,
    credentials: 'omit',
  })

  if (!s3Response.ok) {
    throw new Error(await s3Response.text())
  }
}

export const finishUpload = async (p: FinUploadPayload) => {
  const res = await fetch(getApiUrl('/api/storage/finish-upload'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      object_key: p.object_key,
      project_id: p.project_id,
      owner_code: p.ownerCode,
    }),
  })

  return handleResponse<FinishUploadResponse>(res)
}
