import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { PipelineStage, type StageStatus } from './PipelineStage'
import { STTEditor } from './STTEditor'
import { AdvancedTranslationEditor } from './AdvancedTranslationEditor'
import { VoiceSelector } from './VoiceSelector'
import { OutputsReview, type LanguageOutput, type PublishResult } from './OutputsReview'
import { ArrowLeft, Video, Globe, Play, Pause } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'

interface Language {
  code: string
  name: string
  subtitle: boolean
  dubbing: boolean
  translator?: string
  translationReviewed?: boolean
  voiceConfig?: Record<string, { voiceId?: string; preserveTone: boolean }>
}

interface Project {
  id: string
  name: string
  languages: Language[]
  status: string
  createdAt: string
}

interface PipelineStageData {
  id: string
  title: string
  description: string
  status: StageStatus
  progress: number
  estimatedTime?: string
}

interface ProcessingDashboardProps {
  project: Project
  onBack: () => void
  onUpdateProject?: (project: Project) => void
}

const TRANSLATOR_OPTIONS = ['김소라', '이준혁', '박민지', 'Sophia Lee', 'Alex Kim']

const UNASSIGNED_TRANSLATOR_VALUE = '__UNASSIGNED__'

export function ProcessingDashboard({
  project,
  onBack,
  onUpdateProject,
}: ProcessingDashboardProps) {
  const [languages, setLanguages] = useState<Language[]>(() =>
    project.languages.map((lang) => ({
      ...lang,
      translationReviewed: lang.translationReviewed ?? false,
      voiceConfig: lang.voiceConfig ?? {},
    }))
  )
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(project.languages[0]?.code ?? '')
  const selectedLanguage = useMemo(
    () => languages.find((lang) => lang.code === selectedLanguageCode) ?? languages[0],
    [languages, selectedLanguageCode]
  )
  const [currentView, setCurrentView] = useState<'dashboard' | 'stt' | 'translation' | 'outputs'>(
    'dashboard'
  )
  const [isPaused, setIsPaused] = useState(false)
  const [voiceMappingLanguageCode, setVoiceMappingLanguageCode] = useState<string | null>(null)
  const [voiceMappingDraft, setVoiceMappingDraft] = useState<
    Record<string, { voiceId?: string; preserveTone: boolean }>
  >({})
  const [isRagModalOpen, setIsRagModalOpen] = useState(false)
  const [assignmentDraft, setAssignmentDraft] = useState<Record<string, string>>({})
  const [reviewDraft, setReviewDraft] = useState<Record<string, boolean>>({})
  const [stages, setStages] = useState<PipelineStageData[]>([
    {
      id: 'upload',
      title: '1. 영상 업로드',
      description: '원본 영상 파일을 서버에 업로드합니다',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'stt',
      title: '2. STT (Speech to Text)',
      description: '음성을 텍스트로 변환하고 타임스탬프를 생성합니다',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'mt',
      title: '3. MT (Machine Translation)',
      description: '추출된 텍스트를 타겟 언어로 번역합니다',
      status: 'completed',
      progress: 100,
      estimatedTime: '2분',
    },
    {
      id: 'rag',
      title: '4. RAG/LLM 교정',
      description: 'AI 교정 결과를 검토하고 화자별 목소리를 매핑하세요',
      status: 'review',
      progress: 100,
      estimatedTime: '3분',
    },
    {
      id: 'tts',
      title: '5. TTS (Text to Speech)',
      description: '번역된 텍스트를 음성으로 변환합니다',
      status: 'pending',
      progress: 0,
      estimatedTime: '5분',
    },
    {
      id: 'packaging',
      title: '6. 패키징',
      description: '더빙된 음성과 자막을 영상에 합성합니다',
      status: 'pending',
      progress: 0,
      estimatedTime: '2분',
    },
    {
      id: 'outputs',
      title: '7. 산출물 점검 및 Publish',
      description: '완료된 산출물을 검수하고 배포 설정을 확정합니다',
      status: 'pending',
      progress: 0,
    },
  ])

  const updateVoiceStageStatus = useCallback(
    (nextLanguages: Language[]) => {
      const allReviewed = nextLanguages.every((lang) => lang.translationReviewed)
      const allVoicesReady = nextLanguages.every((lang) => {
        if (!lang.dubbing) return true
        return lang.voiceConfig && Object.keys(lang.voiceConfig).length > 0
      })

      setStages((prev) =>
        prev.map((stage) => {
          if (stage.id === 'rag') {
            if (allReviewed && allVoicesReady) {
              return { ...stage, status: 'completed', progress: 100 }
            }
            return {
              ...stage,
              status: 'review',
              progress: allReviewed ? 100 : 80,
            }
          }
          if (stage.id === 'tts') {
            if (allReviewed && allVoicesReady) {
              return stage.status === 'processing'
                ? stage
                : { ...stage, status: 'processing', progress: stage.progress ?? 10 }
            }
            return { ...stage, status: 'pending', progress: 0 }
          }
          return stage
        })
      )
    },
    [setStages]
  )

  const handleVoiceMappingDraftChange = useCallback(
    (speaker: string, config: { voiceId?: string; preserveTone: boolean }) => {
      setVoiceMappingDraft((prev) => ({
        ...prev,
        [speaker]: config,
      }))
    },
    []
  )

  const handleOpenVoiceMappingPage = useCallback(
    (languageCode: string) => {
      const targetLanguage = languages.find((lang) => lang.code === languageCode)
      if (!targetLanguage) return
      setVoiceMappingDraft(targetLanguage.voiceConfig ?? {})
      setVoiceMappingLanguageCode(languageCode)
      setCurrentView('voiceMapping')
    },
    [languages, setCurrentView]
  )

  const handleVoiceMappingCancel = useCallback(() => {
    setVoiceMappingLanguageCode(null)
    setVoiceMappingDraft({})
    setCurrentView('dashboard')
  }, [setCurrentView])

  const handleVoiceMappingSave = () => {
    if (!voiceMappingLanguageCode) {
      handleVoiceMappingCancel()
      return
    }

    const nextLanguages = languages.map((lang) =>
      lang.code === voiceMappingLanguageCode
        ? {
            ...lang,
            voiceConfig: { ...voiceMappingDraft },
          }
        : lang
    )

    setLanguages(nextLanguages)
    updateVoiceStageStatus(nextLanguages)
    if (onUpdateProject) {
      onUpdateProject({ ...project, languages: nextLanguages })
    }
    handleVoiceMappingCancel()
  }
  useEffect(() => {
    const cloned = project.languages.map((lang) => ({
      ...lang,
      translationReviewed: lang.translationReviewed ?? false,
      voiceConfig: lang.voiceConfig ?? {},
    }))
    setLanguages(cloned)
    setSelectedLanguageCode(project.languages[0]?.code ?? '')
    setVoiceMappingLanguageCode(null)
    setVoiceMappingDraft({})
    setAssignmentDraft(
      cloned.reduce<Record<string, string>>((acc, lang) => {
        if (lang.translator) acc[lang.code] = lang.translator
        return acc
      }, {})
    )
    setReviewDraft(
      cloned.reduce<Record<string, boolean>>((acc, lang) => {
        acc[lang.code] = lang.translationReviewed ?? false
        return acc
      }, {})
    )
    updateVoiceStageStatus(cloned)
  }, [project, updateVoiceStageStatus])

  useEffect(() => {
    if (languages.length === 0) {
      setSelectedLanguageCode('')
      return
    }
    if (!languages.some((lang) => lang.code === selectedLanguageCode)) {
      setSelectedLanguageCode(languages[0].code)
    }
  }, [languages, selectedLanguageCode])

  const mockSTTSegments = [
    {
      id: '1',
      startTime: '00:00:00',
      endTime: '00:00:05',
      text: 'Welcome to our product demonstration',
      speaker: 'A',
      confidence: 0.95,
    },
    {
      id: '2',
      startTime: '00:00:06',
      endTime: '00:00:12',
      text: "Today we'll show you the key features",
      speaker: 'A',
      confidence: 0.92,
    },
    {
      id: '3a',
      startTime: '00:00:13',
      endTime: '00:00:18',
      text: 'This innovative solution helps streamline your workflow',
      speaker: 'A',
      confidence: 0.76,
    },
    {
      id: '3b',
      startTime: '00:00:13',
      endTime: '00:00:18',
      text: 'Absolutely, it keeps every team aligned and efficient',
      speaker: 'B',
      confidence: 0.81,
    },
    {
      id: '4',
      startTime: '00:00:19',
      endTime: '00:00:25',
      text: "Let's dive into the details",
      speaker: 'B',
      confidence: 0.88,
    },
  ]

  const mockTranslations = [
    {
      id: '1',
      timestamp: '00:00:00 - 00:00:05',
      original: 'Welcome to our product demonstration',
      translated: '제품 시연에 오신 것을 환영합니다',
      confidence: 0.95,
      issues: [],
      speaker: 'A',
      segmentDurationSeconds: 5,
      originalSpeechSeconds: 4.6,
      translatedSpeechSeconds: 4.8,
    },
    {
      id: '2',
      timestamp: '00:00:06 - 00:00:12',
      original: "Today we'll show you the key features",
      translated: '오늘은 주요 기능들을 보여드리겠습니다',
      confidence: 0.92,
      issues: [
        {
          type: 'length' as const,
          severity: 'warning' as const,
          message: '원문보다 20% 길어짐',
          suggestion: '오늘은 핵심 기능을 보여드리겠습니다',
        },
      ],
      speaker: 'A',
      segmentDurationSeconds: 6,
      originalSpeechSeconds: 5.1,
      translatedSpeechSeconds: 6.6,
      correctionSuggestions: [
        {
          id: '2-alt-1',
          text: '오늘은 핵심 기능을 간단히 소개해 드리겠습니다',
          reason: '길이 단축',
        },
        {
          id: '2-alt-2',
          text: '주요 기능을 빠르게 살펴보겠습니다',
          reason: '톤 중립화',
        },
      ],
      termCorrections: [
        {
          id: '2-term-1',
          original: '주요 기능들을',
          replacement: '핵심 기능을',
          reason: '중복 표현 축약',
        },
      ],
    },
    {
      id: '3a',
      timestamp: '00:00:13 - 00:00:18',
      original: 'This innovative solution helps streamline your workflow',
      translated: '이 혁신적인 솔루션은 작업 흐름을 간소화합니다',
      confidence: 0.76,
      issues: [
        {
          type: 'term' as const,
          severity: 'warning' as const,
          message: "workflow는 '작업 흐름'으로 통일되게 번역",
          suggestion: '이 혁신적인 솔루션은 작업 흐름을 간소화합니다',
        },
      ],
      speaker: 'A',
      segmentDurationSeconds: 5,
      originalSpeechSeconds: 4.2,
      translatedSpeechSeconds: 5.1,
      correctionSuggestions: [
        {
          id: '3a-alt-1',
          text: '이 혁신적인 솔루션은 우리의 작업 흐름을 단순화합니다',
          reason: '톤 보정',
        },
      ],
      termCorrections: [
        {
          id: '3a-term-1',
          original: '작업 흐름',
          replacement: '워크플로',
          reason: '전문 용어 유지',
        },
      ],
    },
    {
      id: '3b',
      timestamp: '00:00:13 - 00:00:18',
      original: 'Absolutely, it keeps every team aligned and efficient',
      translated: '맞아요, 모든 팀이 정렬되고 효율적으로 움직이죠',
      confidence: 0.81,
      issues: [],
      speaker: 'B',
      segmentDurationSeconds: 5,
      originalSpeechSeconds: 4.3,
      translatedSpeechSeconds: 4.6,
    },
    {
      id: '4',
      timestamp: '00:00:19 - 00:00:25',
      original: "Let's dive into the details",
      translated: '자세한 내용을 살펴보겠습니다',
      confidence: 0.88,
      issues: [],
      speaker: 'B',
      segmentDurationSeconds: 6,
      originalSpeechSeconds: 4.8,
      translatedSpeechSeconds: 5.2,
    },
  ]

  const [sttSegments, setSTTSegments] = useState(mockSTTSegments)
  const [translations, setTranslations] = useState(mockTranslations)
  const aiRefinementInsights = [
    '길이 초과 구간을 평균 12% 단축했습니다',
    "workflow 용어를 '작업 흐름'으로 통일했습니다",
    '발화 길이를 원문과 0.4초 이내로 맞췄습니다',
  ]
  const [publishResults, setPublishResults] = useState<Record<string, PublishResult>>({})

  const buildOutputBundle = (lang: Language, index: number): LanguageOutput => {
    const baseTimestamp = `2025-10-26 09:${(40 + index).toString().padStart(2, '0')}`
    const assets: LanguageOutput['assets'] = []

    if (lang.subtitle) {
      assets.push({
        id: `${lang.code}-subtitle`,
        label: '자막 파일 (VTT)',
        type: 'subtitle',
        format: 'VTT',
        size: `${24 + index} KB`,
        lastModified: baseTimestamp,
        downloadUrl: '#',
      })
    }

    assets.push({
      id: `${lang.code}-video`,
      label: '합성 영상 (MP4)',
      type: 'video',
      format: 'MP4',
      size: `${140 + index * 5} MB`,
      lastModified: baseTimestamp,
      downloadUrl: '#',
    })

    if (lang.dubbing) {
      assets.push({
        id: `${lang.code}-audio`,
        label: '더빙 오디오 (MP3)',
        type: 'audio',
        format: 'MP3',
        size: `${(5 + index * 0.3).toFixed(1)} MB`,
        lastModified: baseTimestamp,
        downloadUrl: '#',
      })
    }

    return {
      code: lang.code,
      name: lang.name,
      summary: `${lang.name} 버전 산출물이 완성되었습니다. 자막 ${
        lang.subtitle ? '포함' : '미포함'
      }, 더빙 ${lang.dubbing ? '활성' : '제외'} 상태예요.`,
      assets,
      preview: {
        videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        videoPoster:
          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1280&q=60',
        audioSrc: lang.dubbing
          ? 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3'
          : undefined,
        duration: '00:42',
      },
    }
  }

  const outputBundles: LanguageOutput[] = languages.map((lang, index) =>
    buildOutputBundle(lang, index)
  )

  // 파이프라인 자동 진행 시뮬레이션
  useEffect(() => {
    if (isPaused) return

    const reviewStageExists = stages.some((s) => s.status === 'review')
    if (reviewStageExists) {
      // 검토 단계에서 대기 중
      return
    }

    const processingStage = stages.find((s) => s.status === 'processing')
    if (!processingStage) {
      // 다음 pending 단계 찾기
      const pendingStageIndex = stages.findIndex(
        (s) => s.status === 'pending' && s.id !== 'outputs'
      )
      if (pendingStageIndex !== -1) {
        setStages((prev) =>
          prev.map((stage, idx) =>
            idx === pendingStageIndex ? { ...stage, status: 'processing', progress: 0 } : stage
          )
        )
      }
      return
    }

    // 진행률 업데이트
    const interval = setInterval(() => {
      setStages((prev) =>
        prev.map((stage) => {
          if (stage.status === 'processing') {
            const newProgress = Math.min(stage.progress + 10, 100)
            if (newProgress >= 100) {
              return { ...stage, status: 'completed', progress: 100 }
            }
            return { ...stage, progress: newProgress }
          }
          return stage
        })
      )
    }, 500)

    return () => clearInterval(interval)
  }, [stages, isPaused])

  useEffect(() => {
    const packagingStage = stages.find((s) => s.id === 'packaging')
    const outputsStage = stages.find((s) => s.id === 'outputs')

    if (packagingStage?.status === 'completed' && outputsStage?.status === 'pending') {
      setStages((prev) =>
        prev.map((stage) =>
          stage.id === 'outputs' && stage.status === 'pending'
            ? { ...stage, status: 'review' }
            : stage
        )
      )
    }
  }, [stages])

  const handleSaveSTT = (editedSegments: typeof sttSegments) => {
    setSTTSegments(editedSegments)
    // STT 단계를 완료로 변경
    setStages((prev) =>
      prev.map((stage) => (stage.id === 'stt' ? { ...stage, status: 'completed' } : stage))
    )
    setCurrentView('dashboard')
  }

  const handleSaveTranslations = (editedTranslations: typeof translations) => {
    setTranslations(editedTranslations)
    // RAG 교정 단계를 완료로 변경
    setStages((prev) =>
      prev.map((stage) => (stage.id === 'rag' ? { ...stage, status: 'completed' } : stage))
    )
    setCurrentView('dashboard')
  }

  const handlePublishComplete = (result: PublishResult) => {
    setPublishResults((prev) => ({
      ...prev,
      [result.languageCode]: result,
    }))

    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id === 'outputs') {
          return { ...stage, status: 'completed', progress: 100 }
        }
        return stage
      })
    )
  }

  const currentStageIndex = stages.findIndex(
    (s) => s.status === 'processing' || s.status === 'review'
  )
  const overallProgress =
    (stages.filter((s) => s.status === 'completed').length / stages.length) * 100

  const voiceMappingLanguage = useMemo(() => {
    if (!voiceMappingLanguageCode) return undefined
    return languages.find((lang) => lang.code === voiceMappingLanguageCode)
  }, [languages, voiceMappingLanguageCode])

  const handleStageEdit = (stageId: string) => {
    if (stageId === 'rag') {
      const initialAssignments = languages.reduce<Record<string, string>>((acc, lang) => {
        if (lang.translator) acc[lang.code] = lang.translator
        return acc
      }, {})
      const initialReviews = languages.reduce<Record<string, boolean>>((acc, lang) => {
        acc[lang.code] = lang.translationReviewed ?? false
        return acc
      }, {})

      setAssignmentDraft(initialAssignments)
      setReviewDraft(initialReviews)
      setIsRagModalOpen(true)
      return
    }
    if (stageId === 'stt') {
      setCurrentView('stt')
      return
    }
    if (stageId === 'outputs') {
      setCurrentView('outputs')
      return
    }
    setCurrentView('translation')
  }

  const handleRagModalSave = () => {
    if (languages.length === 0) {
      setIsRagModalOpen(false)
      return
    }

    const nextLanguages = languages.map((lang) => {
      const translatorValue = assignmentDraft[lang.code]
      const reviewed = reviewDraft[lang.code] ?? false
      return {
        ...lang,
        translator: translatorValue,
        translationReviewed: reviewed,
        voiceConfig: lang.voiceConfig ?? {},
      }
    })

    setLanguages(nextLanguages)
    updateVoiceStageStatus(nextLanguages)

    if (onUpdateProject) {
      onUpdateProject({ ...project, languages: nextLanguages })
    }

    setIsRagModalOpen(false)
  }

  const handleRagModalCancel = () => {
    setAssignmentDraft(
      languages.reduce<Record<string, string>>((acc, lang) => {
        if (lang.translator) acc[lang.code] = lang.translator
        return acc
      }, {})
    )
    setReviewDraft(
      languages.reduce<Record<string, boolean>>((acc, lang) => {
        acc[lang.code] = lang.translationReviewed ?? false
        return acc
      }, {})
    )
    setIsRagModalOpen(false)
  }

  if (currentView === 'voiceMapping') {
    if (!voiceMappingLanguageCode || !voiceMappingLanguage) {
      return (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={handleVoiceMappingCancel} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  파이프라인으로 돌아가기
                </Button>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-6 py-10">
            <Card>
              <CardContent className="py-12 text-center text-sm text-gray-500">
                선택된 언어 정보를 불러오지 못했습니다. 다시 시도해주세요.
              </CardContent>
            </Card>
          </main>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleVoiceMappingCancel} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  파이프라인으로 돌아가기
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-gray-600" />
                  <div>
                    <h2>{project.name}</h2>
                    <p className="text-xs text-gray-500">{project.createdAt}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleVoiceMappingCancel}>
                  취소
                </Button>
                <Button onClick={handleVoiceMappingSave}>저장</Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{voiceMappingLanguage.name} 목소리 매핑</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    STT에서 감지된 화자별로 더빙 음성을 매핑하고 톤 유지 여부를 설정하세요.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <Badge variant="secondary" className="text-xs">
                    {voiceMappingLanguage.name}
                  </Badge>
                  {voiceMappingLanguage.subtitle && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      자막
                    </Badge>
                  )}
                  {voiceMappingLanguage.dubbing && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      더빙
                    </Badge>
                  )}
                  {voiceMappingLanguage.translator && (
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      번역가 {voiceMappingLanguage.translator}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <VoiceSelector
            translations={translations}
            initialConfig={voiceMappingDraft}
            onVoiceChange={handleVoiceMappingDraftChange}
          />
        </main>
      </div>
    )
  }

  // STT 에디터 뷰
  if (currentView === 'stt') {
    return (
      <STTEditor
        segments={sttSegments}
        onSave={handleSaveSTT}
        onBack={() => setCurrentView('dashboard')}
        language={selectedLanguage?.name ?? ''}
      />
    )
  }

  // 번역 에디터 뷰
  if (currentView === 'translation') {
    return (
      <AdvancedTranslationEditor
        language={selectedLanguage?.name ?? ''}
        translations={translations}
        onSave={handleSaveTranslations}
        onBack={() => setCurrentView('dashboard')}
        isDubbing={selectedLanguage?.dubbing ?? false}
      />
    )
  }

  if (currentView === 'outputs') {
    return (
      <OutputsReview
        projectName={project.name}
        outputs={outputBundles}
        onBack={() => setCurrentView('dashboard')}
        onPublishComplete={handlePublishComplete}
        publishResults={publishResults}
        initialLanguageCode={selectedLanguage?.code ?? languages[0]?.code ?? ''}
        onLanguageChange={(code) => {
          const target = languages.find((lang) => lang.code === code)
          if (target) {
            setSelectedLanguageCode(target.code)
          }
        }}
      />
    )
  }

  // 메인 대시보드 뷰
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  프로젝트 목록
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-gray-600" />
                  <div>
                    <h2>{project.name}</h2>
                    <p className="text-xs text-gray-500">{project.createdAt}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                  className="gap-2"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      재개
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      일시정지
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 파이프라인 단계 */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>처리 파이프라인</CardTitle>
                    <Badge variant="secondary">{Math.round(overallProgress)}% 완료</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stages.map((stage) => (
                    <PipelineStage
                      key={stage.id}
                      title={stage.title}
                      description={stage.description}
                      status={stage.status}
                      progress={stage.progress}
                      estimatedTime={stage.estimatedTime}
                      showEditButton={
                        stage.id === 'stt' || stage.id === 'rag' || stage.id === 'outputs'
                      }
                      editLabel={stage.id === 'rag' ? '번역가 지정' : undefined}
                      onEdit={() => handleStageEdit(stage.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 오른쪽: 프로젝트 정보 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>타겟 언어</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedLanguage?.code === lang.code
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedLanguageCode(lang.code)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4" />
                        <span>{lang.name}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {lang.subtitle && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            자막
                          </Badge>
                        )}
                        {lang.dubbing && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-700"
                          >
                            더빙
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        번역가: {lang.translator ?? '미지정'}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] leading-tight px-1.5 py-0.5 ${
                            lang.translationReviewed
                              ? 'border-green-200 text-green-600'
                              : 'border-yellow-200 text-yellow-600'
                          }`}
                        >
                          {lang.translationReviewed ? '검토 완료' : '검토 필요'}
                        </Badge>
                        {lang.dubbing && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] leading-tight px-1.5 py-0.5 ${
                              lang.voiceConfig && Object.keys(lang.voiceConfig).length > 0
                                ? 'border-blue-200 text-blue-600'
                                : 'border-gray-200 text-gray-500'
                            }`}
                          >
                            {lang.voiceConfig && Object.keys(lang.voiceConfig).length > 0
                              ? '목소리 매핑 완료'
                              : '목소리 미지정'}
                          </Badge>
                        )}
                      </div>
                      {lang.dubbing && (
                        <div className="mt-2">
                          <Button
                            variant="link"
                            size="sm"
                            className="px-0 text-xs"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleOpenVoiceMappingPage(lang.code)
                            }}
                          >
                            목소리 매핑 설정
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI 교정 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-xs text-gray-500">RAG/LLM이 선 적용된 주요 개선 사항입니다.</p>
                  <ul className="space-y-2">
                    {aiRefinementInsights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>진행 상태</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">전체 진행률</span>
                    <span>{Math.round(overallProgress)}%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>완료: {stages.filter((s) => s.status === 'completed').length}개</span>
                      <span>
                        처리 중: {stages.filter((s) => s.status === 'processing').length}개
                      </span>
                      <span>대기: {stages.filter((s) => s.status === 'pending').length}개</span>
                    </div>
                  </div>

                  {currentStageIndex !== -1 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">현재 단계</p>
                      <p className="text-sm">{stages[currentStageIndex].title}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Dialog
        open={isRagModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleRagModalCancel()
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>번역가 지정 · 번역 검토</DialogTitle>
            <p className="text-xs text-gray-500">
              RAG/LLM 교정 이후 담당 번역가를 지정하고 검토 상태를 업데이트하세요.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {languages.map((lang) => {
              const translatorValue = assignmentDraft[lang.code] ?? UNASSIGNED_TRANSLATOR_VALUE
              const reviewed = reviewDraft[lang.code] ?? false
              const translatorOptions =
                lang.translator && !TRANSLATOR_OPTIONS.includes(lang.translator)
                  ? [lang.translator, ...TRANSLATOR_OPTIONS]
                  : TRANSLATOR_OPTIONS

              return (
                <div
                  key={lang.code}
                  className="rounded-lg border border-gray-200 bg-white p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {lang.name}
                      </Badge>
                      <div className="flex gap-1 text-[11px] text-gray-500">
                        {lang.subtitle && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-600">
                            자막
                          </span>
                        )}
                        {lang.dubbing && (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-600">
                            더빙
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          reviewed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {reviewed ? '검토 완료' : '검토 필요'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">번역가</Label>
                    <Select
                      value={translatorValue}
                      onValueChange={(value) =>
                        setAssignmentDraft((prev) => {
                          const next = { ...prev }
                          if (value === UNASSIGNED_TRANSLATOR_VALUE) {
                            delete next[lang.code]
                          } else {
                            next[lang.code] = value
                          }
                          return next
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="번역가 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED_TRANSLATOR_VALUE}>미지정</SelectItem>
                        {translatorOptions.map((translator) => (
                          <SelectItem key={translator} value={translator}>
                            {translator}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">번역 검토 완료</p>
                      <p className="text-xs text-gray-500">인간 검토가 마무리되면 활성화하세요</p>
                    </div>
                    <Switch
                      checked={reviewed}
                      onCheckedChange={(checked) =>
                        setReviewDraft((prev) => ({
                          ...prev,
                          [lang.code]: checked,
                        }))
                      }
                    />
                  </div>

                  {lang.dubbing && (
                    <div className="rounded-lg border border-dashed px-3 py-3 text-xs text-gray-500">
                      더빙 언어는 번역 검토 후 별도 화면에서 목소리를 매핑하세요.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleRagModalCancel}>
              취소
            </Button>
            <Button onClick={handleRagModalSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
