import { useEffect, useMemo, useState } from 'react'

import { Filter } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import { cn } from '@/shared/lib/utils'
import { VOICE_CATEGORIES } from '@/shared/constants/voiceCategories'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
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
  tagOptions: { tag: string; count: number }[]
}

export function VoiceFiltersModal({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
  tagOptions,
}: VoiceFiltersModalProps) {
  const { data: languageResponse, isLoading: languagesLoading } = useLanguage()
  const languages = languageResponse ?? []
  const [languageCode, setLanguageCode] = useState(filters.languages?.[0] ?? '')

  const [localFilters, setLocalFilters] = useState<VoiceFilters>(filters)
  const [tagInput, setTagInput] = useState('')

  // 모달이 열릴 때 필터 상태 동기화
  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
      setLanguageCode(filters.languages?.[0] ?? '')
      setTagInput('')
    }
  }, [open, filters])

  const handleReset = () => {
    const resetFilters: VoiceFilters = {
      languages: undefined,
      category: undefined,
      tags: undefined,
      commercialOnly: undefined,
    }
    setLocalFilters(resetFilters)
    setLanguageCode('')
    setTagInput('')
    onFiltersChange(resetFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onApply()
    onOpenChange(false)
  }

  const selectedLanguage = languages.find(
    (lang) => lang.language_code === localFilters.languages?.[0],
  )
  const selectedFlagCode = selectedLanguage
    ? getCountryCode(selectedLanguage.language_code)
    : undefined
  const hasSelectedLanguage = Boolean(languageCode)

  const filteredTags = useMemo(() => {
    const query = tagInput.trim().toLowerCase()
    const list = tagOptions ?? []
    if (!query) return list
    return list.filter(({ tag }) => tag.toLowerCase().includes(query))
  }, [tagInput, tagOptions])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scrollbar-thin max-h-[90vh] max-w-[63rem] overflow-y-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Filter className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">필터</DialogTitle>
        </div>

        <div className="mt-6 space-y-6">
          {/* Languages */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">언어</label>
            <Select
              value={localFilters.languages?.[0] || ''}
              onValueChange={(value) => {
                setLanguageCode(value)
                setLocalFilters((prev) => {
                  return {
                    ...prev,
                    languages: value ? [value] : undefined,
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

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">카테고리</label>
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
                      : 'border-outline/40 bg-surface-1 text-foreground hover:border-primary',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">태그 검색</label>
            <Input
              placeholder="태그 검색..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="h-10"
            />
            <div className="scrollbar-thin max-h-40 space-y-2 overflow-y-auto rounded-lg bg-surface-2 p-3 shadow-inner">
              {filteredTags.length === 0 ? (
                <p className="text-xs text-muted-foreground">추가/선택할 태그가 없습니다.</p>
              ) : (
                filteredTags.map(({ tag, count }) => {
                  const isSelected = localFilters.tags?.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2 py-1 text-sm',
                        isSelected
                          ? 'border border-primary bg-primary/10 text-primary'
                          : 'border border-outline/30 text-foreground hover:border-primary',
                      )}
                      onClick={() => {
                        setLocalFilters((prev) => {
                          const prevTags = prev.tags ?? []
                          if (prevTags.includes(tag)) {
                            const next = prevTags.filter((t) => t !== tag)
                            return { ...prev, tags: next.length ? next : undefined }
                          }
                          return { ...prev, tags: [...prevTags, tag] }
                        })
                      }}
                    >
                      <span>#{tag}</span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
          {/* Commercial use */}
          <div className="space-y-2">
            <label className="text-sm font-medium">상업적 사용</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                  localFilters.commercialOnly
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline/40 bg-surface-1 text-foreground hover:border-primary hover:bg-surface-2',
                )}
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    commercialOnly: prev.commercialOnly ? undefined : true,
                  }))
                }
              >
                상업 사용 가능한 음성만 보기
              </button>
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
