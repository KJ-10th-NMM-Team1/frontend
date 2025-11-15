type WaveformBar = {
  id: number
  height: number
}

type WaveformTrackProps = {
  waveformData: WaveformBar[]
  isLoading?: boolean
  color?: string
}

/**
 * 오디오 파형을 표시하는 트랙 컴포넌트
 * z-index: 없음 (기본 레이어)
 */
export function WaveformTrack({ waveformData, isLoading, color = '#ec4899' }: WaveformTrackProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-r-transparent"
          style={{
            borderColor: color,
            borderRightColor: 'transparent',
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full items-center gap-px">
      {waveformData.map((bar) => (
        <span
          key={bar.id}
          className="flex-1 rounded-full"
          style={{ height: `${bar.height}%`, backgroundColor: color }}
        />
      ))}
    </div>
  )
}