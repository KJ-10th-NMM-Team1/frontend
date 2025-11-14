/**
 * Editor hotkey configurations
 *
 * Central place to define all editor keyboard shortcuts.
 * Add new hotkeys here as the editor functionality grows.
 */

import type { HotkeyCategory } from '@/shared/lib/hotkeys'

/**
 * Playback control hotkeys
 */
export const PLAYBACK_HOTKEYS: HotkeyCategory = {
  name: 'Playback',
  bindings: {
    togglePlayback: {
      key: ' ',
      description: 'Play/pause playback',
      preventDefault: true,
    },
    jumpBackward: {
      key: 'ArrowLeft',
      description: 'Jump backward 5 seconds',
      preventDefault: true,
    },
    jumpForward: {
      key: 'ArrowRight',
      description: 'Jump forward 5 seconds',
      preventDefault: true,
    },
    jumpToStart: {
      key: 'Home',
      description: 'Jump to start',
      preventDefault: true,
    },
    jumpToEnd: {
      key: 'End',
      description: 'Jump to end',
      preventDefault: true,
    },
  },
}

/**
 * Timeline/zoom control hotkeys
 */
export const TIMELINE_HOTKEYS: HotkeyCategory = {
  name: 'Timeline',
  bindings: {
    zoomIn: {
      key: '=',
      modifiers: ['ctrl'],
      description: 'Zoom in timeline',
      preventDefault: true,
    },
    zoomOut: {
      key: '-',
      modifiers: ['ctrl'],
      description: 'Zoom out timeline',
      preventDefault: true,
    },
    resetZoom: {
      key: '0',
      modifiers: ['ctrl'],
      description: 'Reset zoom level',
      preventDefault: true,
    },
  },
}

/**
 * Segment editing hotkeys
 */
export const SEGMENT_HOTKEYS: HotkeyCategory = {
  name: 'Segment Editing',
  bindings: {
    splitSegment: {
      key: 's',
      modifiers: ['ctrl'],
      description: 'Split segment at playhead',
      preventDefault: true,
    },
    deleteSegment: {
      key: 'Delete',
      description: 'Delete selected segment',
      preventDefault: true,
    },
    selectNextSegment: {
      key: 'ArrowDown',
      description: 'Select next segment',
      preventDefault: true,
    },
    selectPrevSegment: {
      key: 'ArrowUp',
      description: 'Select previous segment',
      preventDefault: true,
    },
  },
}

/**
 * General editor hotkeys
 */
export const GENERAL_HOTKEYS: HotkeyCategory = {
  name: 'General',
  bindings: {
    save: {
      key: 's',
      modifiers: ['ctrl'],
      description: 'Save changes',
      preventDefault: true,
    },
    undo: {
      key: 'z',
      modifiers: ['ctrl'],
      description: 'Undo',
      preventDefault: true,
    },
    redo: {
      key: 'z',
      modifiers: ['ctrl', 'shift'],
      description: 'Redo',
      preventDefault: true,
    },
  },
}

/**
 * All editor hotkey categories
 */
export const EDITOR_HOTKEY_CATEGORIES = [
  PLAYBACK_HOTKEYS,
  TIMELINE_HOTKEYS,
  SEGMENT_HOTKEYS,
  GENERAL_HOTKEYS,
] as const
