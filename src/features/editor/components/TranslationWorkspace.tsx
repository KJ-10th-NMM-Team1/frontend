import { useEffect, useMemo, useRef, useState } from 'react'

import { ArrowRight } from 'lucide-react'

import type { Segment } from '@/entities/segment/types'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { useSegmentsStore } from '@/shared/store/useSegmentsStore'
import { Button } from '@/shared/ui/Button'
import { apiPost } from '@/shared/api/client'

import { TranslationSegmentCard } from './TranslationSegmentCard'

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

  // store에서 segments 가져오기 (없으면 props의 segments 사용)
  const displaySegments = segments.map((seg) => {
    const storeSegment = storeSegments.find((s) => s.id === seg.id)
    return storeSegment ?? seg
  })

  return (
    <section className="border-surface-3 bg-surface-1 flex h-full flex-col rounded-3xl border p-3 shadow-soft">
      <header className="border-surface-3 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="text-muted flex items-center gap-2 text-sm font-medium">
          <span>{sourceLanguage}</span>
          <ArrowRight className="h-4 w-4" />
          <span>{languageNameMap[targetLanguage]}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm">
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
  )
}
