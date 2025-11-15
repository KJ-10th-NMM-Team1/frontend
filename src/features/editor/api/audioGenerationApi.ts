import { apiClient } from '@/shared/api/client'

/**
 * TTS 재생성 요청 페이로드
 * - Fixed/Dynamic 모두 동일한 엔드포인트 사용
 * - mod 필드로 고정/동적 길이 구분
 */
export type RegenerateTTSPayload = {
  projectId: string // URL 경로에 사용
  segmentId: string
  translatedText: string // TTS 생성에 사용할 번역된 텍스트
  start: number // 세그먼트 시작 시간 (초)
  end: number // 세그먼트 종료 시간 (초)
  targetLang: string // 타겟 언어 코드 (예: 'ko', 'en')
  mod: 'fixed' | 'dynamic' // fixed: 고정 길이, dynamic: 동적 길이
  voiceSampleId?: string // 음성 샘플 ID (선택사항)
}

/**
 * 오디오 생성 API 응답
 * - 즉시 완료되지 않고 워커 큐에 추가됨
 * - SSE를 통해 완료 이벤트 수신
 */
export type AudioGenerationResponse = {
  success: boolean
  message: string
  segmentId: string
}

/**
 * 세그먼트 TTS 재생성 API 호출
 * - Fixed/Dynamic 모드를 mod 파라미터로 구분
 * - 백엔드 워커 큐에 작업 추가 후 SSE로 완료 알림
 *
 * @param payload - TTS 재생성 요청 정보
 * @returns API 응답 (워커 큐잉 확인)
 */
export async function regenerateSegmentTTS(
  payload: RegenerateTTSPayload,
): Promise<AudioGenerationResponse> {
  const requestBody: Record<string, unknown> = {
    segment_id: payload.segmentId,
    translated_text: payload.translatedText,
    start: payload.start,
    end: payload.end,
    target_lang: payload.targetLang,
    mod: payload.mod,
  }

  // voiceSampleId가 있을 때만 포함
  if (payload.voiceSampleId) {
    requestBody.voice_sample_id = payload.voiceSampleId
  }

  return apiClient
    .post(`api/projects/${payload.projectId}/segments/regenerate-tts`, {
      json: requestBody,
    })
    .json<AudioGenerationResponse>()
}
