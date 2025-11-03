import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

interface Translation {
  id: string
  timestamp: string
  original: string
  translated: string
  confidence: number
  segmentDurationSeconds?: number
  originalSpeechSeconds?: number
  translatedSpeechSeconds?: number
}

interface TranslationEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: string
  translations: Translation[]
  onSave: (translations: Translation[]) => void
}

export function TranslationEditor({
  open,
  onOpenChange,
  language,
  translations,
  onSave,
}: TranslationEditorProps) {
  const [editedTranslations, setEditedTranslations] = useState<Translation[]>(translations)

  const parseTimestampDuration = (timestamp: string) => {
    const [start, end] = timestamp.split(' - ')
    if (!start || !end) return 0
    const toSeconds = (value: string) => {
      const parts = value.split(':').map(Number)
      if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
        return 0
      }
      const [hours, minutes, seconds] = parts
      return hours * 3600 + minutes * 60 + seconds
    }
    const duration = toSeconds(end) - toSeconds(start)
    return duration > 0 ? duration : 0
  }

  const getSegmentDuration = (translation: Translation) =>
    translation.segmentDurationSeconds ?? parseTimestampDuration(translation.timestamp)

  const formatSeconds = (value?: number) => {
    if (value === undefined) return '-'
    return `${value.toFixed(1)}초`
  }

  const getGaugeColor = (progress: number) => {
    if (progress <= 80) return 'bg-emerald-500'
    if (progress <= 100) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const handleTranslationChange = (id: string, newText: string) => {
    setEditedTranslations((prev) =>
      prev.map((t) => (t.id === id ? { ...t, translated: newText } : t))
    )
  }

  const handleSave = () => {
    onSave(editedTranslations)
    onOpenChange(false)
  }

  const lowConfidenceCount = editedTranslations.filter((t) => t.confidence < 0.8).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            번역 편집 - {language}
            {lowConfidenceCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                <AlertTriangle className="w-3 h-3 mr-1" />
                낮은 신뢰도 {lowConfidenceCount}개
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {editedTranslations.map((translation) => {
              // TODO: 어떻게해야하냐
              const segmentDuration = getSegmentDuration(translation)
              const safeSegmentDuration = segmentDuration || 1
              const originalSpeech = translation.originalSpeechSeconds ?? segmentDuration
              const translatedSpeech = translation.translatedSpeechSeconds ?? segmentDuration
              const originalProgress = originalSpeech
                ? (originalSpeech / safeSegmentDuration) * 100
                : 0
              const translatedProgress = translatedSpeech
                ? (translatedSpeech / safeSegmentDuration) * 100
                : 0
              const translatedDelta =
                translatedSpeech && segmentDuration ? translatedSpeech - segmentDuration : 0
              const translatedDeltaLabel =
                translatedSpeech && segmentDuration
                  ? `${translatedDelta >= 0 ? '+' : ''}${translatedDelta.toFixed(1)}초`
                  : '0.0초'
              const translatedDeltaClass =
                translatedSpeech && segmentDuration
                  ? translatedDelta > 0.3
                    ? 'text-red-600'
                    : translatedDelta < -0.3
                      ? 'text-emerald-600'
                      : 'text-gray-500'
                  : 'text-gray-500'

              return (
                <div
                  key={translation.id}
                  className={`border rounded-lg p-4 ${
                    translation.confidence < 0.8 ? 'border-yellow-300 bg-yellow-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {translation.timestamp}
                      </span>
                      <div className="flex items-center gap-1">
                        {translation.confidence >= 0.8 ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          신뢰도 {(translation.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {segmentDuration > 0 && (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-3 text-gray-500">
                          <span className="w-16 shrink-0">원문 발화</span>
                          <div className="flex-1 h-1 bg-gray-200/80 rounded-full overflow-hidden relative">
                            <span
                              className="absolute inset-y-0 w-[2px] bg-gray-400/70"
                              style={{ left: 'calc(100% - 1px)' }}
                            />
                            <div
                              className={`h-full ${getGaugeColor(originalProgress)}`}
                              style={{
                                width: `${Math.min(Math.max(originalProgress, 0), 100)}%`,
                              }}
                            />
                          </div>
                          <span className="w-28 text-right">
                            {formatSeconds(originalSpeech)} / {formatSeconds(segmentDuration)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="w-16 shrink-0 text-gray-500">번역 발화</span>
                          <div className="flex-1 h-1 bg-gray-200/80 rounded-full overflow-hidden relative">
                            <span
                              className="absolute inset-y-0 w-[2px] bg-gray-400/70"
                              style={{ left: 'calc(100% - 1px)' }}
                            />
                            <div
                              className={`h-full ${getGaugeColor(translatedProgress)}`}
                              style={{
                                width: `${Math.min(Math.max(translatedProgress, 0), 100)}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2 w-36">
                            <span className="text-gray-500">
                              {formatSeconds(translatedSpeech)} / {formatSeconds(segmentDuration)}
                            </span>
                            {translatedSpeech && segmentDuration ? (
                              <span className={translatedDeltaClass}>{translatedDeltaLabel}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">원문</label>
                      <div className="bg-gray-50 p-3 rounded text-sm">{translation.original}</div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">번역</label>
                      <Textarea
                        value={translation.translated}
                        onChange={(e) => handleTranslationChange(translation.id, e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-500">총 {editedTranslations.length}개 문장</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button onClick={handleSave}>저장</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
