// 백엔드 API 응답 타입 (snake_case)
// 백엔드에서 _id로 오지만 sample_id로 alias되어 있음
export interface VoiceSampleApiResponse {
  _id?: string // 실제 응답에서는 _id로 올 수 있음
  sample_id?: string // alias로 sample_id로도 올 수 있음
  owner_id: string
  name: string
  description?: string | null
  is_public: boolean
  file_path_wav: string
  audio_sample_url?: string | null
  prompt_text?: string | null
  created_at: string
  is_in_my_voices: boolean
  added_count: number
  category?: string | null
  is_default: boolean
  country?: string | null
  gender?: string | null
  avatar_image_url?: string | null
  avatar_image_path?: string | null
}

// 프론트엔드에서 사용하는 타입 (camelCase)
export interface VoiceSample {
  id: string
  name: string
  description?: string
  type?: string
  attributes?: string
  language?: string
  gender?: 'male' | 'female' | 'neutral'
  previewUrl?: string
  audio_sample_url?: string
  file_path_wav?: string
  prompt_text?: string
  isPublic: boolean
  isInMyVoices: boolean
  addedCount: number
  category?: string
  isDefault: boolean
  country?: string
  avatarImageUrl?: string
  avatarImagePath?: string
  provider?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  owner_id?: string
}

export interface VoiceSamplePayload {
  name: string
  description?: string
  isPublic: boolean
  audioFile?: File
  testText?: string
}

// 백엔드 API 응답 타입
export interface VoiceSamplesApiResponse {
  samples: VoiceSampleApiResponse[]
  total: number
}

// 프론트엔드에서 사용하는 타입
export interface VoiceSamplesResponse {
  samples: VoiceSample[]
  total: number
}

export const sampleVoices: VoiceSample[] = [
  {
    id: 'voice-amy',
    name: 'Amy (KR)',
    language: 'Korean',
    gender: 'female',
    previewUrl: '/assets/sample-voice-amy.mp3',
    isPublic: true,
    isInMyVoices: false,
    addedCount: 0,
    isDefault: false,
  },
  {
    id: 'voice-hiro',
    name: 'Hiro (JP)',
    language: 'Japanese',
    gender: 'male',
    previewUrl: '/assets/sample-voice-hiro.mp3',
    isPublic: true,
    isInMyVoices: false,
    addedCount: 0,
    isDefault: false,
  },
  {
    id: 'voice-lee',
    name: 'Lee (Neutral)',
    language: 'English',
    gender: 'neutral',
    previewUrl: '/assets/sample-voice-lee.mp3',
    isPublic: true,
    isInMyVoices: false,
    addedCount: 0,
    isDefault: false,
  },
]
