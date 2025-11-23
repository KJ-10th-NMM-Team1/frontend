/**
 * Hook to handle segment save functionality
 *
 * Manages:
 * - Save mutation
 * - Save state (idle, saving, saved)
 * - Toast notifications
 * - Original tracks update after save
 */

import { useCallback, useEffect, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { useUpdateSegments } from '@/features/editor/api/useUpdateSegments'
import { queryKeys } from '@/shared/config/queryKeys'
import { useTracksStore } from '@/shared/store/useTracksStore'
import { useUiStore } from '@/shared/store/useUiStore'
import { useVersionStore } from '@/shared/store/useVersionStore'

type SaveStatus = 'idle' | 'saving' | 'saved'

type UseSaveSegmentsOptions = {
  projectId: string
  languageCode: string
}

export function useSaveSegments({ projectId, languageCode }: UseSaveSegmentsOptions) {
  const queryClient = useQueryClient()
  const getAllSegments = useTracksStore((state) => state.getAllSegments)
  const hasChangesFunc = useTracksStore((state) => state.hasChanges)
  const setTracks = useTracksStore((state) => state.setTracks)
  const showToast = useUiStore((state) => state.showToast)
  const createVersion = useVersionStore((state) => state.createVersion)

  // Subscribe to hasChanges as a computed value that updates reactively
  const hasChanges = useTracksStore((state) => {
    return JSON.stringify(state.tracks) !== JSON.stringify(state.originalTracks)
  })

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // Save mutation
  const { mutate: updateSegments, isPending: isSaving } = useUpdateSegments({
    onSuccess: (data) => {
      // Get current segments before updating originalTracks
      const currentSegments = getAllSegments()

      // Update originalTracks to reflect saved state
      // This ensures hasChanges() returns false after save
      const tracks = useTracksStore.getState().tracks
      setTracks(tracks)

      // Create a new version with the saved state
      createVersion(projectId, languageCode, currentSegments, '저장됨')

      setSaveStatus('saved')
      showToast({
        title: '저장 완료',
        description: `${data.updated_count}개의 세그먼트가 저장되었습니다.`,
      })

      // Invalidate editor state query to refetch latest data on next page visit
      // This ensures that cached data is updated with the saved changes
      void queryClient.invalidateQueries({
        queryKey: queryKeys.editor.state(projectId, languageCode),
      })
    },
    onError: (error) => {
      setSaveStatus('idle')
      showToast({
        title: '저장 실패',
        description: error.message || '저장 중 오류가 발생했습니다.',
      })
    },
  })

  // Update save status when isSaving changes
  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving')
    }
  }, [isSaving])

  // Auto-reset to idle after showing "saved" status for 1 second
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setSaveStatus('idle')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  // Handle save
  const handleSave = useCallback(() => {
    if (isSaving || !hasChangesFunc()) {
      return
    }

    const segments = getAllSegments()

    updateSegments({
      project_id: projectId,
      language_code: languageCode,
      segments: segments.map((seg) => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        speaker_tag: seg.speaker_tag,
        playbackRate: seg.playbackRate, // Server accepts camelCase in requests
        source_text: seg.source_text,
        target_text: seg.target_text,
      })),
    })
  }, [isSaving, hasChangesFunc, getAllSegments, updateSegments, projectId, languageCode])

  return {
    saveStatus,
    isSaving,
    hasChanges, // Now this is a reactive boolean value
    handleSave,
  }
}
