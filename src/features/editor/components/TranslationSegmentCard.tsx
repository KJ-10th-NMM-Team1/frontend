import { ArrowRight } from 'lucide-react'

import type { Segment } from '@/entities/segment/types'
import { Button } from '@/shared/ui/Button'

type TranslationSegmentCardProps = {
  segment: Segment
  index: number
  isActive: boolean
  sourceText: string
  targetText: string
  isTranslating?: boolean
  isGeneratingAudio?: boolean
  onSourceChange: (value: string) => void
  onTargetChange: (value: string) => void
  onTranscribeAudio: () => void
  onGenerateAudio: () => void
  onSegmentClick: () => void
  cardRef?: (node: HTMLElement | null) => void
}

export function TranslationSegmentCard({
  segment,
  index,
  isActive,
  sourceText,
  targetText,
  isTranslating = false,
  isGeneratingAudio = false,
  onSourceChange,
  onTargetChange,
  onTranscribeAudio,
  onGenerateAudio,
  onSegmentClick,
  cardRef,
}: TranslationSegmentCardProps) {
  return (
    <article
      ref={cardRef}
      className={`space-y-3 transition ${
        isActive ? 'border-primary bg-primary/5 shadow-primary/20' : ''
      }`}
    >
      <div className="text-muted flex items-center justify-between text-sm font-semibold uppercase tracking-[0.2em]">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span>{segment.speaker_tag}</span>
      </div>
      <div className="grid gap-2 lg:grid-cols-[1fr_auto_1fr]">
        {/* 왼쪽 패널: 원문 */}
        <div className="flex flex-col gap-3">
          <textarea
            className="scrollbar-thin bg-surface-1 text-foreground border-primary/40 focus-visible:outline-hidden focus-visible:ring-primary h-36 w-full resize-none rounded-md border p-3 text-sm focus-visible:ring-2"
            value={sourceText}
            onClick={onSegmentClick}
            onChange={(event) => onSourceChange(event.target.value)}
            placeholder="원문을 입력하세요"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onTranscribeAudio}
            disabled={isTranslating || !sourceText.trim()}
            className="w-full"
          >
            {isTranslating ? '번역 중...' : 'Translate'}
          </Button>
        </div>

        {/* 중간 화살표 */}
        <div className="hidden items-center justify-center px-2 lg:flex">
          <ArrowRight className="text-muted h-6 w-6" />
        </div>

        {/* 오른쪽 패널: 번역 */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              className="scrollbar-thin bg-surface-1 text-foreground border-primary/40 focus-visible:outline-hidden focus-visible:ring-primary h-36 w-full resize-none rounded-md border p-3 text-sm focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={targetText}
              onClick={onSegmentClick}
              onChange={(event) => onTargetChange(event.target.value)}
              placeholder={isTranslating ? '번역 중...' : '번역을 입력하세요'}
              disabled={isTranslating}
            />
            {isTranslating && (
              <div className="bg-surface-1/80 absolute inset-0 flex items-center justify-center rounded-2xl">
                <div className="flex flex-col items-center gap-2">
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                  <span className="text-muted text-sm">번역 중...</span>
                </div>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onGenerateAudio}
            disabled={isGeneratingAudio || !targetText.trim()}
            className="w-full"
          >
            {isGeneratingAudio ? '생성 중...' : 'Generate Audio'}
          </Button>
        </div>
      </div>
    </article>
  )
}
