import { useMemo, useState } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { ArrowLeft, Play, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface STTSegment {
  id: string
  startTime: string
  endTime: string
  text: string
  speaker?: string
  confidence: number
}

interface GroupedSegment {
  key: string
  startTime: string
  endTime: string
  segments: STTSegment[]
  averageConfidence: number
}

interface STTEditorProps {
  segments: STTSegment[]
  onSave: (segments: STTSegment[]) => void
  onBack: () => void
  language: string
}

export function STTEditor({ segments, onSave, onBack, language }: STTEditorProps) {
  const [editedSegments, setEditedSegments] = useState<STTSegment[]>(segments)
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null)

  const groupedSegments = useMemo<GroupedSegment[]>(() => {
    const groups: GroupedSegment[] = []
    const indexMap = new Map<string, number>()

    editedSegments.forEach((segment) => {
      const timeKey = `${segment.startTime}-${segment.endTime}`
      if (indexMap.has(timeKey)) {
        const idx = indexMap.get(timeKey)!
        groups[idx].segments.push(segment)
      } else {
        const idx = groups.length
        indexMap.set(timeKey, idx)
        groups.push({
          key: `${timeKey}-${idx}`,
          startTime: segment.startTime,
          endTime: segment.endTime,
          segments: [segment],
          averageConfidence: segment.confidence,
        })
      }
    })

    return groups.map((group) => ({
      ...group,
      key: group.segments.map((s) => s.id).join('|'),
      averageConfidence:
        group.segments.reduce((acc, seg) => acc + seg.confidence, 0) / group.segments.length,
    }))
  }, [editedSegments])

  const handleTextChange = (id: string, newText: string) => {
    setEditedSegments((prev) => prev.map((s) => (s.id === id ? { ...s, text: newText } : s)))
  }

  const handleGroupTimeChange = (ids: string[], field: 'startTime' | 'endTime', value: string) => {
    const targetIds = new Set(ids)
    setEditedSegments((prev) =>
      prev.map((s) => (targetIds.has(s.id) ? { ...s, [field]: value } : s))
    )
  }

  const handleSpeakerChange = (id: string, speaker: string) => {
    setEditedSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, speaker: speaker.trim() || undefined } : s))
    )
  }

  const handleSave = () => {
    onSave(editedSegments)
    toast.success('STT 수정사항이 저장되었습니다')
    onBack()
  }

  const lowConfidenceCount = editedSegments.filter((s) => s.confidence < 0.8).length

  const multiSpeakerCount = groupedSegments.filter((group) => group.segments.length > 1).length

  const getSpeakerBadgeClasses = (speaker?: string) => {
    const palette: Record<string, string> = {
      A: 'bg-blue-100 text-blue-700 border-blue-200',
      B: 'bg-green-100 text-green-700 border-green-200',
      C: 'bg-purple-100 text-purple-700 border-purple-200',
      D: 'bg-orange-100 text-orange-700 border-orange-200',
    }
    return speaker
      ? (palette[speaker] ?? 'bg-gray-100 text-gray-600 border-gray-200')
      : 'bg-gray-100 text-gray-500 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                대시보드로 돌아가기
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h2 className="flex items-center gap-2">
                  음성 인식 결과 편집 (STT) - {language}
                  {lowConfidenceCount > 0 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      낮은 신뢰도 {lowConfidenceCount}개
                    </Badge>
                  )}
                </h2>
                <p className="text-xs text-gray-500">
                  총 {groupedSegments.length}개 타임슬롯 · 화자 분리 {multiSpeakerCount}개
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                자동 구두점 추가
              </Button>
              <Button variant="outline" size="sm">
                화자 분리
              </Button>
              <Button onClick={handleSave}>저장 및 다음 단계</Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-3">
          {groupedSegments.map((group, index) => {
            const segmentIds = group.segments.map((s) => s.id)
            return (
              <Card
                key={group.key}
                className={`transition-all ${
                  group.averageConfidence < 0.8 ? 'border-yellow-300 bg-yellow-50/30' : ''
                } ${selectedGroupKey === group.key ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedGroupKey(group.key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="text-lg text-gray-400">#{index + 1}</div>
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* 타임코드 */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={group.startTime}
                            onChange={(e) =>
                              handleGroupTimeChange(segmentIds, 'startTime', e.target.value)
                            }
                            className="w-24 h-8 text-xs text-center"
                          />
                          <span className="text-gray-400">→</span>
                          <Input
                            type="text"
                            value={group.endTime}
                            onChange={(e) =>
                              handleGroupTimeChange(segmentIds, 'endTime', e.target.value)
                            }
                            className="w-24 h-8 text-xs text-center"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          {group.averageConfidence >= 0.8 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-xs text-gray-500">
                            평균 신뢰도 {(group.averageConfidence * 100).toFixed(0)}%
                          </span>
                        </div>

                        {group.segments.length > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            동시 화자 {group.segments.length}명
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        {group.segments.map((segment) => (
                          <div
                            key={segment.id}
                            className="rounded-lg border border-gray-200/80 bg-white/80 p-3"
                          >
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getSpeakerBadgeClasses(segment.speaker)}`}
                              >
                                {segment.speaker ? `화자 ${segment.speaker}` : '화자 미지정'}
                              </Badge>
                              <span className="text-[11px] text-gray-500">
                                신뢰도 {(segment.confidence * 100).toFixed(0)}%
                              </span>
                              <Input
                                value={segment.speaker ?? ''}
                                onChange={(e) => handleSpeakerChange(segment.id, e.target.value)}
                                placeholder="화자 태그"
                                className="w-28 h-8 text-xs"
                              />
                            </div>
                            <Textarea
                              value={segment.text}
                              onChange={(e) => handleTextChange(segment.id, e.target.value)}
                              className="min-h-[60px] resize-none"
                              placeholder="인식된 텍스트를 수정하세요"
                            />
                          </div>
                        ))}
                      </div>

                      {/* 미리보기 버튼 */}
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Play className="w-3 h-3" />
                          구간 재생
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
