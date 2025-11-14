import { timeToPixel } from '@/features/editor/utils/timeline-scale'

type PlayheadIndicatorProps = {
  playhead: number
  duration: number
  scale: number
}

/**
 * 재생 위치를 나타내는 인디케이터 (삼각형 + 세로선)
 * z-index: z-[100] (최상위 레이어 - 모든 트랙 위에 표시)
 *
 * 레이어 구조:
 * - 부모 컨테이너: z-[100] + pointer-events-none (클릭 이벤트 무시)
 * - 세로선: 회색 1.5px 선
 * - 삼각형: 상단에 위치한 화살표 (border trick 사용)
 */
export function PlayheadIndicator({ playhead, duration, scale }: PlayheadIndicatorProps) {
  const position = timeToPixel(playhead, duration, scale)

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-[100]"
      style={{ left: `${position}px` }}
    >
      {/* 삼각형 화살표 - 상단에 위치 */}
      <div
        className="absolute -top-[1px] left-1/2 h-0 w-0 -translate-x-1/2"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '14px solid rgb(75, 85, 99)', // gray-600
        }}
      />

      {/* 세로선 */}
      <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-gray-600" />
    </div>
  )
}
