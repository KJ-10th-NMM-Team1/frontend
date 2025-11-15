export interface Language {
  language_code: string
  name_ko: string
  name_en: string
  sort: number
}

export type LanguageResponse = Language[]
export interface LanguagePayload {
  code: string
  nameKo: string
  nameEn: string
}

export const sampleLanguages: Language[] = [
  { language_code: 'ko', name_ko: '한국어', name_en: 'Korean', sort: 0 },
  { language_code: 'en', name_ko: '영어', name_en: 'English', sort: 1 },
  { language_code: 'ja', name_ko: '일본어', name_en: 'Japanese', sort: 2 },
]
