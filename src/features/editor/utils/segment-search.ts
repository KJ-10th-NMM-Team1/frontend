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

  // playhead가 마지막 세그먼트 이후인 경우, 마지막 세그먼트 반환
  const lastSegment = segments[segments.length - 1]
  if (playhead >= lastSegment.end) {
    return lastSegment
  }

  // 이진 탐색
  let left = 0
  let right = segments.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const segment = segments[mid]

    // playhead가 현재 세그먼트 범위 내에 있음
    if (playhead >= segment.start && playhead < segment.end) {
      return segment
    }

    // playhead가 현재 세그먼트보다 앞에 있음
    if (playhead < segment.start) {
      right = mid - 1
    } else {
      // playhead가 현재 세그먼트보다 뒤에 있음
      left = mid + 1
    }
  }

  return undefined
}
