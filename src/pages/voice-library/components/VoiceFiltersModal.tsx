import { useEffect, useState } from 'react'

import { Filter, User } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import { cn } from '@/shared/lib/utils'
import { VOICE_CATEGORIES } from '@/shared/constants/voiceCategories'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/ToggleGroup'
import { useAccents } from '@/features/accents/hooks/useAccents'
import { useLanguage } from '@/features/languages/hooks/useLanguage'

import type { VoiceFilters as VoiceFiltersType } from '../hooks/useVoiceLibraryFilters'

const languageCountryMap: Record<string, string> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  jp: 'JP',
  zh: 'CN',
  cn: 'CN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  ru: 'RU',
}

const getCountryCode = (code?: string) => {
  if (!code) return 'US'
  const normalized = code.toLowerCase()
  return languageCountryMap[normalized] ?? normalized.slice(0, 2).toUpperCase()
}

export type VoiceFilters = VoiceFiltersType

interface VoiceFiltersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: VoiceFilters
  onFiltersChange: (filters: VoiceFilters) => void
  onApply: () => void
}

export function VoiceFiltersModal({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
}: VoiceFiltersModalProps) {
  const { data: languageResponse, isLoading: languagesLoading } = useLanguage()
  const languages = languageResponse ?? []
  const [languageCode, setLanguageCode] = useState(filters.languages?.[0] ?? '')
  const { data: accentResponse, isLoading: accentsLoading } = useAccents(languageCode || undefined)
  const accents = accentResponse ?? []

  const [localFilters, setLocalFilters] = useState<VoiceFilters>(filters)

  // 모달이 열릴 때 필터 상태 동기화
  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
      setLanguageCode(filters.languages?.[0] ?? '')
    }
  }, [open, filters])

  const handleReset = () => {
    const resetFilters: VoiceFilters = {
      gender: 'any',
      accent: undefined,
      age: undefined,
      languages: undefined,
      category: undefined,
    }
    setLocalFilters(resetFilters)
    setLanguageCode('')
    onFiltersChange(resetFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onApply()
    onOpenChange(false)
  }

  const selectedLanguage = languages.find((lang) => lang.language_code === localFilters.languages?.[0])
  const selectedFlagCode = selectedLanguage ? getCountryCode(selectedLanguage.language_code) : undefined
  const hasSelectedLanguage = Boolean(languageCode)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted" />
          <DialogTitle>목소리 필터</DialogTitle>
        </div>

        <div className="mt-6 space-y-6">
          {/* Languages */}
          <div className="space-y-2">
            <label className="text-sm font-medium">언어</label>
            <Select
              value={localFilters.languages?.[0] || ''}
              onValueChange={(value) => {
                setLanguageCode(value)
                setLocalFilters((prev) => {
                  const hasChanged = value !== prev.languages?.[0]
                  return {
                    ...prev,
                    languages: value ? [value] : undefined,
                    accent: hasChanged ? undefined : prev.accent,
                  }
                })
              }}
              disabled={languagesLoading}
            >
              <SelectTrigger>
                <div className="flex w-full items-center gap-2">
                  {selectedLanguage ? (
                    <>
                      <ReactCountryFlag
                        countryCode={selectedFlagCode ?? 'US'}
                        svg
                        style={{ width: '1.15em', height: '1.15em' }}
                        title={selectedLanguage.name_ko}
                      />
                      <span className="text-foreground">{selectedLanguage.name_ko}</span>
                    </>
                  ) : (
                    <SelectValue
                      placeholder={languagesLoading ? '언어를 불러오는 중...' : '언어를 선택하세요'}
                    />
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {languages.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    {languagesLoading ? '언어를 불러오는 중...' : '등록된 언어가 없습니다.'}
                  </SelectItem>
                ) : (
                  languages.map((lang) => {
                    const flagCode = getCountryCode(lang.language_code)
                    return (
                      <SelectItem key={lang.language_code} value={lang.language_code}>
                        <span className="flex items-center gap-2">
                          <ReactCountryFlag
                            countryCode={flagCode}
                            svg
                            style={{ width: '1.25em', height: '1.25em' }}
                            title={lang.name_ko}
                          />
                          {lang.name_ko}
                        </span>
                      </SelectItem>
                    )
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Accent */}
          <div className="space-y-2">
            <label className="text-sm font-medium">억양</label>
            <Select
              value={hasSelectedLanguage ? localFilters.accent ?? 'any' : ''}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, accent: value === 'any' ? undefined : value })
              }
              disabled={accentsLoading || !hasSelectedLanguage}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    hasSelectedLanguage
                      ? accentsLoading
                        ? '억양을 불러오는 중...'
                        : '선택 안 함'
                      : '언어를 먼저 선택하세요'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {hasSelectedLanguage ? (
                  <>
                    <SelectItem value="any">선택 안 함</SelectItem>
                    {accents.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <SelectItem value="__no_language" disabled>
                    언어를 먼저 선택하세요
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium">성별</label>
            <ToggleGroup
              type="single"
              value={localFilters.gender || 'any'}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  gender: (value as 'any' | 'male' | 'female' | 'neutral') || 'any',
                })
              }
              className="flex gap-2"
            >
              <ToggleGroupItem
                value="any"
                className="rounded-lg border border-surface-3 data-[state=off]:bg-surface-2 data-[state=on]:bg-white data-[state=off]:text-muted data-[state=on]:text-foreground"
              >
                전체
              </ToggleGroupItem>
              <ToggleGroupItem
                value="male"
                className="rounded-lg border border-surface-3 data-[state=off]:bg-surface-2 data-[state=on]:bg-white data-[state=off]:text-muted data-[state=on]:text-foreground"
              >
                <User className="mr-1.5 h-4 w-4" />
                남성
              </ToggleGroupItem>
              <ToggleGroupItem
                value="female"
                className="rounded-lg border border-surface-3 data-[state=off]:bg-surface-2 data-[state=on]:bg-white data-[state=off]:text-muted data-[state=on]:text-foreground"
              >
                <User className="mr-1.5 h-4 w-4" />
                여성
              </ToggleGroupItem>
            </ToggleGroup>
          </div>          
          {/* Age */}
          <div className="space-y-2">
            <label className="text-sm font-medium">나이대</label>
            <Select
              value={localFilters.age ?? 'any'}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, age: value === 'any' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="선택 안 함" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">선택 안 함</SelectItem>
                <SelectItem value="young">청년 (Young)</SelectItem>
                <SelectItem value="middle_aged">중년 (Middle-aged)</SelectItem>
                <SelectItem value="old">노년 (Old)</SelectItem>
              </SelectContent>
            </Select>
          </div>     
          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {VOICE_CATEGORIES.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    const currentCategories = localFilters.category || []
                    const newCategories = currentCategories.includes(code)
                      ? currentCategories.filter((c) => c !== code)
                      : [...currentCategories, code]
                    setLocalFilters({
                      ...localFilters,
                      category: newCategories.length > 0 ? newCategories : undefined,
                    })
                  }}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                    localFilters.category?.includes(code)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-surface-3 bg-surface-1 text-muted hover:bg-surface-2',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleReset}>
            초기화
          </Button>
          <Button variant="primary" onClick={handleApply}>
            필터 적용
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
