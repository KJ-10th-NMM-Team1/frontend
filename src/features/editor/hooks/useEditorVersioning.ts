import { useEffect } from 'react'

import type { Segment } from '@/entities/segment/types'
import { useVersionStore } from '@/shared/store/useVersionStore'

/**
 * 에디터 버전 관리 hook
 *
 * 언어별로 독립적인 버전 히스토리를 관리합니다.
 * - 에디터 데이터 로드 시 자동으로 version0 생성
 * - 각 언어마다 독립적인 버전 유지
 * - 에디터 종료 시 모든 버전 정리
 *
 * @param projectId 프로젝트 ID
 * @param languageCode 언어 코드
 * @param segments 세그먼트 데이터 (로드되면 자동으로 version0 생성)
 */
export function useEditorVersioning(
  projectId: string,
  languageCode: string,
  segments?: Segment[],
) {
  const initializeVersion0 = useVersionStore((state) => state.initializeVersion0)
  const reset = useVersionStore((state) => state.reset)

  useEffect(() => {
    if (segments && segments.length > 0) {
      // segments의 언어가 현재 선택된 언어와 일치하는지 확인
      // (keepPreviousData로 인해 이전 언어 데이터가 남아있을 수 있음)
      const segmentLanguage = segments[0]?.language_code
      if (segmentLanguage === languageCode) {
        // 현재 언어의 버전이 없으면 version0 생성
        // initializeVersion0 내부에서 이미 존재하는지 체크하므로 중복 생성 방지
        initializeVersion0(projectId, languageCode, segments)
      }
    }
  }, [projectId, languageCode, segments, initializeVersion0])

  // 에디터 전체 종료 시 모든 버전 정리
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])
}
