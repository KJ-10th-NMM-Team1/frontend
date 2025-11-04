import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Play, User, Wand2 } from 'lucide-react'
import { getVoicePresets, type VoicePreset } from '@/features/projects/services/voice'

interface Translation {
  id: string
  speaker?: string
}

interface VoiceSelectorProps {
  translations: Translation[]
  onVoiceChange?: (speaker: string, config: { voiceId?: string; preserveTone: boolean }) => void
  initialConfig?: Record<string, { voiceId?: string; preserveTone: boolean }>
}

const styleOptions = [
  { value: 'news', label: '뉴스/공식' },
  { value: 'friendly', label: '친근한' },
  { value: 'calm', label: '차분한' },
  { value: 'energetic', label: '활기찬' },
]

export function VoiceSelector({ translations, onVoiceChange, initialConfig }: VoiceSelectorProps) {
  const speakers = Array.from(
    new Set(translations.map((t) => t.speaker).filter(Boolean))
  ) as string[]

  // 화자가 없으면 기본 화자 1명 추가
  const displaySpeakers = speakers.length > 0 ? speakers : ['A']
  const [speakerConfig, setSpeakerConfig] = useState<
    Record<string, { voiceId?: string; preserveTone: boolean; lastVoiceId?: string }>
  >({})
  const [selectedStyle, setSelectedStyle] = useState<string>('friendly')
  const [voicePresets, setVoicePresets] = useState<VoicePreset[]>([])

  // 보이스 프리셋 로드
  useEffect(() => {
    getVoicePresets()
      .then(setVoicePresets)
      .catch((err) => console.error('Failed to load voice presets:', err))
  }, [])

  useEffect(() => {
    setSpeakerConfig((prev) => {
      const next: Record<
        string,
        { voiceId?: string; preserveTone: boolean; lastVoiceId?: string }
      > = {}
      displaySpeakers.forEach((speaker) => {
        const incoming = initialConfig?.[speaker]
        const existing = prev[speaker]
        next[speaker] = {
          preserveTone: incoming?.preserveTone ?? existing?.preserveTone ?? true,
          voiceId: incoming?.voiceId ?? (incoming?.preserveTone ? undefined : existing?.voiceId),
          lastVoiceId: incoming?.voiceId ?? existing?.lastVoiceId,
        }
      })
      return next
    })
  }, [initialConfig, displaySpeakers])

  const updateSpeakerConfig = (
    speaker: string,
    updater: (existing: { voiceId?: string; preserveTone: boolean; lastVoiceId?: string }) => {
      voiceId?: string
      preserveTone: boolean
      lastVoiceId?: string
    }
  ) => {
    setSpeakerConfig((prev) => {
      const existing = prev[speaker] ?? { preserveTone: true }
      const next = updater(existing)
      return { ...prev, [speaker]: next }
    })
  }

  const handleVoiceSelect = (speaker: string, voiceId: string) => {
    updateSpeakerConfig(speaker, (existing) => ({
      ...existing,
      voiceId,
      lastVoiceId: voiceId,
    }))
    onVoiceChange?.(speaker, {
      voiceId,
      preserveTone: speakerConfig[speaker]?.preserveTone ?? false,
    })
  }

  const handleToneToggle = (speaker: string, preserveTone: boolean) => {
    const existing = speakerConfig[speaker] ?? { preserveTone: true }
    const nextConfig = preserveTone
      ? {
          ...existing,
          preserveTone: true,
          lastVoiceId: existing.voiceId ?? existing.lastVoiceId,
          voiceId: undefined,
        }
      : {
          ...existing,
          preserveTone: false,
          voiceId: existing.lastVoiceId ?? existing.voiceId,
        }

    updateSpeakerConfig(speaker, () => nextConfig)
    onVoiceChange?.(speaker, { voiceId: nextConfig.voiceId, preserveTone: nextConfig.preserveTone })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 왼쪽: 보이스 프리셋 */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">보이스 프리셋</CardTitle>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(90vh-400px)]">
              <div className="grid gap-3">
                {voicePresets.map((voice) => (
                  <Card
                    key={voice.id}
                    className="hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback
                            className={
                              voice.gender === 'female'
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-blue-100 text-blue-700'
                            }
                          >
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{voice.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {voice.age}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {voice.style} • {voice.language}
                          </p>
                        </div>

                        <Button variant="ghost" size="sm" className="gap-1">
                          <Play className="w-3 h-3" />
                          샘플
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              보이스 클로닝
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 border-2 border-dashed rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                원하는 음성 샘플을 업로드하여
                <br />
                커스텀 보이스를 생성하세요
              </p>
              <Button variant="outline" size="sm">
                음성 파일 업로드
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 오른쪽: 화자별 보이스 매핑 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">화자별 보이스 매핑</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displaySpeakers.map((speaker) => {
                const selectedVoice = speakerConfig[speaker]?.voiceId
                const preserveTone = speakerConfig[speaker]?.preserveTone ?? true
                const voice = voicePresets.find((v) => v.id === selectedVoice)

                return (
                  <Card key={speaker} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gray-100">{speaker}</AvatarFallback>
                            </Avatar>
                            <span>화자 {speaker}</span>
                          </div>
                          <Badge variant="secondary">
                            {translations.filter((t) => t.speaker === speaker).length}개 문장
                          </Badge>
                        </div>

                        <Select
                          disabled={preserveTone}
                          value={selectedVoice}
                          onValueChange={(value) => handleVoiceSelect(speaker, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="보이스 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {voicePresets.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.name} ({v.style})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div>
                            <p className="text-sm font-medium">원문 톤 유지</p>
                            <p className="text-xs text-gray-500">
                              원본 발화자의 톤과 억양을 최대한 반영합니다
                            </p>
                          </div>
                          <Switch
                            checked={preserveTone}
                            onCheckedChange={(checked) => handleToneToggle(speaker, checked)}
                          />
                        </div>

                        {preserveTone && (
                          <div className="flex items-center justify-between bg-blue-50 p-3 rounded text-xs text-blue-700">
                            원문 화자의 톤을 그대로 클로닝하여 사용합니다.
                          </div>
                        )}

                        {!preserveTone && voice && (
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback
                                  className={
                                    voice.gender === 'female'
                                      ? 'bg-pink-100 text-pink-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }
                                >
                                  <User className="w-4 h-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm">
                                <p>{voice.name}</p>
                                <p className="text-xs text-gray-500">{voice.style}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Play className="w-3 h-3" />
                              샘플
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {displaySpeakers.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">프리뷰 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">배경 음악 유지</span>
                <Button variant="outline" size="sm">
                  ON
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">음성 속도</span>
                <Select defaultValue="normal">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">느리게</SelectItem>
                    <SelectItem value="normal">보통</SelectItem>
                    <SelectItem value="fast">빠르게</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
