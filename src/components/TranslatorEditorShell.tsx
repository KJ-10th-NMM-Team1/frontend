import { useMemo, useState, useEffect } from 'react'
import { Button } from './ui/button'
import { AdvancedTranslationEditor } from './AdvancedTranslationEditor'
import type { TranslatorAssignment } from './TranslatorAssignments'
import { ArrowLeft } from 'lucide-react'

interface TranslationEntry {
  _id: string
  segment_id: string
  segment_text: string
  score: number
  start_point: number
  end_point: number
  editor_id: string
  translate_context: string
  sub_langth: number
  issues?: {
    issue_id: string
    issue_context?: string | null // service.py에서 $lookup으로 추가한 필드
  }[]
}
interface TranslatorEditorShellProps {
  assignment: TranslatorAssignment
  onBack: () => void
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) seconds = 0
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${h}:${m}:${s}`
}

const mapApiIssues = (apiIssues: SegmentData['issues'] | undefined): TranslationIssue[] => {
  if (!apiIssues) {
    return []
  }

  return apiIssues.map((issue) => {
    const message = issue.issue_context || '알 수 없는 이슈'
    let type: TranslationIssueType = 'term' // 기본값
    let severity: 'warning' | 'error' = 'warning' // 기본값

    if (message.includes('길이') || message.includes('length')) {
      type = 'length'
      severity = 'error' // 길이 문제는 'error'로 가정
    } else if (message.includes('용어') || message.includes('term')) {
      type = 'term'
    } else if (message.includes('톤') || message.includes('tone')) {
      type = 'tone'
    }

    return {
      type,
      severity,
      message,
    }
  })
}

export function TranslatorEditorShell({ assignment, onBack }: TranslatorEditorShellProps) {
  const [translations, setTranslations] = useState<TranslationEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const editorTranslations = useMemo((): Translation[] => {
    return translations.map((segment) => {
      return {
        id: segment.segment_id,
        timestamp: `${formatTime(segment.start_point)} - ${formatTime(segment.end_point)}`,
        original: segment.segment_text || '',
        translated: segment.translate_context || '',
        confidence: segment.score || 0,
        issues: mapApiIssues(segment.issues),
        segmentDurationSeconds: segment.end_point - segment.start_point,
        speaker: undefined,
        correctionSuggestions: [],
        termCorrections: [],
      }
    })
  }, [translations])

  useEffect(() => {
    const apiUrl = 'http://localhost:8000/api/segment/'

    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: TranslationEntry[] = await response.json()
        setTranslations(data)
      } catch (e) {
        setError(e.message)
        console.log(error)
      } finally {
        setIsLoading(false)
        console.log(isLoading)
      }
    }
    fetchData()
  }, [])

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
        translations={editorTranslations}
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
