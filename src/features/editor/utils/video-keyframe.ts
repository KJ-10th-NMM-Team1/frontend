/**
 * 비디오 시킹 시 가장 가까운 키프레임으로 이동합니다.
 *
 * 브라우저가 키프레임 정보를 제공하지 않으므로,
 * GOP (Group of Pictures) 크기를 추정하여 사용합니다.
 * 일반적인 GOP 크기: 1~2초
 *
 * @param targetTime - 목표 시간 (초)
 * @param gopSize - GOP 크기 (초), 기본값 2초
 * @returns 가장 가까운 키프레임 시간
 */
export function getKeyframeTime(targetTime: number, gopSize: number = 2): number {
  // 가장 가까운 키프레임 시간으로 반올림
  return Math.floor(targetTime / gopSize) * gopSize
}

/**
 * 비디오 시킹 최적화 설정
 */
export const VIDEO_SEEK_CONFIG = {
  // 스크러빙 중 비디오 업데이트 간격 (ms)
  SCRUB_THROTTLE: 100,

  // 키프레임 간격 (초) - 영상에 따라 조정 필요
  // 일반적으로 1-2초 간격으로 키프레임이 존재
  GOP_SIZE: 2,

  // 시킹 완료 대기 timeout (ms)
  SEEK_TIMEOUT: 300,

  // 미세 조정 임계값 (초) - 이 값보다 작으면 정확한 시킹
  FINE_SEEK_THRESHOLD: 0.1,
} as const
