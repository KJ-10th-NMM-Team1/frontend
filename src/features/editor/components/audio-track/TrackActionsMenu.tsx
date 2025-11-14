import { useState } from 'react'

import { MoreVertical, Settings, Trash2 } from 'lucide-react'

import { useTracksStore } from '@/shared/store/useTracksStore'
import { Button } from '@/shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
          className="hover:bg-surface-3 text-muted hover:text-foreground flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          title="Voice Sample Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:bg-surface-3 text-muted hover:text-foreground flex h-7 w-7 items-center justify-center rounded-md transition-colors"
              title="More options"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
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
