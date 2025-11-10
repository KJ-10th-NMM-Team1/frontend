export interface GlossaryItem {
  id: string
  term: string
  definition: string
  context: string
  language: string
}

export interface Glossary {
  id: string
  name: string
  language: string
  items: GlossaryItem[]
}

export const sampleGlossaries: Glossary[] = [
  {
    id: 'glossary-ai',
    name: 'AI Suite Glossary',
    language: 'Korean',
    items: [
      {
        id: 'term-001',
        term: 'Voice Cloning',
        definition: '기계 학습으로 음성을 복제하여 새로운 문장을 생성하는 기술',
        context: '제품 소개 영상',
        language: 'Korean',
      },
      {
        id: 'term-002',
        term: 'Dubbing Pipeline',
        definition: '원본 업로드부터 배포까지의 자동화된 더빙 워크플로',
        context: '내부 교육',
        language: 'Korean',
      },
    ],
  },
]
