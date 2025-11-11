import { useEffect, useMemo, useRef, useState } from 'react'

import { ArrowRight } from 'lucide-react'

import type { Segment } from '@/entities/segment/types'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { Button } from '@/shared/ui/Button'

type TranslationWorkspaceProps = {
  segments: Segment[]
  sourceLanguage: string
  targetLanguage: string
}

export function TranslationWorkspace({
  segments,
  sourceLanguage,
  targetLanguage,
}: TranslationWorkspaceProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const { data: languageData } = useLanguage()
  const { setPlayhead, setActiveSegment, setPlaying, activeSegmentId } = useEditorStore(
    (state) => ({
      setPlayhead: state.setPlayhead,
      setActiveSegment: state.setActiveSegment,
      setPlaying: state.setPlaying,
      activeSegmentId: state.activeSegmentId,
    }),
  )
  const languageNameMap = useMemo(() => {
    const items = languageData ?? []
    return items.reduce<Record<string, string>>((acc, item) => {
      acc[item.language_code] = item.name_ko
      return acc
    }, {})
  }, [languageData])

  useEffect(() => {
    setDrafts(
      segments.reduce<Record<string, string>>((acc, segment) => {
        acc[segment.id] = segment.target_text ?? ''
        return acc
      }, {}),
    )
  }, [segments])

  const handleChange = (segmentId: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [segmentId]: value }))
  }

  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleSegmentAreaClick = (segment: Segment) => {
    setPlaying(false)
    setActiveSegment(segment.id)
    setPlayhead(segment.start)
  }

  useEffect(() => {
    if (!activeSegmentId) return
    const node = segmentRefs.current[activeSegmentId]
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeSegmentId])

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
        {segments.map((segment, index) => {
          const isActive = activeSegmentId === segment.id
          return (
            <article
              key={segment.id}
              ref={(node) => {
                segmentRefs.current[segment.id] = node
              }}
              className={`bg-surface-2 hover:border-primary/40 border-surface-3 space-y-3 rounded-2xl border p-4 shadow-inner transition ${
                isActive ? 'border-primary bg-primary/5 shadow-primary/20' : ''
              }`}
            >
              <div className="text-muted flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em]">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{segment.speaker_tag}</span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <textarea
                  className="bg-surface-1 text-foreground border-surface-3 h-32 w-full resize-none rounded-2xl border p-3 text-sm shadow-inner"
                  readOnly
                  value={segment.source_text}
                />
                <textarea
                  className="bg-surface-1 text-foreground border-primary/40 focus-visible:outline-hidden focus-visible:ring-primary h-32 w-full resize-none rounded-2xl border p-3 text-sm shadow-inner focus-visible:ring-2"
                  value={drafts[segment.id] ?? ''}
                  onClick={() => handleSegmentAreaClick(segment)}
                  onChange={(event) => handleChange(segment.id, event.target.value)}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
