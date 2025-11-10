import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react'

import { Button } from '@/shared/ui/Button'

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
  duration,
  formatTime,
  setPlayhead,
  togglePlayback,
  isPlaying,
}: AudioTimelineControlsProps) {
  return (
    <div className="border-surface-3 flex items-center justify-between border-b px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="icon" onClick={() => setPlayhead(0)}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button type="button" variant="secondary" size="icon" onClick={togglePlayback}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => setPlayhead(Math.min(playhead + Math.max(duration * 0.05, 1), duration))}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm">
          <Volume2 className="h-4 w-4" />
          모니터링
        </Button>
      </div>
      <div className="text-foreground font-mono text-lg">{formatTime(playhead)}</div>
    </div>
  )
}
