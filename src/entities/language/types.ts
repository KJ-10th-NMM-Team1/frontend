export interface Language {
  language_code: string
  name_ko: string
  name_en: string
}

export type LanguageResponse = Language[]
export interface LanguagePayload {
  code: string
  nameKo: string
  nameEn: string
}

export const sampleLanguages: Language[] = [
  { language_code: 'ko', name_ko: '한국어', name_en: 'Korean' },
  { language_code: 'en', name_ko: '영어', name_en: 'English' },
  { language_code: 'ja', name_ko: '일본어', name_en: 'Japanese' },
]
