/**
 * Hotkey system types
 *
 * This module defines the core types for the hotkey management system.
 */

/**
 * Keyboard modifiers
 */
export type Modifier = 'ctrl' | 'shift' | 'alt' | 'meta'

/**
 * Configuration for a single hotkey binding
 */
export type HotkeyConfig = {
  /** Primary key (e.g., 'Space', 'Enter', 'a', 'ArrowLeft') */
  key: string
  /** Optional modifier keys */
  modifiers?: Modifier[]
  /** Human-readable description of what this hotkey does */
  description: string
  /** Whether this hotkey should work when input elements are focused */
  allowInInput?: boolean
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean
  /** Whether to stop event propagation */
  stopPropagation?: boolean
}

/**
 * Hotkey action handler
 */
export type HotkeyHandler = (event: KeyboardEvent) => void

/**
 * Hotkey binding - combines config with handler
 */
export type HotkeyBinding = {
  config: HotkeyConfig
  handler: HotkeyHandler
}

/**
 * Hotkey category for organization
 */
export type HotkeyCategory = {
  name: string
  bindings: Record<string, HotkeyConfig>
}
