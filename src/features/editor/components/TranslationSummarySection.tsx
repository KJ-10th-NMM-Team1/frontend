/**
 * 번역 요약 섹션
 * 모든 세그먼트의 번역 내용을 표시하고 편집 가능
 */

import { useState, useEffect, useRef } from 'react'

import { MoreVertical } from 'lucide-react'

import { apiPost } from '@/shared/api/client'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { useTracksStore } from '@/shared/store/useTracksStore'
import { Button } from '@/shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

type TranslationSummarySectionProps = {
  projectId: string
  sourceLanguage: string
  targetLanguage: string
}

export function TranslationSummarySection({
  projectId,
  sourceLanguage,
  targetLanguage,
}: TranslationSummarySectionProps) {
  const activeSegmentId = useEditorStore((state) => state.activeSegmentId)
  const { getAllSegments, updateSegment } = useTracksStore((state) => ({
    getAllSegments: state.getAllSegments,
    updateSegment: state.updateSegment,
  }))

  const allSegments = getAllSegments()
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [translatingSegments, setTranslatingSegments] = useState<Set<string>>(new Set())
  const [generatingAudioSegments, setGeneratingAudioSegments] = useState<Set<string>>(new Set())

  // 활성 세그먼트로 자동 스크롤
  useEffect(() => {
    if (!activeSegmentId) return
    const node = segmentRefs.current[activeSegmentId]
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeSegmentId])

  const handleSourceChange = (segmentId: string, value: string) => {
    updateSegment(segmentId, { source_text: value })
  }

  const handleTargetChange = (segmentId: string, value: string) => {
    updateSegment(segmentId, { target_text: value })
  }

  const handleTranslate = async (segmentId: string) => {
    if (translatingSegments.has(segmentId)) return

    const segment = allSegments.find((s) => s.id === segmentId)
    if (!segment) return

    const sourceText = segment.source_text ?? ''
    if (!sourceText.trim()) {
      console.warn('Source text is empty, cannot translate')
      return
    }

    setTranslatingSegments((prev) => new Set(prev).add(segmentId))

    try {
      const response = await apiPost<{
        segment_id: string
        translation_id: string
        source_text: string
        target_text: string
        language_code: string
        src_lang: string | null
      }>(
        `api/segments/${segmentId}/translate`,
        {
          target_lang: targetLanguage,
          src_lang: sourceLanguage || undefined,
          source_text: sourceText,
        },
        { timeout: 60_000 },
      )

      updateSegment(segmentId, { target_text: response.target_text })
      console.log('Translation completed:', response)
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setTranslatingSegments((prev) => {
        const next = new Set(prev)
        next.delete(segmentId)
        return next
      })
    }
  }

  const handleGenerateAudio = async (segmentId: string) => {
    if (generatingAudioSegments.has(segmentId)) return

    const segment = allSegments.find((s) => s.id === segmentId)
    if (!segment) return

    const translatedText = segment.target_text ?? ''
    if (!translatedText.trim()) {
      console.warn('Target text is empty, cannot generate audio')
      return
    }

    setGeneratingAudioSegments((prev) => new Set(prev).add(segmentId))

    try {
      const payload = {
        segment_id: segmentId,
        translated_text: translatedText,
        start: segment.start,
        end: segment.end,
        target_lang: targetLanguage,
        mod: 'fixed' as const,
        voice_sample_id: null,
      }

      const response = await apiPost<{
        job_id: string
        project_id: string
        segment_idx: number
        target_lang: string
        mod: string
      }>(`api/projects/${projectId}/segments/regenerate-tts`, payload, {
        timeout: 60_000,
      })

      console.log('Audio generation job started:', response)
    } catch (error) {
      console.error('Audio generation failed:', error)
    } finally {
      setGeneratingAudioSegments((prev) => {
        const next = new Set(prev)
        next.delete(segmentId)
        return next
      })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {allSegments.map((segment) => {
          const isActive = activeSegmentId === segment.id
          const isTranslating = translatingSegments.has(segment.id)
          const isGeneratingAudio = generatingAudioSegments.has(segment.id)

          return (
            <div
              key={segment.id}
              ref={(node) => {
                segmentRefs.current[segment.id] = node
              }}
              className={`group flex items-start gap-2 rounded px-2 py-1.5 transition ${
                isActive ? 'border-primary bg-primary/5' : 'hover:bg-surface-2'
              }`}
            >
              <div className="flex-1">
                {/* 원본 텍스트 */}
                <input
                  className="text-foreground mb-0.5 w-full border-0 bg-transparent px-0 py-0 text-xs focus:outline-none"
                  value={segment.source_text || ''}
                  onChange={(e) => handleSourceChange(segment.id, e.target.value)}
                  placeholder="원문 없음"
                />

                {/* 번역 텍스트 */}
                <div className="relative flex items-center gap-1">
                  <span className="text-muted text-xs">→</span>
                  <input
                    className="text-primary flex-1 border-0 bg-transparent px-0 py-0 text-xs font-medium focus:outline-none disabled:opacity-50"
                    value={segment.target_text || ''}
                    onChange={(e) => handleTargetChange(segment.id, e.target.value)}
                    placeholder={isTranslating ? '번역 중...' : '번역 없음'}
                    disabled={isTranslating}
                  />
                  {isTranslating && (
                    <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                  )}
                </div>
              </div>

              {/* 드롭다운 버튼 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 shrink-0 p-0 opacity-0 transition group-hover:opacity-100"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => void handleTranslate(segment.id)}
                    disabled={isTranslating || !segment.source_text?.trim()}
                  >
                    {isTranslating ? '번역 중...' : '번역하기'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void handleGenerateAudio(segment.id)}
                    disabled={isGeneratingAudio || !segment.target_text?.trim()}
                  >
                    {isGeneratingAudio ? '생성 중...' : '오디오 생성'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>
    </div>
  )
}
