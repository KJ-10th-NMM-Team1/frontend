/**
 * 프로젝트 진행도 상태별 메시지 상수
 */
export const PROGRESS_STATUS_MESSAGES = {
  pending: '대기 중',
  processing: '처리 중',
  completed: '완료',
  failed: '실패',
} as const

/**
 * 프로젝트 진행도 알림 메시지 상수
 */
export const NOTIFICATION_MESSAGES = {
  // 타겟 언어 작업 완료
  TARGET_COMPLETED: (projectTitle: string, languageDisplay: string, languageCode: string) =>
    `${projectTitle ?? '프로젝트'}의 ${languageDisplay}(${languageCode.toUpperCase()}) 작업이 완료되었습니다.`,

  // 프로젝트 전체 완료
  PROJECT_COMPLETED: (projectTitle: string) =>
    `${projectTitle}의 모든 언어 더빙 작업이 완료되었습니다.`,

  // 작업 실패
  TARGET_FAILED: (projectTitle: string, languageDisplay: string, languageCode: string) =>
    `${projectTitle}의 ${languageDisplay}(${languageCode.toUpperCase()}) 작업이 실패했습니다.`,

  // 작업 진행 중
  TARGET_PROCESSING: (languageDisplay: string) => `${languageDisplay} 더빙 작업이 진행 중입니다.`,
} as const

/**
 * 언어 코드를 표시 이름으로 변환
 */
export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  ko: '한국어',
  en: '영어',
  ja: '일본어',
  zh: '중국어',
  es: '스페인어',
  fr: '프랑스어',
  de: '독일어',
  pt: '포르투갈어',
  it: '이탈리아어',
  ru: '러시아어',
  ar: '아랍어',
  hi: '힌디어',
  th: '태국어',
  vi: '베트남어',
  id: '인도네시아어',
} as const

/**
 * 언어 코드를 표시 이름으로 변환하는 헬퍼 함수
 */
export function getLanguageDisplayName(languageCode: string): string {
  return LANGUAGE_DISPLAY_NAMES[languageCode.toLowerCase()] ?? languageCode.toUpperCase()
}
