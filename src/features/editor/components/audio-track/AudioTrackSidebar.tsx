import { Plus } from 'lucide-react'

import { Button } from '@/shared/ui/Button'

import type { TrackRow } from './types'

type AudioTrackSidebarProps = {
  trackRows: TrackRow[]
}

export function AudioTrackSidebar({ trackRows }: AudioTrackSidebarProps) {
  return (
    <div className="border-surface-3 bg-surface-2 border-r">
      <div className="border-surface-3 border-b px-4 py-3">
        <Button type="button" variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          트랙 추가
        </Button>
      </div>
      {trackRows.map((track) => (
        <div
          key={track.id}
          className="border-surface-3 flex h-[84px] items-center justify-between border-b px-4 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: track.color }} />
            <span className="text-foreground font-medium">{track.label}</span>
          </div>
          <span className="text-muted text-xs uppercase tracking-[0.2em]">S</span>
        </div>
      ))}
    </div>
  )
}
