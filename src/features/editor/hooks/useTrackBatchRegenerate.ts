import { useCallback } from 'react'

import type { TrackRow } from '@/features/editor/components/audio-track/types'
import { useBatchRegenerateTTS } from '@/features/editor/api'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { useTracksStore } from '@/shared/store/useTracksStore'
import { useUiStore } from '@/shared/store/useUiStore'

import { useEditorContext } from '../context/EditorContext'

interface UseTrackBatchRegenerateOptions {
  trackId: string
  voiceSampleId?: string
}

/**
 * speaker 타입 트랙에서 세그먼트를 가져오는 헬퍼 함수
 */
function getSpeakerTrackSegments(trackId: string, tracks: TrackRow[]) {
  const track = tracks.find((t) => t.id === trackId)
  if (!track || track.type !== 'speaker') return null
  return track.segments
}

/**
 * 트랙의 모든 세그먼트에 대해 배치 TTS 재생성을 수행하는 훅
 */
export function useTrackBatchRegenerate({
  trackId,
  voiceSampleId,
}: UseTrackBatchRegenerateOptions) {
  const { projectId, languageCode } = useEditorContext()
  const showToast = useUiStore((state) => state.showToast)
  const setSegmentLoading = useEditorStore((state) => state.setSegmentLoading)
  const tracks = useTracksStore((state) => state.tracks)

  const { mutate: batchRegenerate, isPending } = useBatchRegenerateTTS({
    onError: (error) => {
      // 로딩 상태 해제
      const segments = getSpeakerTrackSegments(trackId, tracks)
      segments?.forEach((seg) => {
        setSegmentLoading(seg.id, false)
      })

      showToast({
        id: `batch-tts-error-${trackId}`,
        title: 'TTS 재생성 실패',
        description: error.message,
        variant: 'error',
        autoDismiss: 5000,
      })
    },
  })

  const handleBatchRegenerate = useCallback(() => {
    const segments = getSpeakerTrackSegments(trackId, tracks)

    if (!segments || segments.length === 0) {
      return
    }

    // 모든 세그먼트 로딩 상태로 설정
    segments.forEach((seg) => {
      setSegmentLoading(seg.id, true)
    })

    // 배치 TTS 재생성 요청
    batchRegenerate({
      projectId,
      segments: segments.map((seg) => ({
        segmentId: seg.id,
        translatedText: seg.target_text || '',
        start: seg.start,
        end: seg.end,
      })),
      targetLang: languageCode,
      mod: 'fixed',
      voiceSampleId: voiceSampleId,
    })
  }, [trackId, tracks, projectId, languageCode, voiceSampleId, batchRegenerate, setSegmentLoading])

  return {
    handleBatchRegenerate,
    isPending,
  }
}
