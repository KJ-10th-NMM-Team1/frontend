import { useMemo } from 'react'

import ReactCountryFlag from 'react-country-flag'

import type { Language } from '@/entities/language/types'
import { useLanguage } from '@/features/languages/hooks/useLanguage'

import { EMPTY_LANGUAGES, TARGET_STATUS_LABELS } from './episodeCardConstants'
import type { NormalizedTarget } from './projectDataNormalizer'

interface EpisodeCardTargetsProps {
  targets: NormalizedTarget[]
}

const FLAG_STYLE = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  display: 'block',
}

/**
 * 에피소드 카드 타겟 언어 국기 표시
 * - grayscale에서 컬러로 진행도 표시 (왼쪽에서 오른쪽으로 걷힘)
 * - 실패 상태면 전체 grayscale
 */
export function EpisodeCardTargets({ targets }: EpisodeCardTargetsProps) {
  const { data } = useLanguage()
  const languageItems = data ?? EMPTY_LANGUAGES

  const languageMap = useMemo(() => {
    const map: Record<string, string> = {}
    languageItems.forEach((lang: Language) => {
      map[lang.language_code] = lang.name_ko
    })
    return map
  }, [languageItems])

  if (targets.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {targets.map((target) => {
        const label = languageMap[target.languageCode] ?? target.languageCode
        const statusLabel = TARGET_STATUS_LABELS[target.status] ?? '대기'

        // 실패 상태면 진행도를 0으로 표시
        const displayProgress = target.status === 'failed' ? 0 : target.progress

        return (
          <div
            key={target.languageCode}
            className="relative h-5 w-7 overflow-hidden rounded-sm shadow-sm ring-1 ring-black/10"
            title={`${label} ${statusLabel} ${target.progress}%`}
          >
            {/* Grayscale 배경 (진한 grayscale) */}
            <div
              className="absolute inset-0"
              style={{ filter: 'grayscale(100%) brightness(0.7) contrast(1.1)' }}
            >
              <ReactCountryFlag countryCode={target.countryCode} svg style={FLAG_STYLE} />
            </div>

            {/* 컬러 오버레이 (진행도에 따라 왼쪽에서 오른쪽으로 표시) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${displayProgress}%` }}
            >
              <div className="h-5 w-7">
                <ReactCountryFlag countryCode={target.countryCode} svg style={FLAG_STYLE} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
