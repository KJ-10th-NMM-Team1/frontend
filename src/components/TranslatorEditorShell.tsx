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
  // 1. API 응답에 issues 배열이 없으면 빈 배열 반환
  if (!apiIssues) {
    return []
  }

  // 2. API issues 배열을 순회하며 Editor가 사용하는 TranslationIssue[] 형태로 변환
  return apiIssues.map((issue) => {
    // 3. API의 issue_context를 message로 사용
    const message = issue.issue_context || '알 수 없는 이슈'

    // 4. issue_context 내용에 따라 type과 severity 추론
    //    (이 로직은 백엔드 응답에 따라 더 정교하게 수정될 수 있습니다)
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

    // 5. Editor가 사용하는 TranslationIssue 객체 반환
    return {
      type,
      severity,
      message,
      // 'suggestion' 필드는 API 데이터에 없으므로 undefined가 됩니다.
      // (AdvancedTranslationEditor가 suggestion: undefined 를 처리함)
    }
  })
}

export function TranslatorEditorShell({ assignment, onBack }: TranslatorEditorShellProps) {
  const [translations, setTranslations] = useState<TranslationEntry[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const editorTranslations = useMemo((): Translation[] => {
    // 1. API에서 받은 'segments' 배열을 순회(map)합니다.
    return translations.map((segment) => {
      // 2. 'segment'(SegmentData)의 필드를
      //    'Translation' 인터페이스의 필드로 1:1 매핑합니다.
      return {
        //  [Editor 필드]   : [API 원본 필드]
        id: segment.segment_id,
        timestamp: `${formatTime(segment.start_point)} - ${formatTime(segment.end_point)}`,
        original: segment.segment_text || '',
        translated: segment.translate_context || '',
        confidence: segment.score || 0,
        issues: mapApiIssues(segment.issues), // (issues는 별도 함수로 한 번 더 변환)

        // (기타 필드들...)
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
        // 5. (중요) 네트워크 오류 또는 위에서 throw한 오류 처리
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError('데이터를 가져오는 중 알 수 없는 오류가 발생했습니다.')
        }
      } finally {
        // 6. (중요) 성공하든 실패하든 로딩 상태를 false로 변경합니다.
        setIsLoading(false)
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
// function useEffect(arg0: () => void, arg1: never[]) {
//   throw new Error('Function not implemented.')
// }
