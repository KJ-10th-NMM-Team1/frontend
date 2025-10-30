import { useMemo, useState } from 'react'
import { Button } from './ui/button'
import { AdvancedTranslationEditor } from './AdvancedTranslationEditor'
import type { TranslatorAssignment } from './TranslatorAssignments'
import { ArrowLeft } from 'lucide-react'

interface TranslationEntry {
  id: string
  timestamp: string
  original: string
  translated: string
  confidence: number
  issues: {
    type: 'term' | 'length' | 'number' | 'tone'
    severity: 'warning' | 'error'
    message: string
    suggestion?: string
  }[]
  speaker?: string
  segmentDurationSeconds?: number
  originalSpeechSeconds?: number
  translatedSpeechSeconds?: number
  correctionSuggestions?: {
    id: string
    text: string
    reason: string
  }[]
  termCorrections?: {
    id: string
    original: string
    replacement: string
    reason?: string
  }[]
}

const SAMPLE_TRANSLATIONS: TranslationEntry[] = [
  {
    id: '1',
    timestamp: '00:00:00 - 00:00:05',
    original: 'Welcome to our product demonstration.',
    translated: '제품 설명회에 오신 것을 환영합니다.',
    confidence: 0.92,
    issues: [],
    speaker: 'A',
    segmentDurationSeconds: 5,
    originalSpeechSeconds: 4.3,
    translatedSpeechSeconds: 4.7,
  },
  {
    id: '2',
    timestamp: '00:00:06 - 00:00:12',
    original: "Today, we'll walk you through the key features.",
    translated: '오늘은 핵심 기능을 함께 살펴보겠습니다.',
    confidence: 0.88,
    issues: [
      {
        type: 'length',
        severity: 'warning',
        message: '원문보다 15% 길어요.',
        suggestion: '오늘은 주요 기능을 함께 살펴보겠습니다.',
      },
    ],
    speaker: 'A',
    segmentDurationSeconds: 6,
    originalSpeechSeconds: 5.2,
    translatedSpeechSeconds: 6.1,
    correctionSuggestions: [
      {
        id: '2-alt-1',
        text: '오늘은 주요 기능을 함께 살펴보겠습니다.',
        reason: '길이 축소',
      },
    ],
  },
  {
    id: '3',
    timestamp: '00:00:13 - 00:00:18',
    original: 'This solution keeps every team aligned and efficient.',
    translated: '이 솔루션은 모든 팀이 정렬되어 효율적으로 움직이도록 도와줍니다.',
    confidence: 0.9,
    issues: [
      {
        type: 'term',
        severity: 'warning',
        message: "'aligned' 용어는 '정렬' 대신 '협업'으로 번역 권장.",
        suggestion: '이 솔루션은 모든 팀이 협업하며 효율적으로 움직이도록 도와줍니다.',
      },
    ],
    speaker: 'B',
    segmentDurationSeconds: 5,
    originalSpeechSeconds: 4.5,
    translatedSpeechSeconds: 4.8,
    termCorrections: [
      {
        id: '3-term-1',
        original: 'aligned',
        replacement: '협업',
        reason: '고객사 용어집 기준',
      },
    ],
  },
]

interface TranslatorEditorShellProps {
  assignment: TranslatorAssignment
  onBack: () => void
}

export function TranslatorEditorShell({ assignment, onBack }: TranslatorEditorShellProps) {
  const [translations, setTranslations] = useState<TranslationEntry[]>(SAMPLE_TRANSLATIONS)

  const pageTitle = useMemo(
    () => `${assignment.projectName} · ${assignment.languageName}`,
    [assignment.projectName, assignment.languageName]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              할당 목록
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h2 className="text-lg font-semibold">{pageTitle}</h2>
              <p className="text-xs text-gray-500">번역가: {assignment.translator}</p>
            </div>
          </div>
        </div>
      </header>

      <AdvancedTranslationEditor
        language={assignment.languageName}
        translations={translations}
        onSave={(updated) => {
          setTranslations(updated)
          onBack()
        }}
        onBack={onBack}
        isDubbing={assignment.isDubbing}
        showVoiceSelector={false}
      />
    </div>
  )
}
