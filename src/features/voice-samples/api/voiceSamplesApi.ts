import type {
  VoiceSample,
  VoiceSampleApiResponse,
  VoiceSamplePayload,
  VoiceSamplesApiResponse,
  VoiceSamplesResponse,
} from '@/entities/voice-sample/types'
import { apiClient, apiGet, apiPost } from '@/shared/api/client'

import { getPresetAvatarUrl } from '../components/voiceSampleFieldUtils'

// 백엔드 응답을 프론트엔드 타입으로 변환
function transformVoiceSample(apiSample: VoiceSampleApiResponse): VoiceSample {
  // sample_id 또는 _id를 문자열로 변환 (ObjectId일 수 있음)
  // 백엔드에서 _id로 오거나 sample_id로 alias되어 올 수 있음
  const sampleId = String(apiSample.sample_id || apiSample._id || '')
  if (!sampleId || sampleId === 'undefined' || sampleId === 'null') {
    console.error('목소리 ID가 없습니다:', apiSample)
  }
  const categories = Array.isArray(apiSample.category)
    ? apiSample.category.filter(Boolean)
    : apiSample.category
      ? [apiSample.category].filter(Boolean)
      : undefined
  const isBuiltin =
    apiSample.is_builtin ?? (apiSample as unknown as { is_default?: boolean }).is_default ?? false
  const avatarPreset =
    (apiSample as unknown as { avatar_preset?: string }).avatar_preset ?? undefined
  const presetUrl = getPresetAvatarUrl(avatarPreset)

  return {
    id: sampleId,
    name: apiSample.name,
    description: apiSample.description || undefined,
    isPublic: apiSample.is_public,
    isInMyVoices: apiSample.is_in_my_voices,
    addedCount: apiSample.added_count,
    category: categories,
    isBuiltin,
    file_path_wav: apiSample.file_path_wav,
    audio_sample_url: apiSample.audio_sample_url || undefined,
    prompt_text: apiSample.prompt_text || undefined,
    createdAt: apiSample.created_at,
    owner_id: apiSample.owner_id ? String(apiSample.owner_id) : undefined,
    country: apiSample.country ?? undefined,
    gender: (apiSample.gender as 'male' | 'female' | 'neutral') ?? undefined,
    avatarImageUrl: presetUrl ?? apiSample.avatar_image_url ?? undefined,
    avatarImagePath: apiSample.avatar_image_path ?? apiSample.avatar_image_url ?? undefined,
    avatarPreset,
    age: apiSample.age ?? undefined,
    accent: apiSample.accent ?? undefined,
    tags: apiSample.tags ?? undefined,
    licenseCode: (apiSample as unknown as { license_code?: string }).license_code ?? undefined,
    canCommercialUse:
      (apiSample as unknown as { can_commercial_use?: boolean }).can_commercial_use ?? undefined,
    isDeletable: (apiSample as unknown as { is_deletable?: boolean }).is_deletable ?? undefined,
  }
}

// 음성 샘플 목록 조회
export async function fetchVoiceSamples(options?: {
  myVoicesOnly?: boolean
  mySamplesOnly?: boolean
  category?: string | string[]
  isBuiltin?: boolean
  languages?: string[]
  tags?: string[]
  q?: string
  page?: number
  limit?: number
}): Promise<VoiceSamplesResponse> {
  const params = new URLSearchParams()
  if (options?.myVoicesOnly) {
    params.append('my_voices_only', 'true')
  }
  if (options?.mySamplesOnly) {
    params.append('my_samples_only', 'true')
  }
  if (options?.category) {
    const categories = Array.isArray(options.category) ? options.category : [options.category]
    categories.forEach((category) => {
      params.append('category', category)
    })
  }
  if (options?.isBuiltin !== undefined) {
    params.append('is_builtin', String(options.isBuiltin))
  }
  if (options?.languages && options.languages.length > 0) {
    options.languages.forEach((lang) => {
      params.append('languages', lang)
    })
  }
  if (options?.tags && options.tags.length > 0) {
    options.tags.forEach((tag) => {
      params.append('tags', tag)
    })
  }
  if (options?.q) {
    params.append('q', options.q)
  }
  if (options?.page) {
    params.append('page', String(options.page))
  }
  if (options?.limit) {
    params.append('limit', String(options.limit))
  }

  const queryString = params.toString()
  const url = queryString ? `api/voice-samples?${queryString}` : 'api/voice-samples'
  const response = await apiGet<VoiceSamplesApiResponse>(url)
  return {
    samples: response.samples.map(transformVoiceSample),
    total: response.total,
  }
}

export async function fetchVoiceSample(id: string): Promise<VoiceSample> {
  const response = await apiGet<VoiceSampleApiResponse>(`api/voice-samples/${id}`)
  return transformVoiceSample(response)
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
  category?: string[]
  is_builtin?: boolean
  tags?: string[]
  avatar_preset?: string
  license_code?: string
  can_commercial_use?: boolean
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
    isInMyVoices: false,
    addedCount: 0,
    isBuiltin: false,
  } as VoiceSample)
}

export async function updateVoiceSample(
  id: string,
  payload: {
    name?: string
    description?: string
    country?: string
    category?: string[]
    tags?: string[]
    avatar_preset?: string
    license_code?: string
    can_commercial_use?: boolean
    is_public?: boolean
  },
): Promise<VoiceSample> {
  const response = await apiClient
    .put(`api/voice-samples/${id}`, {
      json: {
        name: payload.name,
        description: payload.description,
        country: payload.country,
        category: payload.category,
        tags: payload.tags,
        avatar_preset: payload.avatar_preset,
        license_code: payload.license_code,
        can_commercial_use: payload.can_commercial_use,
        is_public: payload.is_public,
      },
    })
    .json<VoiceSampleApiResponse>()
  return transformVoiceSample(response)
}

export async function deleteVoiceSample(id: string): Promise<{ id: string }> {
  await apiClient.delete(`api/voice-samples/${id}`)
  return { id }
}

// 보이스를 내 라이브러리에 추가
export async function addToMyVoices(id: string): Promise<void> {
  await apiClient.post(`api/me/voices/${id}`)
}

// 내 라이브러리에서 보이스 제거
export async function removeFromMyVoices(id: string): Promise<void> {
  await apiClient.delete(`api/me/voices/${id}`)
}

// 내가 추가한 보이스 목록 조회
export async function getMyVoices(options?: {
  page?: number
  limit?: number
}): Promise<VoiceSamplesResponse> {
  const params = new URLSearchParams()
  if (options?.page) {
    params.append('page', String(options.page))
  }
  if (options?.limit) {
    params.append('limit', String(options.limit))
  }

  const queryString = params.toString()
  const url = queryString ? `api/me/voices?${queryString}` : 'api/me/voices'
  const response = await apiGet<VoiceSamplesApiResponse>(url)
  return {
    samples: response.samples.map(transformVoiceSample),
    total: response.total,
  }
}
