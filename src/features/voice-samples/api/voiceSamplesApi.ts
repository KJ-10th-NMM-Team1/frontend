import type {
  VoiceSample,
  VoiceSampleApiResponse,
  VoiceSamplePayload,
  VoiceSamplesApiResponse,
  VoiceSamplesResponse,
} from '@/entities/voice-sample/types'
import { apiClient, apiGet, apiPost } from '@/shared/api/client'

// 백엔드 응답을 프론트엔드 타입으로 변환
function transformVoiceSample(apiSample: VoiceSampleApiResponse): VoiceSample {
  // sample_id 또는 _id를 문자열로 변환 (ObjectId일 수 있음)
  // 백엔드에서 _id로 오거나 sample_id로 alias되어 올 수 있음
  const sampleId = String(apiSample.sample_id || apiSample._id || '')
  if (!sampleId || sampleId === 'undefined' || sampleId === 'null') {
    console.error('음성 샘플 ID가 없습니다:', apiSample)
  }
  return {
    id: sampleId,
    name: apiSample.name,
    description: apiSample.description || undefined,
    isPublic: apiSample.is_public,
    isFavorite: apiSample.is_favorite,
    file_path_wav: apiSample.file_path_wav,
    audio_sample_url: apiSample.audio_sample_url || undefined,
    prompt_text: apiSample.prompt_text || undefined,
    createdAt: apiSample.created_at,
    owner_id: apiSample.owner_id ? String(apiSample.owner_id) : undefined,
    favoriteCount: apiSample.favorite_count ?? 0,
    country: apiSample.country ?? undefined,
    gender: apiSample.gender ?? undefined,
    avatarImageUrl: apiSample.avatar_image_url ?? undefined,
    avatarImagePath: apiSample.avatar_image_path ?? apiSample.avatar_image_url ?? undefined,
  }
}

// 음성 샘플 목록 조회
export async function fetchVoiceSamples(options?: {
  favoritesOnly?: boolean
  mySamplesOnly?: boolean
  q?: string
}): Promise<VoiceSamplesResponse> {
  const params = new URLSearchParams()
  if (options?.favoritesOnly) {
    params.append('favorites_only', 'true')
  }
  if (options?.mySamplesOnly) {
    params.append('my_samples_only', 'true')
  }
  if (options?.q) {
    params.append('q', options.q)
  }

  const queryString = params.toString()
  const url = queryString ? `api/voice-samples?${queryString}` : 'api/voice-samples'
  const response = await apiGet<VoiceSamplesApiResponse>(url)
  return {
    samples: response.samples.map(transformVoiceSample),
    total: response.total,
  }
}

// 업로드 준비 (presigned URL 받기)
export interface PrepareUploadPayload {
  filename: string
  content_type: string
  country?: string
}

export interface PrepareUploadResponse {
  upload_url: string
  fields: Record<string, string>
  object_key: string
}

export async function prepareVoiceSampleUpload(payload: PrepareUploadPayload) {
  return apiClient
    .post('api/voice-samples/prepare-upload', {
      json: payload,
    })
    .json<PrepareUploadResponse>()
}

// 업로드 완료 (DB 저장)
export interface FinishUploadPayload {
  name: string
  description?: string
  is_public: boolean
  object_key: string
  country?: string
  gender?: string
}

export async function finishVoiceSampleUpload(payload: FinishUploadPayload): Promise<VoiceSample> {
  const response = await apiPost<VoiceSampleApiResponse>('api/voice-samples/finish-upload', payload)
  return transformVoiceSample(response)
}

export interface PrepareAvatarUploadPayload {
  filename: string
  content_type: string
}

export interface PrepareAvatarUploadResponse {
  upload_url: string
  fields: Record<string, string>
  object_key: string
}

export async function prepareVoiceSampleAvatarUpload(
  sampleId: string,
  payload: PrepareAvatarUploadPayload,
) {
  return apiClient
    .post(`api/voice-samples/${sampleId}/avatar/prepare-upload`, { json: payload })
    .json<PrepareAvatarUploadResponse>()
}

export async function finalizeVoiceSampleAvatarUpload(
  sampleId: string,
  payload: { object_key: string },
): Promise<VoiceSample> {
  const response = await apiClient
    .post(`api/voice-samples/${sampleId}/avatar`, { json: payload })
    .json<VoiceSampleApiResponse>()
  return transformVoiceSample(response)
}

// S3에 파일 업로드
type UploadFileParams = {
  uploadUrl: string
  file: File
  fields?: Record<string, string>
}

export async function uploadVoiceSampleFile({ uploadUrl, file, fields }: UploadFileParams) {
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

export function createVoiceSample(payload: VoiceSamplePayload): Promise<VoiceSample> {
  // TODO: 실제 API 엔드포인트로 교체 필요
  // const formData = new FormData()
  // formData.append('name', payload.name)
  // if (payload.description) formData.append('description', payload.description)
  // formData.append('isPublic', String(payload.isPublic))
  // if (payload.audioFile) formData.append('audioFile', payload.audioFile)
  // if (payload.testText) formData.append('testText', payload.testText)
  // return apiClient.post('api/voice-samples', { body: formData }).json<VoiceSample>()

  // 임시로 목 데이터 반환 (Promise로 래핑)
  return Promise.resolve({
    id: Date.now().toString(),
    name: payload.name,
    description: payload.description,
    isPublic: payload.isPublic,
    isFavorite: false,
  } as VoiceSample)
}

export async function updateVoiceSample(
  id: string,
  payload: Partial<VoiceSamplePayload>,
): Promise<VoiceSample> {
  const response = await apiClient
    .put(`api/voice-samples/${id}`, {
      json: {
        name: payload.name,
        description: payload.description,
        is_public: payload.isPublic,
      },
    })
    .json<VoiceSampleApiResponse>()
  return transformVoiceSample(response)
}

export async function deleteVoiceSample(id: string): Promise<{ id: string }> {
  await apiClient.delete(`api/voice-samples/${id}`)
  return { id }
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<VoiceSample> {
  // isFavorite가 true면 좋아요 추가 (POST), false면 좋아요 제거 (DELETE)
  if (isFavorite) {
    // 좋아요 추가
    await apiClient.post(`api/me/favorites/voice-samples/${id}`)
  } else {
    // 좋아요 제거
    await apiClient.delete(`api/me/favorites/voice-samples/${id}`)
  }

  // 업데이트된 샘플 정보를 가져오기 위해 목록을 다시 조회하거나,
  // 개별 샘플을 조회할 수 있습니다. 여기서는 목록 갱신을 위해 빈 객체 반환
  // (실제로는 쿼리 무효화로 목록이 자동 갱신됨)
  return {
    id,
    isFavorite,
  } as VoiceSample
}
