import { useEffect, useRef } from 'react'

import { env } from '@/shared/config/env'
import { useSegmentsStore } from '@/shared/store/useSegmentsStore'
import { useUiStore } from '@/shared/store/useUiStore'

interface SegmentUpdateEvent {
  type: 'segment_update'
  project_id: string
  segment_index: number
  segment_id: string
  language_code: string
  target_text: string
  audio_url: string
  timestamp: string
}

const isSegmentUpdateEvent = (payload: unknown): payload is SegmentUpdateEvent => {
  if (typeof payload !== 'object' || payload === null) {
    return false
  }
  const obj = payload as Record<string, unknown>
  return (
    obj.type === 'segment_update' &&
    typeof obj.project_id === 'string' &&
    typeof obj.segment_index === 'number' &&
    typeof obj.segment_id === 'string' &&
    typeof obj.language_code === 'string' &&
    typeof obj.target_text === 'string' &&
    typeof obj.audio_url === 'string'
  )
}

type UseSegmentUpdateListenerOptions = {
  projectId: string
  languageCode: string
  enabled?: boolean
}

export function useSegmentUpdateListener({
  projectId,
  languageCode,
  enabled = true,
}: UseSegmentUpdateListenerOptions) {
  const updateSegment = useSegmentsStore((state) => state.updateSegment)
  const showToast = useUiStore((state) => state.showToast)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled || !projectId) {
      return
    }

    // SSE 연결
    const source = new EventSource(`${env.apiBaseUrl}/api/pipeline/${projectId}/events`)

    // 'stage' 이벤트로 받기 (백엔드에서 event: "stage"로 보냄)
    source.addEventListener('stage', (event) => {
      try {
        const parsed = JSON.parse(event.data as string) as unknown

        if (!isSegmentUpdateEvent(parsed)) {
          return
        }

        // language_code가 일치하는 경우에만 업데이트
        if (parsed.language_code !== languageCode) {
          return
        }

        // 세그먼트 업데이트
        // segment_id를 id로 사용하여 세그먼트 찾기
        updateSegment(parsed.segment_id, {
          target_text: parsed.target_text,
          segment_audio_url: parsed.audio_url,
        })

        // 성공 토스트 표시 (선택적)
        showToast({
          title: '세그먼트 오디오 업데이트 완료',
          description: `세그먼트 #${parsed.segment_index + 1}의 오디오가 업데이트되었습니다.`,
          autoDismiss: 3000,
        })
      } catch (error) {
        console.error('Failed to parse segment update event:', error)
      }
    })

    // 'message' 이벤트도 처리 (다른 이벤트 타입 대비)
    source.addEventListener('message', (event) => {
      try {
        const parsed = JSON.parse(event.data as string) as unknown

        if (!isSegmentUpdateEvent(parsed)) {
          return
        }

        // language_code가 일치하는 경우에만 업데이트
        if (parsed.language_code !== languageCode) {
          return
        }

        // 세그먼트 업데이트
        updateSegment(parsed.segment_id, {
          target_text: parsed.target_text,
          segment_audio_url: parsed.audio_url,
        })

        showToast({
          title: '세그먼트 오디오 업데이트 완료',
          description: `세그먼트 #${parsed.segment_index + 1}의 오디오가 업데이트되었습니다.`,
          autoDismiss: 3000,
        })
      } catch (error) {
        console.error('Failed to parse segment update event:', error)
      }
    })

    source.onerror = (error) => {
      console.error('SSE connection error for segment updates:', error)
      // 에러 발생 시 재연결을 위해 연결을 닫고 다시 열 수 있음
      // 여기서는 로깅만 하고 연결은 유지
    }

    eventSourceRef.current = source

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [enabled, projectId, languageCode, updateSegment, showToast])
}

