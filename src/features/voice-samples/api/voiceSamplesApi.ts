import type {
  VoiceSample,
  VoiceSamplePayload,
  VoiceSamplesResponse,
} from '@/entities/voice-sample/types'
// import { apiClient } from '@/shared/api/client' // TODO: 실제 API 연결 시 사용

export function fetchVoiceSamples() {
  // TODO: 실제 API 엔드포인트로 교체 필요
  // return apiClient.get('api/voice-samples').json<VoiceSamplesResponse>()

  // 임시로 목 데이터 반환
  return {
    samples: [
      {
        id: '1',
        name: 'SunHi',
        type: 'Natural',
        attributes: 'Youth, Ads, Explainer, Audiobooks, Azure, Female',
        isPublic: true,
        isFavorite: true,
        provider: 'Azure',
      },
      {
        id: '2',
        name: 'InJoon',
        type: 'Natural',
        attributes: 'Middle-Aged, News, Explainer, E-learning, Azure',
        isPublic: true,
        isFavorite: true,
        provider: 'Azure',
      },
      {
        id: '3',
        name: 'Allison',
        type: 'Natural',
        attributes: 'Middle Aged, Energetic, Advertisement, Elevenlabs',
        isPublic: true,
        isFavorite: false,
        provider: 'Elevenlabs',
      },
      {
        id: '4',
        name: 'Ivy',
        type: 'Natural',
        attributes: 'Young, Confident, Social Media, Elevenlabs, Multilingual',
        isPublic: true,
        isFavorite: false,
        provider: 'Elevenlabs',
      },
      {
        id: '5',
        name: 'John Doe',
        type: 'Natural',
        attributes: 'Old, Deep, Voice Over, Elevenlabs, Multilingual',
        isPublic: true,
        isFavorite: false,
        provider: 'Elevenlabs',
      },
      {
        id: '6',
        name: 'Chill Brian',
        type: 'Natural',
        attributes: 'Formal, Narrative story, Middle-Aged, Elevenlabs',
        isPublic: true,
        isFavorite: false,
        provider: 'Elevenlabs',
      },
      {
        id: '7',
        name: 'Cassidy',
        type: 'Natural',
        attributes: 'Middle Aged, Crisp, Podcasts, Elevenlabs, Multilingual',
        isPublic: true,
        isFavorite: false,
        provider: 'Elevenlabs',
      },
      {
        id: '8',
        name: 'Ivy',
        type: 'Natural',
        attributes: 'Young, Confident, Social Media, Elevenlabs, Multilingual',
        isPublic: true,
        isFavorite: false,
        provider: 'Elevenlabs',
      },
    ] as VoiceSample[],
    total: 8,
  } as VoiceSamplesResponse
}

export function createVoiceSample(payload: VoiceSamplePayload) {
  // TODO: 실제 API 엔드포인트로 교체 필요
  // const formData = new FormData()
  // formData.append('name', payload.name)
  // if (payload.description) formData.append('description', payload.description)
  // formData.append('isPublic', String(payload.isPublic))
  // if (payload.audioFile) formData.append('audioFile', payload.audioFile)
  // if (payload.testText) formData.append('testText', payload.testText)
  // return apiClient.post('api/voice-samples', { body: formData }).json<VoiceSample>()

  // 임시로 목 데이터 반환
  return {
    id: Date.now().toString(),
    name: payload.name,
    description: payload.description,
    isPublic: payload.isPublic,
    isFavorite: false,
  } as VoiceSample
}

export function updateVoiceSample(id: string, payload: Partial<VoiceSamplePayload>) {
  // TODO: 실제 API 엔드포인트로 교체 필요
  // return apiClient.patch(`api/voice-samples/${id}`, { json: payload }).json<VoiceSample>()

  return {
    id,
    ...payload,
  } as VoiceSample
}

export function deleteVoiceSample(id: string) {
  // TODO: 실제 API 엔드포인트로 교체 필요
  // await apiClient.delete(`api/voice-samples/${id}`)
  return { id }
}

export function toggleFavorite(id: string, isFavorite: boolean) {
  // TODO: 실제 API 엔드포인트로 교체 필요
  // return apiClient.patch(`api/voice-samples/${id}/favorite`, { json: { isFavorite } }).json<VoiceSample>()

  return {
    id,
    isFavorite,
  } as Partial<VoiceSample>
}
