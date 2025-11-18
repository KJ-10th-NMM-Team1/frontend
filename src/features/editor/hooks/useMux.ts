import { useState } from 'react'

import { useTracksStore } from '@/shared/store/useTracksStore'
import { useUiStore } from '@/shared/store/useUiStore'

import { createMux } from '../api/muxApi'
import type { EditorState } from './useEditorState'

type UseMuxOptions = {
  projectId: string
  editorData: EditorState | undefined
}

type UseMuxReturn = {
  handleMux: () => Promise<void>
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
export function useMux({ projectId, editorData }: UseMuxOptions): UseMuxReturn {
  const getAllSegments = useTracksStore((state) => state.getAllSegments)
  const showToast = useUiStore((state) => state.showToast)
  const [isMuxing, setIsMuxing] = useState(false)

  const handleMux = async () => {
    if (!editorData) {
      showToast({
        id: 'mux-error',
        title: '에러',
        description: '에디터 데이터를 불러올 수 없습니다.',
        autoDismiss: 3000,
      })
      return
    }

    const segments = getAllSegments()
    if (segments.length === 0) {
      showToast({
        id: 'mux-error',
        title: '에러',
        description: '세그먼트가 없습니다.',
        autoDismiss: 3000,
      })
      return
    }

    const muxSegments = segments
      .filter((seg) => seg.segment_audio_url) // audio_url이 있는 것만
      .map((seg) => ({
        start: seg.start,
        end: seg.end,
        audio_file: seg.segment_audio_url!, // S3 키
      }))

    if (muxSegments.length === 0) {
      showToast({
        id: 'mux-error',
        title: '에러',
        description: '오디오 파일이 있는 세그먼트가 없습니다.',
        autoDismiss: 3000,
      })
      return
    }

    if (!editorData.playback.video_source) {
      showToast({
        id: 'mux-error',
        title: '에러',
        description: '비디오 소스가 없습니다.',
        autoDismiss: 3000,
      })
      return
    }

    if (!editorData.playback.background_audio_source) {
      showToast({
        id: 'mux-error',
        title: '에러',
        description: '배경음 소스가 없습니다.',
        autoDismiss: 3000,
      })
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
        video_key: editorData.playback.video_source, // S3 키
        background_audio_key: editorData.playback.background_audio_source, // S3 키
        segments: muxSegments,
        output_prefix: `projects/${projectId}/outputs`,
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
    } finally {
      setIsMuxing(false)
    }
  }

  return {
    handleMux,
    isMuxing,
  }
}
