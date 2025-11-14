type WaveformBar = {
  id: number
  height: number
}

type WaveformTrackProps = {
  waveformData: WaveformBar[]
}

/**
 * 오디오 파형을 표시하는 트랙 컴포넌트
 * z-index: 없음 (기본 레이어)
 */
export function WaveformTrack({ waveformData }: WaveformTrackProps) {
  return (
    <div className="flex h-full items-center gap-px">
      {waveformData.map((bar) => (
        <span
          key={bar.id}
          className="bg-primary/60 flex-1 rounded-full"
          style={{ height: `${bar.height}%` }}
        />
      ))}
    </div>
  )
}