import { useMemo } from 'react'

import ReactCountryFlag from 'react-country-flag'

import type { Language } from '@/entities/language/types'
import type { ProjectSummary } from '@/entities/project/types'
import type { ProjectProgress } from '@/features/projects/types/progress'
import { useLanguage } from '@/features/languages/hooks/useLanguage'

import {
  EMPTY_LANGUAGES,
  TARGET_STATUS_BADGE_COLORS,
  TARGET_STATUS_LABELS,
} from './episodeCardConstants'
import { getCountryCode } from './episodeCardUtils'

interface EpisodeCardTargetsProps {
  project: ProjectSummary
  sseProgressData?: ProjectProgress
}

/**
 * 에피소드 카드 타겟 언어 국기 표시
 * - grayscale에서 컬러로 진행도 표시
 * - 국기만 표시 (텍스트 없음)
 */
export function EpisodeCardTargets({ project, sseProgressData }: EpisodeCardTargetsProps) {
  const { data } = useLanguage()
  const languageItems = data ?? EMPTY_LANGUAGES

  const languageMap = useMemo(() => {
    const map: Record<string, string> = {}
    languageItems.forEach((lang: Language) => {
      map[lang.language_code] = lang.name_ko
    })
    return map
  }, [languageItems])

  if (!project.targets || project.targets.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {project.targets.map((target) => {
        const languageCode = target.language_code.toLowerCase()
        const label = languageMap[languageCode] ?? target.language_code
        const countryCode = getCountryCode(languageCode)

        // SSE 데이터가 있으면 사용, 없으면 API 데이터 사용
        const sseTarget = sseProgressData?.targets[target.language_code]
        const progress = sseTarget?.progress ?? target.progress ?? 0
        const targetStatus = sseTarget?.status ?? target.status ?? 'pending'
        const statusLabel = TARGET_STATUS_LABELS[targetStatus] ?? '대기'
        const badgeClass = TARGET_STATUS_BADGE_COLORS[targetStatus] ?? TARGET_STATUS_BADGE_COLORS.pending

        return (
          <div
            key={target.target_id ?? `${target.project_id}-${languageCode}`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-surface-3"
            title={`${label} ${statusLabel} ${progress}%`}
          >
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{
                width: '105%',
                height: '105%',
                display: 'block',
                borderRadius: '9999px',
              }}
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${badgeClass}`}
              aria-hidden="true"
            />
            <span className="sr-only">{`${label} ${statusLabel}`}</span>
          </div>
        )
      })}
    </div>
  )
}
