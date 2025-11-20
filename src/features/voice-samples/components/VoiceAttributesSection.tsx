import ReactCountryFlag from 'react-country-flag'
import { Minus } from 'lucide-react'

import type { Accent } from '@/entities/accent/types'
import type { Language } from '@/entities/language/types'
import { Button } from '@/shared/ui/Button'
import { Label } from '@/shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'

import { getCountryCode } from './voiceSampleFieldUtils'
import type { AttributeKey } from './voiceSampleFieldUtils'

export function VoiceAttributesSection({
  languageCode,
  onLanguageChange,
  languages,
  languagesLoading,
  accent,
  onAccentChange,
  accentOptions,
  accentsLoading,
  gender,
  onGenderChange,
  age,
  onAgeChange,
  labelFields,
  onLabelFieldsChange,
  disabled,
}: {
  languageCode: string
  onLanguageChange: (value: string) => void
  languages: Language[]
  languagesLoading?: boolean
  accent: string
  onAccentChange: (value: string) => void
  accentOptions: Accent[]
  accentsLoading?: boolean
  gender: string
  onGenderChange: (value: string) => void
  age: string
  onAgeChange: (value: string) => void
  labelFields: AttributeKey[]
  onLabelFieldsChange: (next: AttributeKey[]) => void
  disabled?: boolean
}) {
  const selectedLanguage = languages.find((lang) => lang.language_code === languageCode)
  const selectedFlagIcon = selectedLanguage ? (
    <ReactCountryFlag
      countryCode={getCountryCode(selectedLanguage.language_code)}
      svg
      style={{ width: '1.25em', height: '1.25em' }}
      title={selectedLanguage.name_ko}
    />
  ) : null

  const removeField = (key: AttributeKey) =>
    onLabelFieldsChange(labelFields.filter((f) => f !== key))

  const addNextField = () => {
    const order: AttributeKey[] = ['accent', 'gender', 'age']
    const next = order.find((f) => !labelFields.includes(f))
    if (next) {
      onLabelFieldsChange([...labelFields, next])
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-surface-3 bg-white p-3 shadow-inner shadow-black/5">
      <div className="grid grid-cols-[114px,1fr] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
        <Label>
          언어<span className="text-danger ml-1">*</span>
        </Label>
        <Select
          value={languageCode}
          onValueChange={(value) => onLanguageChange(value)}
          disabled={disabled || languages.length === 0 || languagesLoading}
        >
          <SelectTrigger className="h-11">
            <div className="flex w-full items-center gap-2">
              {selectedFlagIcon}
              <SelectValue placeholder={languagesLoading ? '언어를 불러오는 중...' : '언어를 선택하세요'} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {languages.length === 0 ? (
              <SelectItem value="__empty" disabled>
                {languagesLoading ? '언어를 불러오는 중...' : '등록된 언어가 없습니다.'}
              </SelectItem>
            ) : (
              languages.map((language) => {
                const code = language.language_code
                const flagCode = getCountryCode(code)
                return (
                  <SelectItem key={code} value={code}>
                    <span className="flex items-center gap-2">
                      <ReactCountryFlag
                        countryCode={flagCode}
                        svg
                        style={{ width: '1.25em', height: '1.25em' }}
                        title={language.name_ko}
                      />
                      {language.name_ko}
                    </span>
                  </SelectItem>
                )
              })
            )}
          </SelectContent>
        </Select>
      </div>

      {labelFields.includes('accent') ? (
        <div className="grid grid-cols-[114px,1fr,auto] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
          <Label>억양</Label>
          <Select
            value={accent}
            onValueChange={(value) => onAccentChange(value)}
            disabled={disabled || accentsLoading}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="선택 안 함" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">선택 안 함</SelectItem>
              {accentOptions.map((opt) => (
                <SelectItem key={opt.code} value={opt.code}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-lg border border-surface-4 bg-white shadow-inner shadow-black/10 hover:bg-surface-2"
            onClick={() => removeField('accent')}
            disabled={disabled}
            aria-label="억양 라벨 삭제"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {labelFields.includes('gender') ? (
        <div className="grid grid-cols-[114px,1fr,auto] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
          <Label>성별</Label>
          <Select
            value={gender}
            onValueChange={(value) => onGenderChange(value)}
            disabled={disabled}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="선택 안 함" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">선택 안 함</SelectItem>
              <SelectItem value="female">여성</SelectItem>
              <SelectItem value="male">남성</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-lg border border-surface-4 bg-white shadow-inner shadow-black/10 hover:bg-surface-2"
            onClick={() => removeField('gender')}
            disabled={disabled}
            aria-label="성별 라벨 삭제"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {labelFields.includes('age') ? (
        <div className="grid grid-cols-[114px,1fr,auto] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
          <Label>나이대</Label>
          <Select value={age} onValueChange={(value) => onAgeChange(value)} disabled={disabled}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="선택 안 함" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">선택 안 함</SelectItem>
              <SelectItem value="young">청년 (Young)</SelectItem>
              <SelectItem value="middle_aged">중년 (Middle-aged)</SelectItem>
              <SelectItem value="old">노년 (Old)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-lg border border-surface-4 bg-white shadow-inner shadow-black/10 hover:bg-surface-2"
            onClick={() => removeField('age')}
            disabled={disabled}
            aria-label="나이대 라벨 삭제"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div className="flex items-center justify-between px-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-md px-3 text-xs"
          disabled={disabled || labelFields.length >= 3}
          onClick={addNextField}
        >
          + 라벨 추가
        </Button>
        <p className="text-xs text-muted">
          {labelFields.length >= 3 ? '모든 라벨이 추가되었습니다.' : '필요한 라벨만 추가해 주세요.'}
        </p>
      </div>
    </div>
  )
}
