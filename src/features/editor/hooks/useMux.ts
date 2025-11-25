import { useState } from 'react'

import { useTracksStore } from '@/shared/store/useTracksStore'
import { useUiStore } from '@/shared/store/useUiStore'

import { createMux } from '../api/muxApi'

import type { EditorState } from './useEditorState'

type UseMuxOptions = {
  projectId: string
  job_id: string
  editorData: EditorState | undefined
}

type UseMuxReturn = {
  handleMux: () => Promise<string | undefined> // result_key 반환
  isMuxing: boolean
}

/**
 * Mux 작업을 수행하는 훅
 *
 * 비디오와 오디오 세그먼트를 결합하여 최종 더빙 영상을 생성합니다.
 *
 * Usage:
 * ```ts
 * const { handleMux, isMuxing } = useMux({
 *   projectId: 'project-123',
 *   editorData: data
 * })
 *
 * <Button onClick={handleMux} disabled={isMuxing}>
 *   {isMuxing ? 'Mux 중...' : 'Mux'}
 * </Button>
 * ```
 */
export function useMux({ projectId, editorData, job_id }: UseMuxOptions): UseMuxReturn {
  const getAllSegments = useTracksStore((state) => state.getAllSegments)
  const showToast = useUiStore((state) => state.showToast)
  const [isMuxing, setIsMuxing] = useState(false)

  // 에러 토스트 헬퍼
  const showError = (description: string, autoDismiss = 3000) => {
    showToast({
      id: 'mux-error',
      title: '에러',
      description,
      autoDismiss,
    })
  }

  const handleMux = async () => {
    if (!editorData) {
      showError('에디터 데이터를 불러올 수 없습니다.')
      return
    }

    const segments = getAllSegments()
    if (segments.length === 0) {
      showError('세그먼트가 없습니다.')
      return
    }

    const muxSegments = segments
      .filter((seg) => seg.segment_audio_url) // audio_url이 있는 것만
      .map((seg) => ({
        start: seg.start,
        end: seg.end,
        audio_file: seg.segment_audio_url!, // S3 키
        playback_rate: seg.playbackRate ?? 1.0,
      }))

    if (muxSegments.length === 0) {
      showError('오디오 파일이 있는 세그먼트가 없습니다.')
      return
    }

    if (!editorData.playback.video_source) {
      showError('비디오 소스가 없습니다.')
      return
    }

    if (!editorData.playback.background_audio_source) {
      showError('배경음 소스가 없습니다.')
      return
    }

    try {
      setIsMuxing(true)
      showToast({
        id: 'mux-start',
        title: 'Mux 시작',
        description: '비디오와 오디오를 결합하는 중...',
        autoDismiss: 3000,
      })

      const result = await createMux({
        project_id: projectId,
        job_id: job_id,
        video_key: editorData.playback.video_source, // S3 키
        background_audio_key: editorData.playback.background_audio_source, // S3 키
        segments: muxSegments,
        output_prefix: `projects/${projectId}/outputs/${job_id}`,
      })

      if (result.success) {
        showToast({
          id: 'mux-success',
          title: 'Mux 완료',
          description: result.result_key
            ? `결과: ${result.result_key}`
            : '비디오와 오디오가 성공적으로 결합되었습니다.',
          autoDismiss: 5000,
        })
        console.log('Mux 결과:', result)
        return result.result_key // result_key 반환
      } else {
        throw new Error(result.message || 'Mux 실패')
      }
    } catch (error) {
      console.error('Mux 실패:', error)
      showToast({
        id: 'mux-error',
        title: 'Mux 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        autoDismiss: 5000,
      })
      return undefined // 실패 시 undefined 반환
    } finally {
      setIsMuxing(false)
    }
  }

  return {
    handleMux,
    isMuxing,
  }
}
