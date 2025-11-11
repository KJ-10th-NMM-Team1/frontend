import type {
  FinishUploadPayload,
  FinishUploadResponse,
  PrepareUploadPayload,
  PrepareUploadResponse,
  RegisterYoutubeSourcePayload,
  RegisterYoutubeSourceResponse,
} from '@/entities/project/types'
import { apiClient } from '@/shared/api/client'

export async function prepareFileUpload(payload: PrepareUploadPayload) {
  return apiClient
    .post('api/storage/prepare-upload', {
      json: {
        project_id: payload.projectId,
        filename: payload.fileName,
        content_type: payload.contentType,
      },
    })
    .json<PrepareUploadResponse>()
}

export async function registerYoutubeSource(payload: RegisterYoutubeSourcePayload) {
  return apiClient
    .post('api/storage/register-source', {
      json: {
        project_id: payload.projectId,
        youtube_url: payload.youtubeUrl,
      },
    })
    .json<RegisterYoutubeSourceResponse>()
}

export async function finalizeUpload(payload: FinishUploadPayload) {
  return apiClient
    .post('api/storage/finish-upload', {
      json: {
        project_id: payload.projectId,
        object_key: payload.objectKey,
      },
    })
    .json<FinishUploadResponse>()
}

type UploadFileParams = {
  uploadUrl: string
  file: File
  fields?: Record<string, string>
}

export async function uploadFile({ uploadUrl, file, fields }: UploadFileParams) {
  const formData = new FormData()
  if (fields) {
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }
  formData.append('file', file)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
    credentials: 'omit',
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }
}

// export async function getPresignedUrl(s3key: string) {
//   return apiClient.get(`api/storage/media/${s3key}`).json<{ url: string }>()
// }
