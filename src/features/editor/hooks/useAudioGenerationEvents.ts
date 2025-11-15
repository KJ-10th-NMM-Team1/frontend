import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { Segment } from '@/entities/segment/types'
import { queryKeys } from '@/shared/config/queryKeys'
import { env } from '@/shared/config/env'
import { useEditorStore } from '@/shared/store/useEditorStore'

type AudioGenerationEvent = {
  segmentId: string
  audioS3Key: string
  status: 'completed' | 'failed'
  error?: string
}

/**
 * SSE를 통해 오디오 생성 이벤트를 구독하고 세그먼트 데이터를 업데이트합니다.
 *
 * 오디오 생성 워크플로우:
 * 1. 버튼 클릭 → API 호출로 워커 큐잉
 * 2. 워커가 백그라운드에서 오디오 생성
 * 3. SSE로 완료 이벤트 수신
 * 4. queryClient.setQueryData()로 해당 세그먼트만 업데이트
 * 5. presigned URL 캐시 무효화로 새 오디오 로드
 *
 * @param projectId - 프로젝트 ID
 * @param languageCode - 언어 코드
 * @param enabled - SSE 연결 활성화 여부 (default: true)
 */
export function useAudioGenerationEvents(
  projectId: string,
  languageCode: string,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const setSegmentLoading = useEditorStore((state) => state.setSegmentLoading)

  useEffect(() => {
    if (!enabled || !projectId || !languageCode) return

    // SSE 연결 생성
    const eventSource = new EventSource(
      `${env.apiBaseUrl}/api/audio/events?projectId=${projectId}&language=${languageCode}`,
      { withCredentials: true },
    )

    // 연결 성공
    eventSource.addEventListener('open', () => {
      console.log('[SSE] Audio generation events connected')
    })

    // 오디오 생성 완료 이벤트
    eventSource.addEventListener('audio-completed', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as AudioGenerationEvent
        const { segmentId, audioS3Key } = data

        console.log('[SSE] Audio generation completed:', { segmentId, audioS3Key })

        // 세그먼트 리스트에서 해당 세그먼트만 업데이트 (네트워크 요청 없음!)
        // S3 키가 변경되면 usePreloadSegmentAudios가 새 키를 감지하고 자동으로 presigned URL을 fetch함
        queryClient.setQueryData<Segment[]>(
          queryKeys.segments.list(projectId, languageCode),
          (oldSegments) => {
            if (!oldSegments) return oldSegments

            return oldSegments.map((seg) =>
              seg.id === segmentId
                ? { ...seg, segment_audio_url: audioS3Key } // 새 S3 키로 교체
                : seg,
            )
          },
        )

        // 로딩 상태 해제
        setSegmentLoading(segmentId, false)

        // TODO: 토스트 알림 추가
        // toast.success(`세그먼트 ${segmentId} 오디오 생성 완료!`)
      } catch (error) {
        console.error('[SSE] Failed to parse audio-completed event:', error)
      }
    })

    // 오디오 생성 실패 이벤트
    eventSource.addEventListener('audio-failed', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as AudioGenerationEvent
        const { segmentId, error } = data

        console.error('[SSE] Audio generation failed:', { segmentId, error })

        // 로딩 상태 해제
        setSegmentLoading(segmentId, false)

        // TODO: 토스트 알림 추가
        // toast.error(`세그먼트 ${segmentId} 오디오 생성 실패: ${error}`)
      } catch (err) {
        console.error('[SSE] Failed to parse audio-failed event:', err)
      }
    })

    // 연결 오류
    eventSource.addEventListener('error', (event) => {
      console.error('[SSE] Connection error:', event)

      // 일시적인 오류는 자동 재연결됨
      // 영구적인 오류는 연결 종료
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('[SSE] Connection closed')
      }
    })

    // 클린업: 컴포넌트 언마운트 시 연결 종료
    return () => {
      console.log('[SSE] Closing audio generation events connection')
      eventSource.close()
    }
  }, [projectId, languageCode, enabled, queryClient, setSegmentLoading])
}
