import { useState, useEffect, useMemo, useCallback } from 'react'

import type { SuggestionContext } from '@/entities/suggestion/types'
import { fetchSuggestion } from '@/features/editor/api/suggestionApi'
import { useSuggestionStore } from '@/shared/store/useSuggestionStore'
import { useTracksStore } from '@/shared/store/useTracksStore'

type UseAiSuggestionOptions = {
  activeSegmentId: string | null
  targetLanguage: string
}

/**
 * AI 제안 기능을 위한 커스텀 훅
 * - 제안 다이얼로그 상태 관리
 * - 제안 요청 및 결과 관리
 * - 제안 적용 로직
 */
export function useAiSuggestion({ activeSegmentId, targetLanguage }: UseAiSuggestionOptions) {
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [suggestionResult, setSuggestionResult] = useState<string>('')
  const [suggestionPage, setSuggestionPage] = useState(1)

  const { items: suggestionsBySegment, addSuggestion, clearAll } = useSuggestionStore()
  const { getAllSegments, updateSegment } = useTracksStore((state) => ({
    getAllSegments: state.getAllSegments,
    updateSegment: state.updateSegment,
  }))

  const allSegments = getAllSegments()
  const currentActiveSegment = useMemo(() => {
    if (!activeSegmentId) return null
    return allSegments.find((segment) => segment.id === activeSegmentId) ?? null
  }, [activeSegmentId, allSegments])

  const segmentSuggestions = useMemo(
    () => (activeSegmentId ? (suggestionsBySegment[activeSegmentId] ?? []) : []),
    [activeSegmentId, suggestionsBySegment],
  )

  // 활성 세그먼트 변경 시 제안 페이지와 결과 초기화
  useEffect(() => {
    const nextLength = segmentSuggestions.length || 1
    setSuggestionPage(nextLength)
    setSuggestionResult(
      segmentSuggestions.length > 0
        ? segmentSuggestions[segmentSuggestions.length - 1].text
        : (currentActiveSegment?.target_text ?? ''),
    )
  }, [activeSegmentId, segmentSuggestions, currentActiveSegment])

  const suggestionTotalPages = Math.max(1, segmentSuggestions.length || 1)

  /**
   * AI 제안 요청
   */
  const handleRequestSuggestion = useCallback(
    async (context: SuggestionContext) => {
      if (!activeSegmentId) return

      try {
        const response = await fetchSuggestion({ segmentId: activeSegmentId, context })
        const nextPage = segmentSuggestions.length + 1

        addSuggestion(activeSegmentId, {
          id: crypto.randomUUID?.() ?? `${Date.now()}`,
          context,
          text: response,
          createdAt: Date.now(),
        })

        setSuggestionPage(nextPage)
        setSuggestionResult(response)
        setIsAiDialogOpen(true)
      } catch (error) {
        console.error('Suggestion fetch failed', error)
      }
    },
    [activeSegmentId, segmentSuggestions, addSuggestion],
  )

  /**
   * 제안 페이지 변경
   */
  const handleSuggestionPageChange = useCallback(
    (page: number) => {
      if (!segmentSuggestions.length) {
        setSuggestionPage(1)
        setSuggestionResult(currentActiveSegment?.target_text ?? '')
        return
      }
      const safePage = Math.min(Math.max(1, page), suggestionTotalPages)
      setSuggestionPage(safePage)
      setSuggestionResult(segmentSuggestions[safePage - 1].text)
    },
    [segmentSuggestions, suggestionTotalPages, currentActiveSegment],
  )

  /**
   * 다이얼로그 열기/닫기
   */
  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setIsAiDialogOpen(open)
      if (!open) {
        clearAll()
        setSuggestionPage(1)
        setSuggestionResult('')
      }
    },
    [clearAll],
  )

  /**
   * 제안 적용
   */
  const handleApplySuggestion = useCallback(() => {
    if (activeSegmentId) {
      updateSegment(activeSegmentId, { target_text: suggestionResult })
    }
    handleDialogOpenChange(false)
  }, [activeSegmentId, suggestionResult, updateSegment, handleDialogOpenChange])

  /**
   * 다이얼로그 열기 (초기 제안 텍스트 설정)
   */
  const openAiDialog = useCallback(() => {
    setSuggestionResult(currentActiveSegment?.target_text ?? '')
    setIsAiDialogOpen(true)
  }, [currentActiveSegment])

  return {
    // 상태
    isAiDialogOpen,
    suggestionResult,
    suggestionPage,
    suggestionTotalPages,
    targetLanguage,

    // 핸들러
    handleRequestSuggestion,
    handleSuggestionPageChange,
    handleDialogOpenChange,
    handleApplySuggestion,
    openAiDialog,
  }
}
