export interface Language {
  code: string
  nameKo: string
  nameEn: string
}

export type LanguageResponse = {
  items: Language[]
}

export interface LanguagePayload {
  code: string
  nameKo: string
  nameEn: string
}

export const sampleLanguages: Language[] = [
  { code: 'ko', nameKo: '한국어', nameEn: 'Korean' },
  { code: 'en', nameKo: '영어', nameEn: 'English' },
  { code: 'ja', nameKo: '일본어', nameEn: 'Japanese' },
]
