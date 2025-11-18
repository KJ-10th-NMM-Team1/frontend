import type { Segment } from '@/entities/segment/types'

/**
 * 이진 탐색으로 playhead가 속한 세그먼트를 찾습니다.
 *
 * @param segments - 시간순으로 정렬된 세그먼트 배열 (start 기준 오름차순)
 * @param playhead - 현재 재생 위치 (초 단위)
 * @returns playhead가 속한 세그먼트, 없으면 undefined
 *
 * @example
 * const segments = [
 *   { start: 0, end: 5, ... },
 *   { start: 5, end: 10, ... },
 *   { start: 10, end: 15, ... },
 * ]
 * findSegmentByPlayhead(segments, 7) // returns segment with start: 5, end: 10
 *
 * 시간 복잡도: O(log n)
 * 전제 조건: segments가 start 시간 순으로 정렬되어 있어야 함
 */
export function findSegmentByPlayhead(
  segments: Segment[],
  playhead: number,
): Segment | undefined {
  if (segments.length === 0) return undefined

  // 이진 탐색으로 playhead가 [start, end) 범위 내에 있는 세그먼트 찾기
  let left = 0
  let right = segments.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const segment = segments[mid]

    // playhead가 현재 세그먼트 범위 내에 있음 (반개구간: [start, end))
    if (playhead >= segment.start && playhead < segment.end) {
      return segment
    }

    // playhead가 현재 세그먼트보다 앞에 있음
    if (playhead < segment.start) {
      right = mid - 1
    } else {
      // playhead가 현재 세그먼트보다 뒤에 있음 (playhead >= segment.end)
      left = mid + 1
    }
  }

  // playhead가 어떤 세그먼트 범위에도 속하지 않음
  return undefined
}

/**
 * playhead와 겹치는 모든 세그먼트를 찾습니다. (다중 트랙 최적화)
 *
 * 여러 트랙이 있을 때, playhead 위치에서 재생 중인 모든 세그먼트를 반환합니다.
 * 각 트랙에서 이진 탐색을 수행하여 효율적으로 찾습니다.
 *
 * @param trackSegments - 트랙별로 그룹화된 세그먼트 배열의 배열
 *                         각 트랙의 세그먼트는 start 기준으로 정렬되어 있어야 함
 * @param playhead - 현재 재생 위치 (초 단위)
 * @returns playhead와 겹치는 모든 세그먼트 배열
 *
 * @example
 * const trackSegments = [
 *   [{ id: 'a', start: 2, end: 5 }, { id: 'c', start: 7, end: 10 }], // Track 1
 *   [{ id: 'b', start: 3, end: 6 }],                                 // Track 2
 * ]
 * findAllSegmentsByPlayhead(trackSegments, 4)
 * // → [segment a, segment b] (Track 1과 2에서 각각 이진 탐색)
 *
 * 시간 복잡도: O(M × log n)
 * - M: 트랙 수 (보통 2-5개)
 * - n: 트랙당 평균 세그먼트 수
 * - 기존 O(n) 순회 방식보다 훨씬 효율적 (특히 RAF로 초당 60회 호출되는 환경)
 *
 * 전제 조건: 각 트랙의 세그먼트는 start 시간 순으로 정렬되어 있어야 함
 */
export function findAllSegmentsByPlayhead(
  trackSegments: Segment[][],
  playhead: number,
): Segment[] {
  if (trackSegments.length === 0) return []

  const activeSegments: Segment[] = []

  // 각 트랙에서 이진 탐색으로 해당 세그먼트 찾기 (O(M × log n))
  for (const segments of trackSegments) {
    const segment = findSegmentByPlayhead(segments, playhead)
    if (segment) {
      activeSegments.push(segment)
    }
  }

  return activeSegments
}
