import { useMemo } from 'react'

import ReactCountryFlag from 'react-country-flag'

import type { Language } from '@/entities/language/types'
import type { ProjectSummary } from '@/entities/project/types'
import type { ProjectProgress } from '@/features/projects/types/progress'
import { useLanguage } from '@/features/languages/hooks/useLanguage'

import { EMPTY_LANGUAGES } from './episodeCardConstants'
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
        const progress = sseTarget?.progress ?? target.progress

        return (
          <div
            key={target.target_id ?? `${target.project_id}-${languageCode}`}
            className="relative h-5 w-8 overflow-hidden rounded border border-gray-300"
            title={`${label} ${progress}%`}
          >
            {/* 배경 (grayscale) */}
            <div className="absolute inset-0 grayscale">
              <ReactCountryFlag
                countryCode={countryCode}
                svg
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                }}
              />
            </div>

            {/* 진행도 오버레이 (컬러) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
              }}
            >
              <ReactCountryFlag
                countryCode={countryCode}
                svg
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
