import { Plus } from 'lucide-react'

import { Button } from '@/shared/ui/Button'
import { useTracksStore } from '@/shared/store/useTracksStore'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { cn } from '@/shared/lib/utils'

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
  // togglePlayback,
  // isPlaying,
}: AudioTimelineControlsProps) {
  const addSpeakerTrack = useTracksStore((state) => state.addSpeakerTrack)
  const { audioPlaybackMode, toggleAudioPlaybackMode } = useEditorStore((state) => ({
    audioPlaybackMode: state.audioPlaybackMode,
    toggleAudioPlaybackMode: state.toggleAudioPlaybackMode,
  }))

  return (
    <div className="border-surface-3 flex items-center justify-between border-b px-2 py-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="bg-surface-50 cursor-pointer rounded-none py-3 text-gray-700"
        onClick={addSpeakerTrack}
      >
        <div className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Speaker
        </div>
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        {/* Audio Playback Mode Toggle - More prominent */}
        <div className="border-surface-3 flex items-center rounded-lg border bg-white shadow-sm">
          <Button
            type="button"
            variant={audioPlaybackMode === 'original' ? 'primary' : 'ghost'}
            size="sm"
            className={cn(
              'rounded-r-none border-none px-4 py-1.5 text-xs font-medium transition-colors',
              audioPlaybackMode === 'original' && 'bg-primary text-white',
            )}
            onClick={() => toggleAudioPlaybackMode()}
          >
            Original
          </Button>
          <Button
            type="button"
            variant={audioPlaybackMode === 'target' ? 'primary' : 'ghost'}
            size="sm"
            className={cn(
              'rounded-l-none border-none px-4 py-1.5 text-xs font-medium transition-colors',
              audioPlaybackMode === 'target' && 'bg-primary text-white',
            )}
            onClick={() => toggleAudioPlaybackMode()}
          >
            Target
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-5">
        {/* <Button
          type="button"
          className="border-none bg-white shadow-none"
          variant="secondary"
          size="icon"
          onClick={togglePlayback}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button> */}

        <div className="flex items-center gap-4">
          <div className="text-foreground font-mono text-sm">{formatTime(playhead)}</div>
          <ZoomControl />
        </div>
      </div>
    </div>
  )
}
