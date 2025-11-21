import { useState } from 'react'

import { Loader2, MoreVertical, RefreshCw, Settings, Trash2 } from 'lucide-react'

import { useTrackBatchRegenerate } from '@/features/editor/hooks/useTrackBatchRegenerate'
import { useTracksStore } from '@/shared/store/useTracksStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

import { VoiceSampleSelectModal } from '../modals/VoiceSampleSelectModal'

type TrackActionsMenuProps = {
  trackId: string
  trackLabel: string
  voiceSampleId?: string
}

export function TrackActionsMenu({ trackId, trackLabel, voiceSampleId }: TrackActionsMenuProps) {
  const [showVoiceSampleModal, setShowVoiceSampleModal] = useState(false)
  const updateTrack = useTracksStore((state) => state.updateTrack)
  const removeTrack = useTracksStore((state) => state.removeTrack)

  const { handleBatchRegenerate, isPending } = useTrackBatchRegenerate({
    trackId,
    voiceSampleId,
  })

  const handleVoiceSampleSelect = (selectedVoiceSampleId: string) => {
    updateTrack(trackId, { voiceSampleId: selectedVoiceSampleId })
  }

  const handleDeleteTrack = () => {
    if (confirm(`Are you sure you want to delete "${trackLabel}"?`)) {
      removeTrack(trackId)
    }
  }

  const handleSettingsClick = () => {
    setShowVoiceSampleModal(true)
  }

  return (
    <>
      <div className="flex items-center gap-0.5">
        {/* Settings Button */}
        <button
          type="button"
          onClick={handleSettingsClick}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
          title="Voice Sample Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
              title="More options"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuItem onClick={handleBatchRegenerate} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
              )}
              <span className="text-xs">목소리 적용</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDeleteTrack} className="text-danger">
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              <span className="text-xs">Delete Speaker</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Voice Sample Select Modal */}
      <VoiceSampleSelectModal
        open={showVoiceSampleModal}
        onOpenChange={setShowVoiceSampleModal}
        onSelect={handleVoiceSampleSelect}
        currentVoiceSampleId={voiceSampleId}
        trackLabel={trackLabel}
      />
    </>
  )
}
