import { Pause, Play, Plus } from 'lucide-react'

import { Button } from '@/shared/ui/Button'

import { ZoomControl } from './ZoomControl'

type AudioTimelineControlsProps = {
  playhead: number
  duration: number
  formatTime: (value: number) => string
  setPlayhead: (time: number) => void
  togglePlayback: () => void
  isPlaying: boolean
}

export function AudioTimelineControls({
  playhead,
  // duration,
  formatTime,
  // setPlayhead,
  togglePlayback,
  isPlaying,
}: AudioTimelineControlsProps) {
  return (
    <div className="border-surface-3 flex items-center justify-between border-b px-2 py-1.5">
      <div className="border-surface-3 bg-surface-2 sticky top-0 z-20 border-b px-2 py-1.5">
        <Button type="button" variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          트랙 추가
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className="border-none bg-white shadow-none"
          variant="secondary"
          size="icon"
          onClick={togglePlayback}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-foreground font-mono text-sm">{formatTime(playhead)}</div>
        <ZoomControl />
      </div>
    </div>
  )
}
