export interface Segment {
  id: string
  speakerTag: string
  start: number
  end: number
  sourceText: string
  targetText: string
  reviewing: boolean
}

export const sampleSegments: Segment[] = [
  {
    id: 'seg-001',
    speakerTag: 'Narrator',
    start: 0,
    end: 4.5,
    sourceText: 'Welcome to the future of localisation.',
    targetText: '현지화의 미래에 오신 것을 환영합니다.',
    reviewing: false,
  },
  {
    id: 'seg-002',
    speakerTag: 'Creator',
    start: 4.5,
    end: 9.2,
    sourceText: 'Automated dubbing keeps your voice authentic and global.',
    targetText: '자동 더빙으로 진짜 목소리를 전 세계에 전달하세요.',
    reviewing: true,
  },
  {
    id: 'seg-003',
    speakerTag: 'spk-01',
    start: 9.2,
    end: 14.1,
    sourceText: 'Assign translators, manage glossaries, and track progress in one place.',
    targetText: '번역가 지정, 용어집 관리, 진행 현황까지 한 곳에서 끝냅니다.',
    reviewing: false,
  },
]
