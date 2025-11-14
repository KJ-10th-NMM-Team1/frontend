import type { MouseEvent as ReactMouseEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

type Position = {
  x: number
  y: number
}

type UseSegmentContextMenuOptions = {
  segmentId: string
  onGenerateFixed?: () => void
  onGenerateDynamic?: () => void
}

/**
 * Hook to manage segment context menu state and position
 *
 * Features:
 * - Opens on right-click
 * - Closes when segment changes (different segmentId)
 * - Closes on outside click or escape key
 * - Manages menu position
 */
export function useSegmentContextMenu({
  segmentId,
  onGenerateFixed,
  onGenerateDynamic,
}: UseSegmentContextMenuOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null)

  // Close menu when segment changes
  useEffect(() => {
    if (activeSegmentId !== null && activeSegmentId !== segmentId && isOpen) {
      setIsOpen(false)
    }
  }, [segmentId, activeSegmentId, isOpen])

  const handleContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()

      setPosition({ x: event.clientX, y: event.clientY })
      setActiveSegmentId(segmentId)
      setIsOpen(true)
    },
    [segmentId],
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleGenerateFixed = useCallback(() => {
    onGenerateFixed?.()
    handleClose()
  }, [onGenerateFixed, handleClose])

  const handleGenerateDynamic = useCallback(() => {
    onGenerateDynamic?.()
    handleClose()
  }, [onGenerateDynamic, handleClose])

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  return {
    isOpen,
    position,
    handleContextMenu,
    handleClose,
    handleGenerateFixed,
    handleGenerateDynamic,
  }
}
