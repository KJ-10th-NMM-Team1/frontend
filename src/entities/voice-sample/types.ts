export interface VoiceSample {
  id: string
  name: string
  description?: string
  type?: string
  attributes?: string
  language?: string
  gender?: 'male' | 'female' | 'neutral'
  previewUrl?: string
  isPublic: boolean
  isFavorite: boolean
  provider?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface VoiceSamplePayload {
  name: string
  description?: string
  isPublic: boolean
  audioFile?: File
  testText?: string
}

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
    isFavorite: false,
  },
  {
    id: 'voice-hiro',
    name: 'Hiro (JP)',
    language: 'Japanese',
    gender: 'male',
    previewUrl: '/assets/sample-voice-hiro.mp3',
    isPublic: true,
    isFavorite: false,
  },
  {
    id: 'voice-lee',
    name: 'Lee (Neutral)',
    language: 'English',
    gender: 'neutral',
    previewUrl: '/assets/sample-voice-lee.mp3',
    isPublic: true,
    isFavorite: false,
  },
]
