import { apiClient } from '@/shared/api/client'

/**
 * Fixed 오디오 생성 요청 페이로드
 * - 세그먼트의 시작/끝/길이 정보 필요
 * - 트랙에 적용된 샘플 ID 필요
 */
export type GenerateFixedAudioPayload = {
  segmentId: string
  voiceSampleId: string
  start: number // 세그먼트 시작 시간 (초)
  end: number // 세그먼트 종료 시간 (초)
  duration: number // 세그먼트 길이 (초)
}

/**
 * Dynamic 오디오 생성 요청 페이로드
 * - 트랙에 적용된 샘플 ID만 필요
 */
export type GenerateDynamicAudioPayload = {
  segmentId: string
  voiceSampleId: string
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
 * Fixed duration 오디오 생성 API 호출
 * - 지정된 구간의 발화 길이를 유지하며 오디오 생성
 *
 * @param payload - 세그먼트 정보 및 음성 샘플 ID
 * @returns API 응답 (워커 큐잉 확인)
 */
export async function generateFixedAudio(
  payload: GenerateFixedAudioPayload,
): Promise<AudioGenerationResponse> {
  return apiClient
    .post('api/audio/generate/fixed', {
      json: {
        segment_id: payload.segmentId,
        voice_sample_id: payload.voiceSampleId,
        start: payload.start,
        end: payload.end,
        duration: payload.duration,
      },
    })
    .json<AudioGenerationResponse>()
}

/**
 * Dynamic duration 오디오 생성 API 호출
 * - 텍스트에 맞게 길이를 자동 조절하여 오디오 생성
 *
 * @param payload - 세그먼트 ID 및 음성 샘플 ID
 * @returns API 응답 (워커 큐잉 확인)
 */
export async function generateDynamicAudio(
  payload: GenerateDynamicAudioPayload,
): Promise<AudioGenerationResponse> {
  return apiClient
    .post('api/audio/generate/dynamic', {
      json: {
        segment_id: payload.segmentId,
        voice_sample_id: payload.voiceSampleId,
      },
    })
    .json<AudioGenerationResponse>()
}
