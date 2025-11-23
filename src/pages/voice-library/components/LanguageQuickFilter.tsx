import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import { cn } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'
import { getCountryCode } from '@/features/voice-samples/components/voiceSampleFieldUtils'

interface LanguageQuickFilterProps {
  languages: Array<{ code: string; label: string; countryCode?: string }>
  selectedLanguages: string[]
  onToggleLanguage: (languageCode: string | null) => void
}

// 주요 언어 (버튼으로 직접 표시) - 순서대로
// jp는 ja로, cn은 zh로 정규화되므로 중복 제거
const PRIMARY_LANGUAGE_CODES = ['ko', 'en', 'ja', 'zh']

// 언어 코드 정규화 (ja/jp, zh/cn 등을 통일)
const normalizeLanguageCode = (code: string): string => {
  const normalized = code.toLowerCase()
  if (normalized === 'jp') return 'ja'
  if (normalized === 'cn') return 'zh'
  return normalized
}

// getCountryCode에 정의된 모든 언어 코드 목록
const ALL_SUPPORTED_LANGUAGE_CODES = [
  'ko',
  'en',
  'ja',
  'jp',
  'zh',
  'cn',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ru',
]

// 언어 이름 매핑 (getCountryCode에 있는 언어들의 한글 이름)
const LANGUAGE_NAME_MAP: Record<string, string> = {
  ko: '한국어',
  en: '영어',
  ja: '일본어',
  jp: '일본어',
  zh: '중국어',
  cn: '중국어',
  es: '스페인어',
  fr: '프랑스어',
  de: '독일어',
  it: '이탈리아어',
  pt: '포르투갈어',
  ru: '러시아어',
}

export function LanguageQuickFilter({
  languages,
  selectedLanguages,
  onToggleLanguage,
}: LanguageQuickFilterProps) {
  // API에서 받은 언어와 getCountryCode에 정의된 모든 언어를 병합
  const allAvailableLanguages = useMemo(() => {
    const languageMap = new Map<string, { code: string; label: string }>()

    // API에서 받은 언어 추가
    languages.forEach((lang) => {
      const normalized = normalizeLanguageCode(lang.code)
      if (!languageMap.has(normalized)) {
        languageMap.set(normalized, lang)
      }
    })

    // getCountryCode에 정의된 언어 중 API에 없는 것들 추가
    ALL_SUPPORTED_LANGUAGE_CODES.forEach((code) => {
      const normalized = normalizeLanguageCode(code)
      if (!languageMap.has(normalized)) {
        languageMap.set(normalized, {
          code: normalized,
          label: LANGUAGE_NAME_MAP[code] || LANGUAGE_NAME_MAP[normalized] || code.toUpperCase(),
        })
      }
    })

    return Array.from(languageMap.values())
  }, [languages])

  // 주요 언어를 순서대로 찾아서 표시
  const primaryLanguages = PRIMARY_LANGUAGE_CODES.map((code) => {
    // 정규화된 코드로 찾기
    const normalized = normalizeLanguageCode(code)
    return allAvailableLanguages.find((lang) => normalizeLanguageCode(lang.code) === normalized)
  }).filter((lang): lang is NonNullable<typeof lang> => lang !== undefined)

  // 나머지 언어들 (드롭다운에 표시)
  const primaryLanguageCodes = new Set(
    primaryLanguages.map((lang) => normalizeLanguageCode(lang.code)),
  )
  const otherLanguages = allAvailableLanguages.filter(
    (lang) => !primaryLanguageCodes.has(normalizeLanguageCode(lang.code)),
  )

  const isAllSelected = selectedLanguages.length === 0

  if (allAvailableLanguages.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 전체 버튼 */}
      <button
        type="button"
        onClick={() => onToggleLanguage(null)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
          'hover:shadow-sm',
          isAllSelected
            ? 'border-primary bg-primary/10 text-primary shadow-sm'
            : 'border-outline/40 bg-surface-1 text-foreground hover:border-primary/50',
        )}
      >
        <span>전체</span>
      </button>

      {/* 주요 언어 버튼들 */}
      {primaryLanguages.map((lang) => {
        const langCode = normalizeLanguageCode(lang.code)
        const isSelected = selectedLanguages.some(
          (selected) => normalizeLanguageCode(selected) === langCode,
        )
        const countryCode =
          (lang as { code: string; label: string; countryCode?: string }).countryCode ||
          getCountryCode(lang.code) ||
          'US'

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onToggleLanguage(lang.code)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
              'hover:shadow-sm',
              isSelected
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-outline/40 bg-surface-1 text-foreground hover:border-primary/50',
            )}
          >
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{ width: '1em', height: '1em' }}
              title={lang.label}
            />
            <span>{lang.label}</span>
          </button>
        )
      })}

      {/* 더 많은 나라 드롭다운 */}
      {otherLanguages.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                'hover:shadow-sm',
                selectedLanguages.some((selected) =>
                  otherLanguages.some(
                    (lang) => normalizeLanguageCode(lang.code) === normalizeLanguageCode(selected),
                  ),
                )
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-outline/40 bg-surface-1 text-foreground hover:border-primary/50',
              )}
            >
              <span>더 많은 언어</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
            {otherLanguages.map((lang) => {
              const langCode = normalizeLanguageCode(lang.code)
              const isSelected = selectedLanguages.some(
                (selected) => normalizeLanguageCode(selected) === langCode,
              )
              const countryCode =
                (lang as { code: string; label: string; countryCode?: string }).countryCode ||
                getCountryCode(lang.code) ||
                'US'

              return (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => onToggleLanguage(lang.code)}
                  className="flex items-center gap-2"
                >
                  <ReactCountryFlag
                    countryCode={countryCode}
                    svg
                    style={{ width: '1em', height: '1em' }}
                    title={lang.label}
                  />
                  <span>{lang.label}</span>
                  {isSelected && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
