import { Button } from '../ui/button'
import { Lightbulb } from 'lucide-react'

interface SuggestionItem {
  id: string
  text: string
  reason: string
  onApply: () => void
}

interface SuggestionProps {
  combinedSuggestions: SuggestionItem[]
}

export const Suggestion = ({ combinedSuggestions }: SuggestionProps) => {
  // TODO: 제안이 있을 경우 렌더링하도록 아래 주석을 풀어야함
  // if (!combinedSuggestions || combinedSuggestions.length === 0) {
  //   return null
  // }

  // ❗ 'return' 바로 뒤에 '('를 붙여야 합니다.
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
        <Lightbulb className="w-4 h-4" />
        교정 후보
      </div>
      {combinedSuggestions.map((suggestion) => (
        <div key={suggestion.id} className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-blue-600">{suggestion.reason}</p>
            <p className="text-sm text-blue-900">{suggestion.text}</p>
          </div>
          <Button variant="outline" size="sm" className="h-7" onClick={suggestion.onApply}>
            적용
          </Button>
        </div>
      ))}
    </div>
  )
}
