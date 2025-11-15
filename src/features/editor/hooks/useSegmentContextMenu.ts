import type { MouseEvent as ReactMouseEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

import type { Segment } from '@/entities/segment/types'
import { useEditorStore } from '@/shared/store/useEditorStore'

import { useRegenerateSegmentTTS } from './useAudioGeneration'

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

  const { mutate: regenerateTTS } = useRegenerateSegmentTTS()

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
    // Set loading state
    setSegmentLoading(segment.id, true)

    // Call API - Fixed mode
    regenerateTTS(
      {
        projectId: segment.project_id,
        segmentId: segment.id,
        translatedText: segment.target_text || segment.source_text, // target_text 없으면 source_text 사용
        start: segment.start,
        end: segment.end,
        targetLang: segment.language_code,
        mod: 'fixed',
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
  }, [segment, voiceSampleId, setSegmentLoading, regenerateTTS, handleClose])

  const handleGenerateDynamic = useCallback(() => {
    // Set loading state
    setSegmentLoading(segment.id, true)

    // Call API - Dynamic mode
    regenerateTTS(
      {
        projectId: segment.project_id,
        segmentId: segment.id,
        translatedText: segment.target_text || segment.source_text, // target_text 없으면 source_text 사용
        start: segment.start,
        end: segment.end,
        targetLang: segment.language_code,
        mod: 'dynamic',
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
  }, [segment, voiceSampleId, setSegmentLoading, regenerateTTS, handleClose])

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
