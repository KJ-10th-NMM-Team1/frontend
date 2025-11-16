/**
 * 번역 요약 섹션
 * 현재/이전/다음 세그먼트의 번역 내용을 표시
 */

import { useMemo, useRef, useEffect } from 'react'

import type { Segment } from '@/entities/segment/types'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { useTracksStore } from '@/shared/store/useTracksStore'

export function TranslationSummarySection() {
  // 성능 최적화: activeSegmentId만 구독 (playhead는 매 프레임 변경되므로 구독 X)
  const activeSegmentId = useEditorStore((state) => state.activeSegmentId)

  // Get all segments from tracks store (same data used by useAudioTimeline)
  // tracks가 업데이트될 때마다 allSegments도 업데이트
  const allSegments = useTracksStore((state) =>
    state.tracks
      .filter((track): track is Extract<typeof track, { type: 'speaker' }> => track.type === 'speaker')
      .flatMap((track) => track.segments),
  )

  // 성능 최적화: segment ID -> index Map 생성 (O(1) 조회)
  const segmentIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    allSegments.forEach((segment, index) => {
      map.set(segment.id, index)
    })
    return map
  }, [allSegments])

  // gap에서 사용할 마지막 알려진 위치를 저장
  const lastKnownPositionRef = useRef<{
    previousSegment: (typeof allSegments)[0] | null
    nextSegment: (typeof allSegments)[0] | null
  }>({
    previousSegment: null,
    nextSegment: null,
  })

  // activeSegmentId가 변경될 때만 마지막 알려진 위치 업데이트
  useEffect(() => {
    if (activeSegmentId) {
      const currentIndex = segmentIndexMap.get(activeSegmentId)
      if (currentIndex !== undefined) {
        lastKnownPositionRef.current = {
          previousSegment: currentIndex > 0 ? allSegments[currentIndex - 1] : null,
          nextSegment: currentIndex < allSegments.length - 1 ? allSegments[currentIndex + 1] : null,
        }
      }
    }
  }, [activeSegmentId, allSegments, segmentIndexMap])

  // 현재 activeSegmentId에 해당하는 segment와 이전/다음 segment 찾기
  // 성능 최적화: Map을 사용한 O(1) 조회
  const { currentSegment, previousSegment, nextSegment } = useMemo(() => {
    // Case 1: activeSegmentId가 있는 경우 (segment 위에 있음)
    if (activeSegmentId) {
      const currentIndex = segmentIndexMap.get(activeSegmentId)

      if (currentIndex === undefined) {
        return {
          currentSegment: null,
          previousSegment: null,
          nextSegment: null,
        }
      }

      return {
        currentSegment: allSegments[currentIndex],
        previousSegment: currentIndex > 0 ? allSegments[currentIndex - 1] : null,
        nextSegment: currentIndex < allSegments.length - 1 ? allSegments[currentIndex + 1] : null,
      }
    }

    // Case 2: activeSegmentId가 없는 경우 (segment 사이의 gap에 있음)
    // 성능 최적화: 마지막 알려진 위치 사용 (실시간 playhead 추적 X)
    return {
      currentSegment: null,
      previousSegment: lastKnownPositionRef.current.previousSegment,
      nextSegment: lastKnownPositionRef.current.nextSegment,
    }
  }, [activeSegmentId, allSegments, segmentIndexMap])

  return (
    <section className="border-surface-3 flex-1 overflow-y-auto rounded border bg-white p-3">
      <h3 className="text-foreground mb-2 text-xs font-semibold">번역 요약</h3>

      <div className="flex flex-col gap-1.5">
        {/* 이전 텍스트 */}
        {previousSegment && (
          <div className="text-muted rounded border border-transparent px-2 py-1.5 text-xs opacity-50">
            <div className="mb-0.5 line-clamp-1 text-[11px]">
              {previousSegment.source_text || '원문 없음'}
            </div>
            <div className="line-clamp-1 text-[11px]">
              → {previousSegment.target_text || '번역 없음'}
            </div>
          </div>
        )}

        {/* 현재 텍스트 */}
        {currentSegment ? (
          <div className="bg-primary/5 border-primary rounded border px-2.5 py-2">
            <div className="text-foreground mb-1 line-clamp-2 text-xs font-medium">
              {currentSegment.source_text || '원문 없음'}
            </div>
            <div className="text-primary line-clamp-2 text-xs font-medium">
              → {currentSegment.target_text || '번역 없음'}
            </div>
          </div>
        ) : null}

        {/* 다음 텍스트 */}
        {nextSegment && (
          <div className="text-muted rounded border border-transparent px-2 py-1.5 text-xs opacity-50">
            <div className="mb-0.5 line-clamp-1 text-[11px]">
              {nextSegment.source_text || '원문 없음'}
            </div>
            <div className="line-clamp-1 text-[11px]">
              → {nextSegment.target_text || '번역 없음'}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
