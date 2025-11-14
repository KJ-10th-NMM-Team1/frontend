import { useState, useRef, useEffect } from 'react'

import { Pencil } from 'lucide-react'

import { useTracksStore } from '@/shared/store/useTracksStore'
import { cn } from '@/shared/lib/utils'

type TrackNameEditorProps = {
  trackId: string
  trackLabel: string
  trackColor: string
}

export function TrackNameEditor({ trackId, trackLabel, trackColor }: TrackNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(trackLabel)
  const inputRef = useRef<HTMLInputElement>(null)
  const updateTrack = useTracksStore((state) => state.updateTrack)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setEditValue(trackLabel)
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== trackLabel) {
      updateTrack(trackId, { label: trimmedValue })
    } else {
      setEditValue(trackLabel) // Revert if empty or unchanged
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(trackLabel)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="bg-surface-3 text-foreground focus:ring-primary -ml-1 rounded border-none px-1 py-0.5 text-sm font-medium outline-none focus:ring-1"
        maxLength={50}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      className="hover:bg-surface-3/50 group flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors"
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: trackColor }} />
      <span className="text-foreground text-sm font-medium">{trackLabel}</span>
      <Pencil
        className={cn(
          'text-muted h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60',
          'ml-0.5',
        )}
      />
    </button>
  )
}
