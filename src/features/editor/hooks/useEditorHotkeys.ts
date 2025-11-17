/**
 * Editor hotkeys hook
 *
 * Centralizes all editor hotkey bindings.
 * Add new hotkey handlers here as features are implemented.
 */

import { useCallback } from 'react'

import { useHotkeys } from '@/shared/lib/hotkeys'
import { useEditorStore } from '@/shared/store/useEditorStore'

import { GENERAL_HOTKEYS, PLAYBACK_HOTKEYS, TIMELINE_HOTKEYS } from '../config/hotkeys'

type EditorHotkeysOptions = {
  playhead: number
  setPlayhead: (time: number) => void
  duration: number
  setPlaying: (playing: boolean) => void
  togglePlayback: () => void
  onSave?: () => void
}

const JUMP_TIME = 1 // seconds

/**
 * Registers all editor hotkeys
 */
export function useEditorHotkeys({
  playhead,
  setPlayhead,
  duration,
  setPlaying,
  togglePlayback,
  onSave,
}: EditorHotkeysOptions) {
  const { scale, setScale } = useEditorStore((state) => ({
    scale: state.scale,
    setScale: state.setScale,
  }))

  // General handlers
  const handleSave = useCallback(() => {
    onSave?.()
  }, [onSave])

  // Playback handlers
  const handleJumpBackward = useCallback(() => {
    setPlayhead(Math.max(0, playhead - JUMP_TIME))
    setPlaying(false)
  }, [playhead, setPlaying, setPlayhead])

  const handleJumpForward = useCallback(() => {
    setPlayhead(Math.min(duration, playhead + JUMP_TIME))
    setPlaying(false)
  }, [playhead, setPlaying, setPlayhead, duration])

  const handleJumpToStart = useCallback(() => {
    setPlayhead(0)
  }, [setPlayhead])

  const handleJumpToEnd = useCallback(() => {
    setPlayhead(duration)
  }, [setPlayhead, duration])

  // Timeline/zoom handlers
  const handleZoomIn = useCallback(() => {
    setScale(scale + 0.1)
  }, [scale, setScale])

  const handleZoomOut = useCallback(() => {
    setScale(scale - 0.1)
  }, [scale, setScale])

  const handleResetZoom = useCallback(() => {
    setScale(1)
  }, [setScale])

  // Register hotkeys
  useHotkeys([
    // General controls
    {
      config: GENERAL_HOTKEYS.bindings.save,
      handler: handleSave,
    },
    // Playback controls
    {
      config: PLAYBACK_HOTKEYS.bindings.togglePlayback,
      handler: togglePlayback,
    },
    {
      config: PLAYBACK_HOTKEYS.bindings.jumpBackward,
      handler: handleJumpBackward,
    },
    {
      config: PLAYBACK_HOTKEYS.bindings.jumpForward,
      handler: handleJumpForward,
    },
    {
      config: PLAYBACK_HOTKEYS.bindings.jumpToStart,
      handler: handleJumpToStart,
    },
    {
      config: PLAYBACK_HOTKEYS.bindings.jumpToEnd,
      handler: handleJumpToEnd,
    },
    // Timeline/zoom controls
    {
      config: TIMELINE_HOTKEYS.bindings.zoomIn,
      handler: handleZoomIn,
    },
    {
      config: TIMELINE_HOTKEYS.bindings.zoomOut,
      handler: handleZoomOut,
    },
    {
      config: TIMELINE_HOTKEYS.bindings.resetZoom,
      handler: handleResetZoom,
    },
  ])
}
