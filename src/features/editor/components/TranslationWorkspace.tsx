import { useEffect, useMemo, useRef, useState } from 'react'

import { ArrowRight } from 'lucide-react'

import type { Segment } from '@/entities/segment/types'
import type { SuggestionContext } from '@/entities/suggestion/types'
import { fetchSuggestion } from '@/features/editor/api/suggestionApi'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { apiPost } from '@/shared/api/client'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { useSegmentsStore } from '@/shared/store/useSegmentsStore'
import { useSuggestionStore } from '@/shared/store/useSuggestionStore'
import { Button } from '@/shared/ui/Button'

import { TranslationSegmentCard } from './TranslationSegmentCard'
import { SuggestionDialog } from './suggestion/SuggestionDialog'

type TranslationWorkspaceProps = {
  projectId: string
  segments: Segment[]
  sourceLanguage: string
  targetLanguage: string
}

export function TranslationWorkspace({
  projectId,
  segments,
  sourceLanguage,
  targetLanguage,
}: TranslationWorkspaceProps) {
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [suggestionResult, setSuggestionResult] = useState<string>('')
  const { data: languageData } = useLanguage()
  const { setPlayhead, setActiveSegment, setPlaying, activeSegmentId } = useEditorStore(
    (state) => ({
      setPlayhead: state.setPlayhead,
      setActiveSegment: state.setActiveSegment,
      setPlaying: state.setPlaying,
      activeSegmentId: state.activeSegmentId,
    }),
  )
  const {
    segments: storeSegments,
    setSegments,
    updateSegment,
  } = useSegmentsStore((state) => ({
    segments: state.segments,
    setSegments: state.setSegments,
    updateSegment: state.updateSegment,
  }))

  const languageNameMap = useMemo(() => {
    const items = languageData ?? []
    return items.reduce<Record<string, string>>((acc, item) => {
      acc[item.language_code] = item.name_ko
      return acc
    }, {})
  }, [languageData])

  // segments가 변경되면 store에 반영
  useEffect(() => {
    setSegments(segments)
  }, [segments, setSegments])

  const handleChange = (segmentId: string, value: string) => {
    updateSegment(segmentId, { target_text: value })
  }

  const handleSourceChange = (segmentId: string, value: string) => {
    updateSegment(segmentId, { source_text: value })
  }

  const segmentRefs = useRef<Record<string, HTMLElement | null>>({})

  const handleSegmentAreaClick = (segment: Segment) => {
    setPlaying(false)
    setActiveSegment(segment.id)
    setPlayhead(segment.start)
  }

  const [translatingSegments, setTranslatingSegments] = useState<Set<string>>(new Set())

  const handleTranslate = async (segment: Segment) => {
    // 이미 번역 중이면 무시
    if (translatingSegments.has(segment.id)) {
      return
    }

    // store의 최신 source_text 사용 (사용자가 수정한 내용 반영)
    const currentSegment = storeSegments.find((s) => s.id === segment.id) ?? segment

    const sourceText = currentSegment.source_text ?? segment.source_text ?? ''
    if (!sourceText.trim()) {
      console.warn('Source text is empty, cannot translate')
      return
    }

    // 번역 중 상태 추가
    setTranslatingSegments((prev) => new Set(prev).add(segment.id))

    try {
      const response = await apiPost<{
        segment_id: string
        translation_id: string
        source_text: string
        target_text: string
        language_code: string
        src_lang: string | null
      }>(
        `api/segments/${segment.id}/translate`,
        {
          target_lang: targetLanguage,
          src_lang: sourceLanguage || undefined,
          source_text: sourceText, // 수정한 source_text 전달
        },
        {
          timeout: 60_000, // 번역은 시간이 걸릴 수 있으므로 60초로 설정
        },
      )

      // 번역 결과를 store에 반영
      updateSegment(segment.id, { target_text: response.target_text })

      console.log('Translation completed:', response)
    } catch (error) {
      console.error('Translation failed:', error)
      // 에러 발생 시 사용자에게 알림 (선택사항)
      // alert('번역에 실패했습니다. 다시 시도해주세요.')
    } finally {
      // 번역 중 상태 제거
      setTranslatingSegments((prev) => {
        const next = new Set(prev)
        next.delete(segment.id)
        return next
      })
    }
  }

  const handleGenerateAudio = (segment: Segment) => {
    // TODO: Generate Audio API 호출 구현
    console.log('Generate Audio for segment:', segment.id)
    // 예: await apiPost(`/api/segments/${segment.id}/generate-audio`, { ... })
  }

  useEffect(() => {
    if (!activeSegmentId) return
    const node = segmentRefs.current[activeSegmentId]
    if (!node) return
    // node.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeSegmentId])

  const displaySegments = segments.map((seg) => {
    const storeSegment = storeSegments.find((s) => s.id === seg.id)
    return storeSegment ?? seg
  })

  const currentActiveSegment = useMemo(() => {
    if (!activeSegmentId) return null
    return displaySegments.find((segment) => segment.id === activeSegmentId) ?? null
  }, [activeSegmentId, displaySegments])

  const { items: suggestionsBySegment, addSuggestion, clearAll } = useSuggestionStore()
  const segmentSuggestions = useMemo(
    () => (activeSegmentId ? suggestionsBySegment[activeSegmentId] ?? [] : []),
    [activeSegmentId, suggestionsBySegment],
  )
  const [suggestionPage, setSuggestionPage] = useState(1)

  useEffect(() => {
    const nextLength = segmentSuggestions.length || 1
    setSuggestionPage(nextLength)
    setSuggestionResult(
      segmentSuggestions.length > 0
        ? segmentSuggestions[segmentSuggestions.length - 1].text
        : currentActiveSegment?.target_text ?? '',
    )
  }, [activeSegmentId, segmentSuggestions, currentActiveSegment])

  const PAGE_SIZE = 6
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(displaySegments.length / PAGE_SIZE))
  const paginatedSegments = displaySegments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const handleRequestSuggestion = async (context: SuggestionContext) => {
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
  }

  const suggestionTotalPages = Math.max(1, segmentSuggestions.length || 1)

  const handleSuggestionPageChange = (page: number) => {
    if (!segmentSuggestions.length) {
      setSuggestionPage(1)
      setSuggestionResult(currentActiveSegment?.target_text ?? '')
      return
    }
    const safePage = Math.min(Math.max(1, page), suggestionTotalPages)
    setSuggestionPage(safePage)
    setSuggestionResult(segmentSuggestions[safePage - 1].text)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsAiDialogOpen(open)
    if (!open) {
      clearAll()
      setSuggestionPage(1)
      setSuggestionResult('')
    }
  }

  const handleApplySuggestion = () => {
    if (activeSegmentId) {
      updateSegment(activeSegmentId, { target_text: suggestionResult })
    }
    handleDialogOpenChange(false)
  }

  return (
    <>
      <section className="border-surface-3 bg-surface-1 flex h-full flex-col rounded-3xl border p-3 shadow-soft">
        <header className="border-surface-3 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="text-muted flex items-center gap-2 text-sm font-medium">
            <span>{sourceLanguage}</span>
            <ArrowRight className="h-4 w-4" />
            <span>{languageNameMap[targetLanguage]}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSuggestionResult(currentActiveSegment?.target_text ?? '')
                setIsAiDialogOpen(true)
              }}
            >
              AI 제안 받기
            </Button>
            <Button type="button" variant="primary" size="sm">
              번역 저장
            </Button>
          </div>
        </header>
        <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-2">
          {displaySegments.map((segment, index) => {
            const isActive = activeSegmentId === segment.id
            const isTranslating = translatingSegments.has(segment.id)
            return (
              <TranslationSegmentCard
                key={segment.id}
                segment={segment}
                index={index}
                isActive={isActive}
                sourceText={segment.source_text ?? ''}
                targetText={segment.target_text ?? ''}
                isTranslating={isTranslating}
                onSourceChange={(value) => handleSourceChange(segment.id, value)}
                onTargetChange={(value) => handleChange(segment.id, value)}
                onTranscribeAudio={() => {
                  void handleTranslate(segment)
                }}
                onGenerateAudio={() => handleGenerateAudio(segment)}
                onSegmentClick={() => handleSegmentAreaClick(segment)}
                cardRef={(node) => {
                  segmentRefs.current[segment.id] = node
                }}
              />
            )
          })}
        </div>
      </section>
      <SuggestionDialog
        isOpen={isAiDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onRequestSuggestion={handleRequestSuggestion}
        suggestionText={suggestionResult}
        currentPage={suggestionPage}
        totalPages={suggestionTotalPages}
        onPageChange={handleSuggestionPageChange}
        languageLabel={languageNameMap[targetLanguage] ?? targetLanguage}
        onApply={handleApplySuggestion}
      />
    </>
  )
}
