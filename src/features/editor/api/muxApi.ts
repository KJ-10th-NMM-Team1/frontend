import { apiPost } from '@/shared/api/client'

export type MuxRequest = {
  project_id: string
  job_id: string
  video_key: string
  background_audio_key: string
  segments: Array<{
    start: number
    end: number
    audio_file: string
  }>
  output_prefix?: string
}

export type MuxResponse = {
  success: boolean
  result_key?: string
  audio_key?: string
  message?: string
}

export async function createMux(payload: MuxRequest): Promise<MuxResponse> {
  return apiPost<MuxResponse>('api/mux/', payload)
}
