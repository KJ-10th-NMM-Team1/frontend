/**
 * React hook for managing hotkeys
 *
 * This hook provides a declarative API for registering keyboard shortcuts
 * in React components.
 */

import { useEffect, useRef } from 'react'

import type { HotkeyBinding, HotkeyConfig, HotkeyHandler } from './types'
import { isInputElement, matchesHotkey } from './utils'

/**
 * Registers hotkey bindings for a component
 *
 * @example
 * ```tsx
 * useHotkeys([
 *   {
 *     config: { key: ' ', description: 'Play/pause' },
 *     handler: togglePlayback
 *   },
 *   {
 *     config: { key: 'ArrowLeft', description: 'Jump backward' },
 *     handler: jumpBackward
 *   }
 * ])
 * ```
 */
export function useHotkeys(bindings: HotkeyBinding[], enabled = true) {
  // Use ref to avoid recreating event listener on every render
  const bindingsRef = useRef(bindings)

  useEffect(() => {
    bindingsRef.current = bindings
  }, [bindings])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check each binding
      for (const binding of bindingsRef.current) {
        const { config, handler } = binding

        // Skip if hotkey doesn't match
        if (!matchesHotkey(event, config)) {
          continue
        }

        // Check if we should ignore input elements
        if (!config.allowInInput && isInputElement(event.target as Element)) {
          continue
        }

        // Prevent default if configured
        if (config.preventDefault !== false) {
          event.preventDefault()
        }

        // Stop propagation if configured
        if (config.stopPropagation) {
          event.stopPropagation()
        }

        // Execute handler
        handler(event)

        // Only execute first matching hotkey
        break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])
}

/**
 * Registers a single hotkey binding
 *
 * @example
 * ```tsx
 * useHotkey(
 *   { key: ' ', description: 'Play/pause' },
 *   togglePlayback
 * )
 * ```
 */
export function useHotkey(config: HotkeyConfig, handler: HotkeyHandler, enabled = true) {
  useHotkeys([{ config, handler }], enabled)
}
