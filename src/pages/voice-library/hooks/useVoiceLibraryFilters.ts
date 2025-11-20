import React, { useMemo, useState } from 'react'

import ReactCountryFlag from 'react-country-flag'

import { VOICE_CATEGORY_MAP } from '@/shared/constants/voiceCategories'

export type VoiceFilters = {
  languages?: string[]
  category?: string[]
  gender?: 'any' | 'male' | 'female' | 'neutral'
  accent?: string
  age?: string
}

type LanguageOption = {
  code: string
  label?: string
  countryCode?: string
}

export type FilterChip = {
  label: string
  value: string
  onRemove: () => void
  icon?: React.ReactNode
}

const genderLabelMap: Record<string, string> = {
  male: '남성',
  female: '여성',
  neutral: '중립',
}

const ageLabelMap: Record<string, string> = {
  young: '청년',
  middle_aged: '중년',
  old: '노년',
}

export function useVoiceLibraryFilters(
  initial?: VoiceFilters,
  options?: { languages?: LanguageOption[] },
) {
  const [filters, setFilters] = useState<VoiceFilters>({
    gender: 'any',
    accent: undefined,
    age: undefined,
    languages: undefined,
    category: undefined,
    ...initial,
  })

  const resetFilters = () =>
    setFilters({
      gender: 'any',
      accent: undefined,
      age: undefined,
      languages: undefined,
      category: undefined,
    })

  const chips = useMemo<FilterChip[]>(() => {
    const list: FilterChip[] = []
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
    options?.languages?.forEach(({ code, countryCode }) => {
      const normalized = code.toLowerCase()
      if (countryCode) {
        languageCountryMap[normalized] = countryCode.toUpperCase()
      }
    })
    const getCountryCode = (code?: string) => {
      if (!code) return 'US'
      const normalized = code.toLowerCase()
      return languageCountryMap[normalized] ?? normalized.slice(0, 2).toUpperCase()
    }
    const languageLabelMap: Record<string, string> = {
      ko: '한국어',
      en: '영어',
      ja: '日本語',
      jp: '日本語',
      zh: '中国語',
      cn: '中国語',
      es: '스페인어',
      fr: '프랑스어',
      de: '독일어',
      it: '이탈리아어',
      pt: '포르투갈어',
      ru: '러시아어',
    }
    options?.languages?.forEach(({ code, label }) => {
      const normalized = code.toLowerCase()
      languageLabelMap[normalized] = label ?? languageLabelMap[normalized] ?? code
    })

    if (filters.category?.length) {
      filters.category.forEach((code) => {
        const label = VOICE_CATEGORY_MAP[code as keyof typeof VOICE_CATEGORY_MAP] ?? code
        list.push({
          label: '카테고리',
          value: label,
          onRemove: () =>
            setFilters((prev) => ({
              ...prev,
              category: prev.category?.filter((c) => c !== code) ?? undefined,
            })),
        })
      })
    }

    if (filters.languages?.length) {
      filters.languages.forEach((lang) => {
        const iconNode = React.createElement(ReactCountryFlag, {
          countryCode: getCountryCode(lang),
          svg: true,
          style: { width: '1em', height: '1em' },
          title: lang.toUpperCase(),
        })
        list.push({
          label: '언어',
          value: languageLabelMap[lang.toLowerCase()] ?? lang.toUpperCase(),
          icon: iconNode,
          onRemove: () =>
            setFilters((prev) => ({
              ...prev,
              languages: prev.languages?.filter((l) => l !== lang) ?? undefined,
            })),
        })
      })
    }

    if (filters.gender && filters.gender !== 'any') {
      list.push({
        label: '성별',
        value: genderLabelMap[filters.gender] ?? filters.gender,
        onRemove: () => setFilters((prev) => ({ ...prev, gender: 'any' })),
      })
    }

    if (filters.age && filters.age !== 'any') {
      list.push({
        label: '나이대',
        value: ageLabelMap[filters.age] ?? filters.age,
        onRemove: () => setFilters((prev) => ({ ...prev, age: undefined })),
      })
    }

    if (filters.accent) {
      list.push({
        label: '억양',
        value: filters.accent,
        onRemove: () => setFilters((prev) => ({ ...prev, accent: undefined })),
      })
    }

    return list
  }, [filters, options?.languages])

  return {
    filters,
    setFilters,
    resetFilters,
    chips,
  }
}
