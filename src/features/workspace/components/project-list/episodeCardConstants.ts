import type { Language } from '@/entities/language/types'

export const EMPTY_LANGUAGES: Language[] = []

export const GRADIENTS = [
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-purple-500 via-indigo-500 to-sky-500',
  'from-rose-400 via-orange-400 to-amber-400',
] as const

export const DAY_IN_MS = 1000 * 60 * 60 * 24

export const LANGUAGE_COUNTRY_MAP: Record<string, string> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  zh: 'CN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
}

/**
 * 상태 레이블 타입 (UI 표시용)
 */
export type StatusLabel = '대기' | '처리중' | '완료' | '실패'

/**
 * 상태 레이블별 스타일 클래스
 */
export const STATUS_CLASS_MAP: Record<StatusLabel, string> = {
  대기: 'bg-amber-200 text-amber-900',
  처리중: 'bg-sky-200 text-sky-900',
  완료: 'bg-emerald-200 text-emerald-900',
  실패: 'bg-rose-200 text-rose-900',
}

/**
 * 프로젝트 Stage → 표시 레이블
 * (서버에서 워커 stage 값을 그대로 전달)
 *
 * 매핑 규칙:
 * - starting, *_started, 진행 중인 stage → '처리중'
 * - done, completed, *_completed → '완료'
 * - failed → '실패'
 * - 그 외 알 수 없는 값 → '처리중' (기본값)
 */
export const PROJECT_STAGE_LABELS: Record<string, StatusLabel> = {
  // 시작/대기
  starting: '처리중',
  pending: '대기',

  // 업로드
  upload: '처리중',
  uploading: '처리중',
  uploaded: '처리중',

  // 음성 인식
  vad: '처리중',
  asr_started: '처리중',
  asr_completed: '처리중',
  stt: '처리중',

  // 번역
  translation_started: '처리중',
  translation_completed: '처리중',
  mt: '처리중',

  // RAG
  rag: '처리중',

  // 화자 매핑
  voice_mapping: '처리중',

  // TTS
  tts_started: '처리중',
  tts_completed: '처리중',
  tts: '처리중',

  // 패키징
  packaging: '처리중',
  outputs: '처리중',

  // 동기화
  sync_started: '처리중',
  sync_completed: '처리중',

  // 비디오 합성
  mux_started: '처리중',
  mux_completed: '처리중',

  // 완료
  done: '완료',
  completed: '완료',

  // 실패
  failed: '실패',
  error: '실패',

  // 레거시 (이전 코드 호환)
  processing: '처리중',
  editing: '처리중',
}

/**
 * 타겟 언어별 상태 → 표시 레이블
 * (Enum: pending, processing, completed, failed)
 */
export const TARGET_STATUS_LABELS: Record<string, StatusLabel> = {
  pending: '대기',
  processing: '처리중',
  completed: '완료',
  failed: '실패',
}

/**
 * Stage별 진행도 매핑
 * 다음 단계의 진행도 직전까지 스무스하게 증가시키기 위함
 */
export const STAGE_PROGRESS_MAP: Record<string, number> = {
  starting: 1,
  asr_started: 5,
  asr_completed: 20,
  translation_started: 21,
  translation_completed: 35,
  tts_started: 36,
  tts_completed: 85,
  // segment_tts_completed/failed는 progress 업데이트 없음
  mux_started: 86,
  done: 100,
  failed: 0,
}
