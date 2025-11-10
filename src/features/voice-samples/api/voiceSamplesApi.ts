import type {
  VoiceSample,
  VoiceSampleApiResponse,
  VoiceSamplePayload,
  VoiceSamplesApiResponse,
  VoiceSamplesResponse,
} from '@/entities/voice-sample/types'
import { apiClient, apiGet, apiPost } from '@/shared/api/client'
// import { apiClient } from '@/shared/api/client' // TODO: 실제 API 연결 시 사용

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
    createdAt: apiSample.created_at,
    owner_id: apiSample.owner_id,
  }
}

// 음성 샘플 목록 조회
export async function fetchVoiceSamples(): Promise<VoiceSamplesResponse> {
  const response = await apiGet<VoiceSamplesApiResponse>('api/voice-samples')
  return {
    samples: response.samples.map(transformVoiceSample),
    total: response.total,
  }
}

// 업로드 준비 (presigned URL 받기)
export interface PrepareUploadPayload {
  filename: string
  content_type: string
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
}

export async function finishVoiceSampleUpload(payload: FinishUploadPayload): Promise<VoiceSample> {
  const response = await apiPost<VoiceSampleApiResponse>('api/voice-samples/finish-upload', payload)
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

// export function fetchVoiceSamples() {
//   // TODO: 실제 API 엔드포인트로 교체 필요
//   // return apiClient.get('api/voice-samples').json<VoiceSamplesResponse>()

//   // 임시로 목 데이터 반환
//   return {
//     samples: [
//       {
//         id: '1',
//         name: 'SunHi',
//         type: 'Natural',
//         attributes: 'Youth, Ads, Explainer, Audiobooks, Azure, Female',
//         isPublic: true,
//         isFavorite: true,
//         provider: 'Azure',
//       },
//       {
//         id: '2',
//         name: 'InJoon',
//         type: 'Natural',
//         attributes: 'Middle-Aged, News, Explainer, E-learning, Azure',
//         isPublic: true,
//         isFavorite: true,
//         provider: 'Azure',
//       },
//       {
//         id: '3',
//         name: 'Allison',
//         type: 'Natural',
//         attributes: 'Middle Aged, Energetic, Advertisement, Elevenlabs',
//         isPublic: true,
//         isFavorite: false,
//         provider: 'Elevenlabs',
//       },
//       {
//         id: '4',
//         name: 'Ivy',
//         type: 'Natural',
//         attributes: 'Young, Confident, Social Media, Elevenlabs, Multilingual',
//         isPublic: true,
//         isFavorite: false,
//         provider: 'Elevenlabs',
//       },
//       {
//         id: '5',
//         name: 'John Doe',
//         type: 'Natural',
//         attributes: 'Old, Deep, Voice Over, Elevenlabs, Multilingual',
//         isPublic: true,
//         isFavorite: false,
//         provider: 'Elevenlabs',
//       },
//       {
//         id: '6',
//         name: 'Chill Brian',
//         type: 'Natural',
//         attributes: 'Formal, Narrative story, Middle-Aged, Elevenlabs',
//         isPublic: true,
//         isFavorite: false,
//         provider: 'Elevenlabs',
//       },
//       {
//         id: '7',
//         name: 'Cassidy',
//         type: 'Natural',
//         attributes: 'Middle Aged, Crisp, Podcasts, Elevenlabs, Multilingual',
//         isPublic: true,
//         isFavorite: false,
//         provider: 'Elevenlabs',
//       },
//       {
//         id: '8',
//         name: 'Ivy',
//         type: 'Natural',
//         attributes: 'Young, Confident, Social Media, Elevenlabs, Multilingual',
//         isPublic: true,
//         isFavorite: false,
//         provider: 'Elevenlabs',
//       },
//     ] as VoiceSample[],
//     total: 8,
//   } as VoiceSamplesResponse
// }

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

export function updateVoiceSample(
  id: string,
  payload: Partial<VoiceSamplePayload>,
): Promise<VoiceSample> {
  // TODO: 실제 API 엔드포인트로 교체 필요
  // return apiClient.patch(`api/voice-samples/${id}`, { json: payload }).json<VoiceSample>()

  return Promise.resolve({
    id,
    ...payload,
  } as VoiceSample)
}

export function deleteVoiceSample(id: string): Promise<{ id: string }> {
  // TODO: 실제 API 엔드포인트로 교체 필요
  // await apiClient.delete(`api/voice-samples/${id}`)
  return Promise.resolve({ id })
}

export function toggleFavorite(id: string, isFavorite: boolean): Promise<Partial<VoiceSample>> {
  // TODO: 실제 API 엔드포인트로 교체 필요
  // return apiClient.patch(`api/voice-samples/${id}/favorite`, { json: { isFavorite } }).json<VoiceSample>()

  return Promise.resolve({
    id,
    isFavorite,
  } as Partial<VoiceSample>)
}
