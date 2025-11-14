import type { Segment } from '@/entities/segment/types'

/**
 * 세그먼트 위치 제약 조건을 계산하는 유틸리티
 *
 * 용도:
 * - 세그먼트 이동 시 다른 세그먼트와 겹치지 않도록 제약
 * - 세그먼트 크기 조절 시 경계 제약
 * - 타임라인 범위 내로 제한
 */

/**
 * 특정 세그먼트의 이전/다음 세그먼트를 찾습니다.
 *
 * 최적화:
 * - 세그먼트가 이미 정렬되어 있다고 가정 (시작 시간 기준)
 * - 정렬 없이 인덱스만으로 인접 세그먼트 찾기
 */
export function findAdjacentSegments(
  segments: Segment[],
  targetSegmentId: string,
): {
  previous: Segment | null
  next: Segment | null
} {
  const targetIndex = segments.findIndex((seg) => seg.id === targetSegmentId)

  if (targetIndex === -1) {
    return { previous: null, next: null }
  }

  return {
    previous: targetIndex > 0 ? segments[targetIndex - 1] : null,
    next: targetIndex < segments.length - 1 ? segments[targetIndex + 1] : null,
  }
}

/**
 * 세그먼트 배열이 시작 시간 기준으로 정렬되어 있는지 확인합니다.
 *
 * @param segments - 확인할 세그먼트 배열
 * @returns 정렬되어 있으면 true
 */
export function isSegmentsSorted(segments: Segment[]): boolean {
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].start < segments[i - 1].start) {
      return false
    }
  }
  return true
}

/**
 * 세그먼트 이동 시 제약 조건을 적용합니다.
 *
 * @param newStart - 이동하려는 새 시작 시간
 * @param segmentDuration - 세그먼트의 길이 (고정)
 * @param duration - 타임라인 전체 길이
 * @param previousSegment - 이전 세그먼트 (없으면 null)
 * @param nextSegment - 다음 세그먼트 (없으면 null)
 * @param gap - 세그먼트 간 최소 간격 (기본값: 0.1초)
 * @returns 제약 조건을 적용한 새 시작/종료 시간
 */
export function clampSegmentPosition(
  newStart: number,
  segmentDuration: number,
  duration: number,
  previousSegment: Segment | null,
  nextSegment: Segment | null,
  gap: number = 0,
): { start: number; end: number } {
  let clampedStart = newStart
  const clampedEnd = clampedStart + segmentDuration

  // 1. 타임라인 시작 부분 제약 (0 이상)
  if (clampedStart < 0) {
    clampedStart = 0
  }

  // 2. 타임라인 끝 부분 제약 (duration 이하)
  if (clampedEnd > duration) {
    clampedStart = duration - segmentDuration
  }

  // 3. 이전 세그먼트와의 제약 (겹치지 않도록)
  if (previousSegment) {
    const minStart = previousSegment.end + gap
    if (clampedStart < minStart) {
      clampedStart = minStart
    }
  }

  // 4. 다음 세그먼트와의 제약 (겹치지 않도록)
  if (nextSegment) {
    const maxEnd = nextSegment.start - gap
    const maxStart = maxEnd - segmentDuration

    if (clampedStart + segmentDuration > maxEnd) {
      clampedStart = maxStart
    }
  }

  return {
    start: clampedStart,
    end: clampedStart + segmentDuration,
  }
}

/**
 * 세그먼트 크기 조절 시 시작 시간 제약 조건을 적용합니다.
 *
 * @param newStart - 조절하려는 새 시작 시간
 * @param currentEnd - 현재 종료 시간 (고정)
 * @param previousSegment - 이전 세그먼트 (없으면 null)
 * @param minDuration - 최소 세그먼트 길이 (기본값: 0.5초)
 * @param gap - 세그먼트 간 최소 간격 (기본값: 0.1초)
 * @returns 제약 조건을 적용한 새 시작 시간
 */
export function clampSegmentStartResize(
  newStart: number,
  currentEnd: number,
  previousSegment: Segment | null,
  minDuration: number = 0.5,
  gap: number = 0,
): number {
  let clampedStart = newStart

  // 1. 타임라인 시작 부분 제약 (0 이상)
  if (clampedStart < 0) {
    clampedStart = 0
  }

  // 2. 최소 길이 제약
  const maxStart = currentEnd - minDuration
  if (clampedStart > maxStart) {
    clampedStart = maxStart
  }

  // 3. 이전 세그먼트와의 제약
  if (previousSegment) {
    const minStart = previousSegment.end + gap
    if (clampedStart < minStart) {
      clampedStart = minStart
    }
  }

  return clampedStart
}

/**
 * 세그먼트 크기 조절 시 종료 시간 제약 조건을 적용합니다.
 *
 * @param newEnd - 조절하려는 새 종료 시간
 * @param currentStart - 현재 시작 시간 (고정)
 * @param duration - 타임라인 전체 길이
 * @param nextSegment - 다음 세그먼트 (없으면 null)
 * @param minDuration - 최소 세그먼트 길이 (기본값: 0.5초)
 * @param gap - 세그먼트 간 최소 간격 (기본값: 0.1초)
 * @returns 제약 조건을 적용한 새 종료 시간
 */
export function clampSegmentEndResize(
  newEnd: number,
  currentStart: number,
  duration: number,
  nextSegment: Segment | null,
  minDuration: number = 0.5,
  gap: number = 0,
): number {
  let clampedEnd = newEnd

  // 1. 타임라인 끝 부분 제약 (duration 이하)
  if (clampedEnd > duration) {
    clampedEnd = duration
  }

  // 2. 최소 길이 제약
  const minEnd = currentStart + minDuration
  if (clampedEnd < minEnd) {
    clampedEnd = minEnd
  }

  // 3. 다음 세그먼트와의 제약
  if (nextSegment) {
    const maxEnd = nextSegment.start - gap
    if (clampedEnd > maxEnd) {
      clampedEnd = maxEnd
    }
  }

  return clampedEnd
}

/**
 * 세그먼트가 다른 세그먼트와 겹치는지 확인합니다.
 *
 * @param start - 확인할 세그먼트의 시작 시간
 * @param end - 확인할 세그먼트의 종료 시간
 * @param segments - 전체 세그먼트 목록
 * @param excludeId - 검사에서 제외할 세그먼트 ID (자기 자신)
 * @returns 겹치는 세그먼트가 있으면 true
 */
export function hasSegmentOverlap(
  start: number,
  end: number,
  segments: Segment[],
  excludeId?: string,
): boolean {
  return segments.some((segment) => {
    if (excludeId && segment.id === excludeId) {
      return false
    }

    // 겹침 조건: (start < segment.end) && (end > segment.start)
    return start < segment.end && end > segment.start
  })
}
