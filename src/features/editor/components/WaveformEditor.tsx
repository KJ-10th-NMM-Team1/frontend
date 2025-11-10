import { useMemo } from 'react'

import { Scissors, Timer, Waves } from 'lucide-react'

import { useEditorStore } from '../../../shared/store/useEditorStore'
import { Button } from '../../../shared/ui/Button'

type WaveformEditorProps = {
  duration: number
  segmentCount: number
}

export function WaveformEditor({ duration, segmentCount }: WaveformEditorProps) {
  const { playbackRate, setPlaybackRate, splitMode, toggleSplitMode } = useEditorStore((state) => ({
    playbackRate: state.playbackRate,
    setPlaybackRate: state.setPlaybackRate,
    splitMode: state.splitMode,
    toggleSplitMode: state.toggleSplitMode,
  }))

  const bars = useMemo(
    () => Array.from({ length: segmentCount * 4 }, () => Math.random()),
    [segmentCount],
  )

  return (
    <div className="border-surface-3 bg-surface-1 space-y-4 rounded-3xl border p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">음성 트랙 타임라인</h3>
        <span className="bg-surface-2 text-muted inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs">
          <Timer className="h-3.5 w-3.5" />
          길이 {duration}s
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <div className="bg-surface-2 grid h-32 grid-cols-12 gap-1 overflow-hidden rounded-2xl p-2">
          {bars.map((value, index) => (
            <div
              key={index}
              className="bg-primary/70 self-end rounded-full"
              style={{ height: `${30 + value * 70}%` }}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setPlaybackRate(Math.min(playbackRate + 0.1, 2))}
          >
            <Waves className="h-4 w-4" />
            속도 + (현재 {playbackRate.toFixed(1)}x)
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setPlaybackRate(Math.max(playbackRate - 0.1, 0.5))}
          >
            <Waves className="h-4 w-4" />
            속도 -
          </Button>
          <Button
            type="button"
            variant={splitMode ? 'primary' : 'outline'}
            size="sm"
            onClick={toggleSplitMode}
          >
            <Scissors className="h-4 w-4" />
            {splitMode ? '분할 모드 (ON)' : '분할 모드'}
          </Button>
        </div>
      </div>
    </div>
  )
}
