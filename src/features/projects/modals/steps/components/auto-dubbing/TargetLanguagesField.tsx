import { PlusCircle, X } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import type { Language } from '@/entities/language/types'
import { Button } from '@/shared/ui/Button'
import { Label } from '@/shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

const languageCountryMap: Record<string, string> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  zh: 'CN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
}

type TargetLanguagesFieldProps = {
  selectedTargets: string[]
  availableOptions: Language[]
  languageLabelMap: Record<string, string>
  pendingTarget: string
  onPendingChange: (value: string) => void
  onAddTarget: () => void
  onRemoveTarget: (language: string) => void
  error?: string
}

export function TargetLanguagesField({
  selectedTargets,
  availableOptions,
  languageLabelMap,
  pendingTarget,
  onPendingChange,
  onAddTarget,
  onRemoveTarget,
  error,
}: TargetLanguagesFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-lg font-semibold">번역 언어</Label>
        <span className="inline-flex items-center rounded-full bg-primary-container px-2 py-0.5 text-[11px] font-semibold leading-none text-on-primary-container">
          필수
        </span>
      </div>
      <div className="">
        <div className="flex min-h-[130px] flex-col gap-3 rounded-2xl border border-dashed border-surface-4 p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Select value={pendingTarget} onValueChange={onPendingChange}>
                <SelectTrigger>
                  <SelectValue placeholder="추가할 언어를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.length === 0 ? (
                    <SelectItem disabled value="__no-option">
                      선택 가능한 언어가 없습니다
                    </SelectItem>
                  ) : (
                    availableOptions.map((language) => {
                      const countryCode =
                        languageCountryMap[language.language_code] ??
                        language.language_code.slice(0, 2).toUpperCase()
                      return (
                        <SelectItem key={language.language_code} value={language.language_code}>
                          <div className="flex items-center gap-2">
                            <ReactCountryFlag
                              countryCode={countryCode}
                              svg
                              style={{ width: '1.2em', height: '1.2em' }}
                            />
                            {language.name_ko}
                          </div>
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="primary"
              className="text-lg md:w-40"
              disabled={!pendingTarget}
              onClick={onAddTarget}
            >
              <PlusCircle className="h-4 w-4" />
              언어 추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTargets.length === 0 ? (
              <p className="text-sm text-muted">추가된 번역 언어가 없습니다.</p>
            ) : (
              selectedTargets.map((language) => {
                const label = languageLabelMap[language] ?? language
                const countryCode =
                  languageCountryMap[language] ?? language.slice(0, 2).toUpperCase()
                return (
                  <span
                    key={language}
                    className="inline-flex items-center gap-2 rounded-full border border-surface-4 bg-surface-1 px-4 py-2 text-sm text-foreground"
                  >
                    <ReactCountryFlag
                      countryCode={countryCode}
                      svg
                      style={{ width: '1em', height: '1em' }}
                    />
                    {label}
                    <button
                      type="button"
                      className="text-muted transition hover:text-danger"
                      aria-label={`${label} 제거`}
                      onClick={() => onRemoveTarget(language)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })
            )}
          </div>
        </div>

        <ValidationMessage message={error} />
      </div>
    </div>
  )
}
