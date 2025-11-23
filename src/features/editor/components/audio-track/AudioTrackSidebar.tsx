import { Plus } from 'lucide-react'

import { Button } from '@/shared/ui/Button'
import { useTracksStore } from '@/shared/store/useTracksStore'

import { TrackActionsMenu } from './TrackActionsMenu'
import { TrackNameEditor } from './TrackNameEditor'
import type { TrackRow } from './types'

type AudioTrackSidebarProps = {
  trackRows: TrackRow[]
  getTrackRowHeight: (track: TrackRow) => number
}

export function AudioTrackSidebar({ trackRows, getTrackRowHeight }: AudioTrackSidebarProps) {
  const addSpeakerTrack = useTracksStore((state) => state.addSpeakerTrack)

  return (
    <div className="border-outline/20 border-r bg-surface-1">
      {/* 티커라인 패딩 */}
      <div className="border-outline/20 h-10 border-b" />

      {trackRows.map((track) => {
        if (track.type === 'speaker') {
          return (
            <div
              key={track.id}
              className="border-outline/20 group flex items-center justify-between border-b px-4 text-sm"
              style={{ height: `${getTrackRowHeight(track)}px` }}
            >
              <TrackNameEditor
                trackId={track.id}
                trackLabel={track.label}
                trackColor={track.color}
              />
              <TrackActionsMenu
                trackId={track.id}
                trackLabel={track.label}
                voiceSampleId={track.voiceSampleId}
              />
            </div>
          )
        }

        return (
          <div
            key={track.id}
            className="border-outline/20 group flex items-center justify-between border-b px-4 text-sm"
            style={{ height: `${getTrackRowHeight(track)}px` }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: track.color }} />
              <span className="font-medium text-foreground">{track.label}</span>
            </div>
          </div>
        )
      })}

      {/* 티커라인 패딩 with Add Speaker button */}
      <div className="border-outline/20 flex h-10 items-center border-b px-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full gap-1 text-foreground"
          onClick={addSpeakerTrack}
        >
          <Plus className="h-3.5 w-3.5" />
          스피커 추가
        </Button>
      </div>
    </div>
  )
}
