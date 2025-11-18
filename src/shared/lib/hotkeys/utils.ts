/**
 * Hotkey utility functions
 */

import type { HotkeyConfig } from './types'

/**
 * Checks if the pressed key matches the hotkey configuration
 *
 * Cross-platform support: 'ctrl' modifier matches both Ctrl (Windows/Linux) and Cmd (Mac)
 */
export function matchesHotkey(event: KeyboardEvent, config: HotkeyConfig): boolean {
  // Normalize key for case-insensitive comparison
  const pressedKey = event.key.toLowerCase()
  const configKey = config.key.toLowerCase()

  // Check if key matches
  if (pressedKey !== configKey) {
    return false
  }

  // Check modifiers
  const modifiers = config.modifiers || []
  const hasCtrl = modifiers.includes('ctrl')
  const hasShift = modifiers.includes('shift')
  const hasAlt = modifiers.includes('alt')
  const hasMeta = modifiers.includes('meta')

  // Cross-platform Ctrl/Meta matching
  let ctrlMetaMatch = true
  if (hasCtrl || hasMeta) {
    // At least one of ctrl or meta should be pressed
    const ctrlOrMetaPressed = event.ctrlKey || event.metaKey
    if (!ctrlOrMetaPressed) {
      ctrlMetaMatch = false
    }
    // If meta is explicitly required, metaKey must be pressed (not cross-platform)
    else if (hasMeta && !hasCtrl && !event.metaKey) {
      ctrlMetaMatch = false
    }
    // If only ctrl is required (not meta), allow both ctrl and meta for cross-platform support
    // This is already satisfied by the ctrlOrMetaPressed check above
  } else {
    // Neither ctrl nor meta should be pressed
    if (event.ctrlKey || event.metaKey) {
      ctrlMetaMatch = false
    }
  }

  return ctrlMetaMatch && event.shiftKey === hasShift && event.altKey === hasAlt
}

/**
 * Checks if the current focused element is an input element
 */
export function isInputElement(element: Element | null): boolean {
  if (!element) return false

  const tagName = element.tagName.toLowerCase()
  const isContentEditable = element.getAttribute('contenteditable') === 'true'

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isContentEditable
  )
}

/**
 * Formats hotkey config into human-readable string
 * @example formatHotkeyLabel({ key: 'Space' }) → 'Space'
 * @example formatHotkeyLabel({ key: 's', modifiers: ['ctrl'] }) → 'Ctrl+S'
 */
export function formatHotkeyLabel(config: HotkeyConfig): string {
  const modifiers = config.modifiers || []
  const parts: string[] = []

  // Add modifiers in standard order
  if (modifiers.includes('ctrl')) parts.push('Ctrl')
  if (modifiers.includes('alt')) parts.push('Alt')
  if (modifiers.includes('shift')) parts.push('Shift')
  if (modifiers.includes('meta')) parts.push('Cmd')

  // Add main key (capitalize first letter)
  const key = config.key.charAt(0).toUpperCase() + config.key.slice(1)
  parts.push(key)

  return parts.join('+')
}

/**
 * Creates a unique identifier for a hotkey configuration
 */
export function getHotkeyId(config: HotkeyConfig): string {
  const modifiers = config.modifiers || []
  const sortedModifiers = [...modifiers].sort()
  return [...sortedModifiers, config.key.toLowerCase()].join('+')
}
