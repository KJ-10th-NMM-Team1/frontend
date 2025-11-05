import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Play, User, Wand2, Upload } from 'lucide-react'
import {
  getVoicePresets,
  type VoicePreset,
  uploadVoiceFile,
  getCustomVoices,
  type CustomVoice,
} from '@/features/projects/services/voice'
import { toast } from 'sonner'

interface Translation {
  id: string
  speaker?: string
}

interface VoiceSelectorProps {
  translations: Translation[]
  projectId: string
  onVoiceChange?: (speaker: string, config: { voiceId?: string; preserveTone: boolean }) => void
  initialConfig?: Record<string, { voiceId?: string; preserveTone: boolean }>
}

const styleOptions = [
  { value: 'news', label: '뉴스/공식' },
  { value: 'friendly', label: '친근한' },
  { value: 'calm', label: '차분한' },
  { value: 'energetic', label: '활기찬' },
]

export function VoiceSelector({
  translations,
  projectId,
  onVoiceChange,
  initialConfig,
}: VoiceSelectorProps) {
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
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 보이스 프리셋 및 커스텀 보이스 로드
  useEffect(() => {
    getVoicePresets()
      .then(setVoicePresets)
      .catch((err) => console.error('Failed to load voice presets:', err))

    getCustomVoices(projectId)
      .then(setCustomVoices)
      .catch((err) => console.error('Failed to load custom voices:', err))
  }, [projectId])

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 오디오 파일 검증
    if (!file.type.startsWith('audio/')) {
      toast.error('오디오 파일만 업로드 가능합니다')
      return
    }

    setIsUploading(true)
    try {
      await uploadVoiceFile(file, projectId)
      toast.success('음성 파일이 업로드되었습니다')
      // 커스텀 보이스 목록 새로고침
      const voices = await getCustomVoices(projectId)
      setCustomVoices(voices)
    } catch (error) {
      console.error('Voice upload failed:', error)
      toast.error('음성 파일 업로드에 실패했습니다')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 왼쪽: 보이스 선택 */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-base">보이스 선택</CardTitle>
              {activeTab === 'preset' && (
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
              )}
            </div>
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab('preset')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'preset'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                프리셋
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'custom'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                커스텀 ({customVoices.length})
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(90vh-500px)]">
              {activeTab === 'preset' && (
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
              )}
              {activeTab === 'custom' && (
                <div className="grid gap-3">
                  {customVoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      업로드된 커스텀 보이스가 없습니다
                    </div>
                  ) : (
                    customVoices.map((voice) => (
                      <Card
                        key={voice.id}
                        className="hover:border-blue-300 transition-colors cursor-pointer"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-purple-100 text-purple-700">
                                <Wand2 className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{voice.name}</p>
                              <p className="text-xs text-gray-500">커스텀 보이스</p>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Play className="w-3 h-3" />
                              샘플
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4" />
              보이스 업로드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 border-2 border-dashed rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                원하는 음성 샘플을 업로드하여 커스텀 보이스를 생성하세요
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? '업로드 중...' : '음성 파일 업로드'}
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
                            {customVoices.length > 0 && (
                              <>
                                <SelectItem disabled value="separator">
                                  ─── 커스텀 보이스 ───
                                </SelectItem>
                                {customVoices.map((v) => (
                                  <SelectItem key={v.id} value={v.id}>
                                    🎤 {v.name}
                                  </SelectItem>
                                ))}
                              </>
                            )}
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
