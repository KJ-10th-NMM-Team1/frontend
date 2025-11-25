import type { Language } from '@/entities/language/types'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Label } from '@/shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

type SourceLanguageFieldProps = {
  detectAutomatically: boolean
  replaceVoiceSamples: boolean
  onDetectChange: (checked: boolean) => void
  onReplaceVoiceSamplesChange: (checked: boolean) => void
  languages: Language[]
  sourceLanguage: string
  onSourceLanguageChange: (value: string) => void
  error?: string
}

export function SourceLanguageField({
  detectAutomatically,
  replaceVoiceSamples,
  onDetectChange,
  onReplaceVoiceSamplesChange,
  languages,
  sourceLanguage,
  onSourceLanguageChange,
  error,
}: SourceLanguageFieldProps) {
  // 원어 자동 인식은 숨기고 항상 false로 유지
  const handleDetect = () => {
    onDetectChange(false)
  }

  // 기본 원어는 영어(en)로 고정
  const effectiveSource = sourceLanguage || 'en'

  return (
    <div className="space-y-3">
      {/* 숨겨진 자동 인식 토글 */}
      <input type="hidden" value="false" />

      <div className="space-y-1">
        <Label className="text-lg font-semibold" htmlFor="source-language">
          원어 선택
        </Label>
        <Select
          value={effectiveSource}
          onValueChange={(value) => {
            handleDetect()
            onSourceLanguageChange(value)
          }}
        >
          <SelectTrigger id="source-language">
            <SelectValue placeholder="원어를 선택하세요" />
          </SelectTrigger>
          <SelectContent align="start">
            {languages.map((language) => (
              <SelectItem key={language.language_code} value={language.language_code}>
                {language.name_ko}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ValidationMessage message={error} />
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-secondary">
          <Checkbox
            checked={replaceVoiceSamples}
            onCheckedChange={(checked) => onReplaceVoiceSamplesChange(Boolean(checked))}
          />
          음성샘플 자동 추천
        </label>
      </div>
      <div className="pt-1"></div>
    </div>
  )
}
