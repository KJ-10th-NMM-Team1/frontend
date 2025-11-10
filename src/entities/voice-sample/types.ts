export interface VoiceSample {
  id: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  previewUrl: string
}

export const sampleVoices: VoiceSample[] = [
  {
    id: 'voice-amy',
    name: 'Amy (KR)',
    language: 'Korean',
    gender: 'female',
    previewUrl: '/assets/sample-voice-amy.mp3',
  },
  {
    id: 'voice-hiro',
    name: 'Hiro (JP)',
    language: 'Japanese',
    gender: 'male',
    previewUrl: '/assets/sample-voice-hiro.mp3',
  },
  {
    id: 'voice-lee',
    name: 'Lee (Neutral)',
    language: 'English',
    gender: 'neutral',
    previewUrl: '/assets/sample-voice-lee.mp3',
  },
]
