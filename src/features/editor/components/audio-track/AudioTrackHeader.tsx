import { Button } from '@/shared/ui/Button'

type AudioTrackHeaderProps = {
  playbackRate: number
  onDecreaseRate: () => void
  onIncreaseRate: () => void
}

export function AudioTrackHeader({
  playbackRate,
  onDecreaseRate,
  onIncreaseRate,
}: AudioTrackHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onDecreaseRate}>
          속도 -
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onIncreaseRate}>
          속도 +
        </Button>
        <span className="text-muted text-sm font-semibold">{playbackRate.toFixed(1)}x</span>
      </div>
    </header>
  )
}
