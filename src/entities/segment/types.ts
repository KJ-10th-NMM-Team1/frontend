// export interface Segment {
//   id: string
//   speakerId: string
//   speakerName: string
//   start: number
//   end: number
//   originalText: string
//   translatedText: string
//   reviewing: boolean
// }

export interface Segment {
  id: string            // `_id` → `id`로 변환하려면 응답에서 매핑하거나 여기서 alias 처리
  project_id: string
  language_code: string
  speaker_tag?: string
  start: number
  end: number
  source_text: string
  target_text?: string
  segment_audio_url?: string
}

export interface EditorPlaybackState {
  duration: number
  active_language: string
  playback_rate: number
  video_source: string
}

export interface EditorState {
  projectId: string
  segments: Segment[]
  playback: EditorPlaybackState
  // voices?: VoiceSample[]
  // glossaries?: Glossary[]
}

export const sampleSegments: Segment[] = [
  {
    id: 'seg-001',
    speakerId: 'spk-001',
    speakerName: 'Narrator',
    start: 0,
    end: 4.5,
    originalText: 'Welcome to the future of localisation.',
    translatedText:  '현지화의 미래에 오신 것을 환영합니다.',
    reviewing: false,
  },
  {
    id: 'seg-002',
    speakerId: 'spk-002',
    speakerName: 'Creator',
    start: 4.5,
    end: 9.2,
    originalText: 'Automated dubbing keeps your voice authentic and global.',
    translatedText: '자동 더빙으로 진짜 목소리를 전 세계에 전달하세요.',
    reviewing: true,
  },
  {
    id: 'seg-003',
    speakerId: 'spk-003',
    speakerName: 'Speaker 01',
    start: 9.2,
    end: 14.1,
    originalText: 'Assign translators, manage glossaries, and track progress in one place.',
    translatedText: '번역가 지정, 용어집 관리, 진행 현황까지 한 곳에서 끝냅니다.',
    reviewing: false,
  },
]
