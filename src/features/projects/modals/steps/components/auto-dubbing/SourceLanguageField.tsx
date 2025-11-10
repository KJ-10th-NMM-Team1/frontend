import { Checkbox } from '@/shared/ui/Checkbox'
import { Label } from '@/shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

type SourceLanguageFieldProps = {
  detectAutomatically: boolean
  onDetectChange: (checked: boolean) => void
  languages: string[]
  sourceLanguage: string
  onSourceLanguageChange: (value: string) => void
  error?: string
}

export function SourceLanguageField({
  detectAutomatically,
  onDetectChange,
  languages,
  sourceLanguage,
  onSourceLanguageChange,
  error,
}: SourceLanguageFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={detectAutomatically}
          onCheckedChange={(checked) => onDetectChange(Boolean(checked))}
        />
        <span className="text-muted text-sm">원어 자동 인식 사용</span>
      </div>
      {!detectAutomatically ? (
        <div className="space-y-2">
          <Label className="sr-only" htmlFor="source-language">
            원어 선택
          </Label>
          <Select value={sourceLanguage} onValueChange={onSourceLanguageChange}>
            <SelectTrigger id="source-language">
              <SelectValue placeholder="원어를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* <ValidationMessage message={error} /> */}
        </div>
      ) : null}
    </div>
  )
}
