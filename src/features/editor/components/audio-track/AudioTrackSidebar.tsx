import { TrackActionsMenu } from './TrackActionsMenu'
import { TrackNameEditor } from './TrackNameEditor'
import type { TrackRow } from './types'

type AudioTrackSidebarProps = {
  trackRows: TrackRow[]
  getTrackRowHeight: (track: TrackRow) => number
}

export function AudioTrackSidebar({ trackRows, getTrackRowHeight }: AudioTrackSidebarProps) {
  return (
    <div className="border-surface-3 bg-surface-2 border-r">
      {/* 티커라인 패딩 */}
      <div className="border-surface-3 h-10 border-b" />

      {trackRows.map((track) => {
        if (track.type === 'speaker') {
          return (
            <div
              key={track.id}
              className="border-surface-3 group flex items-center justify-between border-b px-4 text-sm"
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
            className="border-surface-3 group flex items-center justify-between border-b px-4 text-sm"
            style={{ height: `${getTrackRowHeight(track)}px` }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: track.color }} />
              <span className="text-foreground font-medium">{track.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
