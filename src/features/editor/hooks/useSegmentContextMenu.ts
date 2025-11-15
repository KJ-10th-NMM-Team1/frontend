import type { MouseEvent as ReactMouseEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

import type { Segment } from '@/entities/segment/types'
import { useEditorStore } from '@/shared/store/useEditorStore'

import { useGenerateDynamicAudio, useGenerateFixedAudio } from './useAudioGeneration'

type Position = {
  x: number
  y: number
}

type UseSegmentContextMenuOptions = {
  segment: Segment
  voiceSampleId?: string
}

/**
 * Hook to manage segment context menu state and position
 *
 * Features:
 * - Opens on right-click
 * - Closes when segment changes (different segmentId)
 * - Closes on outside click or escape key
 * - Manages menu position
 * - Handles audio generation API calls with loading states
 */
export function useSegmentContextMenu({ segment, voiceSampleId }: UseSegmentContextMenuOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null)

  const setSegmentLoading = useEditorStore((state) => state.setSegmentLoading)

  const { mutate: generateFixed } = useGenerateFixedAudio()
  const { mutate: generateDynamic } = useGenerateDynamicAudio()

  // Close menu when segment changes
  useEffect(() => {
    if (activeSegmentId !== null && activeSegmentId !== segment.id && isOpen) {
      setIsOpen(false)
    }
  }, [segment.id, activeSegmentId, isOpen])

  const handleContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()

      setPosition({ x: event.clientX, y: event.clientY })
      setActiveSegmentId(segment.id)
      setIsOpen(true)
    },
    [segment.id],
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleGenerateFixed = useCallback(() => {
    if (!voiceSampleId) {
      console.warn('[SegmentContextMenu] No voice sample assigned to track')
      // TODO: Show toast notification
      return
    }

    // Set loading state
    setSegmentLoading(segment.id, true)

    // Calculate segment duration
    const duration = segment.end - segment.start

    // Call API
    generateFixed(
      {
        segmentId: segment.id,
        voiceSampleId,
        start: segment.start,
        end: segment.end,
        duration,
      },
      {
        onError: () => {
          // Clear loading state on error
          setSegmentLoading(segment.id, false)
        },
      },
    )

    handleClose()
  }, [segment, voiceSampleId, setSegmentLoading, generateFixed, handleClose])

  const handleGenerateDynamic = useCallback(() => {
    if (!voiceSampleId) {
      console.warn('[SegmentContextMenu] No voice sample assigned to track')
      // TODO: Show toast notification
      return
    }

    // Set loading state
    setSegmentLoading(segment.id, true)

    // Call API
    generateDynamic(
      {
        segmentId: segment.id,
        voiceSampleId,
      },
      {
        onError: () => {
          // Clear loading state on error
          setSegmentLoading(segment.id, false)
        },
      },
    )

    handleClose()
  }, [segment, voiceSampleId, setSegmentLoading, generateDynamic, handleClose])

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
